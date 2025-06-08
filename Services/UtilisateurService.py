import jwt
from datetime import datetime, timedelta
from flask import current_app
import pyotp
from extensions import bcrypt
import os
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string
from Services.EmailServices import EmailService
from Services.EmailUtils import send_2fa_email
import logging

class AuthService:
    def __init__(self, utilisateur_repository):
        self.utilisateur_repository = utilisateur_repository

    def register_user(self, nom, prenom, email, mot_de_passe, type, code_secret=None):
        try:
            existing_user = self.utilisateur_repository.get_by_email(email)
            if existing_user:
                return None, "Cet email est déjà utilisé"
            if type == 'enseignant':
                code_enseignant_requis = os.environ.get('CODE_ENSEIGNANT')
                if not code_secret:
                    return None, "Le code d'enseignant est requis"
                if code_secret != code_enseignant_requis:
                    return None, "Code d'enseignant invalide"
                from Models.Enseignant import Enseignant
                utilisateur = Enseignant(
                    nom=nom,
                    prenom=prenom,
                    email=email,
                    mot_de_passe=mot_de_passe,
                    type=type
                )
            elif type == 'etudiant':
                from Models.Etudiant import Etudiant
                utilisateur = Etudiant(
                    nom=nom,
                    prenom=prenom,
                    email=email,
                    mot_de_passe=mot_de_passe,
                    type=type
                )
            elif type == 'admin':
                from Models.Administrateur import Administrateur
                utilisateur = Administrateur(
                    nom=nom,
                    prenom=prenom,
                    email=email,
                    mot_de_passe=mot_de_passe,
                    type=type
                )
            else:
                return None, "Type d'utilisateur invalide"
            try:
                return self.utilisateur_repository.create(utilisateur), None
            except Exception as e:
                return None, f"Erreur lors de la création de l'utilisateur: {str(e)}"
        except Exception as e:
            return None, f"Erreur lors de l'inscription: {str(e)}"

    def login_user(self, email, mot_de_passe):
        utilisateur = self.utilisateur_repository.get_by_email(email)
        if not utilisateur:
            return None, None, "Email ou mot de passe incorrect"
        if not utilisateur.verify_password(mot_de_passe):
            print(f"Échec de vérification du mot de passe pour {email}, type: {utilisateur.type}")
            return None, None, "Email ou mot de passe incorrect"
        if hasattr(utilisateur, 'tfa_enabled') and utilisateur.tfa_enabled:
            # Générer un code 2FA à 6 chiffres
            code = str(random.randint(100000, 999999))
            # Stocker le code et son expiration (5 min)
            utilisateur.tfa_code = code
            utilisateur.tfa_code_exp = datetime.utcnow() + timedelta(minutes=5)
            self.utilisateur_repository.update(utilisateur)
            # Envoyer le code par email
            send_2fa_email(utilisateur.email, code)
            return {"need_2fa": True, "user_id": utilisateur.id}, None, None
        token = self._generate_token(utilisateur)
        return utilisateur, token, None

    def verify_2fa(self, user_id, token):
        utilisateur = self.utilisateur_repository.get_by_id(user_id)
        if not utilisateur:
            return None, "Utilisateur non trouvé"
        # Vérifier le code 2FA envoyé par email
        if (
            not utilisateur.tfa_code or
            not utilisateur.tfa_code_exp or
            utilisateur.tfa_code != token or
            utilisateur.tfa_code_exp < datetime.utcnow()
        ):
            return None, "Code d'authentification incorrect ou expiré"
        # Activer la 2FA si ce n'est pas déjà fait
        if not utilisateur.tfa_enabled:
            utilisateur.tfa_enabled = True
        # Effacer le code utilisé
        utilisateur.tfa_code = None
        utilisateur.tfa_code_exp = None
        self.utilisateur_repository.update(utilisateur)
        jwt_token = self._generate_token(utilisateur)
        return jwt_token, None

    def setup_2fa(self, user_id):
        utilisateur = self.utilisateur_repository.get_by_id(user_id)
        if not utilisateur:
            return None, "Utilisateur non trouvé"
        utilisateur.tfa_secret = pyotp.random_base32()
        utilisateur.tfa_enabled = False
        self.utilisateur_repository.update(utilisateur)
        totp_uri = utilisateur.get_totp_uri()
        return totp_uri, None

    def activate_2fa(self, user_id, token):
        utilisateur = self.utilisateur_repository.get_by_id(user_id)
        if not utilisateur or not utilisateur.tfa_secret:
            return False, "Configuration 2FA non trouvée"
        totp = pyotp.TOTP(utilisateur.tfa_secret)
        if not totp.verify(token):
            return False, "Code incorrect"
        utilisateur.tfa_enabled = True
        self.utilisateur_repository.update(utilisateur)
        return True, None

    def _generate_token(self, utilisateur):
        payload = {
            'sub': str(utilisateur.id),
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=1),
            'type': utilisateur.type
        }
        print(f"Clé JWT utilisée pour génération: {current_app.config['JWT_SECRET_KEY']}")
        token = jwt.encode(
            payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm='HS256'
        )
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        return token

    def request_password_reset(self, email):
        utilisateur = self.utilisateur_repository.get_by_email(email)
        # Ne pas indiquer si l'utilisateur existe ou non pour des raisons de sécurité
        if not utilisateur:
            return True, None
            
        # Générer un nouveau mot de passe aléatoire
        nouveau_mot_de_passe = self._generate_random_password()
        logging.info(f"Génération d'un nouveau mot de passe pour {email}")
        logging.info(f"Mot de passe généré (en clair): {nouveau_mot_de_passe}")
        
        # Hachage du mot de passe avec bcrypt
        try:
            hashed_password = bcrypt.generate_password_hash(nouveau_mot_de_passe)
            if isinstance(hashed_password, bytes):
                hashed_password = hashed_password.decode('utf-8')
            logging.info(f"Mot de passe haché généré avec succès pour {email}")
            
            # Mise à jour du mot de passe dans la base de données
            utilisateur.mot_de_passe = hashed_password
            self.utilisateur_repository.update(utilisateur)
            logging.info(f"Mot de passe mis à jour dans la base de données pour {email}")
            
            # Envoi d'un email avec le nouveau mot de passe en clair
            subject = "Vos identifiants de connexion"
            
            # Stocker le mot de passe en clair dans une variable séparée pour l'email
            password_for_email = nouveau_mot_de_passe
            logging.info(f"Mot de passe préparé pour l'email (en clair): {password_for_email}")
            
            html_content = f"""
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #4F46E5;">Vos identifiants de connexion</h2>
                <p>Bonjour {utilisateur.prenom} {utilisateur.nom},</p>
                <p>Voici vos identifiants pour accéder à l'application :</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Email :</strong> {utilisateur.email}</p>
                    <p><strong>Mot de passe :</strong> {password_for_email}</p>
                    <p><strong>ID utilisateur :</strong> {utilisateur.id}</p>
                </div>
                <p>🔗 Lien Expo Go :</p>
                <p>exp://192.168.11.103:8081</p>
                <p>Cordialement,<br>L'équipe technique</p>
            </div>
            """
            
            logging.info(f"Contenu HTML préparé avec le mot de passe en clair: {password_for_email}")
            
            # Envoyer l'email directement avec le contenu HTML
            success = EmailService.send_email_async(
                utilisateur.email,
                subject,
                html_content,
                sender_name="L'équipe technique"
            )
            
            if not success:
                logging.error(f"Échec de l'envoi de l'email pour {email}")
                return False, "Erreur lors de l'envoi de l'email"
                
            logging.info(f"Email envoyé avec succès pour {email}")
            return True, None
            
        except Exception as e:
            logging.error(f"Erreur lors du hachage du mot de passe: {str(e)}")
            return False, "Erreur lors de la réinitialisation du mot de passe"

    def _generate_random_password(self):
        caracteres = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(random.choice(caracteres) for _ in range(12))

    def _send_password_email(self, email, nouveau_mot_de_passe):
        try:
            subject = "Votre nouveau mot de passe"
            html_content = f"""
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #4F46E5;">Réinitialisation de mot de passe</h2>
                <p>Bonjour,</p>
                <p>Suite à votre demande de réinitialisation, voici votre nouveau mot de passe:</p>
                <div style="background-color: #DC97FF; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Nouveau mot de passe :</strong> {nouveau_mot_de_passe}</p>
                </div>
                <p>Pour des raisons de sécurité, nous vous recommandons de changer ce mot de passe dès votre prochaine connexion.</p>
                <p>Cordialement,<br>L'équipe de votre application</p>
            </div>
            """
            
            return EmailService.send_email_async(email, subject, html_content)
            
        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email: {str(e)}")
            return False

    def reset_password(self, token, nouveau_mot_de_passe):
        utilisateur = self.utilisateur_repository.get_by_reset_token(token)
        if not utilisateur:
            return False, "Token invalide ou expiré"
        if not utilisateur.reset_token_exp or utilisateur.reset_token_exp < datetime.utcnow():
            return False, "Token expiré"
        # Hachage du mot de passe avant stockage
        utilisateur.mot_de_passe = bcrypt.generate_password_hash(nouveau_mot_de_passe).decode('utf-8')
        utilisateur.reset_token = None
        utilisateur.reset_token_exp = None
        self.utilisateur_repository.update(utilisateur)
        return True, None

    def _generate_reset_token(self, utilisateur):
        return str(uuid.uuid4())
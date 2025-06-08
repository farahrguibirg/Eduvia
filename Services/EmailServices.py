from flask import current_app
from Repository.EmailRepository import EmailRepository
import os
from threading import Thread
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from datetime import datetime
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging

class EmailService:
    @staticmethod
    def get_all_students():
        """Récupère tous les étudiants"""
        return EmailRepository.get_all_users(user_type='etudiant')
    
    @staticmethod
    def get_all_teachers():
        """Récupère tous les enseignants"""
        return EmailRepository.get_all_users(user_type='enseignant')

    @staticmethod
    def get_user_by_id(user_id):
        """Récupère un utilisateur par son ID"""
        return EmailRepository.get_user_by_id(user_id)
    
    @staticmethod
    def check_email_exists(email):
        """Vérifie si l'email existe déjà"""
        return EmailRepository.get_user_by_email(email) is not None
    
    @staticmethod
    def serialize_user(user):
        """Sérialise un utilisateur pour l'API"""
        return {
            'id': user.id,
            'nom': user.nom,
            'prenom': user.prenom,
            'email': user.email,
            'type': user.type
        }
    
    @staticmethod
    def send_email_async(to_email, subject, html_content, sender_name=None):
        """Envoyer un email de façon asynchrone avec Brevo"""
        logging.info(f"Préparation de l'envoi d'email à {to_email}")
        logging.info(f"Contenu HTML à envoyer: {html_content}")
        
        # Vérifier que le contenu HTML contient bien le mot de passe en clair
        if "Mot de passe :" in html_content:
            password_line = html_content.split("Mot de passe :")[1].split("<")[0].strip()
            logging.info(f"Mot de passe trouvé dans le contenu HTML: {password_line}")
        
        thread = Thread(target=EmailService._send_email, 
                       args=(to_email, subject, html_content, sender_name))
        thread.daemon = True
        thread.start()
        return True
    
    @staticmethod
    def _send_email(to_email, subject, html_content, sender_name=None):
        """Méthode privée pour envoyer un email avec Brevo"""
        try:
            # Configuration de l'API Brevo
            configuration = sib_api_v3_sdk.Configuration()
            configuration.api_key['api-key'] = os.environ.get('BREVO_API_KEY')
            
            # Instance de l'API
            api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
            
            # Définir l'expéditeur
            sender = {"email": os.environ.get('SENDER_EMAIL', 'noreply@votredomaine.com')}
            if sender_name:
                sender["name"] = sender_name
            
            # Créer la liste des destinataires
            to = [{"email": to_email}]
            
            logging.info(f"Envoi de l'email à {to_email}")
            logging.info(f"Contenu HTML final: {html_content}")
            
            # Créer et envoyer l'email
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=to,
                html_content=html_content,
                sender=sender,
                subject=subject
            )
            
            # Envoyer l'email via l'API
            api_response = api_instance.send_transac_email(send_smtp_email)
            
            # Enregistrer l'email dans la base de données si nécessaire
            EmailRepository.save_email_log(to_email, subject, datetime.now())
            
            logging.info(f"Email envoyé avec succès à {to_email}")
            return True
        except ApiException as e:
            logging.error(f"Exception lors de l'envoi de l'email: {e}")
            return False
        except Exception as e:
            logging.error(f"Erreur générale lors de l'envoi de l'email: {e}")
            return False
    
    @staticmethod
    def send_user_credentials(user_id, password):
        """Envoyer un email avec les identifiants de l'utilisateur"""
        logging.info(f"Tentative d'envoi des identifiants pour l'utilisateur ID: {user_id}")
        logging.info(f"Mot de passe reçu (en clair): {password}")
        
        user = EmailService.get_user_by_id(user_id)
        if not user:
            logging.error(f"Utilisateur avec ID {user_id} non trouvé")
            return False
            
        logging.info(f"Utilisateur trouvé: {user.email}")
        
        # Sujet de l'email
        subject = "Vos identifiants de connexion"
        
        # URL de l'application
        app_url = current_app.config.get('FRONTEND_URL', 'exp://192.168.11.103:8081')
        logging.info(f"URL de l'application: {app_url}")
        
        # Contenu HTML de l'email
        html_content = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4F46E5;">Vos identifiants de connexion</h2>
            <p>Bonjour {user.prenom} {user.nom},</p>
            <p>Voici vos identifiants pour accéder à l'application :</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Email :</strong> {user.email}</p>
                <p><strong>Mot de passe :</strong> {password}</p>
                <p><strong>ID utilisateur :</strong> {user.id}</p>
            </div>
            <p>🔗 Lien Expo Go :</p>
            <p>{app_url}</p>
            <p>Cordialement,<br>L'équipe technique : Eduvia</p>
        </div>
        """
        
        logging.info("Envoi de l'email via send_email_async")
        logging.info(f"Contenu HTML préparé: {html_content}")
        
        # Envoyer l'email
        success = EmailService.send_email_async(
            user.email, 
            subject, 
            html_content, 
            sender_name="L'équipe technique"
        )
        
        if success:
            logging.info(f"Email envoyé avec succès à {user.email}")
        else:
            logging.error(f"Échec de l'envoi de l'email à {user.email}")
            
        return success
    
    @staticmethod
    def send_mass_credentials(user_ids_with_passwords):
        """Envoyer des identifiants à plusieurs utilisateurs
        
        Args:
            user_ids_with_passwords: Liste de tuples (user_id, password)
        """
        success_count = 0
        failed_count = 0
        
        for user_id, password in user_ids_with_passwords:
            success = EmailService.send_user_credentials(user_id, password)
            if success:
                success_count += 1
            else:
                failed_count += 1
        
        return {
            'success_count': success_count,
            'failed_count': failed_count,
            'total': len(user_ids_with_passwords)
        }
    
    # Les autres méthodes existantes restent inchangées
    
    @staticmethod
    def _render_template(template_name, context):
        """Rendre un template HTML pour un email avec les données de contexte"""
        try:
            # Chemin vers les templates d'email
            template_path = os.path.join(current_app.root_path, 'templates', 'emails', f"{template_name}.html")
            
            # Lire le contenu du template
            with open(template_path, 'r', encoding='utf-8') as file:
                template_content = file.read()
            
            # Remplacer les variables dans le template
            for key, value in context.items():
                placeholder = "{{" + key + "}}"
                template_content = template_content.replace(placeholder, str(value))
            
            return template_content
        except FileNotFoundError:
            # Si le template n'existe pas, retourner un template par défaut
            return f"""
            <html>
            <body>
                <h2>Bonjour {context.get('user_name', 'Utilisateur')},</h2>
                <p>Vous avez reçu une notification.</p>
                <p>Cordialement,<br>L'équipe</p>
            </body>
            </html>
            """
    
    @staticmethod
    def send_mass_email(user_ids, subject, template_name, context=None):
        """Envoyer un email à plusieurs utilisateurs avec template"""
        success_count = 0
        failed_count = 0
        
        for user_id in user_ids:
            success = EmailService.send_email_to_user(user_id, subject, template_name, context)
            if success:
                success_count += 1
            else:
                failed_count += 1
        
        return {
            'success_count': success_count,
            'failed_count': failed_count,
            'total': len(user_ids)
        }
    
    @staticmethod
    def send_mass_email_simple(user_ids, subject, message, **context):
        """Envoyer un email simple à plusieurs utilisateurs"""
        success_count = 0
        failed_count = 0
        
        for user_id in user_ids:
            success = EmailService.send_email_to_user_simple(user_id, subject, message, **context)
            if success:
                success_count += 1
            else:
                failed_count += 1
        
        return {
            'success_count': success_count,
            'failed_count': failed_count,
            'total': len(user_ids)
        }
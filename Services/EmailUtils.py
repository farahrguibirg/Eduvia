"""from Repository.EmailRepository import EmailRepository
import os
from threading import Thread
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import requests
import json

def send_2fa_email(to_email, code):
    Envoie un email 2FA de façon synchrone (utilitaire)
    subject = f"Votre code de sécurité : {code}"
    html_content = f"<p>Votre code de sécurité est : <b>{code}</b></p>"
    api_key = os.environ.get("BREVO_API_KEY")
    sender_email = os.environ.get("MAIL_USERNAME", "farahrguibi@gmail.com")
    sender_name = os.environ.get("SENDER_NAME", "notreprojet")
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        'accept': 'application/json',
        'api-key': api_key,
        'content-type': 'application/json'
    }
    payload = {
        "sender": {
            "name": sender_name,
            "email": sender_email
        },
        "to": [
            {
                "email": to_email
            }
        ],
        "subject": subject,
        "htmlContent": html_content
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    if response.status_code != 201:
        print(f"Erreur lors de l'envoi: {response.status_code}")
        print(f"Réponse: {response.text}")
        return False
    print(f"Email 2FA envoyé avec succès à {to_email}")
    print(f"Réponse complète: {response.text}")
    return True

class TwoFactorEmailService:
    @staticmethod
    def send_2fa_email_async(to_email, code, sender_name=None):
        Envoie le code 2FA par email de façon asynchrone avec Brevo
        thread = Thread(target=TwoFactorEmailService._send_2fa_email, 
                        args=(to_email, code, sender_name))
        thread.daemon = True
        thread.start()
        return True

    @staticmethod
    def _send_2fa_email(to_email, code, sender_name=None):
        Méthode privée pour envoyer le code 2FA par email avec Brevo
        try:
            api_key = os.environ.get("BREVO_API_KEY")
            if not api_key:
                raise ValueError("BREVO_API_KEY non définie dans les variables d'environnement")

            sender_email = os.environ.get("MAIL_USERNAME", "farahrguibi@gmail.com")
            sender_name = sender_name or os.environ.get("SENDER_NAME", "notreprojet")

            subject = f"Votre code de sécurité : {code}"
            html_content = f"<p>Votre code de sécurité est : <b>{code}</b></p>"

            url = "https://api.brevo.com/v3/smtp/email"
            headers = {
                'accept': 'application/json',
                'api-key': api_key,
                'content-type': 'application/json'
            }
            payload = {
                "sender": {
                    "name": sender_name,
                    "email": sender_email
                },
                "to": [
                    {
                        "email": to_email
                    }
                ],
                "subject": subject,
                "htmlContent": html_content
            }

            print(f"Envoi de l'email 2FA avec la configuration suivante:")
            print(f"De: {sender_name} <{sender_email}>")
            print(f"À: {to_email}")
            print(f"Sujet: {subject}")

            response = requests.post(url, headers=headers, data=json.dumps(payload))
            
            if response.status_code != 201:
                print(f"Erreur lors de l'envoi: {response.status_code}")
                print(f"Réponse: {response.text}")
                return False

            print(f"Email 2FA envoyé avec succès à {to_email}")
            print(f"Réponse complète: {response.text}")
            return True

        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email 2FA: {str(e)}")
            return False

# Fonction interne partagée

def _send_2fa_email_core(to_email, subject, html_content):
    api_key = os.environ.get("BREVO_API_KEY")
    sender_email = os.environ.get("MAIL_USERNAME", "farahrguibi@gmail.com")
    sender_name = os.environ.get("SENDER_NAME", "notreprojet")

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        'accept': 'application/json',
        'api-key': api_key,
        'content-type': 'application/json'
    }
    payload = {
        "sender": {
            "name": sender_name,
            "email": sender_email
        },
        "to": [
            {
                "email": to_email
            }
        ],
        "subject": subject,
        "htmlContent": html_content
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))
    if response.status_code != 201:
        print(f"Erreur lors de l'envoi: {response.status_code}")
        print(f"Réponse: {response.text}")
        return False

    print(f"Email 2FA envoyé avec succès à {to_email}")
    print(f"Réponse complète: {response.text}")
    return True """
"""
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_mail import Mail, Message
from flask import current_app
import logging

# Configuration du logging pour debug
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def send_2fa_email(recipient_email, code):
    
    Envoie un email avec le code 2FA
    
    try:
        # Méthode 1: Utilisation de Flask-Mail (recommandée)
        if hasattr(current_app, 'mail'):
            return send_with_flask_mail(recipient_email, code)
        else:
            # Méthode 2: Utilisation de SMTP direct
            return send_with_smtp(recipient_email, code)
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi de l'email: {str(e)}")
        raise e

def send_with_flask_mail(recipient_email, code):
    Envoi avec Flask-Mail
    try:
        mail = current_app.extensions.get('mail')
        if not mail:
            raise Exception("Flask-Mail n'est pas configuré")
        
        msg = Message(
            subject='Code de vérification 2FA',
            sender=os.getenv('MAIL_DEFAULT_SENDER'),
            recipients=[recipient_email]
        )
        
        msg.html = f
        <html>
            <body>
                <h2>Code de vérification</h2>
                <p>Votre code de vérification à deux facteurs est :</p>
                <h3 style="color: #007bff; font-size: 24px; letter-spacing: 3px;">{code}</h3>
                <p>Ce code expire dans 5 minutes.</p>
                <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            </body>
        </html>
        
        
        msg.body = f
        Code de vérification 2FA
        
        Votre code de vérification à deux facteurs est : {code}
        
        Ce code expire dans 5 minutes.
        Si vous n'avez pas demandé ce code, ignorez cet email.
        
        
        mail.send(msg)
        logger.info(f"Email 2FA envoyé avec succès à {recipient_email}")
        return True
        
    except Exception as e:
        logger.error(f"Erreur Flask-Mail: {str(e)}")
        raise e

def send_with_smtp(recipient_email, code):
    Envoi avec SMTP direct
    try:
        # Récupération des variables d'environnement
        smtp_server = os.getenv('MAIL_SERVER')
        smtp_port = int(os.getenv('MAIL_PORT', 587))
        smtp_username = os.getenv('MAIL_USERNAME')
        smtp_password = os.getenv('MAIL_PASSWORD')
        sender_email = os.getenv('MAIL_DEFAULT_SENDER')
        
        # Vérification des variables
        if not all([smtp_server, smtp_username, smtp_password, sender_email]):
            raise Exception("Configuration SMTP incomplète dans les variables d'environnement")
        
        logger.debug(f"Configuration SMTP: {smtp_server}:{smtp_port}")
        logger.debug(f"Username: {smtp_username}")
        logger.debug(f"Sender: {sender_email}")
        
        # Création du message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Code de vérification 2FA'
        msg['From'] = sender_email
        msg['To'] = recipient_email
        
        # Version texte
        text_content = f
        Code de vérification 2FA
        
        Votre code de vérification à deux facteurs est : {code}
        
        Ce code expire dans 5 minutes.
        Si vous n'avez pas demandé ce code, ignorez cet email.
        
        
        # Version HTML
        html_content = f
        <html>
            <body>
                <h2>Code de vérification</h2>
                <p>Votre code de vérification à deux facteurs est :</p>
                <h3 style="color: #007bff; font-size: 24px; letter-spacing: 3px;">{code}</h3>
                <p>Ce code expire dans 5 minutes.</p>
                <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            </body>
        </html>
        
        
        # Ajout des parties au message
        msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
        msg.attach(MIMEText(html_content, 'html', 'utf-8'))
        
        # Connexion et envoi
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.set_debuglevel(1)  # Active le debug SMTP
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        
        logger.info(f"Email 2FA envoyé avec succès à {recipient_email}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"Erreur d'authentification SMTP: {str(e)}")
        raise Exception("Erreur d'authentification email. Vérifiez vos identifiants.")
    except smtplib.SMTPRecipientsRefused as e:
        logger.error(f"Destinataire refusé: {str(e)}")
        raise Exception("Adresse email destinataire invalide.")
    except smtplib.SMTPServerDisconnected as e:
        logger.error(f"Serveur SMTP déconnecté: {str(e)}")
        raise Exception("Connexion au serveur email perdue.")
    except Exception as e:
        logger.error(f"Erreur SMTP: {str(e)}")
        raise e

def test_email_configuration():
    Test de la configuration email
    try:
        smtp_server = os.getenv('MAIL_SERVER')
        smtp_port = int(os.getenv('MAIL_PORT', 587))
        smtp_username = os.getenv('MAIL_USERNAME')
        smtp_password = os.getenv('MAIL_PASSWORD')
        
        logger.info("Test de la configuration email...")
        logger.info(f"Serveur: {smtp_server}:{smtp_port}")
        logger.info(f"Username: {smtp_username}")
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.set_debuglevel(1)
            server.starttls()
            server.login(smtp_username, smtp_password)
            logger.info("✓ Configuration email valide")
            return True
            
    except Exception as e:
        logger.error(f"✗ Erreur de configuration email: {str(e)}")
        return False"""
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_mail import Mail, Message
from flask import current_app
import logging

# Configuration du logging pour debug
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def send_2fa_email(recipient_email, code):
    """
    Envoie un email avec le code 2FA
    """
    try:
        logger.info(f"Début de l'envoi d'email 2FA à {recipient_email}")
        
        # Méthode 1: Utilisation de Flask-Mail (recommandée)
        if hasattr(current_app, 'mail'):
            logger.info("Utilisation de Flask-Mail")
            return send_with_flask_mail(recipient_email, code)
        else:
            # Méthode 2: Utilisation de SMTP direct
            logger.info("Utilisation de SMTP direct")
            return send_with_smtp(recipient_email, code)
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi de l'email: {str(e)}")
        raise e

def send_with_flask_mail(recipient_email, code):
    """Envoi avec Flask-Mail"""
    try:
        mail = current_app.extensions.get('mail')
        if not mail:
            raise Exception("Flask-Mail n'est pas configuré")
        
        msg = Message(
            subject='Code de vérification 2FA',
            sender=os.getenv('MAIL_DEFAULT_SENDER'),
            recipients=[recipient_email]
        )
        
        msg.html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
                    <h2 style="color: #333; text-align: center; margin-bottom: 30px;">
                        🔐 Code de vérification 2FA
                    </h2>
                    <div style="background-color: white; padding: 25px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
                            Votre code de vérification à deux facteurs est :
                        </p>
                        <div style="background-color: #3C0663; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            {code}
                        </div>
                        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; font-weight: bold;">
                                ⚠️ Ce code expire dans 5 minutes
                            </p>
                        </div>
                        <p style="color: #999; font-size: 14px; margin-top: 20px;">
                            Gardez ce code confidentiel et utilisez-le rapidement.
                        </p>
                    </div>
                    <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
                        <p style="color: #666; font-size: 14px; text-align: center; margin: 0;">
                            Si vous n'avez pas demandé ce code, ignorez cet email.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        msg.body = f"""
        Code de vérification 2FA
        
        Votre code de vérification à deux facteurs est : {code}
        
        ⚠️ IMPORTANT: Ce code expire dans 5 minutes.
        
        Gardez ce code confidentiel et utilisez-le rapidement.
        Si vous n'avez pas demandé ce code, ignorez cet email.
        """
        
        mail.send(msg)
        logger.info(f"✓ Email 2FA envoyé avec succès via Flask-Mail à {recipient_email}")
        return True
        
    except Exception as e:
        logger.error(f"Erreur Flask-Mail: {str(e)}")
        raise e

def send_with_smtp(recipient_email, code):
    """Envoi avec SMTP direct"""
    try:
        # Récupération des variables d'environnement
        smtp_server = os.getenv('MAIL_SERVER')
        smtp_port = int(os.getenv('MAIL_PORT', 587))
        smtp_username = os.getenv('MAIL_USERNAME')
        smtp_password = os.getenv('MAIL_PASSWORD')
        sender_email = os.getenv('MAIL_DEFAULT_SENDER')
        
        # Vérification des variables
        if not all([smtp_server, smtp_username, smtp_password, sender_email]):
            missing = []
            if not smtp_server: missing.append('MAIL_SERVER')
            if not smtp_username: missing.append('MAIL_USERNAME')
            if not smtp_password: missing.append('MAIL_PASSWORD')
            if not sender_email: missing.append('MAIL_DEFAULT_SENDER')
            raise Exception(f"Configuration SMTP incomplète. Variables manquantes: {', '.join(missing)}")
        
        logger.info(f"Configuration SMTP: {smtp_server}:{smtp_port}")
        logger.info(f"Username: {smtp_username}")
        logger.info(f"Sender: {sender_email}")
        
        # Création du message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Code de vérification 2FA'
        msg['From'] = sender_email
        msg['To'] = recipient_email
        
        # Version texte
        text_content = f"""
        Code de vérification 2FA
        
        Votre code de vérification à deux facteurs est : {code}
        
        ⚠️ IMPORTANT: Ce code expire dans 5 minutes.
        
        Gardez ce code confidentiel et utilisez-le rapidement.
        Si vous n'avez pas demandé ce code, ignorez cet email.
        """
        
        # Version HTML
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
                    <h2 style="color: #333; text-align: center; margin-bottom: 30px;">
                        🔐 Code de vérification 2FA
                    </h2>
                    <div style="background-color: white; padding: 25px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
                            Votre code de vérification à deux facteurs est :
                        </p>
                        <div style="background-color: #3c0663; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            {code}
                        </div>
                        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; font-weight: bold;">
                                ⚠️ Ce code expire dans 5 minutes
                            </p>
                        </div>
                        <p style="color: #999; font-size: 14px; margin-top: 20px;">
                            Gardez ce code confidentiel et utilisez-le rapidement.
                        </p>
                    </div>
                    <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
                        <p style="color: #666; font-size: 14px; text-align: center; margin: 0;">
                            Si vous n'avez pas demandé ce code, ignorez cet email.
                        </p>
                         <p>Cordialement,<br>L'équipe technique : Eduvia</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Ajout des parties au message
        msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
        msg.attach(MIMEText(html_content, 'html', 'utf-8'))
        
        # Connexion et envoi
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            if logger.level == logging.DEBUG:
                server.set_debuglevel(1)  # Active le debug SMTP seulement en mode debug
            
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        
        logger.info(f"✓ Email 2FA envoyé avec succès via SMTP à {recipient_email}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"Erreur d'authentification SMTP: {str(e)}")
        raise Exception("Erreur d'authentification email. Vérifiez vos identifiants.")
    except smtplib.SMTPRecipientsRefused as e:
        logger.error(f"Destinataire refusé: {str(e)}")
        raise Exception("Adresse email destinataire invalide.")
    except smtplib.SMTPServerDisconnected as e:
        logger.error(f"Serveur SMTP déconnecté: {str(e)}")
        raise Exception("Connexion au serveur email perdue.")
    except Exception as e:
        logger.error(f"Erreur SMTP: {str(e)}")
        raise e

def test_email_configuration():
    """Test de la configuration email"""
    try:
        smtp_server = os.getenv('MAIL_SERVER')
        smtp_port = int(os.getenv('MAIL_PORT', 587))
        smtp_username = os.getenv('MAIL_USERNAME')
        smtp_password = os.getenv('MAIL_PASSWORD')
        
        logger.info("Test de la configuration email...")
        logger.info(f"Serveur: {smtp_server}:{smtp_port}")
        logger.info(f"Username: {smtp_username}")
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.set_debuglevel(1)
            server.starttls()
            server.login(smtp_username, smtp_password)
            logger.info("✓ Configuration email valide")
            return True
            
    except Exception as e:
        logger.error(f"✗ Erreur de configuration email: {str(e)}")
        return False
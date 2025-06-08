""""
from flask import Blueprint, request, jsonify
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import os
from dotenv import load_dotenv

load_dotenv()
email_b = Blueprint('email', __name__)

@email_b.route('/api/send', methods=['POST'])
def send_email():
    data = request.get_json()
    email = data.get('email')
    user_id = data.get('user_id')
    nom = data.get('nom', '')
    prenom = data.get('prenom', '')
    password = data.get('password', '')
   
    if not email or not user_id:
        return jsonify({"message": "Email et identifiant requis"}), 400
   
    print(f"➡ Envoi d'email à : {email}")
   
    # Récupérer la clé API Brevo
    api_key = os.getenv("BREVO_API_KEY")
    sender_email = os.getenv("SENDER_EMAIL")
    sender_name = os.getenv("SENDER_NAME")
    app_url = os.getenv("FRONTEND_URL", "http://192.168.1.7:5000/login")
    
    # Configuration du client API Brevo
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = api_key
    
    # Créer l'instance de l'API
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
    
    # Construire l'email HTML
    html_content = f
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4F46E5;">Vos informations de connexion</h2>
      <p>Bonjour {prenom} {nom},</p>
      <p>Voici vos identifiants pour accéder à l'application :</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Nom :</strong> {nom}</p>
        <p><strong>Prénom :</strong> {prenom}</p>
        <p><strong>Email :</strong> {email}</p>
        <p><strong>Mot de passe :</strong> {password}</p>
        <p><strong>Identifiant utilisateur :</strong> {user_id}</p>
      </div>
      <p>Connectez-vous ici :
        <a href="{app_url}" style="color: #4F46E5;">{app_url}</a>
      </p>
      <p>Cordialement,</p>
      <p>L'équipe technique</p>
    </div>
        
    # Préparer l'email
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": email, "name": f"{prenom} {nom}"}],
        sender={"name": sender_name, "email": sender_email},
        subject="Vos informations de connexion",
        html_content=html_content
    )
    
    try:
        # Envoi de l'email
        print("Tentative d'envoi d'email via l'API Brevo...")
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"Email envoyé avec succès! ID: {api_response}")
        return jsonify({"success": True, "message": "Email envoyé avec succès"}), 200
    except ApiException as e:
        print(f"Erreur API Brevo : {e}")
        return jsonify({"success": False, "message": "Échec de l'envoi", "error": str(e)}), 500
    except Exception as e:
        print(f"Erreur générale : {e}")
        return jsonify({"success": False, "message": "Échec de l'envoi", "error": str(e)}), 500"""
""""
from flask import Blueprint, request, jsonify
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()
test = Blueprint('"email_blueprint"', __name__)

@test.route('/api/send', methods=['POST'])
def send_email():
    data = request.get_json()
    email = data.get('email')
    user_id = data.get('user_id')
    nom = data.get('nom', '')
    prenom = data.get('prenom', '')
    password = data.get('password', '')
   
    if not email or not user_id:
        return jsonify({"message": "Email et identifiant requis"}), 400
   
    print(f"➡ Envoi d'email à : {email}")
   
    # Récupérer la clé API Brevo et les informations de configuration
    api_key = os.getenv("BREVO_API_KEY")
    
    # Afficher juste les premiers et derniers caractères de la clé pour le débogage
    if api_key:
        print(f"Utilisation de la clé API: {api_key[:5]}...{api_key[-5:] if len(api_key) > 10 else ''}")
    else:
        print("ATTENTION: Clé API non trouvée!")
    
    sender_email = os.getenv("SENDER_EMAIL", "farahrguibi@gmail.com")
    sender_name = os.getenv("SENDER_NAME", "notreprojet")
    
    # Utiliser la bonne URL en fonction de l'environnement
    # Si vous êtes en développement avec Expo, utilisez l'URL de l'app Expo
    is_expo = os.getenv("IS_EXPO", "false").lower() == "true"
    expo_app_url = os.getenv("EXPO_APP_URL", "exp://192.168.1.7:8081")
    web_url = os.getenv("FRONTEND_URL", "http://localhost:8081")
    
    # Choisir l'URL appropriée
    app_url = expo_app_url if is_expo else web_url
    print(f"URL de redirection utilisée: {app_url}")
    # Construire l'email HTML avec instructions spécifiques pour différents appareils
    html_content = f
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4F46E5;">Vos informations de connexion</h2>
      <p>Bonjour {prenom} {nom},</p>
      <p>Voici vos identifiants pour accéder à l'application :</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Nom :</strong> {nom}</p>
        <p><strong>Prénom :</strong> {prenom}</p>
        <p><strong>Email :</strong> {email}</p>
        <p><strong>Mot de passe :</strong> {password}</p>
        <p><strong>Identifiant utilisateur :</strong> {user_id}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <p><strong>Pour vous connecter:</strong></p>
        <ul style="margin-top: 5px;">
          <li style="margin-bottom: 10px;"><strong>Sur navigateur web:</strong> 
            <a href="http://localhost:8081" style="color: #4F46E5;">http://localhost:8081</a>
          </li>
          <li style="margin-bottom: 10px;"><strong>Sur appareil mobile avec Expo Go:</strong> Scannez le QR code de l'application ou utilisez 
            <a href="exp://192.168.1.7:8081" style="color: #4F46E5;">exp://192.168.1.7:8081</a>
          </li>
          <li style="margin-bottom: 10px;"><strong>Sur réseau local:</strong>
            <a href="http://192.168.1.7:8081" style="color: #4F46E5;">http://192.168.1.7:8081</a>
          </li>
        </ul>
      </div>
      
      <p>Cordialement,</p>
      <p>L'équipe technique</p>
    </div>
    
    try:
        # URL de l'API Brevo pour l'envoi d'email
        url = "https://api.brevo.com/v3/smtp/email"
        
        # Préparer les headers avec l'API key
        headers = {
            'accept': 'application/json',
            'api-key': api_key,
            'content-type': 'application/json'
        }
        
        # Préparer les données pour l'envoi
        payload = {
            "sender": {
                "name": sender_name,
                "email": sender_email
            },
            "to": [
                {
                    "email": email,
                    "name": f"{prenom} {nom}"
                }
            ],
            "subject": "Vos informations de connexion",
            "htmlContent": html_content
        }
        
        # Envoi de la requête
        print("Tentative d'envoi d'email via l'API REST Brevo...")
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        
        # Vérification de la réponse
        response.raise_for_status()  # Lève une exception si status code >= 400
        
        print(f"Email envoyé avec succès! Status code: {response.status_code}")
        return jsonify({"success": True, "message": "Email envoyé avec succès"}), 200
        
    except requests.exceptions.HTTPError as e:
        print(f"Erreur HTTP: {e}")
        print(f"Réponse reçue: {e.response.text}")
        return jsonify({"success": False, "message": "Échec de l'envoi", "error": str(e), "details": e.response.text}), e.response.status_code
    except Exception as e:
        print(f"Erreur générale: {e}")
        return jsonify({"success": False, "message": "Échec de l'envoi", "error": str(e)}), 500
    # NOUVELLE ROUTE pour récupérer le mot de passe d'un étudiant
@test.route('/api/students/<int:student_id>/password', methods=['GET'])
def get_student_password(student_id):
    try:
        print(f"➡ Récupération du mot de passe pour l'étudiant ID: {student_id}")
        
        # Remplacez cette partie par votre logique de base de données
        # Exemple avec SQLAlchemy:
        # student = Student.query.get(student_id)
        
        # EXEMPLE TEMPORAIRE - Remplacez par votre vraie logique de DB
        # Pour le moment, retournons un mot de passe d'exemple
        # Vous devez remplacer ceci par votre vraie requête de base de données
        
        # Si vous utilisez SQLAlchemy:
        # if not student:
        #     return jsonify({'success': False, 'message': 'Étudiant introuvable'}), 404
        # 
        # return jsonify({
        #     'success': True, 
        #     'password': student.password
        # })
        
        # TEMPORAIRE - supprimez ceci et utilisez votre vraie logique DB
        return jsonify({
            'success': True, 
            #'password': f'pass{student_id}2024'  # Remplacez par la vraie récupération
            'password': f'student.password'
        })
        
    except Exception as e:
        print(f"Erreur lors de la récupération du mot de passe: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# Optionnellement, ajoutez une route pour obtenir tous les étudiants si elle n'existe pas
@test.route('/api/students', methods=['GET'])
def get_students():
    try:
        # Remplacez par votre logique de récupération des étudiants
        # Exemple:
        # students = Student.query.all()
        # students_list = []
        # for student in students:
        #     students_list.append({
        #         'id': student.id,
        #         'nom': student.nom,
        #         'prenom': student.prenom,
        #         'email': student.email
        #     })
        # return jsonify({'success': True, 'students': students_list})
        
        # EXEMPLE TEMPORAIRE
        return jsonify({'success': True, 'students': []})
        
    except Exception as e:
        print(f"Erreur lors de la récupération des étudiants: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# APRÈS (correct):
@test.route('/api/Teachers/<int:teacher_id>/password', methods=['GET'])
def get_teachers_password(teacher_id):
    try:
        print(f"➡ Récupération du mot de passe pour le prof ID: {teacher_id}")
        
        # Remplacez cette partie par votre logique de base de données
        # Exemple avec SQLAlchemy:
        # teacher = Teacher.query.get(teacher_id)
        # if not teacher:
        #     return jsonify({'success': False, 'message': 'Enseignant introuvable'}), 404
        # return jsonify({'success': True, 'password': teacher.password})
        
        # EXEMPLE TEMPORAIRE - Remplacez par votre vraie logique de DB
        return jsonify({
            'success': True, 
            'password': f'teacher{teacher_id}2024'  # Remplacez par la vraie récupération
        })
        
    except Exception as e:
        print(f"Erreur lors de la récupération du mot de passe: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@test.route('/api/Teachers', methods=['GET'])
def get_teachers():
    try:
        # Remplacez par votre logique de récupération des enseignants
        # Exemple:
        # teachers = Teacher.query.all()
        # teachers_list = []
        # for teacher in teachers:
        #     teachers_list.append({
        #         'id': teacher.id,
        #         'nom': teacher.nom,
        #         'prenom': teacher.prenom,
        #         'email': teacher.email
        #     })
        # return jsonify({'success': True, 'teachers': teachers_list})
        
        # EXEMPLE TEMPORAIRE
        return jsonify({'success': True, 'teachers': []})
        
    except Exception as e:
        print(f"Erreur lors de la récupération des enseignants: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500"""
"""
from flask import Blueprint, request, jsonify
import requests
import json
import os
from dotenv import load_dotenv
from app import db
# Importez le modèle Utilisateur correctement en fonction de votre structure de projet
try:
    from Models.Utilisateur import Utilisateur  # Si votre modèle est dans un package Models
except ImportError:
    try:
        from Models.Utilisateur import Utilisateur  # Alternative avec casse différente
    except ImportError:
        from Models import Utilisateur  # Si Utilisateur est directement dans models

load_dotenv()
test = Blueprint('email_blueprint', __name__)  # Corrigé les guillemets

@test.route('/api/send', methods=['POST'])
def send_email():
    data = request.get_json()
    email = data.get('email')
    user_id = data.get('user_id')
    nom = data.get('nom', '')
    prenom = data.get('prenom', '')
    password = data.get('password', '')
   
    if not email or not user_id:
        return jsonify({"message": "Email et identifiant requis"}), 400
   
    print(f"➡ Envoi d'email à : {email}")
   
    # Récupérer la clé API Brevo et les informations de configuration
    api_key = os.getenv("BREVO_API_KEY")
    
    # Afficher juste les premiers et derniers caractères de la clé pour le débogage
    if api_key:
        print(f"Utilisation de la clé API: {api_key[:5]}...{api_key[-5:] if len(api_key) > 10 else ''}")
    else:
        print("ATTENTION: Clé API non trouvée!")
    
    sender_email = os.getenv("SENDER_EMAIL", "farahrguibi@gmail.com")
    sender_name = os.getenv("SENDER_NAME", "notreprojet")
    
    # Utiliser la bonne URL en fonction de l'environnement
    # Si vous êtes en développement avec Expo, utilisez l'URL de l'app Expo
    is_expo = os.getenv("IS_EXPO", "false").lower() == "true"
    expo_app_url = os.getenv("EXPO_APP_URL", "exp://192.168.1.10:8081")
    web_url = os.getenv("FRONTEND_URL", "http://localhost:8081")
    
    # Choisir l'URL appropriée
    app_url = expo_app_url if is_expo else web_url
    print(f"URL de redirection utilisée: {app_url}")
    # Construire l'email HTML avec instructions spécifiques pour différents appareils
    html_content = f
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4F46E5;">Vos informations de connexion</h2>
      <p>Bonjour {prenom} {nom},</p>
      <p>Voici vos identifiants pour accéder à l'application :</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Nom :</strong> {nom}</p>
        <p><strong>Prénom :</strong> {prenom}</p>
        <p><strong>Email :</strong> {email}</p>
        <p><strong>Mot de passe :</strong> {password}</p>
        <p><strong>Identifiant utilisateur :</strong> {user_id}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <p><strong>Pour vous connecter:</strong></p>
        <ul style="margin-top: 5px;">
          <li style="margin-bottom: 10px;"><strong>Sur navigateur web:</strong> 
            <a href="http://localhost:8081" style="color: #4F46E5;">http://localhost:8081</a>
          </li>
          <li style="margin-bottom: 10px;"><strong>Sur appareil mobile avec Expo Go:</strong> Scannez le QR code de l'application ou utilisez 
            <a href="exp://192.168.1.10:8081" style="color: #4F46E5;">exp://192.168.1.10:8081</a>
          </li>
          <li style="margin-bottom: 10px;"><strong>Sur réseau local:</strong>
            <a href="http://192.168.1.10:8081" style="color: #4F46E5;">http://192.168.1.10:8081</a>
          </li>
        </ul>
      </div>
      
      <p>Cordialement,</p>
      <p>L'équipe technique</p>
    </div>
    

    try:
        # URL de l'API Brevo pour l'envoi d'email
        url = "https://api.brevo.com/v3/smtp/email"
        
        # Préparer les headers avec l'API key
        headers = {
            'accept': 'application/json',
            'api-key': api_key,
            'content-type': 'application/json'
        }
        
        # Préparer les données pour l'envoi
        payload = {
            "sender": {
                "name": sender_name,
                "email": sender_email
            },
            "to": [
                {
                    "email": email,
                    "name": f"{prenom} {nom}"
                }
            ],
            "subject": "Vos informations de connexion",
            "htmlContent": html_content
        }
        
        # Envoi de la requête
        print("Tentative d'envoi d'email via l'API REST Brevo...")
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        
        # Vérification de la réponse
        response.raise_for_status()  # Lève une exception si status code >= 400
        
        print(f"Email envoyé avec succès! Status code: {response.status_code}")
        return jsonify({"success": True, "message": "Email envoyé avec succès"}), 200
        
    except requests.exceptions.HTTPError as e:
        print(f"Erreur HTTP: {e}")
        print(f"Réponse reçue: {e.response.text}")
        return jsonify({"success": False, "message": "Échec de l'envoi", "error": str(e), "details": e.response.text}), e.response.status_code
    except Exception as e:
        print(f"Erreur générale: {e}")
        return jsonify({"success": False, "message": "Échec de l'envoi", "error": str(e)}), 500

# Route corrigée pour récupérer le mot de passe d'un étudiant
@test.route('/api/students/<int:student_id>/password', methods=['GET'])
def get_student_password(student_id):
    try:
        print(f"➡ Récupération du mot de passe pour l'étudiant ID: {student_id}")
        
        # Récupération de l'étudiant depuis la base de données
        try:
            # Essayez d'abord avec la syntaxe standard de SQLAlchemy
            etudiant = Utilisateur.query.filter_by(id=student_id, type='etudiant').first()
        except AttributeError:
            # Si la première méthode échoue, essayez avec la session db directement
            etudiant = db.session.query(Utilisateur).filter_by(id=student_id, type='etudiant').first()
        
        if not etudiant:
            return jsonify({'success': False, 'message': 'Étudiant introuvable'}), 404
        
        # Retourner le mot de passe (qui est hashé)
        # Note: Pour des raisons de sécurité, on ne devrait normalement pas exposer
        # les mots de passe hashés, mais je maintiens cette logique puisqu'elle
        # était dans votre code d'origine
        return jsonify({
            'success': True, 
            'password': etudiant.mot_de_passe
        })
        
    except Exception as e:
        print(f"Erreur lors de la récupération du mot de passe: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# Route corrigée pour obtenir tous les étudiants
@test.route('/api/students', methods=['GET'])
def get_students():
    try:
        # Récupération de tous les étudiants depuis la base de données
        try:
            # Essayez d'abord avec la syntaxe standard de SQLAlchemy
            etudiants = Utilisateur.query.filter_by(type='etudiant').all()
        except AttributeError:
            # Si la première méthode échoue, essayez avec la session db directement
            etudiants = db.session.query(Utilisateur).filter_by(type='etudiant').all()
        
        etudiants_list = []
        for etudiant in etudiants:
            etudiants_list.append({
                'id': etudiant.id,
                'nom': etudiant.nom,
                'prenom': etudiant.prenom,
                'email': etudiant.email
            })
            
        return jsonify({'success': True, 'students': etudiants_list})
        
    except Exception as e:
        print(f"Erreur lors de la récupération des étudiants: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# Route corrigée pour récupérer le mot de passe d'un enseignant
@test.route('/api/Teachers/<int:teacher_id>/password', methods=['GET'])
def get_teachers_password(teacher_id):
    try:
        print(f"➡ Récupération du mot de passe pour le prof ID: {teacher_id}")
        
        # Récupération de l'enseignant depuis la base de données
        try:
            # Essayez d'abord avec la syntaxe standard de SQLAlchemy
            enseignant = Utilisateur.query.filter_by(id=teacher_id, type='enseignant').first()
        except AttributeError:
            # Si la première méthode échoue, essayez avec la session db directement
            enseignant = db.session.query(Utilisateur).filter_by(id=teacher_id, type='enseignant').first()
        
        if not enseignant:
            return jsonify({'success': False, 'message': 'Enseignant introuvable'}), 404
            
        return jsonify({
            'success': True, 
            'password': enseignant.mot_de_passe
        })
        
    except Exception as e:
        print(f"Erreur lors de la récupération du mot de passe: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# Route corrigée pour obtenir tous les enseignants
@test.route('/api/Teachers', methods=['GET'])
def get_teachers():
    try:
        # Récupération de tous les enseignants depuis la base de données
        try:
            # Essayez d'abord avec la syntaxe standard de SQLAlchemy
            enseignants = Utilisateur.query.filter_by(type='enseignant').all()
        except AttributeError:
            # Si la première méthode échoue, essayez avec la session db directement
            enseignants = db.session.query(Utilisateur).filter_by(type='enseignant').all()
        
        enseignants_list = []
        for enseignant in enseignants:
            enseignants_list.append({
                'id': enseignant.id,
                'nom': enseignant.nom,
                'prenom': enseignant.prenom,
                'email': enseignant.email
            })
            
        return jsonify({'success': True, 'teachers': enseignants_list})
        
    except Exception as e:
        print(f"Erreur lors de la récupération des enseignants: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500"""
""""
from flask import Blueprint, request, jsonify
import requests
import json
import os
from dotenv import load_dotenv
from app import db

# Import du modèle Utilisateur
try:
    from Models.Utilisateur import Utilisateur
except ImportError:
    from Models import Utilisateur

load_dotenv()
test = Blueprint('email_blueprint', __name__)

@test.route('/api/send', methods=['POST'])
def send_email():
    data = request.get_json()
    email = data.get('email')
    user_id = data.get('user_id')
    nom = data.get('nom', '')
    prenom = data.get('prenom', '')
    password = data.get('reset_token', '')
    is_reset = data.get('is_reset', False)  # True si reset, False sinon

    if not email or not user_id:
        return jsonify({"message": "Email et identifiant requis"}), 400

    print(f"➡ Envoi d'email à : {email}")

    # Récupérer la clé API Brevo et les informations de configuration
    api_key = os.getenv("BREVO_API_KEY")
    if api_key:
        print(f"Utilisation de la clé API: {api_key[:5]}...{api_key[-5:] if len(api_key) > 10 else ''}")
    else:
        print("ATTENTION: Clé API non trouvée!")

    sender_email = os.getenv("SENDER_EMAIL", "farahrguibi@gmail.com")
    sender_name = os.getenv("SENDER_NAME", "notreprojet")
    expo_app_url = os.getenv("EXPO_APP_URL", "exp://192.168.1.10:8081")

    # Déterminer le mot de passe à envoyer
    if is_reset:
        password_to_send = password  # Nouveau mot de passe généré lors du reset
    else:
        # Récupérer le mot de passe actuel (non hashé si possible, sinon afficher un message)
        utilisateur = Utilisateur.query.filter_by(id=user_id).first()
        if utilisateur and hasattr(utilisateur, "mot_de_passe"):
            password_to_send = utilisateur.mot_de_passe
        else:
            password_to_send = "Votre mot de passe actuel (non affiché pour des raisons de sécurité)"

    # Email HTML : on n'envoie QUE le lien Expo Go
    html_content = f
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4F46E5;">Vos informations de connexion</h2>
      <p>Bonjour {prenom} {nom},</p>
      <p>Voici vos identifiants pour accéder à l'application :</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email :</strong> {email}</p>
        <p><strong>Mot de passe :</strong> {password_to_send}</p>
        <p><strong>Identifiant utilisateur :</strong> {user_id}</p>
      </div>
      <div style="margin: 20px 0;">
        <p><strong>Pour vous connecter sur mobile avec Expo Go :</strong></p>
        <a href="{expo_app_url}" style="color: #4F46E5;">{expo_app_url}</a>
      </div>
      <p>Cordialement,</p>
      <p>L'équipe technique</p>
    </div>
    

    try:
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
                    "email": email,
                    "name": f"{prenom} {nom}"
                }
            ],
            "subject": "Vos informations de connexion",
            "htmlContent": html_content
        }
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        print(f"Email envoyé avec succès! Status code: {response.status_code}")
        return jsonify({"success": True, "message": "Email envoyé avec succès"}), 200
    except requests.exceptions.HTTPError as e:
        print(f"Erreur HTTP: {e}")
        print(f"Réponse reçue: {e.response.text}")
        return jsonify({"success": False, "message": "Échec de l'envoi", "error": str(e), "details": e.response.text}), e.response.status_code
    except Exception as e:
        print(f"Erreur générale: {e}")
        return jsonify({"success": False, "message": "Échec de l'envoi", "error": str(e)}), 500
@test.route('/api/students/<int:student_id>/password', methods=['GET'])
def get_student_password(student_id):
    try:
        print(f"➡ Récupération du mot de passe pour l'étudiant ID: {student_id}")
        try:
            etudiant = Utilisateur.query.filter_by(id=student_id, type='etudiant').first()
        except AttributeError:
            etudiant = db.session.query(Utilisateur).filter_by(id=student_id, type='etudiant').first()
        if not etudiant:
            return jsonify({'success': False, 'message': 'Étudiant introuvable'}), 404
        return jsonify({
            'success': True,
            'password': etudiant.mot_de_passe
        })
    except Exception as e:
        print(f"Erreur lors de la récupération du mot de passe: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@test.route('/api/students', methods=['GET'])
def get_students():
    try:
        try:
            etudiants = Utilisateur.query.filter_by(type='etudiant').all()
        except AttributeError:
            etudiants = db.session.query(Utilisateur).filter_by(type='etudiant').all()
        etudiants_list = []
        for etudiant in etudiants:
            etudiants_list.append({
                'id': etudiant.id,
                'nom': etudiant.nom,
                'prenom': etudiant.prenom,
                'email': etudiant.email
            })
        return jsonify({'success': True, 'students': etudiants_list})
    except Exception as e:
        print(f"Erreur lors de la récupération des étudiants: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@test.route('/api/Teachers/<int:teacher_id>/password', methods=['GET'])
def get_teachers_password(teacher_id):
    try:
        print(f"➡ Récupération du mot de passe pour le prof ID: {teacher_id}")
        try:
            enseignant = Utilisateur.query.filter_by(id=teacher_id, type='enseignant').first()
        except AttributeError:
            enseignant = db.session.query(Utilisateur).filter_by(id=teacher_id, type='enseignant').first()
        if not enseignant:
            return jsonify({'success': False, 'message': 'Enseignant introuvable'}), 404
        return jsonify({
            'success': True,
            'password': enseignant.mot_de_passe
        })
    except Exception as e:
        print(f"Erreur lors de la récupération du mot de passe: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@test.route('/api/Teachers', methods=['GET'])
def get_teachers():
    try:
        try:
            enseignants = Utilisateur.query.filter_by(type='enseignant').all()
        except AttributeError:
            enseignants = db.session.query(Utilisateur).filter_by(type='enseignant').all()
        enseignants_list = []
        for enseignant in enseignants:
            enseignants_list.append({
                'id': enseignant.id,
                'nom': enseignant.nom,
                'prenom': enseignant.prenom,
                'email': enseignant.email
            })
        return jsonify({'success': True, 'teachers': enseignants_list})
    except Exception as e:
        print(f"Erreur lors de la récupération des enseignants: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500"""
"""
from flask import Blueprint, request, jsonify
import requests
import json
import os
from dotenv import load_dotenv
from app import db

# Import du modèle Utilisateur
try:
    from Models.Utilisateur import Utilisateur
except ImportError:
    from Models import Utilisateur

load_dotenv()
test = Blueprint('email_blueprint', __name__)

@test.route('/api/send', methods=['POST'])
def send_email():
    try:
        data = request.get_json()
        
        # Validation des données d'entrée
        if not data:
            return jsonify({"message": "Aucune donnée reçue"}), 400
            
        email = data.get('email')
        user_id = data.get('user_id')
        nom = data.get('nom', '')
        prenom = data.get('prenom', '')
        password = data.get('reset_token', '')
        is_reset = data.get('is_reset', False)

        if not email or not user_id:
            return jsonify({"message": "Email et identifiant requis"}), 400

        print(f"➡ Envoi d'email à : {email} pour l'utilisateur ID: {user_id}")

        # Vérifier que l'utilisateur existe
        try:
            utilisateur = Utilisateur.query.filter_by(id=user_id).first()
        except Exception as db_error:
            print(f"Erreur base de données: {db_error}")
            try:
                utilisateur = db.session.query(Utilisateur).filter_by(id=user_id).first()
            except Exception as fallback_error:
                print(f"Erreur fallback base de données: {fallback_error}")
                return jsonify({"message": "Erreur d'accès à la base de données"}), 500

        if not utilisateur:
            return jsonify({"message": "Utilisateur introuvable"}), 404

        # Récupérer la clé API Brevo et les informations de configuration
        api_key = os.getenv("BREVO_API_KEY")
        if not api_key:
            print("ERREUR CRITIQUE: Clé API Brevo non trouvée!")
            return jsonify({"message": "Configuration email manquante"}), 500

        print(f"Utilisation de la clé API: {api_key[:5]}...{api_key[-5:] if len(api_key) > 10 else ''}")

        sender_email = os.getenv("SENDER_EMAIL", "farahrguibi@gmail.com")
        sender_name = os.getenv("SENDER_NAME", "notreprojet")
        expo_app_url = os.getenv("EXPO_APP_URL", "exp://192.168.1.10:8081")

        # Déterminer le mot de passe à envoyer
        if is_reset:
            password_to_send = password  # Nouveau mot de passe généré lors du reset
            print("Mode reset: utilisation du nouveau mot de passe")
        else:
            # Récupérer le mot de passe actuel
            if hasattr(utilisateur, "mot_de_passe") and utilisateur.mot_de_passe:
                password_to_send = utilisateur.mot_de_passe
                print("Utilisation du mot de passe existant")
            else:
                password_to_send = "Contactez l'administrateur"
                print("Mot de passe non disponible")

        # Utiliser les vraies données de l'utilisateur
        nom_final = nom if nom else getattr(utilisateur, 'nom', 'Utilisateur')
        prenom_final = prenom if prenom else getattr(utilisateur, 'prenom', '')

        # Email HTML simplifié et sécurisé
        html_content = f
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px;">
          <h2 style="color: #6818A5;">Vos informations de connexion</h2>
          <p>Bonjour {prenom_final} {nom_final},</p>
          <p>Voici vos identifiants pour accéder à l'application :</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6818A5;">
            <p style="margin: 5px 0;"><strong>Email :</strong> {email}</p>
            <p style="margin: 5px 0;"><strong>Mot de passe :</strong> {password_to_send}</p>
            <p style="margin: 5px 0;"><strong>ID utilisateur :</strong> {user_id}</p>
          </div>
          
          <div style="margin: 20px 0; padding: 10px; background-color: #ebdbed; border-radius: 5px;">
            <p style="margin: 5px 0;"><strong>🔗 Lien Expo Go :</strong></p>
            <a href="{expo_app_url}" style="color: #6818A5; text-decoration: none; font-weight: bold;">{expo_app_url}</a>
          </div>
          
          <p style="margin-top: 20px;">Cordialement,</p>
          <p style="color: #666;">L'équipe technique</p>
        </div>
        

        # Configuration de la requête Brevo
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
                    "email": email,
                    "name": f"{prenom_final} {nom_final}".strip()
                }
            ],
            "subject": "🔐 Vos informations de connexion",
            "htmlContent": html_content
        }

        print(f"Payload préparé pour l'envoi vers {email}")
        print(f"Sender: {sender_name} <{sender_email}>")

        # Envoi de l'email
        response = requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)
        
        print(f"Status code de la réponse: {response.status_code}")
        print(f"Réponse brute: {response.text}")
        
        if response.status_code == 201:
            print("✅ Email envoyé avec succès!")
            return jsonify({
                "success": True, 
                "message": "Email envoyé avec succès",
                "details": {
                    "recipient": email,
                    "user_id": user_id,
                    "status_code": response.status_code
                }
            }), 200
        else:
            print(f"❌ Échec de l'envoi. Code: {response.status_code}")
            response.raise_for_status()

    except requests.exceptions.Timeout:
        print("❌ Timeout lors de l'envoi de l'email")
        return jsonify({
            "success": False, 
            "message": "Timeout lors de l'envoi de l'email"
        }), 408

    except requests.exceptions.HTTPError as e:
        print(f"❌ Erreur HTTP: {e}")
        print(f"Détails de la réponse: {e.response.text if e.response else 'Pas de réponse'}")
        return jsonify({
            "success": False, 
            "message": "Erreur lors de l'envoi de l'email",
            "error": str(e),
            "details": e.response.text if e.response else None,
            "status_code": e.response.status_code if e.response else None
        }), e.response.status_code if e.response else 500

    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de requête: {e}")
        return jsonify({
            "success": False, 
            "message": "Erreur de connexion",
            "error": str(e)
        }), 500

    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        return jsonify({
            "success": False, 
            "message": "Erreur interne du serveur",
            "error": str(e)
        }), 500

# Routes pour récupérer les mots de passe (avec amélioration de sécurité)
@test.route('/api/students/<int:student_id>/password', methods=['GET'])
def get_student_password(student_id):
    try:
        print(f"➡ Récupération du mot de passe pour l'étudiant ID: {student_id}")
        
        try:
            etudiant = Utilisateur.query.filter_by(id=student_id, type='etudiant').first()
        except AttributeError:
            etudiant = db.session.query(Utilisateur).filter_by(id=student_id, type='etudiant').first()
        
        if not etudiant:
            return jsonify({'success': False, 'message': 'Étudiant introuvable'}), 404
        
        return jsonify({
            'success': True,
            'password': etudiant.mot_de_passe,
            'user_info': {
                'id': etudiant.id,
                'nom': etudiant.nom,
                'prenom': etudiant.prenom,
                'email': etudiant.email
            }
        })
        
    except Exception as e:
        print(f"Erreur lors de la récupération du mot de passe: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@test.route('/api/students', methods=['GET'])
def get_students():
    try:
        try:
            etudiants = Utilisateur.query.filter_by(type='etudiant').all()
        except AttributeError:
            etudiants = db.session.query(Utilisateur).filter_by(type='etudiant').all()
        
        etudiants_list = []
        for etudiant in etudiants:
            etudiants_list.append({
                'id': etudiant.id,
                'nom': etudiant.nom,
                'prenom': etudiant.prenom,
                'email': etudiant.email
            })
        
        return jsonify({'success': True, 'students': etudiants_list})
        
    except Exception as e:
        print(f"Erreur lors de la récupération des étudiants: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@test.route('/api/Teachers/<int:teacher_id>/password', methods=['GET'])
def get_teachers_password(teacher_id):
    try:
        print(f"➡ Récupération du mot de passe pour le prof ID: {teacher_id}")
        
        try:
            enseignant = Utilisateur.query.filter_by(id=teacher_id, type='enseignant').first()
        except AttributeError:
            enseignant = db.session.query(Utilisateur).filter_by(id=teacher_id, type='enseignant').first()
        
        if not enseignant:
            return jsonify({'success': False, 'message': 'Enseignant introuvable'}), 404
        
        return jsonify({
            'success': True,
            'password': enseignant.mot_de_passe,
            'user_info': {
                'id': enseignant.id,
                'nom': enseignant.nom,
                'prenom': enseignant.prenom,
                'email': enseignant.email
            }
        })
        
    except Exception as e:
        print(f"Erreur lors de la récupération du mot de passe: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@test.route('/api/Teachers', methods=['GET'])
def get_teachers():
    try:
        try:
            enseignants = Utilisateur.query.filter_by(type='enseignant').all()
        except AttributeError:
            enseignants = db.session.query(Utilisateur).filter_by(type='enseignant').all()
        
        enseignants_list = []
        for enseignant in enseignants:
            enseignants_list.append({
                'id': enseignant.id,
                'nom': enseignant.nom,
                'prenom': enseignant.prenom,
                'email': enseignant.email
            })
        
        return jsonify({'success': True, 'teachers': enseignants_list})
        
    except Exception as e:
        print(f"Erreur lors de la récupération des enseignants: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# Route de test pour vérifier la configuration
@test.route('/api/test-config', methods=['GET'])
def test_config():
    Route pour tester la configuration email
    config_status = {
        'brevo_api_key': bool(os.getenv("BREVO_API_KEY")),
        'sender_email': os.getenv("SENDER_EMAIL"),
        'sender_name': os.getenv("SENDER_NAME"),
        'expo_app_url': os.getenv("EXPO_APP_URL")
    }
    
    return jsonify({
        'success': True,
        'config': config_status,
        'message': 'Configuration email vérifiée'
    })"""
from flask import Blueprint, request, jsonify
import requests
import json
import os
import secrets
import string
from dotenv import load_dotenv
from app import db

# Import du modèle Utilisateur
try:
    from Models.Utilisateur import Utilisateur
except ImportError:
    from Models import Utilisateur

load_dotenv()
test = Blueprint('email_blueprint', __name__)

def generate_temporary_password(length=8):
    """Génère un mot de passe temporaire aléatoire"""
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

@test.route('/api/send', methods=['POST'])
def send_email():
    try:
        data = request.get_json()
        
        # Validation des données d'entrée
        if not data:
            return jsonify({"message": "Aucune donnée reçue"}), 400
            
        email = data.get('email')
        user_id = data.get('user_id')
        nom = data.get('nom', '')
        prenom = data.get('prenom', '')
        password = data.get('reset_token', '')
        is_reset = data.get('is_reset', False)

        if not email or not user_id:
            return jsonify({"message": "Email et identifiant requis"}), 400

        print(f"➡ Envoi d'email à : {email} pour l'utilisateur ID: {user_id}")

        # Vérifier que l'utilisateur existe
        try:
            utilisateur = Utilisateur.query.filter_by(id=user_id).first()
        except Exception as db_error:
            print(f"Erreur base de données: {db_error}")
            try:
                utilisateur = db.session.query(Utilisateur).filter_by(id=user_id).first()
            except Exception as fallback_error:
                print(f"Erreur fallback base de données: {fallback_error}")
                return jsonify({"message": "Erreur d'accès à la base de données"}), 500

        if not utilisateur:
            return jsonify({"message": "Utilisateur introuvable"}), 404

        # Récupérer la clé API Brevo et les informations de configuration
        api_key = os.getenv("BREVO_API_KEY")
        if not api_key:
            print("ERREUR CRITIQUE: Clé API Brevo non trouvée!")
            return jsonify({"message": "Configuration email manquante"}), 500

        print(f"Utilisation de la clé API: {api_key[:5]}...{api_key[-5:] if len(api_key) > 10 else ''}")

        sender_email = os.getenv("SENDER_EMAIL", "farahrguibi@gmail.com")
        sender_name = os.getenv("SENDER_NAME", "notreprojet")
        expo_app_url = os.getenv("EXPO_APP_URL", "exp://192.168.11.103:8081")

        # Déterminer le mot de passe à envoyer
        if is_reset:
            password_to_send = password  # Nouveau mot de passe généré lors du reset
            print("Mode reset: utilisation du nouveau mot de passe")
        else:
            # Générer un nouveau mot de passe temporaire
            password_to_send = generate_temporary_password()
            print(f"Génération d'un mot de passe temporaire: {password_to_send}")
            
            # Mettre à jour le mot de passe de l'utilisateur
            utilisateur.set_password(password_to_send)
            try:
                db.session.commit()
                print("Mot de passe temporaire mis à jour en base")
            except Exception as e:
                print(f"Erreur lors de la mise à jour du mot de passe: {e}")
                db.session.rollback()
                return jsonify({"message": "Erreur lors de la mise à jour du mot de passe"}), 500

        # Utiliser les vraies données de l'utilisateur
        nom_final = nom if nom else getattr(utilisateur, 'nom', 'Utilisateur')
        prenom_final = prenom if prenom else getattr(utilisateur, 'prenom', '')

        # Email HTML avec instructions détaillées pour changer le mot de passe
        html_content = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px;">
          <h2 style="color: #6818A5;">Vos informations de connexion</h2>
          <p>Bonjour {prenom_final} {nom_final},</p>
          <p>Voici vos identifiants pour accéder à l'application :</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6818A5;">
            <p style="margin: 5px 0;"><strong>Email :</strong> {email}</p>
            <p style="margin: 5px 0;"><strong>Mot de passe :</strong> {password_to_send}</p>
            <p style="margin: 5px 0;"><strong>ID utilisateur :</strong> {user_id}</p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-radius: 5px; border: 1px solid #ffeaa7;">
            <h3 style="margin-top: 0; color: #856404;">⚠️ IMPORTANT - Changement du mot de passe</h3>
            <p style="margin: 5px 0; color: #856404;"><strong>Ce mot de passe est temporaire et doit être changé dès votre première connexion.</strong></p>
            <p style="margin: 10px 0; color: #856404;"><strong>📱 Comment changer votre mot de passe :</strong></p>
            <ol style="color: #856404; padding-left: 20px;">
              <li>Connectez-vous à l'application avec les identifiants ci-dessus</li>
              <li>Allez dans votre <strong>Profil</strong> (icône utilisateur)</li>
              <li>Cliquez sur <strong>"Changer le mot de passe"</strong></li>
              <li>Saisissez votre nouveau mot de passe sécurisé</li>
              <li>Confirmez votre nouveau mot de passe</li>
            </ol>
            <p style="margin: 10px 0; color: #856404;"><em>Pour votre sécurité, choisissez un mot de passe contenant au moins 8 caractères avec des lettres, chiffres et symboles.</em></p>
          </div>
          
          <div style="margin: 20px 0; padding: 10px; background-color: #ebdbed; border-radius: 5px;">
            <p style="margin: 5px 0;"><strong>🔗 Lien Expo Go :</strong></p>
            <a href="{expo_app_url}" style="color: #6818A5; text-decoration: none; font-weight: bold;">{expo_app_url}</a>
          </div>
          
          <div style="margin: 20px 0; padding: 10px; background-color: #e8f4fd; border-radius: 5px; border: 1px solid #bee5eb;">
            <p style="margin: 5px 0; color: #0c5460;"><strong>💡 Conseil :</strong> Enregistrez ce nouveau mot de passe dans un endroit sûr après l'avoir changé.</p>
          </div>
          
          <p style="margin-top: 20px;">Cordialement,</p>
          <p style="color: #666;">L'équipe technique</p>
        </div>
        """

        # Configuration de la requête Brevo
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
                    "email": email,
                    "name": f"{prenom_final} {nom_final}".strip()
                }
            ],
            "subject": "🔐 Vos informations de connexion - Changement de mot de passe requis",
            "htmlContent": html_content
        }

        print(f"Payload préparé pour l'envoi vers {email}")
        print(f"Sender: {sender_name} <{sender_email}>")

        # Envoi de l'email
        response = requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)
        
        print(f"Status code de la réponse: {response.status_code}")
        print(f"Réponse brute: {response.text}")
        
        if response.status_code == 201:
            print("✅ Email envoyé avec succès!")
            return jsonify({
                "success": True, 
                "message": "Email envoyé avec succès",
                "details": {
                    "recipient": email,
                    "user_id": user_id,
                    "status_code": response.status_code,
                    "temporary_password_sent": not is_reset
                }
            }), 200
        else:
            print(f"❌ Échec de l'envoi. Code: {response.status_code}")
            response.raise_for_status()

    except requests.exceptions.Timeout:
        print("❌ Timeout lors de l'envoi de l'email")
        return jsonify({
            "success": False, 
            "message": "Timeout lors de l'envoi de l'email"
        }), 408

    except requests.exceptions.HTTPError as e:
        print(f"❌ Erreur HTTP: {e}")
        print(f"Détails de la réponse: {e.response.text if e.response else 'Pas de réponse'}")
        return jsonify({
            "success": False, 
            "message": "Erreur lors de l'envoi de l'email",
            "error": str(e),
            "details": e.response.text if e.response else None,
            "status_code": e.response.status_code if e.response else None
        }), e.response.status_code if e.response else 500

    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de requête: {e}")
        return jsonify({
            "success": False, 
            "message": "Erreur de connexion",
            "error": str(e)
        }), 500

    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        return jsonify({
            "success": False, 
            "message": "Erreur interne du serveur",
            "error": str(e)
        }), 500

# Route modifiée pour générer un nouveau mot de passe temporaire pour un étudiant
@test.route('/api/students/<int:student_id>/password', methods=['GET'])
def get_student_password(student_id):
    """Génère un nouveau mot de passe temporaire pour l'étudiant"""
    try:
        # Récupérer l'étudiant
        try:
            utilisateur = Utilisateur.query.filter_by(id=student_id, type='etudiant').first()
        except AttributeError:
            utilisateur = db.session.query(Utilisateur).filter_by(id=student_id, type='etudiant').first()
        
        if not utilisateur:
            return jsonify({
                'success': False, 
                'message': 'Étudiant introuvable'
            }), 404
        
        # Générer un nouveau mot de passe temporaire
        temp_password = generate_temporary_password()
        
        # Mettre à jour le mot de passe
        utilisateur.set_password(temp_password)
        db.session.commit()
        
        print(f"Nouveau mot de passe temporaire généré pour l'étudiant {student_id}: {temp_password}")
        
        return jsonify({
            'success': True,
            'password': temp_password,
            'message': 'Nouveau mot de passe temporaire généré',
            'user_info': {
                'id': utilisateur.id,
                'nom': utilisateur.nom,
                'prenom': utilisateur.prenom,
                'email': utilisateur.email,
                'type': utilisateur.type
            }
        })
        
    except Exception as e:
        print(f"Erreur lors de la génération du mot de passe temporaire pour l'étudiant {student_id}: {e}")
        db.session.rollback()
        return jsonify({
            'success': False, 
            'message': f'Erreur interne: {str(e)}'
        }), 500

@test.route('/api/students', methods=['GET'])
def get_students():
    try:
        try:
            etudiants = Utilisateur.query.filter_by(type='etudiant').all()
        except AttributeError:
            etudiants = db.session.query(Utilisateur).filter_by(type='etudiant').all()
        
        etudiants_list = []
        for etudiant in etudiants:
            etudiants_list.append({
                'id': etudiant.id,
                'nom': etudiant.nom,
                'prenom': etudiant.prenom,
                'email': etudiant.email
            })
        
        return jsonify({'success': True, 'students': etudiants_list})
        
    except Exception as e:
        print(f"Erreur lors de la récupération des étudiants: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@test.route('/api/Teachers/<int:teacher_id>/password', methods=['GET'])
def get_teachers_password(teacher_id):
    """Génère un nouveau mot de passe temporaire pour l'enseignant"""
    try:
        # Récupérer l'enseignant
        try:
            utilisateur = Utilisateur.query.filter_by(id=teacher_id, type='enseignant').first()
        except AttributeError:
            utilisateur = db.session.query(Utilisateur).filter_by(id=teacher_id, type='enseignant').first()
        
        if not utilisateur:
            return jsonify({
                'success': False, 
                'message': 'Enseignant introuvable'
            }), 404
        
        # Générer un nouveau mot de passe temporaire
        temp_password = generate_temporary_password()
        
        # Mettre à jour le mot de passe
        utilisateur.set_password(temp_password)
        db.session.commit()
        
        print(f"Nouveau mot de passe temporaire généré pour l'enseignant {teacher_id}: {temp_password}")
        
        return jsonify({
            'success': True,
            'password': temp_password,
            'message': 'Nouveau mot de passe temporaire généré',
            'user_info': {
                'id': utilisateur.id,
                'nom': utilisateur.nom,
                'prenom': utilisateur.prenom,
                'email': utilisateur.email,
                'type': utilisateur.type
            }
        })
        
    except Exception as e:
        print(f"Erreur lors de la génération du mot de passe temporaire pour l'enseignant {teacher_id}: {e}")
        db.session.rollback()
        return jsonify({
            'success': False, 
            'message': f'Erreur interne: {str(e)}'
        }), 500

@test.route('/api/Teachers', methods=['GET'])
def get_teachers():
    try:
        try:
            enseignants = Utilisateur.query.filter_by(type='enseignant').all()
        except AttributeError:
            enseignants = db.session.query(Utilisateur).filter_by(type='enseignant').all()
        
        enseignants_list = []
        for enseignant in enseignants:
            enseignants_list.append({
                'id': enseignant.id,
                'nom': enseignant.nom,
                'prenom': enseignant.prenom,
                'email': enseignant.email
            })
        
        return jsonify({'success': True, 'teachers': enseignants_list})
        
    except Exception as e:
        print(f"Erreur lors de la récupération des enseignants: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# Route pour envoyer un email avec le nouveau mot de passe temporaire
@test.route('/api/users/<int:user_id>/send-temp-password', methods=['POST'])
def send_temp_password_email(user_id):
    """Génère un mot de passe temporaire et l'envoie par email"""
    try:
        # Récupérer l'utilisateur
        try:
            utilisateur = Utilisateur.query.filter_by(id=user_id).first()
        except AttributeError:
            utilisateur = db.session.query(Utilisateur).filter_by(id=user_id).first()
        
        if not utilisateur:
            return jsonify({'success': False, 'message': 'Utilisateur introuvable'}), 404
        
        # Générer un nouveau mot de passe temporaire
        temp_password = generate_temporary_password()
        
        # Mettre à jour le mot de passe
        utilisateur.set_password(temp_password)
        db.session.commit()
        
        # Préparer les données pour l'envoi d'email
        email_data = {
            'email': utilisateur.email,
            'user_id': utilisateur.id,
            'nom': utilisateur.nom,
            'prenom': utilisateur.prenom,
            'reset_token': temp_password,
            'is_reset': False  # Utiliser le template avec instructions
        }
        
        # Appeler la fonction d'envoi d'email
        return send_email_internal(email_data)
        
    except Exception as e:
        print(f"Erreur lors de l'envoi du mot de passe temporaire: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

def send_email_internal(data):
    """Fonction interne pour envoyer un email (réutilise la logique de send_email)"""
    try:
        email = data.get('email')
        user_id = data.get('user_id')
        nom = data.get('nom', '')
        prenom = data.get('prenom', '')
        password = data.get('reset_token', '')
        is_reset = data.get('is_reset', False)

        if not email or not user_id:
            return jsonify({"message": "Email et identifiant requis"}), 400

        print(f"➡ Envoi d'email interne à : {email} pour l'utilisateur ID: {user_id}")

        # Récupérer la configuration
        api_key = os.getenv("BREVO_API_KEY")
        if not api_key:
            return jsonify({"message": "Configuration email manquante"}), 500

        sender_email = os.getenv("SENDER_EMAIL", "farahrguibi@gmail.com")
        sender_name = os.getenv("SENDER_NAME", "notreprojet")
        expo_app_url = os.getenv("EXPO_APP_URL", "exp://192.168.11.103:8081")

        # Email HTML avec instructions détaillées
        html_content = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px;">
          <h2 style="color: #6818A5;">Nouveau mot de passe temporaire</h2>
          <p>Bonjour {prenom} {nom},</p>
          <p>Un nouveau mot de passe temporaire a été généré pour votre compte :</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6818A5;">
            <p style="margin: 5px 0;"><strong>Email :</strong> {email}</p>
            <p style="margin: 5px 0;"><strong>Nouveau mot de passe :</strong> {password}</p>
            <p style="margin: 5px 0;"><strong>ID utilisateur :</strong> {user_id}</p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-radius: 5px; border: 1px solid #ffeaa7;">
            <h3 style="margin-top: 0; color: #856404;">⚠️ IMPORTANT - Changement du mot de passe</h3>
            <p style="margin: 5px 0; color: #856404;"><strong>Ce mot de passe est temporaire et doit être changé dès votre connexion.</strong></p>
            <p style="margin: 10px 0; color: #856404;"><strong>📱 Comment changer votre mot de passe :</strong></p>
            <ol style="color: #856404; padding-left: 20px;">
              <li>Connectez-vous à l'application avec le nouveau mot de passe</li>
              <li>Allez dans votre <strong>Profil</strong> (icône utilisateur)</li>
              <li>Cliquez sur <strong>"Changer le mot de passe"</strong></li>
              <li>Saisissez votre nouveau mot de passe sécurisé</li>
              <li>Confirmez votre nouveau mot de passe</li>
            </ol>
          </div>
          
          <div style="margin: 20px 0; padding: 10px; background-color: #ebdbed; border-radius: 5px;">
            <p style="margin: 5px 0;"><strong>🔗 Lien Expo Go :</strong></p>
            <a href="{expo_app_url}" style="color: #6818A5; text-decoration: none; font-weight: bold;">{expo_app_url}</a>
          </div>
          
          <p style="margin-top: 20px;">Cordialement,</p>
          <p style="color: #666;">L'équipe technique</p>
        </div>
        """

        # Configuration et envoi
        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            'accept': 'application/json',
            'api-key': api_key,
            'content-type': 'application/json'
        }
        
        payload = {
            "sender": {"name": sender_name, "email": sender_email},
            "to": [{"email": email, "name": f"{prenom} {nom}".strip()}],
            "subject": "🔐 Nouveau mot de passe temporaire",
            "htmlContent": html_content
        }

        response = requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)
        
        if response.status_code == 201:
            return jsonify({
                "success": True, 
                "message": "Email avec nouveau mot de passe envoyé",
                "temp_password": password
            }), 200
        else:
            response.raise_for_status()

    except Exception as e:
        print(f"Erreur envoi email interne: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

# Route de test pour vérifier la configuration
@test.route('/api/test-config', methods=['GET'])
def test_config():
    """Route pour tester la configuration email"""
    config_status = {
        'brevo_api_key': bool(os.getenv("BREVO_API_KEY")),
        'sender_email': os.getenv("SENDER_EMAIL"),
        'sender_name': os.getenv("SENDER_NAME"),
        'expo_app_url': os.getenv("EXPO_APP_URL")
    }
    
    return jsonify({
        'success': True,
        'config': config_status,
        'message': 'Configuration email vérifiée'
    })

# Fonction utilitaire pour déboguer le hachage des mots de passe
def debug_password_hash(user_id, test_password):
    """
    Fonction de débogage pour comprendre pourquoi le mot de passe ne se decode pas
    ATTENTION: À utiliser uniquement en développement
    """
    try:
        utilisateur = Utilisateur.query.filter_by(id=user_id).first()
        if not utilisateur:
            print(f"Utilisateur {user_id} introuvable")
            return False
            
        print(f"Debug pour utilisateur {user_id}:")
        print(f"- Hash stocké: {utilisateur.mot_de_passe}")
        print(f"- Mot de passe testé: {test_password}")
        
        # Vérifier le mot de passe
        is_valid = utilisateur.check_password(test_password)
        print(f"- Validation: {is_valid}")
        
        return is_valid
        
    except Exception as e:
        print(f"Erreur debug: {e}")
        return False

# Route de débogage (à supprimer en production)
@test.route('/api/debug/password/<int:user_id>', methods=['POST'])
def debug_user_password(user_id):
    """
    Route de débogage pour tester la validation des mots de passe
    ATTENTION: À supprimer en production pour des raisons de sécurité
    """
    if not os.getenv("DEBUG_MODE"):
        return jsonify({'error': 'Mode debug non activé'}), 403
        
    data = request.get_json()
    test_password = data.get('password')
    
    if not test_password:
        return jsonify({'error': 'Mot de passe requis'}), 400
    
    result = debug_password_hash(user_id, test_password)
    
    return jsonify({
        'user_id': user_id,
        'password_valid': result,
        'message': 'Validation réussie' if result else 'Mot de passe incorrect'
    })
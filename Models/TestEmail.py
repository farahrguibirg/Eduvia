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
    is_reset = data.get('is_reset', False)

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
    expo_app_url = os.getenv("EXPO_APP_URL", "exp://192.168.11.116:8081")

    print(f"Configuration de l'expéditeur:")
    print(f"Email: {sender_email}")
    print(f"Nom: {sender_name}")

    # Déterminer le mot de passe à envoyer
    if is_reset:
        password_to_send = password
    else:
        utilisateur = Utilisateur.query.filter_by(id=user_id).first()
        if utilisateur and hasattr(utilisateur, "mot_de_passe"):
            password_to_send = utilisateur.mot_de_passe
        else:
            password_to_send = "Votre mot de passe actuel (non affiché pour des raisons de sécurité)"

    # Email HTML
    html_content = f"""
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
    """

    try:
        # Vérifier d'abord l'état du compte Brevo
        account_url = "https://api.brevo.com/v3/account"
        headers = {
            'accept': 'application/json',
            'api-key': api_key
        }
        
        print("Vérification de l'état du compte Brevo...")
        account_response = requests.get(account_url, headers=headers)
        account_response.raise_for_status()
        account_info = account_response.json()
        
        print("Informations du compte Brevo:")
        print(f"Plan: {account_info.get('plan', [{}])[0].get('type', 'Inconnu')}")
        print(f"Crédits: {account_info.get('credits', {}).get('remaining', 'Inconnu')}")
        
        # Envoi de l'email
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

        print("Configuration de l'envoi:")
        print(f"URL API: {url}")
        print(f"Destinataire: {prenom} {nom} <{email}>")
        print(f"Expéditeur: {sender_name} <{sender_email}>")

        response = requests.post(url, headers=headers, data=json.dumps(payload))
        
        if response.status_code != 201:
            print(f"Erreur lors de l'envoi: {response.status_code}")
            print(f"Réponse: {response.text}")
            return jsonify({
                "success": False, 
                "message": "Échec de l'envoi", 
                "error": response.text
            }), response.status_code

        print(f"Email envoyé avec succès! Status code: {response.status_code}")
        print(f"Réponse complète: {response.text}")
        
        # Vérifier l'état de l'envoi
        message_id = response.json().get('messageId')
        if message_id:
            print(f"Message ID: {message_id}")
        
        return jsonify({"success": True, "message": "Email envoyé avec succès"}), 200
        
    except requests.exceptions.RequestException as e:
        print(f"Erreur de requête: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Réponse reçue: {e.response.text}")
            return jsonify({
                "success": False, 
                "message": "Échec de l'envoi", 
                "error": str(e),
                "details": e.response.text
            }), e.response.status_code
        return jsonify({
            "success": False, 
            "message": "Échec de l'envoi", 
            "error": str(e)
        }), 500
    except Exception as e:
        print(f"Erreur générale: {e}")
        return jsonify({
            "success": False, 
            "message": "Échec de l'envoi", 
            "error": str(e)
        }), 500

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
        return jsonify({'success': False, 'message': str(e)}), 500
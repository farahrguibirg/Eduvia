from flask import request, jsonify
from Services.EmailServices import EmailService
from Repository.EmailRepository import EmailRepository
from flask_jwt_extended import jwt_required, get_jwt_identity
from Models.Administrateur import Administrateur
from Models.Utilisateur import Utilisateur
from functools import wraps
from datetime import datetime
from Models.Email import Email

def admin_required(f):
    """Décorateur pour vérifier si l'utilisateur est un administrateur"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        admin = Administrateur.query.get(user_id)
        if not admin or admin.type != 'admin':
            return jsonify({'success': False, 'message': 'Accès refusé. Vous devez être administrateur.'}), 403
        return f(*args, **kwargs)
    return decorated_function

class EmailController:
    @staticmethod
    @jwt_required()
    @admin_required
    def get_all_students():
        """Endpoint pour récupérer tous les étudiants"""
        try:
            students = EmailService.get_all_students()
            return jsonify({
                'success': True,
                'data': [EmailService.serialize_user(student) for student in students]
            }), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
    
    @staticmethod
    @jwt_required()
    @admin_required
    def get_all_teachers():
        """Endpoint pour récupérer tous les enseignants"""
        try:
            teachers = EmailService.get_all_teachers()
            return jsonify({
                'success': True,
                'data': [EmailService.serialize_user(teacher) for teacher in teachers]
            }), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
    
    @staticmethod
    @jwt_required()
    @admin_required
    def get_user(user_id):
        """Endpoint pour récupérer un utilisateur par son ID"""
        try:
            user = EmailService.get_user_by_id(user_id)
            if not user:
                return jsonify({'success': False, 'message': 'Utilisateur non trouvé'}), 404
            
            return jsonify({
                'success': True,
                'data': EmailService.serialize_user(user)
            }), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
    
    @staticmethod
    @jwt_required()
    @admin_required
    def send_user_credentials():
        """Endpoint pour envoyer les identifiants à un utilisateur"""
        data = request.get_json()
        
        # Validation des données
        if not data or not all(k in data for k in ['user_id', 'password']):
            return jsonify({
                'success': False, 
                'message': 'Les champs user_id et password sont requis'
            }), 400
        
        user_id = data.get('user_id')
        password = data.get('password')
        
        try:
            success = EmailService.send_user_credentials(user_id, password)
            
            if success:
                return jsonify({
                    'success': True,
                    'message': f'Identifiants envoyés avec succès à l\'utilisateur {user_id}'
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': f'Échec de l\'envoi des identifiants à l\'utilisateur {user_id}'
                }), 500
                
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @staticmethod
    @jwt_required()
    @admin_required
    def send_mass_credentials():
        """Endpoint pour envoyer des identifiants à plusieurs utilisateurs"""
        data = request.get_json()
        
        # Validation des données
        if not data or 'users' not in data:
            return jsonify({
                'success': False, 
                'message': 'Le champ users est requis et doit être une liste de {user_id, password}'
            }), 400
        
        users = data.get('users')
        user_ids_with_passwords = [(user['user_id'], user['password']) for user in users]
        
        try:
            result = EmailService.send_mass_credentials(user_ids_with_passwords)
            
            return jsonify({
                'success': True,
                'message': f'Envoi des identifiants terminé',
                'results': result
            }), 200
                
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
    
    # Les autres méthodes existantes restent inchangées

    @staticmethod
    @jwt_required()
    @admin_required
    def get_email_logs():
        """Endpoint pour récupérer les logs d'emails"""
        try:
            # Obtenir les paramètres de filtre
            email = request.args.get('email')
            start_date_str = request.args.get('start_date')
            end_date_str = request.args.get('end_date')
            
            # Convertir les dates si présentes
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d') if start_date_str else None
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d') if end_date_str else None
            
            # Récupérer les logs selon les filtres
            if email:
                emails = EmailRepository.get_emails_by_recipient(email)
            elif start_date and end_date:
                emails = EmailRepository.get_emails_sent_between_dates(start_date, end_date)
            else:
                # Par défaut, récupérer tous les emails (limiter à 100 par exemple)
                emails = Email.query.limit(100).all()
            
            # Sérialiser les résultats
            email_logs = []
            for email in emails:
                email_logs.append({
                    'id': email.id,
                    'recipient': email.recipient_email,
                    'subject': email.subject,
                    'sent_date': email.sent_date.strftime('%Y-%m-%d %H:%M:%S'),
                    'status': getattr(email, 'status', 'sent')  # Par défaut 'sent' si l'attribut n'existe pas
                })
            
            return jsonify({
                'success': True,
                'data': email_logs
            }), 200
            
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @staticmethod
    @jwt_required()
    @admin_required
    def check_email_exists():
        """Endpoint pour vérifier si un email existe"""
        email = request.args.get('email')
        
        if not email:
            return jsonify({
                'success': False,
                'message': 'Le paramètre email est requis'
            }), 400
        
        try:
            exists = EmailService.check_email_exists(email)
            return jsonify({
                'success': True,
                'exists': exists
            }), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
    
    @staticmethod
    @jwt_required()
    @admin_required
    def send_email_to_user():
        """Endpoint pour envoyer un email à un utilisateur"""
        data = request.get_json()
        
        # Validation des données
        if not data or not all(k in data for k in ['user_id', 'subject']):
            return jsonify({
                'success': False, 
                'message': 'Les champs user_id et subject sont requis'
            }), 400
        
        user_id = data.get('user_id')
        subject = data.get('subject')
        template_name = data.get('template_name')
        message = data.get('message', 'Vous avez reçu une notification.')
        context = data.get('context', {})
        
        try:
            # Si template_name est fourni, utiliser la méthode avec template
            if template_name:
                success = EmailService.send_email_to_user(user_id, subject, template_name, context)
            else:
                # Sinon, utiliser la méthode simple
                success = EmailService.send_email_to_user_simple(user_id, subject, message, **context)
            
            if success:
                return jsonify({
                    'success': True,
                    'message': f'Email envoyé avec succès à l\'utilisateur {user_id}'
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': f'Échec de l\'envoi de l\'email à l\'utilisateur {user_id}'
                }), 500
                
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @staticmethod
    @jwt_required()
    @admin_required
    def send_mass_email():
        """Endpoint pour envoyer un email à plusieurs utilisateurs"""
        data = request.get_json()
        
        # Validation des données
        if not data or not all(k in data for k in ['user_ids', 'subject']):
            return jsonify({
                'success': False, 
                'message': 'Les champs user_ids et subject sont requis'
            }), 400
        
        user_ids = data.get('user_ids')
        subject = data.get('subject')
        template_name = data.get('template_name')
        message = data.get('message', 'Vous avez reçu une notification.')
        context = data.get('context', {})
        
        try:
            # Si template_name est fourni, utiliser la méthode avec template
            if template_name:
                result = EmailService.send_mass_email(user_ids, subject, template_name, context)
            else:
                # Sinon, utiliser la méthode simple
                result = EmailService.send_mass_email_simple(user_ids, subject, message, **context)
            
            return jsonify({
                'success': True,
                'message': f'Envoi d\'emails terminé',
                'results': result
            }), 200
                
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @staticmethod
    @jwt_required()
    @admin_required
    def send_email_to_all_students():
        """Endpoint pour envoyer un email à tous les étudiants"""
        data = request.get_json()
        
        # Validation des données
        if not data or 'subject' not in data:
            return jsonify({
                'success': False, 
                'message': 'Le champ subject est requis'
            }), 400
        
        subject = data.get('subject')
        template_name = data.get('template_name')
        message = data.get('message', 'Information importante pour tous les étudiants.')
        context = data.get('context', {})
        
        try:
            students = EmailService.get_all_students()
            student_ids = [student.id for student in students]
            
            # Si template_name est fourni, utiliser la méthode avec template
            if template_name:
                result = EmailService.send_mass_email(student_ids, subject, template_name, context)
            else:
                # Sinon, utiliser la méthode simple
                result = EmailService.send_mass_email_simple(student_ids, subject, message, **context)
            
            return jsonify({
                'success': True,
                'message': f'Envoi d\'emails aux étudiants terminé',
                'results': result
            }), 200
                
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @staticmethod
    @jwt_required()
    @admin_required
    def send_email_to_all_teachers():
        """Endpoint pour envoyer un email à tous les enseignants"""
        data = request.get_json()
        
        # Validation des données
        if not data or 'subject' not in data:
            return jsonify({
                'success': False, 
                'message': 'Le champ subject est requis'
            }), 400
        
        subject = data.get('subject')
        template_name = data.get('template_name')
        message = data.get('message', 'Information importante pour tous les enseignants.')
        context = data.get('context', {})
        
        try:
            teachers = EmailService.get_all_teachers()
            teacher_ids = [teacher.id for teacher in teachers]
            
            # Si template_name est fourni, utiliser la méthode avec template
            if template_name:
                result = EmailService.send_mass_email(teacher_ids, subject, template_name, context)
            else:
                # Sinon, utiliser la méthode simple
                result = EmailService.send_mass_email_simple(teacher_ids, subject, message, **context)
            
            return jsonify({
                'success': True,
                'message': f'Envoi d\'emails aux enseignants terminé',
                'results': result
            }), 200
                
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
    
    @staticmethod
    @jwt_required()
    @admin_required
    def get_email_logs():
        """Endpoint pour récupérer les logs d'emails"""
        try:
            # Obtenir les paramètres de filtre
            email = request.args.get('email')
            start_date_str = request.args.get('start_date')
            end_date_str = request.args.get('end_date')
            
            # Convertir les dates si présentes
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d') if start_date_str else None
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d') if end_date_str else None
            
            # Récupérer les logs selon les filtres
            if email:
                emails = EmailRepository.get_emails_by_recipient(email)
            elif start_date and end_date:
                emails = EmailRepository.get_emails_sent_between_dates(start_date, end_date)
            else:
                # Par défaut, récupérer tous les emails (limiter à 100 par exemple)
                emails = Email.query.limit(100).all()
            
            # Sérialiser les résultats
            email_logs = []
            for email in emails:
                email_logs.append({
                    'id': email.id,
                    'recipient': email.recipient_email,
                    'subject': email.subject,
                    'sent_date': email.sent_date.strftime('%Y-%m-%d %H:%M:%S'),
                    'status': getattr(email, 'status', 'sent')  # Par défaut 'sent' si l'attribut n'existe pas
                })
            
            return jsonify({
                'success': True,
                'data': email_logs
            }), 200
            
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @staticmethod
    @jwt_required()
    @admin_required
    def check_email_exists():
        """Endpoint pour vérifier si un email existe"""
        email = request.args.get('email')
        
        if not email:
            return jsonify({
                'success': False,
                'message': 'Le paramètre email est requis'
            }), 400
        
        try:
            exists = EmailService.check_email_exists(email)
            return jsonify({
                'success': True,
                'exists': exists
            }), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
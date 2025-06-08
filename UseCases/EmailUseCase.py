from Services.EmailServices import EmailService
from Repository.EmailRepository import EmailRepository
from Models.Utilisateur import Utilisateur
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from Models.Administrateur import Administrateur
from functools import wraps

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

class AdminUseCase:
    @staticmethod
    @jwt_required()
    @admin_required
    def get_all_students():
        """Cas d'utilisation: récupérer tous les étudiants"""
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
        """Cas d'utilisation: récupérer tous les enseignants"""
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
        """Cas d'utilisation: récupérer un utilisateur par ID"""
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
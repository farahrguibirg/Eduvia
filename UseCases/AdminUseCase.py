from Services.AdminServices import AdminService
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
            students = AdminService.get_all_students()
            return jsonify({
                'success': True,
                'data': [AdminService.serialize_user(student) for student in students]
            }), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @staticmethod
    @jwt_required()
    @admin_required
    def get_all_teachers():
        """Cas d'utilisation: récupérer tous les enseignants"""
        try:
            teachers = AdminService.get_all_teachers()
            return jsonify({
                'success': True,
                'data': [AdminService.serialize_user(teacher) for teacher in teachers]
            }), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @staticmethod
    @jwt_required()
    @admin_required
    def get_user(user_id):
        """Cas d'utilisation: récupérer un utilisateur par ID"""
        try:
            user = AdminService.get_user_by_id(user_id)
            if not user:
                return jsonify({'success': False, 'message': 'Utilisateur non trouvé'}), 404
            
            return jsonify({
                'success': True,
                'data': AdminService.serialize_user(user)
            }), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @staticmethod
    @jwt_required()
    @admin_required
    def create_student(data):
        """Cas d'utilisation: créer un nouvel étudiant"""
        try:
            # Vérifier les données requises
            required_fields = ['nom', 'prenom', 'email', 'mot_de_passe']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'message': f'Le champ {field} est requis'}), 400
            
            # Créer l'étudiant
            student = AdminService.create_student(data)
            
            return jsonify({
                'success': True,
                'message': 'Étudiant créé avec succès',
                'data': AdminService.serialize_user(student)
            }), 201
        except ValueError as e:
            return jsonify({'success': False, 'message': str(e)}), 400
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @staticmethod
    @jwt_required()
    @admin_required
    def create_teacher(data):
        """Cas d'utilisation: créer un nouvel enseignant"""
        try:
            # Vérifier les données requises
            required_fields = ['nom', 'prenom', 'email', 'mot_de_passe']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'message': f'Le champ {field} est requis'}), 400
            
            # Créer l'enseignant
            teacher = AdminService.create_teacher(data)
            
            return jsonify({
                'success': True,
                'message': 'Enseignant créé avec succès',
                'data': AdminService.serialize_user(teacher)
            }), 201
        except ValueError as e:
            return jsonify({'success': False, 'message': str(e)}), 400
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @staticmethod
    @jwt_required()
    @admin_required
    def update_user(user_id, data):
        """Cas d'utilisation: mettre à jour un utilisateur"""
        try:
            # Mettre à jour l'utilisateur
            user = AdminService.update_user(user_id, data)
            
            return jsonify({
                'success': True,
                'message': 'Utilisateur mis à jour avec succès',
                'data': AdminService.serialize_user(user)
            }), 200
        except ValueError as e:
            return jsonify({'success': False, 'message': str(e)}), 400
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @staticmethod
    @jwt_required()
    @admin_required
    def delete_user(user_id):
        """Cas d'utilisation: supprimer un utilisateur"""
        try:
            # Supprimer l'utilisateur
            success = AdminService.delete_user(user_id)
            
            if success:
                return jsonify({
                    'success': True,
                    'message': 'Utilisateur supprimé avec succès'
                }), 200
            else:
                return jsonify({'success': False, 'message': 'Utilisateur non trouvé'}), 404
        except ValueError as e:
            return jsonify({'success': False, 'message': str(e)}), 400
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
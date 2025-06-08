from flask import request, jsonify
from Services.AdminServices import AdminService
from flask_jwt_extended import create_access_token, create_refresh_token
from Models.Utilisateur import Utilisateur
from extensions import bcrypt
from datetime import timedelta

class AuthController:
    @staticmethod
    def register_student():
        """Endpoint pour l'inscription d'un étudiant"""
        try:
            data = request.get_json()
            
            # Vérifier les données requises
            required_fields = ['nom', 'prenom', 'email']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'message': f'Le champ {field} est requis'}), 400
            
            # Créer l'étudiant (un mot de passe sera généré automatiquement)
            student = AdminService.create_student(data)
            
            return jsonify({
                'success': True,
                'message': 'Compte étudiant créé avec succès. Veuillez vérifier votre email pour vos informations de connexion.',
                'data': AdminService.serialize_user(student)
            }), 201
        except ValueError as e:
            return jsonify({'success': False, 'message': str(e)}), 400
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
    
    @staticmethod
    def register_teacher():
        """Endpoint pour l'inscription d'un enseignant"""
        try:
            data = request.get_json()
            
            # Vérifier les données requises
            required_fields = ['nom', 'prenom', 'email']
            for field in required_fields:
                if field not in data:
                    return jsonify({'success': False, 'message': f'Le champ {field} est requis'}), 400
            
            # Créer l'enseignant (un mot de passe sera généré automatiquement)
            teacher = AdminService.create_teacher(data)
            
            return jsonify({
                'success': True,
                'message': 'Compte enseignant créé avec succès. Veuillez vérifier votre email pour vos informations de connexion.',
                'data': AdminService.serialize_user(teacher)
            }), 201
        except ValueError as e:
            return jsonify({'success': False, 'message': str(e)}), 400
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
    
    @staticmethod
    def login():
        """Endpoint pour l'authentification"""
        try:
            data = request.get_json()
            
            # Vérifier les données requises
            if not data or not data.get('email') or not data.get('mot_de_passe'):
                return jsonify({'success': False, 'message': 'Email et mot de passe sont requis'}), 400
            
            # Récupérer l'utilisateur par email
            user = Utilisateur.query.filter_by(email=data.get('email')).first()
            
            # Vérifier si l'utilisateur existe et si le mot de passe est correct
            if not user or not user.check_password(data.get('mot_de_passe')):
                return jsonify({'success': False, 'message': 'Email ou mot de passe incorrect'}), 401
            
            # Créer les tokens JWT
            access_token = create_access_token(identity=user.id, expires_delta=timedelta(hours=1))
            refresh_token = create_refresh_token(identity=user.id)
            
            # Retourner les tokens et les informations de l'utilisateur
            return jsonify({
                'success': True,
                'message': 'Connexion réussie',
                'data': {
                    'user': AdminService.serialize_user(user),
                    'access_token': access_token,
                    'refresh_token': refresh_token
                }
            }), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
    
    @staticmethod
    def change_password():
        """Endpoint pour changer le mot de passe"""
        try:
            data = request.get_json()
            
            # Vérifier les données requises
            if not data or not data.get('email') or not data.get('ancien_mot_de_passe') or not data.get('nouveau_mot_de_passe'):
                return jsonify({
                    'success': False, 
                    'message': 'Email, ancien mot de passe et nouveau mot de passe sont requis'
                }), 400
            
            # Récupérer l'utilisateur par email
            user = Utilisateur.query.filter_by(email=data.get('email')).first()
            
            # Vérifier si l'utilisateur existe et si l'ancien mot de passe est correct
            if not user or not user.check_password(data.get('ancien_mot_de_passe')):
                return jsonify({'success': False, 'message': 'Email ou ancien mot de passe incorrect'}), 401
            
            # Mettre à jour le mot de passe
            user.set_password(data.get('nouveau_mot_de_passe'))
            user.save()
            
            return jsonify({
                'success': True,
                'message': 'Mot de passe changé avec succès'
            }), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
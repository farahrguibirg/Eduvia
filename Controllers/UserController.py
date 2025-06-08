
from flask import request, jsonify, send_file
from UseCases.UserUseCase import UserUseCase

class UserController:
    def __init__(self):
        self.user_usecase = UserUseCase()
    
    def get_user_info(self, user_id):
        """Contrôleur pour récupérer les informations de base d'un utilisateur"""
        try:
            result = self.user_usecase.get_user_basic_info(user_id)
            
            if result['success']:
                return jsonify({
                    'status': 'success',
                    'data': result['data']
                }), 200
            else:
                return jsonify({
                    'status': 'error',
                    'message': result['error']
                }), 404 if result['error'] == 'Utilisateur non trouvé' else 400
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500
    
    def change_password(self, user_id):
        """Contrôleur pour changer le mot de passe d'un utilisateur"""
        try:
            # Récupérer les données du corps de la requête
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'status': 'error',
                    'message': 'Aucune donnée fournie'
                }), 400
            
            current_password = data.get('current_password')
            new_password = data.get('new_password')
            
            # Valider les données
            if not current_password or not new_password:
                return jsonify({
                    'status': 'error',
                    'message': 'Données incomplètes: current_password et new_password sont requis'
                }), 400
            
            # Changer le mot de passe
            result = self.user_usecase.change_user_password(user_id, current_password, new_password)
            
            if result['success']:
                return jsonify({
                    'status': 'success',
                    'message': result['message']
                }), 200
            else:
                return jsonify({
                    'status': 'error',
                    'message': result['message']
                }), 400
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500
    
    def add_profile_image(self, user_id):
        """Contrôleur pour ajouter une image de profil"""
        try:
            if 'image' not in request.files:
                return jsonify({
                    'status': 'error',
                    'message': 'Aucun fichier image fourni'
                }), 400
            
            image_file = request.files['image']
            
            result = self.user_usecase.process_profile_image_upload(user_id, image_file)
            
            if result['success']:
                return jsonify({
                    'status': 'success',
                    'message': result['message']
                }), 201
            else:
                return jsonify({
                    'status': 'error',
                    'message': result['message']
                }), 400
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500
    
    def update_profile_image(self, user_id):
        """Contrôleur pour mettre à jour une image de profil"""
        try:
            if 'image' not in request.files:
                return jsonify({
                    'status': 'error',
                    'message': 'Aucun fichier image fourni'
                }), 400
            
            image_file = request.files['image']
            
            # Nous utilisons le même use case que pour l'ajout car la logique est similaire
            result = self.user_usecase.process_profile_image_upload(user_id, image_file)
            
            if result['success']:
                return jsonify({
                    'status': 'success',
                    'message': result['message']
                }), 200
            else:
                return jsonify({
                    'status': 'error',
                    'message': result['message']
                }), 400
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500
    
    def delete_profile_image(self, user_id):
        """Contrôleur pour supprimer une image de profil"""
        try:
            result = self.user_usecase.remove_profile_image(user_id)
            
            if result['success']:
                return jsonify({
                    'status': 'success',
                    'message': result['message']
                }), 200
            else:
                return jsonify({
                    'status': 'error',
                    'message': result['message']
                }), 404
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500
    
    def get_profile_image(self, user_id):
        """Contrôleur pour récupérer l'image de profil"""
        try:
            result = self.user_usecase.retrieve_profile_image(user_id)
            
            if result['success']:
                return send_file(result['image_path'])
            else:
                return jsonify({
                    'status': 'error',
                    'message': result['message']
                }), 404
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500
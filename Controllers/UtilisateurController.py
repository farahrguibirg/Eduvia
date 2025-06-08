from flask import request, jsonify
import json

class AuthController:
    def __init__(self, auth_usecase):
        self.auth_usecase = auth_usecase
    
    def register(self):
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "Données manquantes"}), 400
            
            # Validation des champs requis
            required_fields = ['nom', 'prenom', 'email', 'mot_de_passe', 'type']
            missing_fields = [field for field in required_fields if not data.get(field)]
            
            if missing_fields:
                return jsonify({
                    "error": "Champs manquants",
                    "fields": missing_fields
                }), 400
            
            nom = data.get('nom')
            prenom = data.get('prenom')
            email = data.get('email')
            mot_de_passe = data.get('mot_de_passe')
            type = data.get('type')
            code_secret = data.get('code_secret')  # Récupérer le code secret
            
            # Vérifier si le code secret est fourni pour les enseignants
            if type == 'enseignant' and not code_secret:
                return jsonify({
                    "error": "Code secret manquant",
                    "fields": ["code_secret"]
                }), 400
            
            utilisateur, errors = self.auth_usecase.register(nom, prenom, email, mot_de_passe, type, code_secret)
            
            if errors:
                return jsonify({"errors": errors}), 400
            
            return jsonify({
                "message": "Utilisateur enregistré avec succès",
                "user": {
                    "id": utilisateur.id,
                    "nom": utilisateur.nom,
                    "prenom": utilisateur.prenom,
                    "email": utilisateur.email,
                    "type": utilisateur.type
                }
            }), 201
            
        except Exception as e:
            return jsonify({
                "error": "Erreur lors de l'inscription",
                "details": str(e)
            }), 500
    
    def login(self):
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "Données manquantes"}), 400
            
            email = data.get('email')
            mot_de_passe = data.get('mot_de_passe')
            
            result, token, errors = self.auth_usecase.login(email, mot_de_passe)
            
            if errors:
                return jsonify({"errors": errors}), 400
            
            # Si 2FA est nécessaire
            if isinstance(result, dict) and result.get('need_2fa'):
                return jsonify({
                    "need_2fa": True,
                    "user_id": result.get('user_id')
                }), 200
            
            # Si login réussi sans 2FA
            return jsonify({
                "message": "Connexion réussie",
                "token": token,
                "user": {
                    "id": result.id,
                    "nom": result.nom,
                    "prenom": result.prenom,
                    "email": result.email,
                    "type": result.type
                }
            }), 200
        except Exception as e:
            print(f"Erreur lors de la connexion: {str(e)}")
            return jsonify({
                "error": "Erreur lors de la connexion",
                "details": str(e)
            }), 500
    
    def verify_2fa(self):
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400

        user_id = data.get('user_id')
        token = data.get('token')

        jwt_token, errors = self.auth_usecase.verify_2fa(user_id, token)

        if errors:
            return jsonify({"errors": errors}), 400

        # Ajout de la récupération de l'utilisateur pour la réponse
        utilisateur = self.auth_usecase.auth_service.utilisateur_repository.get_by_id(user_id)
        from Models.Utilisateur import Utilisateur
        from marshmallow import Schema, fields
        class UserSchema(Schema):
            id = fields.Int()
            email = fields.Str()
            nom = fields.Str()
            prenom = fields.Str()
            type = fields.Str()
            tfa_enabled = fields.Bool()
        user_schema = UserSchema()
        user_data = user_schema.dump(utilisateur)
        print("USER renvoyé après 2FA:", user_data)
        if not user_data or not user_data.get('id'):
            print("ERREUR: user_data vide ou incomplet:", user_data)
            return jsonify({"errors": "Utilisateur non trouvé après 2FA"}), 400

        return jsonify({
            "message": "Authentification réussie",
            "token": jwt_token,
            "user": user_data
        }), 200
    
    def setup_2fa(self):
        user_id = request.jwt_payload.get('sub')
        
        totp_uri, errors = self.auth_usecase.setup_2fa(user_id)
        
        if errors:
            return jsonify({"errors": errors}), 400
        
        return jsonify({
            "totp_uri": totp_uri
        }), 200
    
    def activate_2fa(self):
        data = request.get_json()
        user_id = request.jwt_payload.get('sub')
        
        if not data:
            return jsonify({"error": "Données manquantes"}), 400
        
        token = data.get('token')
        
        success, errors = self.auth_usecase.activate_2fa(user_id, token)
        
        if errors:
            return jsonify({"errors": errors}), 400
        
        return jsonify({
            "message": "Authentification à deux facteurs activée avec succès"
        }), 200

    def request_password_reset(self):
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400

        email = data.get('email')
        if not email:
            return jsonify({"error": "Email manquant"}), 400

        success, errors = self.auth_usecase.request_password_reset(email)
        if errors:
            return jsonify({"errors": errors}), 400

        return jsonify({
            "message": "Si l'adresse email existe, un lien de réinitialisation a été envoyé"
        }), 200

    def reset_password(self):
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400

        token = data.get('token')
        nouveau_mot_de_passe = data.get('nouveau_mot_de_passe')
        if not token or not nouveau_mot_de_passe:
            return jsonify({
                "error": "Token ou nouveau mot de passe manquant",
                "fields": [field for field in ['token', 'nouveau_mot_de_passe'] if not data.get(field)]
            }), 400

        success, errors = self.auth_usecase.reset_password(token, nouveau_mot_de_passe)
        if errors:
            return jsonify({"errors": errors}), 400

        return jsonify({
            "message": "Mot de passe réinitialisé avec succès"
        }), 200

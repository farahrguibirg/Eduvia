""""
from functools import wraps
from flask import request, jsonify, current_app
import jwt

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Vérifier si le token est présent dans l'en-tête
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token manquant'}), 401
        
        if not token:
            return jsonify({'message': 'Token manquant'}), 401
        
        try:
            # Décoder le token
            payload = jwt.decode(
                token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=['HS256']
            )
            request.jwt_payload = payload
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expiré. Veuillez vous reconnecter'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token invalide'}), 401
        
        return f(*args, **kwargs)
    
    return decorated
    """
##middleware
from functools import wraps
from flask import request, jsonify, current_app
import jwt

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Vérifier si le token est présent dans l'en-tête
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token manquant'}), 401
        
        if not token:
            return jsonify({'message': 'Token manquant'}), 401
        
        try:
            # Décoder le token
            payload = jwt.decode(
                token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=['HS256']
            )
            request.jwt_payload = payload
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expiré. Veuillez vous reconnecter'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token invalide'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

def role_required(role):
    """Vérifie si l'utilisateur a le rôle requis via le token JWT"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = None
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                try:
                    token = auth_header.split(" ")[1]
                except IndexError:
                    return jsonify({'message': 'Token manquant'}), 401
            if not token:
                return jsonify({'message': 'Token manquant'}), 401
            try:
                payload = jwt.decode(
                    token,
                    current_app.config['JWT_SECRET_KEY'],
                    algorithms=['HS256']
                )
                user_role = payload.get('type')  # ou 'role' selon ton token
                if user_role != role:
                    return jsonify({'error': f'Accès non autorisé. Rôle {role} requis'}), 403
                request.jwt_payload = payload
            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token expiré. Veuillez vous reconnecter'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Token invalide'}), 401
            return f(*args, **kwargs)
        return decorated_function
    return decorator

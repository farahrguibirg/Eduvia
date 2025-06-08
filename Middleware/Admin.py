from functools import wraps
from flask import request, jsonify
import jwt
from flask import current_app
from Repository.AdminRepository import AdminRepository

def admin_required(f):
    """
    Middleware pour vérifier que l'utilisateur est connecté et est un administrateur
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Vérifier si le token est présent dans l'en-tête
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token manquant'}), 401
            
        try:
            # Décoder le token
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            user_id = data['user_id']
            
            # Vérifier si l'utilisateur existe et est un administrateur
            current_user = AdminRepository.get_user_by_id(user_id)
            if not current_user or current_user.type != 'Administrateur':
                return jsonify({'error': 'Accès interdit - Droits administrateur requis'}), 403
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expiré'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token invalide'}), 401
            
        # Tout est OK, continuer vers la fonction
        return f(*args, **kwargs)
        
    return decorated
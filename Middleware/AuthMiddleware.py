
# Middleware pour la vérification des rôles
# middleware/auth_middleware.py
""""""
"""
from functools import wraps
from flask import request, jsonify, g
from Models.Utilisateur import Utilisateur
from Models.Enseignant import Enseignant
from Models.Etudiant import Etudiant
import os

def get_current_user():
    #Récupère l'utilisateur à partir de l'ID dans la requête
    utilisateur_id = request.form.get('utilisateur_id') or request.args.get('utilisateur_id')
    if not utilisateur_id:
        return None
    return Utilisateur.query.get(int(utilisateur_id))

def role_required(role):
    #Vérifie si l'utilisateur a le rôle requis
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            
            if not user:
                return jsonify({'error': 'Authentification requise'}), 401
            
            if role == 'enseignant' and not isinstance(user, Enseignant):
                return jsonify({'error': 'Accès non autorisé. Rôle enseignant requis'}), 403
            
            # Pour des opérations spécifiques sur les PDF (mise à jour, suppression),
            # vérifier que l'enseignant est bien le propriétaire du PDF
            if 'pdf_id' in kwargs:
                from Models.PdfCours import PdfCours
                pdf = PdfCours.query.get(kwargs['pdf_id'])
                if pdf and pdf.utilisateur_id != user.id and role == 'enseignant':
                    return jsonify({'error': 'Vous n\'êtes pas autorisé à modifier ce PDF'}), 403
            
            # Stocker l'utilisateur pour les fonctions suivantes
            g.user = user
            return f(*args, **kwargs)
        return decorated_function
    return decorator
"""
# Middleware pour la vérification des rôles
# middleware/auth_middleware.py
""""""
from functools import wraps
from flask import request, jsonify, g, current_app
from Models.Utilisateur import Utilisateur
from Models.Enseignant import Enseignant
from Models.Etudiant import Etudiant
import jwt
import os

print(f"PyJWT version utilisée: {jwt.__version__}")

def get_current_user():
    """Récupère l'utilisateur à partir du token JWT"""
    auth_header = request.headers.get('Authorization')
    print(f"Authorization header: {auth_header}")
    
    if not auth_header or not auth_header.startswith('Bearer '):
        print("Pas de header Authorization ou format invalide")
        return None
    
    try:
        token = auth_header.split(' ')[1]
        print(f"Token extrait: {token[:20]}...")
        
        # Utiliser la même source de clé que le service d'authentification
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        print(f"Payload décodé: {payload}")
        
        user_id = payload.get('sub')
        if not user_id:
            print("Pas d'ID utilisateur dans le token")
            return None
            
        # Convertir l'ID en entier pour la recherche dans la base de données
        user = Utilisateur.query.get(int(user_id))
        print(f"Utilisateur trouvé: {user.id if user else 'Non trouvé'}")
        return user
    except jwt.InvalidTokenError as e:
        print(f"Token invalide: {str(e)}")
        return None
    except ValueError as e:
        print(f"Erreur de valeur: {str(e)}")
        return None
    except Exception as e:
        print(f"Erreur inattendue: {str(e)}")
        return None

def role_required(role):
    """Vérifie si l'utilisateur a le rôle requis"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Authentification requise'}), 401
            
            try:
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
                user_type = payload.get('type')
                
                if not user_type or user_type != role:
                    return jsonify({'error': f'Accès refusé. Rôle {role} requis'}), 403
                
                # Récupérer l'utilisateur pour les vérifications supplémentaires
                user = get_current_user()
                if not user:
                    return jsonify({'error': 'Utilisateur non trouvé'}), 401
                
                # Pour des opérations spécifiques sur les PDF (mise à jour, suppression),
                # vérifier que l'enseignant est bien le propriétaire du PDF
                if 'pdf_id' in kwargs:
                    from Models.PdfCours import PdfCours
                    pdf = PdfCours.query.get(kwargs['pdf_id'])
                    if pdf and pdf.utilisateur_id != user.id and role == 'enseignant':
                        return jsonify({'error': 'Vous n\'êtes pas autorisé à modifier ce PDF'}), 403
                
                # Stocker l'utilisateur pour les fonctions suivantes
                g.user = user
                return f(*args, **kwargs)
            except jwt.InvalidTokenError:
                return jsonify({'error': 'Token invalide'}), 401
            except Exception as e:
                print(f"Erreur lors de la vérification du rôle: {str(e)}")
                return jsonify({'error': 'Erreur lors de la vérification des permissions'}), 500
        return decorated_function
    return decorator

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        print(f"Authorization header: {auth_header}")
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentification requise'}), 401
        try:
            token = auth_header.split(' ')[1]
            print(f"Token reçu pour décodage: {token}")
            print(f"Clé JWT utilisée pour décodage: {current_app.config['JWT_SECRET_KEY']}")
            payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            print(f"Payload décodé: {payload}")
            from Models.Utilisateur import Utilisateur
            user = Utilisateur.query.get(int(payload.get('sub')))
            print(f"Utilisateur trouvé: {user.id if user else 'Non trouvé'}")
            if not user:
                return jsonify({'error': 'Utilisateur non trouvé'}), 401
            g.user = user
            return f(*args, **kwargs)
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token invalide'}), 401
        except Exception as e:
            print(f"Erreur auth_required: {str(e)}")
            return jsonify({'error': 'Erreur lors de l\'authentification'}), 500
    return decorated


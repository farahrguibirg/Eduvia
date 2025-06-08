from flask import Blueprint
from Controllers.UserController import UserController

# Création du Blueprint pour les routes utilisateur
user_bp = Blueprint('user', __name__, url_prefix='/api/users')

# Initialisation du contrôleur
user_controller = UserController()

# Routes pour les informations utilisateur
@user_bp.route('/<int:user_id>/info', methods=['GET'])
def get_user_info(user_id):
    """Route pour récupérer les informations de base d'un utilisateur (nom, prénom, email)"""
    return user_controller.get_user_info(user_id)

# Routes pour la gestion des mots de passe
@user_bp.route('/<int:user_id>/password', methods=['PUT'])
def change_password(user_id):
    """Route pour changer le mot de passe d'un utilisateur"""
    return user_controller.change_password(user_id)

# Routes pour la gestion des images de profil
@user_bp.route('/<int:user_id>/profile-image', methods=['POST'])
def add_profile_image(user_id):
    """Route pour ajouter une image de profil"""
    return user_controller.add_profile_image(user_id)

@user_bp.route('/<int:user_id>/profile-image', methods=['PUT'])
def update_profile_image(user_id):
    """Route pour mettre à jour une image de profil"""
    return user_controller.update_profile_image(user_id)

@user_bp.route('/<int:user_id>/profile-image', methods=['DELETE'])
def delete_profile_image(user_id):
    """Route pour supprimer une image de profil"""
    return user_controller.delete_profile_image(user_id)

@user_bp.route('/<int:user_id>/profile-image', methods=['GET'])
def get_profile_image(user_id):
    """Route pour récupérer l'image de profil"""
    return user_controller.get_profile_image(user_id)

# Fonction d'enregistrement du blueprint dans l'application Flask
def register_routes(app):
    app.register_blueprint(user_bp)
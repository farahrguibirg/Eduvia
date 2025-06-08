# 1. Mise à jour de Repository/UserRepository.py
from app import db
from Models.Utilisateur import Utilisateur
import os
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

class UserRepository:
    def __init__(self):
        self.upload_folder = 'static/profile_images'
        # S'assurer que le dossier de téléchargement existe
        os.makedirs(self.upload_folder, exist_ok=True)
    
    def get_user_by_id(self, user_id):
        """Récupère un utilisateur par son ID"""
        return Utilisateur.query.get(user_id)
    
    def get_user_info(self, user_id):
        """Récupère uniquement le nom, prénom et email d'un utilisateur"""
        user = self.get_user_by_id(user_id)
        if user:
            return {
                'nom': user.nom,
                'prenom': user.prenom,
                'email': user.email
            }
        return None
    
    def get_user_password(self, user_id):
        """Récupère le mot de passe haché d'un utilisateur"""
        user = self.get_user_by_id(user_id)
        if user:
            return user.mot_de_passe
        return None
    
    def update_user_password(self, user_id, new_password_hash):
        """Met à jour le mot de passe haché d'un utilisateur"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        user.mot_de_passe = new_password_hash
        try:
            db.session.commit()
            return True
        except Exception:
            db.session.rollback()
            return False
    
    def add_profile_image(self, user_id, image_file):
        """Ajoute une image de profil pour un utilisateur"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        # Sécuriser le nom du fichier et créer un nom unique basé sur l'ID utilisateur
        filename = secure_filename(image_file.filename)
        extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'png'
        profile_image_path = f"{self.upload_folder}/user_{user_id}.{extension}"
        
        # Supprimer l'ancienne image si elle existe
        self._delete_existing_profile_image(user_id)
        
        # Sauvegarder la nouvelle image
        image_file.save(profile_image_path)
        
        return True
    
    def update_profile_image(self, user_id, image_file):
        """Met à jour l'image de profil d'un utilisateur (même logique que l'ajout)"""
        return self.add_profile_image(user_id, image_file)
    
    def delete_profile_image(self, user_id):
        """Supprime l'image de profil d'un utilisateur"""
        return self._delete_existing_profile_image(user_id)
    
    def _delete_existing_profile_image(self, user_id):
        """Supprime l'image de profil existante"""
        # Chercher toutes les images potentielles avec différentes extensions
        for extension in ['jpg', 'jpeg', 'png', 'gif']:
            profile_image_path = f"{self.upload_folder}/user_{user_id}.{extension}"
            if os.path.exists(profile_image_path):
                os.remove(profile_image_path)
                return True
        return False
    
    def get_profile_image_path(self, user_id):
        """Récupère le chemin de l'image de profil d'un utilisateur"""
        for extension in ['jpg', 'jpeg', 'png', 'gif']:
            profile_image_path = f"{self.upload_folder}/user_{user_id}.{extension}"
            if os.path.exists(profile_image_path):
                return profile_image_path
        return None


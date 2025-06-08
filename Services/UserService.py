from Repository.UserRepository import UserRepository
import bcrypt
import os
import base64

class UserService:
    def __init__(self):
        self.user_repository = UserRepository()
    
    def get_user_info(self, user_id):
        """Récupère les informations basiques d'un utilisateur (nom, prénom, email)"""
        return self.user_repository.get_user_info(user_id)
    
    def get_password_hash(self, user_id):
        """Récupère le hash du mot de passe d'un utilisateur"""
        return self.user_repository.get_user_password(user_id)
    
    def change_password(self, user_id, current_password, new_password):
        """Change le mot de passe d'un utilisateur avec hachage sécurisé"""
        # Récupérer l'utilisateur pour vérifier son mot de passe
        user = self.user_repository.get_user_by_id(user_id)
        
        if not user:
            return False, "Utilisateur non trouvé."
        
        # Vérifier le mot de passe actuel avec bcrypt
        try:
            password_correct = bcrypt.checkpw(
                current_password.encode('utf-8'),
                user.mot_de_passe.encode('utf-8')
            )
        except Exception as e:
            print(f"Erreur lors de la vérification du mot de passe: {str(e)}")
            return False, "Erreur lors de la vérification du mot de passe."
        
        if not password_correct:
            return False, "Mot de passe actuel incorrect."
        
        # Valider le nouveau mot de passe
        if not self._validate_password(new_password):
            return False, "Le nouveau mot de passe ne respecte pas les critères de sécurité."
        
        # Hacher le nouveau mot de passe avec bcrypt
        try:
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), salt).decode('utf-8')
        except Exception as e:
            print(f"Erreur lors du hachage du nouveau mot de passe: {str(e)}")
            return False, "Erreur lors du hachage du nouveau mot de passe."
        
        # Mettre à jour le mot de passe
        result = self.user_repository.update_user_password(user_id, hashed_password)
        if result:
            return True, "Mot de passe mis à jour avec succès."
        return False, "Erreur lors de la mise à jour du mot de passe."
    
    def _validate_password(self, password):
        """Valide que le mot de passe respecte les critères de sécurité"""
        # Au moins 8 caractères, au moins une lettre majuscule, une lettre minuscule et un chiffre
        if len(password) < 8:
            return False
        
        has_uppercase = any(char.isupper() for char in password)
        has_lowercase = any(char.islower() for char in password)
        has_digit = any(char.isdigit() for char in password)
        
        return has_uppercase and has_lowercase and has_digit
    
    def add_profile_image(self, user_id, image_file):
        """Ajoute une image de profil pour un utilisateur"""
        # Validation du fichier image
        if not self._validate_image(image_file):
            return False, "Format d'image non valide. Utilisez JPG, JPEG, PNG ou GIF."
        
        result = self.user_repository.add_profile_image(user_id, image_file)
        if result:
            return True, "Image de profil ajoutée avec succès."
        return False, "Erreur lors de l'ajout de l'image de profil."
    
    def update_profile_image(self, user_id, image_file):
        """Met à jour l'image de profil d'un utilisateur"""
        # Validation du fichier image
        if not self._validate_image(image_file):
            return False, "Format d'image non valide. Utilisez JPG, JPEG, PNG ou GIF."
        
        result = self.user_repository.update_profile_image(user_id, image_file)
        if result:
            return True, "Image de profil mise à jour avec succès."
        return False, "Erreur lors de la mise à jour de l'image de profil."
    
    def delete_profile_image(self, user_id):
        """Supprime l'image de profil d'un utilisateur"""
        result = self.user_repository.delete_profile_image(user_id)
        if result:
            return True, "Image de profil supprimée avec succès."
        return False, "Aucune image de profil à supprimer ou erreur lors de la suppression."
    
    def get_profile_image_path(self, user_id):
        """Récupère le chemin de l'image de profil"""
        return self.user_repository.get_profile_image_path(user_id)
    
    def _validate_image(self, file):
        """Valide que le fichier est bien une image"""
        if not file:
            return False
        
        # Vérifier l'extension du fichier
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif'}
        filename = file.filename
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in allowed_extensions
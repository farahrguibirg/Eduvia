
# 3. Mise à jour de UseCases/UserUseCase.py
from Services.UserService import UserService
import os

class UserUseCase:
    """
    Classe de cas d'utilisation pour les opérations liées aux utilisateurs.
    Cette couche gère les cas d'utilisation spécifiques de l'application et
    orchestre les appels aux services.
    """
    
    def __init__(self):
        self.user_service = UserService()
    
    def get_user_basic_info(self, user_id):
        """
        Cas d'utilisation: Récupérer les informations basiques d'un utilisateur.
        
        Args:
            user_id (int): L'identifiant de l'utilisateur
            
        Returns:
            dict: Informations de base de l'utilisateur (nom, prénom, email) ou None
        """
        # Vérifier que l'ID est valide
        if not isinstance(user_id, int) and not (isinstance(user_id, str) and user_id.isdigit()):
            return {
                'success': False, 
                'error': 'ID utilisateur invalide',
                'data': None
            }
        
        # Convertir en int si c'est une chaîne
        if isinstance(user_id, str):
            user_id = int(user_id)
        
        # Récupérer les informations
        user_info = self.user_service.get_user_info(user_id)
        
        if user_info:
            return {
                'success': True,
                'error': None,
                'data': user_info
            }
        else:
            return {
                'success': False,
                'error': 'Utilisateur non trouvé',
                'data': None
            }
    
    def change_user_password(self, user_id, current_password, new_password):
        """
        Cas d'utilisation: Changer le mot de passe d'un utilisateur.
        
        Args:
            user_id (int/str): L'identifiant de l'utilisateur
            current_password (str): Le mot de passe actuel
            new_password (str): Le nouveau mot de passe
            
        Returns:
            dict: Résultat de l'opération avec un message
        """
        # Validation de l'ID utilisateur
        if not isinstance(user_id, int) and not (isinstance(user_id, str) and user_id.isdigit()):
            return {
                'success': False,
                'message': 'ID utilisateur invalide'
            }
        
        # Convertir en int si c'est une chaîne
        if isinstance(user_id, str):
            user_id = int(user_id)
        
        # Validation des mots de passe
        if not current_password or not new_password:
            return {
                'success': False,
                'message': 'Mot de passe actuel et nouveau mot de passe requis'
            }
        
        # Vérifier que l'utilisateur existe
        user_info = self.user_service.get_user_info(user_id)
        if not user_info:
            return {
                'success': False,
                'message': 'Utilisateur non trouvé'
            }
        
        # Changer le mot de passe
        success, message = self.user_service.change_password(user_id, current_password, new_password)
        
        return {
            'success': success,
            'message': message
        }
    
    def process_profile_image_upload(self, user_id, image_file):
        """
        Cas d'utilisation: Traitement d'un téléchargement d'image de profil (ajout ou mise à jour).
        
        Args:
            user_id (str/int): L'identifiant de l'utilisateur
            image_file (FileStorage): Le fichier image uploadé
            
        Returns:
            dict: Résultat de l'opération avec message
        """
        # Validation de l'ID utilisateur
        if not user_id:
            return {
                'success': False,
                'message': 'ID utilisateur requis'
            }
        
        # Validation que l'utilisateur existe
        user_info = self.user_service.get_user_info(user_id)
        if not user_info:
            return {
                'success': False,
                'message': 'Utilisateur non trouvé'
            }
        
        # Validation du fichier
        if not image_file or image_file.filename == '':
            return {
                'success': False,
                'message': 'Aucun fichier image valide fourni'
            }
        
        # Vérifier si une image existe déjà pour cet utilisateur
        existing_image = self.user_service.get_profile_image_path(user_id)
        
        if existing_image:
            # Mise à jour de l'image existante
            success, message = self.user_service.update_profile_image(user_id, image_file)
        else:
            # Ajout d'une nouvelle image
            success, message = self.user_service.add_profile_image(user_id, image_file)
        
        return {
            'success': success,
            'message': message
        }
    
    def remove_profile_image(self, user_id):
        """
        Cas d'utilisation: Suppression de l'image de profil d'un utilisateur.
        
        Args:
            user_id (str/int): L'identifiant de l'utilisateur
            
        Returns:
            dict: Résultat de l'opération avec message
        """
        # Validation de l'ID utilisateur
        if not isinstance(user_id, int) and not (isinstance(user_id, str) and user_id.isdigit()):
            return {
                'success': False,
                'message': 'ID utilisateur invalide'
            }
        
        # Convertir en int si c'est une chaîne
        if isinstance(user_id, str):
            user_id = int(user_id)
        
        # Vérifier que l'utilisateur existe
        user_info = self.user_service.get_user_info(user_id)
        if not user_info:
            return {
                'success': False,
                'message': 'Utilisateur non trouvé'
            }
        
        # Vérifier si une image existe pour cet utilisateur
        existing_image = self.user_service.get_profile_image_path(user_id)
        if not existing_image:
            return {
                'success': False,
                'message': 'Aucune image de profil à supprimer pour cet utilisateur'
            }
        
        # Suppression de l'image
        success, message = self.user_service.delete_profile_image(user_id)
        
        return {
            'success': success,
            'message': message
        }
    
    def retrieve_profile_image(self, user_id):
    # Validation de l'ID utilisateur
      if not isinstance(user_id, int) and not (isinstance(user_id, str) and user_id.isdigit()):
        return {
            'success': False,
            'message': 'ID utilisateur invalide',
            'image_path': None
        }
    
    # Convertir en int si c'est une chaîne
      if isinstance(user_id, str):
        user_id = int(user_id)
    
    # Vérifier que l'utilisateur existe
      user_info = self.user_service.get_user_info(user_id)
      if not user_info:
       return {
            'success': False,
            'message': 'Utilisateur non trouvé',
            'image_path': None
        }
    
    # Récupérer le chemin de l'image
      image_path = self.user_service.get_profile_image_path(user_id)
      if not image_path or not os.path.exists(image_path):
        return {
            'success': False,
            'message': 'Image de profil non trouvée',
            'image_path': None
        }
    
      return {
        'success': True,
        'message': 'Image trouvée',
        'image_path': image_path
    }
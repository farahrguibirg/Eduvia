"""
from Repository.AdminRepository import AdminRepository
from extensions import bcrypt
from app import db

class AdminService:
    @staticmethod
    def get_all_students():
        Récupère tous les étudiants
        return AdminRepository.get_all_users(user_type='etudiant')
    
    @staticmethod
    def get_all_teachers():
        Récupère tous les enseignants
        return AdminRepository.get_all_users(user_type='enseignant')

    @staticmethod
    def get_user_by_id(user_id):
        Récupère un utilisateur par son ID
        return AdminRepository.get_user_by_id(user_id)
    
    @staticmethod
    def check_email_exists(email):
        Vérifie si l'email existe déjà
        return AdminRepository.get_user_by_email(email) is not None
    
    @staticmethod
    def create_student(data):
        Crée un nouvel étudiant
        # Vérifier si l'email existe déjà
        if AdminService.check_email_exists(data.get('email')):
            raise ValueError("L'email existe déjà dans la base de données")
        
        # Créer l'étudiant
        return AdminRepository.create_student(
            nom=data.get('nom'),
            prenom=data.get('prenom'),
            email=data.get('email'),
            mot_de_passe=data.get('mot_de_passe')
        )
    
    @staticmethod
    def create_teacher(data):
        Crée un nouvel enseignant
        # Vérifier si l'email existe déjà
        if AdminService.check_email_exists(data.get('email')):
            raise ValueError("L'email existe déjà dans la base de données")
        
        # Créer l'enseignant
        return AdminRepository.create_teacher(
            nom=data.get('nom'),
            prenom=data.get('prenom'),
            email=data.get('email'),
            mot_de_passe=data.get('mot_de_passe')
        )
    
    @staticmethod
    def update_user(user_id, data):
        Met à jour les informations d'un utilisateur
        # Vérifier si l'utilisateur existe
        user = AdminRepository.get_user_by_id(user_id)
        if not user:
            raise ValueError("Utilisateur non trouvé")
        
        # Vérifier si l'email est déjà utilisé par un autre utilisateur
        if data.get('email'):
            existing_user = AdminRepository.get_user_by_email(data.get('email'))
            if existing_user and existing_user.id != int(user_id):
                raise ValueError("Cet email est déjà utilisé par un autre utilisateur")
        
        # Mettre à jour l'utilisateur
        return AdminRepository.update_user(
            user_id=user_id,
            nom=data.get('nom'),
            prenom=data.get('prenom'),
            email=data.get('email'),
            mot_de_passe=data.get('mot_de_passe')
        )
    
    @staticmethod
    def delete_user(user_id):
        Supprime un utilisateur par son ID
        # Vérifier si l'utilisateur existe
        user = AdminRepository.get_user_by_id(user_id)
        if not user:
            return False
        
        # Supprimer l'utilisateur
        return AdminRepository.delete_user(user_id)
    
    @staticmethod
    def serialize_user(user):
        Sérialise un utilisateur pour l'API
        if not user:
            return None
        
        return {
            'id': user.id,
            'nom': user.nom,
            'prenom': user.prenom,
            'email': user.email,
            'type': user.type,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'updated_at': user.updated_at.isoformat() if user.updated_at else None
        }
        """
""""""
from Repository.AdminRepository import AdminRepository
from extensions import bcrypt
from app import db

class AdminService:
    @staticmethod
    def get_all_students():
        """Récupère tous les étudiants"""
        return AdminRepository.get_all_users(user_type='etudiant')
    
    @staticmethod
    def get_all_teachers():
        """Récupère tous les enseignants"""
        return AdminRepository.get_all_users(user_type='enseignant')

    @staticmethod
    def get_user_by_id(user_id):
        """Récupère un utilisateur par son ID"""
        return AdminRepository.get_user_by_id(user_id)
    
    @staticmethod
    def check_email_exists(email):
        """Vérifie si l'email existe déjà"""
        return AdminRepository.get_user_by_email(email) is not None
    
    @staticmethod
    def create_student(data):
        """Crée un nouvel étudiant"""
        # Vérifier si le mot de passe est présent et non vide
        if 'mot_de_passe' not in data or not data['mot_de_passe']:
            raise ValueError("Le mot de passe ne peut pas être vide")
            
        # Vérifier si l'email existe déjà
        if AdminService.check_email_exists(data.get('email')):
            raise ValueError("L'email existe déjà dans la base de données")
        
        # S'assurer que tous les champs nécessaires sont présents
        if not all(key in data and data[key] for key in ['nom', 'prenom', 'email']):
            raise ValueError("Tous les champs (nom, prenom, email) sont requis")
            
        # Créer l'étudiant
        return AdminRepository.create_student(
            nom=data.get('nom'),
            prenom=data.get('prenom'),
            email=data.get('email'),
            mot_de_passe=data.get('mot_de_passe')
        )
    
    @staticmethod
    def create_teacher(data):
        """Crée un nouvel enseignant"""
        # Vérifier si le mot de passe est présent et non vide
        if 'mot_de_passe' not in data or not data['mot_de_passe']:
            raise ValueError("Le mot de passe ne peut pas être vide")
            
        # Vérifier si l'email existe déjà
        if AdminService.check_email_exists(data.get('email')):
            raise ValueError("L'email existe déjà dans la base de données")
        
        # Créer l'enseignant
        return AdminRepository.create_teacher(
            nom=data.get('nom'),
            prenom=data.get('prenom'),
            email=data.get('email'),
            mot_de_passe=data.get('mot_de_passe')
        )
    
    @staticmethod
    def update_user(user_id, data):
        """Met à jour les informations d'un utilisateur"""
        # Vérifier si l'utilisateur existe
        user = AdminRepository.get_user_by_id(user_id)
        if not user:
            raise ValueError("Utilisateur non trouvé")
        
        # Vérifier si l'email est déjà utilisé par un autre utilisateur
        if data.get('email'):
            existing_user = AdminRepository.get_user_by_email(data.get('email'))
            if existing_user and existing_user.id != int(user_id):
                raise ValueError("Cet email est déjà utilisé par un autre utilisateur")
        
        # Vérifier si le mot de passe est vide
        if 'mot_de_passe' in data and not data['mot_de_passe']:
            raise ValueError("Le mot de passe ne peut pas être vide")
        
        # Mettre à jour l'utilisateur
        return AdminRepository.update_user(
            user_id=user_id,
            nom=data.get('nom'),
            prenom=data.get('prenom'),
            email=data.get('email'),
            mot_de_passe=data.get('mot_de_passe')
        )
    
    @staticmethod
    def delete_user(user_id):
        """Supprime un utilisateur par son ID"""
        # Vérifier si l'utilisateur existe
        user = AdminRepository.get_user_by_id(user_id)
        if not user:
            return False
        
        # Supprimer l'utilisateur
        return AdminRepository.delete_user(user_id)
    
    @staticmethod
    def serialize_user(user):
        """Sérialise un utilisateur pour l'API"""
        if not user:
            return None
        
        return {
            'id': user.id,
            'nom': user.nom,
            'prenom': user.prenom,
            'email': user.email,
            'type': user.type,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'updated_at': user.updated_at.isoformat() if user.updated_at else None
        }
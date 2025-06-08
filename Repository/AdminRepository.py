""""
from Models.Utilisateur import Utilisateur
from Models.Etudiant import Etudiant
from Models.Enseignant import Enseignant
from Models.Administrateur import Administrateur
from app import db
from sqlalchemy.exc import SQLAlchemyError
from extensions import bcrypt

class AdminRepository:
    @staticmethod
    def get_all_users(user_type=None):
        Récupère tous les utilisateurs ou selon un type spécifique
        try:
            query = Utilisateur.query
            if user_type:
                query = query.filter_by(type=user_type)
            return query.all()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")

    @staticmethod
    def get_user_by_id(user_id):
        Récupère un utilisateur par son ID
        try:
            return Utilisateur.query.get(user_id)
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")

    @staticmethod
    def get_user_by_email(email):
        Récupère un utilisateur par son email
        try:
            return Utilisateur.query.filter_by(email=email).first()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")

    @staticmethod
    def create_student(nom, prenom, email, mot_de_passe):
        Crée un nouvel étudiant
        try:
            # Hacher le mot de passe
            hashed_password = bcrypt.generate_password_hash(mot_de_passe).decode('utf-8')
            
            # Créer l'étudiant avec le mot de passe déjà haché
            etudiant = Etudiant(nom=nom, prenom=prenom, email=email, mot_de_passe=hashed_password)
            
            db.session.add(etudiant)
            db.session.commit()
            return etudiant
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")

    @staticmethod
    def create_teacher(nom, prenom, email, mot_de_passe):
        Crée un nouvel enseignant
        try:
            # Hacher le mot de passe
            hashed_password = bcrypt.generate_password_hash(mot_de_passe).decode('utf-8')
            
            # Créer l'enseignant avec le mot de passe déjà haché
            enseignant = Enseignant(nom=nom, prenom=prenom, email=email, mot_de_passe=hashed_password)
            
            db.session.add(enseignant)
            db.session.commit()
            return enseignant
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")
    
    @staticmethod
    def update_user(user_id, nom=None, prenom=None, email=None, mot_de_passe=None):
        Met à jour les informations d'un utilisateur
        try:
            user = Utilisateur.query.get(user_id)
            if not user:
                return None
            
            if nom:
                user.nom = nom
            if prenom:
                user.prenom = prenom
            if email:
                user.email = email
            if mot_de_passe:
                user.set_password(mot_de_passe)  # Utiliser la méthode de hachage de la classe
            
            db.session.commit()
            return user
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")
    
    @staticmethod
    def delete_user(user_id):
        Supprime un utilisateur par son ID
        try:
            user = Utilisateur.query.get(user_id)
            if not user:
                return False
            
            db.session.delete(user)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")
            """
from Models.Utilisateur import Utilisateur
from Models.Etudiant import Etudiant
from Models.Enseignant import Enseignant
from Models.Administrateur import Administrateur
from app import db
from sqlalchemy.exc import SQLAlchemyError
from extensions import bcrypt

class AdminRepository:
    @staticmethod
    def get_all_users(user_type=None):
        """Récupère tous les utilisateurs ou selon un type spécifique"""
        try:
            query = Utilisateur.query
            if user_type:
                query = query.filter_by(type=user_type)
            return query.all()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")

    @staticmethod
    def get_user_by_id(user_id):
        """Récupère un utilisateur par son ID"""
        try:
            return Utilisateur.query.get(user_id)
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")

    @staticmethod
    def get_user_by_email(email):
        """Récupère un utilisateur par son email"""
        try:
            return Utilisateur.query.filter_by(email=email).first()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")

    @staticmethod
    def create_student(nom, prenom, email, mot_de_passe):
        """Crée un nouvel étudiant"""
        try:
            # Vérifier que les paramètres ne sont pas vides
            if not all([nom, prenom, email, mot_de_passe]):
                raise ValueError("Tous les champs (nom, prenom, email, mot_de_passe) sont requis")
                
            # Créer l'étudiant avec type explicite
            etudiant = Etudiant(
                nom=nom, 
                prenom=prenom, 
                email=email, 
                mot_de_passe="temporaire",  # Sera remplacé par le hash
                type="etudiant"  # Important: définir explicitement le type
            )
            
            # Définir le mot de passe haché
            etudiant.mot_de_passe = bcrypt.generate_password_hash(mot_de_passe).decode('utf-8')
            
            db.session.add(etudiant)
            db.session.commit()
            return etudiant
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")

    @staticmethod
    def create_teacher(nom, prenom, email, mot_de_passe):
        """Crée un nouvel enseignant"""
        try:
            # Vérifier que les paramètres ne sont pas vides
            if not all([nom, prenom, email, mot_de_passe]):
                raise ValueError("Tous les champs (nom, prenom, email, mot_de_passe) sont requis")
                
            # Créer l'enseignant avec type explicite
            enseignant = Enseignant(
                nom=nom, 
                prenom=prenom, 
                email=email, 
                mot_de_passe="temporaire",  # Sera remplacé par le hash
                type="enseignant"  # Important: définir explicitement le type
            )
            
            # Définir le mot de passe haché
            enseignant.mot_de_passe = bcrypt.generate_password_hash(mot_de_passe).decode('utf-8')
            
            db.session.add(enseignant)
            db.session.commit()
            return enseignant
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")
    
    @staticmethod
    def update_user(user_id, nom=None, prenom=None, email=None, mot_de_passe=None):
        """Met à jour les informations d'un utilisateur"""
        try:
            user = Utilisateur.query.get(user_id)
            if not user:
                return None
            
            if nom:
                user.nom = nom
            if prenom:
                user.prenom = prenom
            if email:
                user.email = email
            if mot_de_passe:
                # Hacher directement le mot de passe
                user.mot_de_passe = bcrypt.generate_password_hash(mot_de_passe).decode('utf-8')
            
            # S'assurer que le type est toujours défini
            if not user.type:
                # Détecter le type en fonction de la classe
                if isinstance(user, Etudiant):
                    user.type = 'etudiant'
                elif isinstance(user, Enseignant):
                    user.type = 'enseignant'
                elif isinstance(user, Administrateur):
                    user.type = 'admin'
            
            db.session.commit()
            return user
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")
    
    @staticmethod
    def delete_user(user_id):
        """Supprime un utilisateur par son ID"""
        try:
            user = Utilisateur.query.get(user_id)
            if not user:
                return False
            
            db.session.delete(user)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")
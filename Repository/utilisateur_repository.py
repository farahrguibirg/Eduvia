""""
from Models.Utilisateur import Utilisateur
from app import db

class UtilisateurRepository:
    def get_by_id(self, user_id):
        return Utilisateur.query.get(user_id)

    def get_by_email(self, email):
        return Utilisateur.query.filter_by(email=email).first()

    def create(self, utilisateur):
        db.session.add(utilisateur)
        db.session.commit()
        return utilisateur

    def update(self, utilisateur):
        db.session.commit()
        return utilisateur

    def delete(self, utilisateur):
        db.session.delete(utilisateur)
        db.session.commit()
        
from Models.Utilisateur import Utilisateur
from app import db

class UtilisateurRepository:
    def create(self, utilisateur):
        db.session.add(utilisateur)
        db.session.commit()
        return utilisateur
    
    def get_by_id(self, user_id):
        return Utilisateur.query.get(user_id)
    
    def get_by_email(self, email):
        return Utilisateur.query.filter_by(email=email).first()
    
    def update(self, utilisateur):
        db.session.commit()
        return utilisateur
    
    def delete(self, utilisateur):
        db.session.delete(utilisateur)
        db.session.commit()
        """
"""from app import db
from Models.Utilisateur import Utilisateur

class UtilisateurRepository:
    @staticmethod
    def get_by_id(user_id):
        return Utilisateur.query.filter_by(id=user_id).first()
    
    @staticmethod
    def get_user_info(user_id):
        utilisateur = Utilisateur.query.get(user_id)
        if not utilisateur:
            return None
        
        return {
            'id': utilisateur.id,
            'nom': utilisateur.nom,
            'prenom': utilisateur.prenom,
            'email': utilisateur.email
        }"""
"""
from Models.Utilisateur import Utilisateur
from Models.Enseignant import Enseignant
from Models.Etudiant import Etudiant
from app import db

class UtilisateurRepository:
    def get_by_id(self, user_id):
        return Utilisateur.query.get(user_id)

    def get_by_email(self, email):
        return Utilisateur.query.filter_by(email=email).first()

    def create(self, utilisateur):
        try:
            db.session.add(utilisateur)
            db.session.commit()
            return utilisateur
        except Exception as e:
            db.session.rollback()
            raise e

    def update(self, utilisateur):
        try:
            db.session.commit()
            return utilisateur
        except Exception as e:
            db.session.rollback()
            raise e

    def delete(self, utilisateur):
        try:
            db.session.delete(utilisateur)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e
"""

from Models.Utilisateur import Utilisateur
from Models.Enseignant import Enseignant
from Models.Etudiant import Etudiant
from Models.Administrateur import Administrateur
from app import db
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

class UtilisateurRepository:
    def get_by_id(self, user_id):
        return Utilisateur.query.get(user_id)

    def get_by_email(self, email):
        return Utilisateur.query.filter_by(email=email).first()

    def create(self, utilisateur):
        try:
            db.session.add(utilisateur)
            db.session.commit()
            return utilisateur
        except Exception as e:
            db.session.rollback()
            raise e

    def update(self, utilisateur):
        try:
            db.session.commit()
            return utilisateur
        except Exception as e:
            db.session.rollback()
            raise e

    def delete(self, utilisateur):
        try:
            db.session.delete(utilisateur)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e
    def get_by_reset_token(self, token):
     return Utilisateur.query.filter_by(reset_token=token).first()
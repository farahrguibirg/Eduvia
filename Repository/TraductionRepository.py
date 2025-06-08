from Models.Traduction import Traduction
from flask import current_app
from app import db

class TraductionRepository:
    @staticmethod
    def create(traduction_data):
        """
        Crée une nouvelle traduction dans la base de données
        """
        try:
            nouvelle_traduction = Traduction(
                contenu_original=traduction_data['contenu_original'],
                contenu_traduit=traduction_data['contenu_traduit'],
                langue_source=traduction_data['langue_source'],
                langue_cible=traduction_data['langue_cible'],
                etudiant_id=traduction_data.get('etudiant_id'),
                fichier_source=traduction_data.get('fichier_source')
            )
            db.session.add(nouvelle_traduction)
            db.session.commit()
            return nouvelle_traduction
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_by_id(traduction_id):
        """
        Récupère une traduction par son ID
        """
        return Traduction.query.get(traduction_id)

    @staticmethod
    def get_by_etudiant(etudiant_id):
        """
        Récupère toutes les traductions d'un étudiant
        """
        return Traduction.query.filter_by(etudiant_id=etudiant_id).all()

    @staticmethod
    def update(traduction_id, traduction_data):
        """
        Met à jour une traduction existante
        """
        try:
            traduction = Traduction.query.get(traduction_id)
            if not traduction:
                return None
            
            # Mise à jour des champs modifiables
            if 'contenu_original' in traduction_data:
                traduction.contenu_original = traduction_data['contenu_original']
            if 'contenu_traduit' in traduction_data:
                traduction.contenu_traduit = traduction_data['contenu_traduit']
            if 'langue_source' in traduction_data:
                traduction.langue_source = traduction_data['langue_source']
            if 'langue_cible' in traduction_data:
                traduction.langue_cible = traduction_data['langue_cible']
            
            db.session.commit()
            return traduction
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete(traduction_id):
        """
        Supprime une traduction
        """
        try:
            traduction = Traduction.query.get(traduction_id)
            if not traduction:
                return False
            
            db.session.delete(traduction)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e
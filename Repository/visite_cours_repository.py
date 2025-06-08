from Models.VisiteCours import VisiteCours
from Models import db

class VisiteCoursRepository:
    @staticmethod
    def add_visite(cours_id, etudiant_id, duree=0):
        visite = VisiteCours(cours_id=cours_id, etudiant_id=etudiant_id, duree_visite=duree)
        db.session.add(visite)
        db.session.commit()
        return visite

    @staticmethod
    def get_visites_by_cours(cours_id):
        return VisiteCours.query.filter_by(cours_id=cours_id).all()

    @staticmethod
    def get_visites_by_enseignant(enseignant_id):
        return VisiteCours.query.join(VisiteCours.cours).filter_by(utilisateur_id=enseignant_id).all()

    @staticmethod
    def get_stats_cours(cours_id):
        visites = VisiteCours.query.filter_by(cours_id=cours_id).all()
        nombre_visites = len(visites)
        nombre_etudiants_uniques = len(set([v.etudiant_id for v in visites]))
        duree_totale = sum([v.duree_visite for v in visites])
        return {
            'nombre_visites': nombre_visites,
            'nombre_etudiants_uniques': nombre_etudiants_uniques,
            'duree_totale': duree_totale,
            'etudiants_visiteurs': [v.to_dict() for v in visites]
        } 
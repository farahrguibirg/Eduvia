from Models.Etudiant import Etudiant
from app import db

class EtudiantRepository:
    def get_all(self):
        return Etudiant.query.all()

    def get_by_id(self, id):
        return Etudiant.query.get(id)

    def create(self, etudiant):
        db.session.add(etudiant)
        db.session.commit()
        return etudiant

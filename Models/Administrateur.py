from app import db
from Models.Utilisateur import Utilisateur


class Administrateur(Utilisateur):
    __tablename__ = 'administrateur'
    id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), primary_key=True)
    __mapper_args__ = {
        'polymorphic_identity': 'admin'
    }
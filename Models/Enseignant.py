from app import db
from .Utilisateur import Utilisateur

class Enseignant(Utilisateur):
    __tablename__ = 'enseignant'
    id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), primary_key=True)

    __mapper_args__ = {
        'polymorphic_identity': 'enseignant'
    }

    created_quizzes = db.relationship('Quiz', back_populates='createur')

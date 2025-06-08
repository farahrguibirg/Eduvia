from app import db
from Models.Utilisateur import Utilisateur
from Models.Progression_eleve import ProgressionEleve  # assure-toi que cette ligne ne crée pas de boucle d'import
from Models.Quiz import Quiz  # nécessaire aussi
from Models.Exercice import Exercice  # nécessaire aussi

class Etudiant(Utilisateur):
    __tablename__ = 'etudiant'
    id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), primary_key=True)
    __mapper_args__ = {
        'polymorphic_identity': 'etudiant'
    }
    progressions = db.relationship('ProgressionEleve', backref='etudiant', lazy='dynamic')
    quizzes = db.relationship('Quiz', secondary='etudiant_quiz', lazy='dynamic')
    traductions = db.relationship('Traduction', backref='etudiant', lazy=True)
    exercices = db.relationship('Exercice', backref='etudiant', lazy='dynamic')
    conversations = db.relationship('Conversation', backref='etudiant', lazy='dynamic')
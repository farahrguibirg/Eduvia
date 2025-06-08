from database import db
from datetime import datetime

etudiant_quiz = db.Table('etudiant_quiz',
    db.Column('etudiant_id', db.Integer, db.ForeignKey('etudiant.id')),
    db.Column('quiz_id', db.Integer, db.ForeignKey('quiz.id'))
)

class Quiz(db.Model):
    __tablename__ = 'quiz'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(255), nullable=False)
    chrono = db.Column(db.Float)  # durée en minutes
    createur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'))  # Référence à la table utilisateur
    type = db.Column(db.String(20), default='prof')  # 'prof' ou 'etudiant'
    
    # Relations
    questions = db.relationship('Question', back_populates='quiz', lazy=True, cascade='all, delete-orphan')
    results = db.relationship('QuizResult', backref='quiz', cascade='all, delete-orphan')
    createur = db.relationship('Utilisateur', back_populates='created_quizzes')

class QuizResult(db.Model):
    __tablename__ = 'quiz_result'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'))
    etudiant_id = db.Column(db.Integer, db.ForeignKey('etudiant.id'))
    score = db.Column(db.Float)
    date_passage = db.Column(db.DateTime, default=datetime.utcnow)
    temps_ecoule = db.Column(db.Boolean, default=False)  # Si le temps a été écoulé
    reponses_completes = db.Column(db.Boolean, default=False)  # Si toutes les questions ont été répondues
    reponses_detail = db.Column(db.JSON)  # Stockage détaillé des réponses

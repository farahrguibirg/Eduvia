from database import db
from datetime import datetime

class Question(db.Model):
    __tablename__ = 'question'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=True)
    exercice_id = db.Column(db.Integer, db.ForeignKey('exercice.id'), nullable=True)
    question = db.Column(db.String(500), nullable=False)
    choices = db.Column(db.JSON, nullable=False)  # Stocke les choix sous forme de liste JSON
    correct_answer = db.Column(db.String(1), nullable=False)  # A, B, C, ou D

    # Relations
    quiz = db.relationship('Quiz', back_populates='questions')
    exercice = db.relationship('Exercice', back_populates='questions')
    reponses = db.relationship('Reponse', back_populates='question', cascade='all, delete-orphan')

    def __init__(self, question, choices, correct_answer, quiz_id=None, exercice_id=None):
        self.question = question
        self.choices = choices
        self.correct_answer = correct_answer
        self.quiz_id = quiz_id
        self.exercice_id = exercice_id

    def to_dict(self):
        return {
            'id': self.id,
            'quiz_id': self.quiz_id,
            'exercice_id': self.exercice_id,
            'question': self.question,
            'choices': self.choices,
            'correct_answer': self.correct_answer
        } 
from database import db
from datetime import datetime

class Reponse(db.Model):
    """
    Modèle représentant une réponse possible à une question
    """
    __tablename__ = 'reponse'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    texte = db.Column(db.Text, nullable=False)  # Texte de la réponse
    est_correcte = db.Column(db.Boolean, default=False)  # Si cette réponse est correcte
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    
    # Add relationship to Question
    question = db.relationship('Question', back_populates='reponses')
    
    def __repr__(self):
        return f'<Reponse {self.id}: {"Correcte" if self.est_correcte else "Incorrecte"}>'
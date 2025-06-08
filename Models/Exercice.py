from database import db
from datetime import datetime
from Models.Question import Question

class Exercice(db.Model):
    """
    Modèle représentant un exercice de type QCM généré à partir d'un PDF
    """
    __tablename__ = 'exercice'
    __table_args__ = {'extend_existing': True}
    
    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(255), nullable=False)
    consigne = db.Column(db.Text, nullable=False)
    contenu_pdf = db.Column(db.Text, nullable=True)  # Contenu du PDF source
    nom_fichier = db.Column(db.String(255), nullable=True)  # Nom du fichier PDF
    
    # Relations
    etudiant_id = db.Column(db.Integer, db.ForeignKey('etudiant.id'))
    
    # Collection de questions pour cet exercice
    questions = db.relationship('Question', back_populates='exercice', lazy=True, cascade="all, delete-orphan")
    
    # Métadonnées
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_modification = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Exercice {self.id}: {self.titre}>'
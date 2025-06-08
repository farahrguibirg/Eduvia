from app import db
from datetime import datetime

class VisiteCours(db.Model):
    __tablename__ = 'visite_cours'
    
    id = db.Column(db.Integer, primary_key=True)
    etudiant_id = db.Column(db.Integer, db.ForeignKey('etudiant.id'), nullable=False)
    cours_id = db.Column(db.Integer, db.ForeignKey('pdf_cours.id'), nullable=False)
    date_visite = db.Column(db.DateTime, default=datetime.utcnow)
    duree_visite = db.Column(db.Integer, default=0)  # Durée en secondes
    
    # Relations
    etudiant = db.relationship('Etudiant', backref='visites_cours')
    cours = db.relationship('PdfCours', backref='visites', foreign_keys=[cours_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'etudiant_id': self.etudiant_id,
            'cours_id': self.cours_id,
            'date_visite': self.date_visite.isoformat(),
            'duree_visite': self.duree_visite,
            'nom': self.etudiant.nom if self.etudiant else None,
            'prenom': self.etudiant.prenom if self.etudiant else None
        } 
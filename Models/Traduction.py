from app import db
from datetime import datetime

class Traduction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contenu_original = db.Column(db.Text)
    contenu_traduit = db.Column(db.Text)
    langue_source = db.Column(db.String(10), nullable=False)
    langue_cible = db.Column(db.String(10), nullable=False)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    etudiant_id = db.Column(db.Integer, db.ForeignKey('etudiant.id'))
    fichier_source = db.Column(db.String(255), nullable=True)
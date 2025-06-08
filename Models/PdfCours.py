from app import db

class PdfCours(db.Model):
    __tablename__ = 'pdf_cours'
    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(100))
    url = db.Column(db.String(255))
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'))

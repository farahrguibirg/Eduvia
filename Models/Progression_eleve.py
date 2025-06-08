from app import db

class ProgressionEleve(db.Model):
    __tablename__ = 'progression_eleve'
    id = db.Column(db.Integer, primary_key=True)
    etud_id = db.Column(db.Integer, db.ForeignKey('etudiant.id'))
    avancement = db.Column(db.Float)

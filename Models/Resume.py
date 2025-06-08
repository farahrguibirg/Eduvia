from app import db

# Définition du modèle Resume
class Resume(db.Model):
    __tablename__ = 'resume'

    id = db.Column(db.Integer, primary_key=True)
    etudiant_id = db.Column(db.String, nullable=False)
    original_text = db.Column(db.Text, nullable=False)
    summary = db.Column(db.Text, nullable=False)
    length = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def __init__(self, etudiant_id, original_text, summary, length, created_at=None):
        self.etudiant_id = etudiant_id
        self.original_text = original_text
        self.summary = summary
        self.length = length
        if created_at:
            self.created_at = created_at

    def to_dict(self):
        return {
            'id': self.id,
            'etudiant_id': self.etudiant_id,
            'original_text': self.original_text,
            'summary': self.summary,
            'length': self.length,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

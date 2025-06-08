from app import db
from datetime import datetime

class Message(db.Model):
    __tablename__ = 'message'
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversation.id', ondelete='CASCADE'), nullable=False)
    etudiant_id = db.Column(db.Integer, db.ForeignKey('etudiant.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.String(10), nullable=False)  # 'user' ou 'bot'
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    pdf_filename = db.Column(db.String(255)) 
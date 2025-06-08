from app import db
from datetime import datetime

class Email(db.Model):
    __tablename__ = 'emails'
    
    id = db.Column(db.Integer, primary_key=True)
    recipient_email = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    sent_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='sent')
    
    def __repr__(self):
        return f'<Email {self.id}: to {self.recipient_email}, subject: {self.subject}>'
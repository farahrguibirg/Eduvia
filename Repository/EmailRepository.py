from app import db
from Models.Email import Email
from sqlalchemy.exc import SQLAlchemyError
from Models.Utilisateur import Utilisateur
from datetime import datetime

class EmailRepository:
    @staticmethod
    def get_all_users(user_type=None):
        """Récupère tous les utilisateurs ou selon un type spécifique"""
        try:
            query = Utilisateur.query
            if user_type:
                query = query.filter_by(type=user_type)
            return query.all()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")

    @staticmethod
    def get_user_by_id(user_id):
        """Récupère un utilisateur par son ID"""
        try:
            return Utilisateur.query.get(user_id)
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")

    @staticmethod
    def get_user_by_email(email):
        """Récupère un utilisateur par son email"""
        try:
            return Utilisateur.query.filter_by(email=email).first()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")
    
    @staticmethod
    def save_email_log(recipient_email, subject, sent_date):
        """Enregistre un log d'email dans la base de données"""
        try:
            email_log = Email(
                recipient_email=recipient_email,
                subject=subject,
                sent_date=sent_date
            )
            db.session.add(email_log)
            db.session.commit()
            return email_log
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur lors de l'enregistrement du log d'email: {str(e)}")
    
    @staticmethod
    def get_emails_by_recipient(email):
        """Récupère les emails envoyés à un destinataire spécifique"""
        try:
            return Email.query.filter_by(recipient_email=email).all()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")
    
    @staticmethod
    def get_emails_sent_between_dates(start_date, end_date):
        """Récupère les emails envoyés entre deux dates"""
        try:
            return Email.query.filter(Email.sent_date.between(start_date, end_date)).all()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Erreur de base de données: {str(e)}")
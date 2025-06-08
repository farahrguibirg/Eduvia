# repositories/ChatbotRepository.py
from Models.Conversation import Conversation
from Models.Message import Message
from app import db
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional, Dict, Any

class ChatbotRepository:
    @staticmethod
    def create_conversation(etudiant_id: int) -> Optional[Conversation]:
        try:
            conversation = Conversation(etudiant_id=etudiant_id)
            db.session.add(conversation)
            db.session.commit()
            return conversation
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Erreur lors de la création de la conversation: {str(e)}")
            return None

    @staticmethod
    def add_message(conversation_id: int, etudiant_id: int, role: str, text: str, pdf_filename: str = None) -> Optional[Message]:
        try:
            message = Message(
                conversation_id=conversation_id,
                etudiant_id=etudiant_id,
                role=role,
                text=text,
                pdf_filename=pdf_filename
            )
            db.session.add(message)
            db.session.commit()
            return message
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Erreur lors de l'ajout du message: {str(e)}")
            return None
    
    @staticmethod
    def get_conversations_by_etudiant(etudiant_id: int) -> List[Conversation]:
        return Conversation.query.filter_by(etudiant_id=etudiant_id).order_by(Conversation.date_creation.desc()).all()

    @staticmethod
    def get_messages_by_conversation(conversation_id: int) -> List[Message]:
        return Message.query.filter_by(conversation_id=conversation_id).order_by(Message.timestamp.asc()).all()
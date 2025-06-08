from Services.PDFServices import PDFService
from Repository.chatbot_repository import ChatbotRepository
from werkzeug.datastructures import FileStorage
from typing import Dict, Any, Optional, List, Tuple
from Models.Conversation import Conversation
from Models.Message import Message
from app import db

class ChatbotUseCase:
    def __init__(self, bard_api_key: str = None):
        """
        Initialise le cas d'utilisation du chatbot avec les dépendances nécessaires
        """
        self.pdf_service = PDFService(bard_api_key)
        self.repository = ChatbotRepository()
    
    def process_question_with_pdf(self, pdf_file: FileStorage, question: str, etudiant_id: int, conversation_id: int = None) -> Dict[str, Any]:
        """
        Traite une question de l'étudiant avec un document PDF attaché
        
        Args:
            pdf_file: Le fichier PDF téléchargé
            question: La question posée par l'étudiant
            etudiant_id: L'identifiant de l'étudiant
            conversation_id: L'identifiant de la conversation
            
        Returns:
            Un dictionnaire contenant la réponse et les informations de traitement
        """
        try:
            pdf_text, response = self.pdf_service.process_pdf(pdf_file, question)
            pdf_data = self.pdf_service.save_pdf_content(pdf_file)
            # Utiliser la conversation existante si conversation_id est fourni
            if conversation_id:
                conversation = Conversation.query.get(int(conversation_id))
                if not conversation:
                    conversation = self.repository.create_conversation(etudiant_id)
            else:
                conversation = self.repository.create_conversation(etudiant_id)
            if not conversation:
                return {
                    'success': False,
                    'error': 'Erreur lors de la création de la conversation',
                    'response': response
                }
            # Ajouter le message utilisateur
            self.repository.add_message(conversation.id, etudiant_id, 'user', question, pdf_data['pdf_filename'])
            # Ajouter la réponse du bot
            self.repository.add_message(conversation.id, etudiant_id, 'bot', response, pdf_data['pdf_filename'])
            return {
                'success': True,
                'response': response,
                'chat_id': conversation.id
            }
        except Exception as e:
            print(f"Erreur dans le cas d'utilisation 'process_question_with_pdf': {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'response': f"Une erreur est survenue lors du traitement de votre question avec le PDF: {str(e)}"
            }
    
    def process_question_without_pdf(self, question: str, etudiant_id: int, conversation_id: int = None) -> Dict[str, Any]:
        """
        Traite une question de l'étudiant sans document PDF
        
        Args:
            question: La question posée par l'étudiant
            etudiant_id: L'identifiant de l'étudiant
            conversation_id: L'identifiant de la conversation
            
        Returns:
            Un dictionnaire contenant la réponse et les informations de traitement
        """
        try:
            prompt = f"Réponds de manière appropriée et naturelle à ce message: '{question}'"
            response = self.pdf_service.get_bard_response(prompt)
            # Utiliser la conversation existante si conversation_id est fourni
            if conversation_id:
                conversation = Conversation.query.get(int(conversation_id))
                if not conversation:
                    conversation = self.repository.create_conversation(etudiant_id)
            else:
                conversation = self.repository.create_conversation(etudiant_id)
            if not conversation:
                return {
                    'success': False,
                    'error': 'Erreur lors de la création de la conversation',
                    'response': response
                }
            # Ajouter le message utilisateur
            self.repository.add_message(conversation.id, etudiant_id, 'user', question)
            # Ajouter la réponse du bot
            self.repository.add_message(conversation.id, etudiant_id, 'bot', response)
            return {
                'success': True,
                'response': response,
                'chat_id': conversation.id
            }
        except Exception as e:
            print(f"Erreur dans le cas d'utilisation 'process_question_without_pdf': {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'response': f"Une erreur est survenue lors du traitement de votre question: {str(e)}"
            }
    
    def get_student_conversation_history(self, etudiant_id: int) -> Dict[str, Any]:
        """
        Récupère l'historique des conversations d'un étudiant
        
        Args:
            etudiant_id: L'identifiant de l'étudiant
            
        Returns:
            Un dictionnaire contenant l'historique des conversations
        """
        try:
            conversations = ChatbotRepository.get_conversations_by_etudiant(etudiant_id)
            history = []
            for conv in conversations:
                first_message = Message.query.filter_by(conversation_id=conv.id).order_by(Message.timestamp.asc()).first()
                history.append({
                    'id': conv.id,
                    'title': first_message.text if first_message else 'Conversation',
                    'date_creation': conv.date_creation.isoformat()
                })
            return {'success': True, 'history': history}
        except Exception as e:
            print(f"Erreur dans le cas d'utilisation 'get_student_conversation_history': {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'history': []
            }
    
    def get_conversation_details(self, conversation_id: int) -> Dict[str, Any]:
        """
        Récupère les détails d'une conversation spécifique
        
        Args:
            conversation_id: L'identifiant de la conversation
            
        Returns:
            Un dictionnaire contenant les détails de la conversation
        """
        try:
            messages = ChatbotRepository.get_messages_by_conversation(conversation_id)
            # Trier les messages par timestamp
            messages.sort(key=lambda x: x.timestamp)
            return {
                'success': True,
                'messages': [
                    {
                        'id': msg.id,
                        'role': msg.role,
                        'text': msg.text,
                        'timestamp': msg.timestamp.isoformat(),
                        'pdf_filename': msg.pdf_filename
                    } for msg in messages
                ]
            }
        except Exception as e:
            print(f"Erreur dans le cas d'utilisation 'get_conversation_details': {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_conversation(self, conversation_id: int) -> Dict[str, Any]:
        """
        Supprime une conversation spécifique
        
        Args:
            conversation_id: L'identifiant de la conversation
            
        Returns:
            Un dictionnaire indiquant le résultat de l'opération
        """
        try:
            conversation = Conversation.query.get(conversation_id)
            if not conversation:
                return {
                    'success': False,
                    'error': 'Conversation non trouvée'
                }
            # Correction : merger dans la session courante
            conversation = db.session.merge(conversation)
            db.session.delete(conversation)
            db.session.commit()
            return {
                'success': True,
                'message': 'Conversation supprimée avec succès'
            }
        except Exception as e:
            print(f"Erreur dans le cas d'utilisation 'delete_conversation': {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
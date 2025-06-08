# Controllers/ChatbotController.py
from flask import request, jsonify
from UseCases.chatbot_usecase import ChatbotUseCase
from werkzeug.exceptions import BadRequest
import os

class ChatbotController:
    def __init__(self, app):
        """
        Initialise le contrôleur avec l'application Flask
        """
        self.app = app
        # Récupérer la clé API depuis les variables d'environnement ou la configuration de l'app
        bard_api_key = app.config.get('BARD_API_KEY') or os.environ.get('_BARD_API_KEY')
        self.use_case = ChatbotUseCase(bard_api_key)
    
    def process_pdf_question(self):
        """
        Point d'entrée pour traiter une question avec ou sans PDF
        """
        try:
            # Vérifier la présence des données requises
            if 'question' not in request.form:
                return jsonify({
                    'error': 'La question est requise'
                }), 400
            
            question = request.form['question']
            etudiant_id = int(request.form.get('etudiant_id', 0))
            conversation_id = request.form.get('conversation_id')
            if conversation_id:
                conversation_id = int(conversation_id)
            else:
                conversation_id = None
            
            if not etudiant_id:
                return jsonify({
                    'error': 'L\'identifiant de l\'étudiant est requis'
                }), 400
            
            # Vérifier si un fichier PDF est présent
            pdf_file = request.files.get('pdf_file')
            
            # Traiter avec le cas d'utilisation approprié
            if pdf_file and pdf_file.filename:
                result = self.use_case.process_question_with_pdf(pdf_file, question, etudiant_id, conversation_id)
            else:
                result = self.use_case.process_question_without_pdf(question, etudiant_id, conversation_id)
            
            # Gérer le résultat
            if not result['success']:
                return jsonify({
                    'error': result.get('error', 'Une erreur est survenue'),
                    'response': result.get('response', '')
                }), 500
            
            return jsonify({
                'success': True,
                'response': result['response'],
                'chat_id': result.get('chat_id')
            })
            
        except BadRequest as e:
            return jsonify({
                'error': f'Erreur de requête: {str(e)}'
            }), 400
        except Exception as e:
            self.app.logger.error(f"Erreur non gérée dans ChatbotController.process_pdf_question: {str(e)}")
            return jsonify({
                'error': f'Erreur serveur: {str(e)}'
            }), 500
    
    def get_student_history(self, etudiant_id):
        """
        Récupère l'historique des conversations d'un étudiant
        """
        try:
            if not etudiant_id:
                return jsonify({'error': "L'identifiant de l'étudiant est requis"}), 400
            result = self.use_case.get_student_conversation_history(etudiant_id)
            if not result['success']:
                return jsonify({'error': result.get('error', 'Une erreur est survenue')}), 500
            return jsonify({'success': True, 'history': result['history']})
        except Exception as e:
            self.app.logger.error(f"Erreur non gérée dans ChatbotController.get_student_history: {str(e)}")
            return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500
    
    def get_chatbot_details(self, conversation_id):
        """
        Récupère les détails d'une conversation spécifique
        """
        try:
            if not conversation_id:
                return jsonify({'error': "L'identifiant de la conversation est requis"}), 400
            result = self.use_case.get_conversation_details(conversation_id)
            if not result['success']:
                return jsonify({'error': result.get('error', 'Une erreur est survenue')}), 404 if 'non trouvée' in result.get('error', '') else 500
            return jsonify({'success': True, 'messages': result['messages']})
        except Exception as e:
            self.app.logger.error(f"Erreur non gérée dans ChatbotController.get_chatbot_details: {str(e)}")
            return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500
    
    def delete_chatbot(self, conversation_id):
        """
        Supprime une conversation spécifique
        """
        try:
            if not conversation_id:
                return jsonify({
                    'error': 'L\'identifiant de la conversation est requis'
                }), 400
            
            result = self.use_case.delete_conversation(conversation_id)
            
            if not result['success']:
                return jsonify({
                    'error': result.get('error', 'Une erreur est survenue')
                }), 404 if 'non trouvée' in result.get('error', '') else 500
            
            return jsonify({
                'success': True,
                'message': result['message']
            })
            
        except Exception as e:
            self.app.logger.error(f"Erreur non gérée dans ChatbotController.delete_chatbot: {str(e)}")
            return jsonify({
                'error': f'Erreur serveur: {str(e)}'
            }), 500
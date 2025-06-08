# Routes/chatbot_routes.py
from flask import Blueprint, current_app
from Controllers.ChatbotController import ChatbotController

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/api')

@chatbot_bp.route('/chatbot/process', methods=['POST'])
def process_pdf_question():
    """
    Route pour traiter une question avec ou sans PDF
    """
    controller = ChatbotController(current_app)
    return controller.process_pdf_question()

@chatbot_bp.route('/chatbot/history/<int:etudiant_id>', methods=['GET'])
def get_student_history(etudiant_id):
    """
    Route pour récupérer l'historique des conversations d'un étudiant
    """
    controller = ChatbotController(current_app)
    return controller.get_student_history(etudiant_id)

@chatbot_bp.route('/chatbot/<int:chatbot_id>', methods=['GET'])
def get_chatbot_details(chatbot_id):
    """
    Route pour récupérer les détails d'une conversation spécifique
    """
    controller = ChatbotController(current_app)
    return controller.get_chatbot_details(chatbot_id)

@chatbot_bp.route('/chatbot/<int:chatbot_id>', methods=['DELETE'])
def delete_chatbot(chatbot_id):
    """
    Route pour supprimer une conversation spécifique
    """
    controller = ChatbotController(current_app)
    return controller.delete_chatbot(chatbot_id)
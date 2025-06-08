from flask import Blueprint
from Controllers.TraductionController import (
    traduire_texte, traduire_pdf, obtenir_traduction, obtenir_traductions_etudiant
)

def register_traduction_routes(app):
    """
    Enregistre les routes de traduction dans l'application
    """
    # Créer le blueprint pour les routes de traduction
    traduction_bp = Blueprint('traduction', __name__)
    
    # Définir les routes
    traduction_bp.route('/traduire-texte', methods=['POST'])(traduire_texte)
    traduction_bp.route('/traduire-pdf', methods=['POST'])(traduire_pdf)
    traduction_bp.route('/traductions/<int:traduction_id>', methods=['GET'])(obtenir_traduction)
    traduction_bp.route('/traductions/etudiant/<int:etudiant_id>', methods=['GET'])(obtenir_traductions_etudiant)
    traduction_bp.route('/traductions/<int:traduction_id>', methods=['DELETE'])(delete_traduction)
    
    # Enregistrer le blueprint avec le préfixe
    app.register_blueprint(traduction_bp, url_prefix='/api/traduction')

def delete_traduction(traduction_id):
    from Repository.TraductionRepository import TraductionRepository
    try:
        success = TraductionRepository.delete(traduction_id)
        if not success:
            return {'success': False, 'message': 'Traduction non trouvée'}, 404
        return {'success': True, 'message': 'Traduction supprimée'}, 200
    except Exception as e:
        return {'success': False, 'message': str(e)}, 500
# routes/import_routes.py
from flask import Blueprint
from Controllers.ImportController import ImportController

# Créer le blueprint pour les routes d'import
import_bp = Blueprint('import', __name__, url_prefix='/api/import')

# Initialiser le contrôleur
import_controller = ImportController()

# Routes pour l'import d'utilisateurs
@import_bp.route('/users/excel', methods=['POST'])
def import_users_excel():
    """
    POST /api/import/users/excel
    Importe des utilisateurs depuis un fichier Excel
    
    Headers requis:
    - Authorization: Bearer <token>
    
    Paramètres:
    - file: Fichier Excel (.xlsx ou .xls)
    
    Réponse:
    - success: bool
    - message: str
    - total_processed: int
    - total_created: int
    - total_failed: int
    - created_users: list
    - failed_users: list
    - warnings: list
    """
    return import_controller.import_users_from_excel()
"""
@import_bp.route('/users/template', methods=['GET'])
def get_import_template():
    
    GET /api/import/users/template
    Récupère les informations du template d'import
    
    Headers requis:
    - Authorization: Bearer <token>
    
    Réponse:
    - success: bool
    - template: dict avec la structure du template
    
    return import_controller.get_import_template()

@import_bp.route('/users/template/download', methods=['GET'])
def download_template():
    
    GET /api/import/users/template/download
    Télécharge un fichier Excel template
    
    Headers requis:
    - Authorization: Bearer <token>
    
    Réponse:
    - Fichier Excel (.xlsx)
    
    return import_controller.download_template()
"""
@import_bp.route('/users/validate', methods=['POST'])
def validate_excel_file():
    """
    POST /api/import/users/validate
    Valide un fichier Excel avant import
    
    Headers requis:
    - Authorization: Bearer <token>
    
    Paramètres:
    - file: Fichier Excel à valider
    
    Réponse:
    - success: bool
    - validation: dict avec les résultats de validation
    - preview: dict avec un aperçu des données
    """
    return import_controller.validate_excel_file()
"""
@import_bp.route('/history', methods=['GET'])
def get_import_history():
    
    GET /api/import/history?limit=10
    Récupère l'historique des imports
    
    Headers requis:
    - Authorization: Bearer <token>
    
    Paramètres:
    - limit: Nombre maximum d'enregistrements (optionnel, défaut: 10)
    
    Réponse:
    - success: bool
    - history: dict avec l'historique des imports
    
    return import_controller.get_import_status()
"""
# Route de test pour vérifier les permissions
@import_bp.route('/test-permissions', methods=['GET'])
def test_permissions():
    """
    GET /api/import/test-permissions
    Teste les permissions d'import de l'utilisateur actuel
    
    Headers requis:
    - Authorization: Bearer <token>
    """
    return import_controller.test_permissions()

# Routes supplémentaires pour d'autres types d'import (si nécessaire)
@import_bp.route('/users/csv', methods=['POST'])
def import_users_csv():
    """
    POST /api/import/users/csv
    Importe des utilisateurs depuis un fichier CSV
    (À implémenter si nécessaire)
    
    Headers requis:
    - Authorization: Bearer <token>
    """
    return {
        'success': False,
        'message': 'Import CSV non encore implémenté'
    }, 501

# Gestionnaire d'erreurs pour ce blueprint
@import_bp.errorhandler(401)
def unauthorized(error):
    """Gestionnaire pour les erreurs d'authentification"""
    return {
        'success': False,
        'message': 'Token d\'authentification manquant ou invalide'
    }, 401

@import_bp.errorhandler(403)
def forbidden(error):
    """Gestionnaire pour les erreurs d'autorisation"""
    return {
        'success': False,
        'message': 'Accès refusé. Droits insuffisants.'
    }, 403

@import_bp.errorhandler(413)
def request_entity_too_large(error):
    """Gestionnaire pour les fichiers trop volumineux"""
    return {
        'success': False,
        'message': 'Fichier trop volumineux. Taille maximale autorisée dépassée.'
    }, 413

@import_bp.errorhandler(400)
def bad_request(error):
    """Gestionnaire pour les requêtes malformées"""
    return {
        'success': False,
        'message': 'Requête malformée'
    }, 400

@import_bp.errorhandler(500)
def internal_server_error(error):
    """Gestionnaire pour les erreurs internes"""
    return {
        'success': False,
        'message': 'Erreur interne du serveur'
    }, 500
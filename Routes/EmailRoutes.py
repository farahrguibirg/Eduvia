from flask import Blueprint
from Controllers.EmailController import EmailController

email_bp = Blueprint('email', __name__, url_prefix='/api/email')

# Routes pour les étudiants
email_bp.route('/students', methods=['GET'])(EmailController.get_all_students)

# Routes pour les enseignants
email_bp.route('/teachers', methods=['GET'])(EmailController.get_all_teachers)

# Routes génériques pour les utilisateurs
email_bp.route('/users/<int:user_id>', methods=['GET'])(EmailController.get_user)

# Routes pour l'envoi d'identifiants (nouvelles routes)
email_bp.route('/send/credentials', methods=['POST'])(EmailController.send_user_credentials)
email_bp.route('/send/mass-credentials', methods=['POST'])(EmailController.send_mass_credentials)

# Routes pour l'envoi d'emails (les routes existantes)
email_bp.route('/send', methods=['POST'])(EmailController.send_email_to_user)
email_bp.route('/send/mass', methods=['POST'])(EmailController.send_mass_email)
email_bp.route('/send/students', methods=['POST'])(EmailController.send_email_to_all_students)
email_bp.route('/send/teachers', methods=['POST'])(EmailController.send_email_to_all_teachers)

# Routes pour les logs d'emails
email_bp.route('/logs', methods=['GET'])(EmailController.get_email_logs)
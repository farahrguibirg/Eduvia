###routes
from flask import Blueprint
from Controllers.UtilisateurController import AuthController
from UseCases.utilisateur_usecase import AuthUseCase
from Services.UtilisateurService import AuthService
from Repository.utilisateur_repository import UtilisateurRepository
from Middleware.UtilisateurMiddleware import auth_required
from Models.TestEmail import get_student_password, get_teachers_password, get_students, get_teachers, send_email

auth_bp = Blueprint('auth', __name__)

# Instancier les dépendances
utilisateur_repository = UtilisateurRepository()
auth_service = AuthService(utilisateur_repository)
auth_usecase = AuthUseCase(auth_service)
auth_controller = AuthController(auth_usecase)

# Définir les routes
auth_bp.route('/register', methods=['POST'])(auth_controller.register)
auth_bp.route('/login', methods=['POST'])(auth_controller.login)
auth_bp.route('/verify-2fa', methods=['POST'])(auth_controller.verify_2fa)
auth_bp.route('/setup-2fa', methods=['GET'])(auth_required(auth_controller.setup_2fa))
auth_bp.route('/activate-2fa', methods=['POST'])(auth_required(auth_controller.activate_2fa))
auth_bp.route('/request-password-reset', methods=['POST'])(auth_controller.request_password_reset)
auth_bp.route('/reset-password', methods=['POST'])(auth_controller.reset_password)

# Routes pour la récupération des mots de passe
auth_bp.route('/students/<int:student_id>/password', methods=['GET'])(get_student_password)
auth_bp.route('/Teachers/<int:teacher_id>/password', methods=['GET'])(get_teachers_password)
auth_bp.route('/students', methods=['GET'])(get_students)
auth_bp.route('/Teachers', methods=['GET'])(get_teachers)

# Route pour l'envoi d'email
auth_bp.route('/send', methods=['POST'])(send_email)

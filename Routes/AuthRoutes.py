from flask import Blueprint
from Controllers.AuthController import AuthController

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Routes d'authentification
auth_bp.route('/login', methods=['POST'])(AuthController.login)
auth_bp.route('/register/student', methods=['POST'])(AuthController.register_student)
auth_bp.route('/register/teacher', methods=['POST'])(AuthController.register_teacher)
auth_bp.route('/change-password', methods=['POST'])(AuthController.change_password)
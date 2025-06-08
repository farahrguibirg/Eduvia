from flask import Blueprint
from Controllers.AdminController import AdminController

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# Routes pour les étudiants
admin_bp.route('/students', methods=['GET'])(AdminController.get_all_students)
admin_bp.route('/students', methods=['POST'])(AdminController.create_student)

# Routes pour les enseignants
admin_bp.route('/teachers', methods=['GET'])(AdminController.get_all_teachers)
admin_bp.route('/teachers', methods=['POST'])(AdminController.create_teacher)

# Routes génériques pour les utilisateurs
admin_bp.route('/users/<int:user_id>', methods=['GET'])(AdminController.get_user)
admin_bp.route('/users/<int:user_id>', methods=['PUT'])(AdminController.update_user)
admin_bp.route('/users/<int:user_id>', methods=['DELETE'])(AdminController.delete_user)
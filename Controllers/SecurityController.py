from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from Models.Utilisateur import Utilisateur
from UseCases.TwoFactorUseCase import TwoFactorUseCase

security_bp = Blueprint('security', __name__, url_prefix='/api/security')
usecase = TwoFactorUseCase()

def get_current_user():
    user_id = get_jwt_identity()
    return Utilisateur.query.get(user_id)

# 1. Envoyer le code par email
@security_bp.route('/2fa/send_code', methods=['POST'])
@jwt_required()
def send_2fa_code():
    user = get_current_user()
    usecase.send_code(user)
    return jsonify({'success': True, 'message': 'Code envoyé par email'})

# 2. Vérifier le code reçu par email
@security_bp.route('/2fa/verify_code', methods=['POST'])
@jwt_required()
def verify_2fa_code():
    user = get_current_user()
    code = request.json.get('code')
    if usecase.verify_code(user, code):
        return jsonify({'success': True})
    else:
        return jsonify({'error': 'Code invalide ou expiré'}), 400

# 3. Désactiver la 2FA
@security_bp.route('/2fa/disable', methods=['POST'])
@jwt_required()
def disable_2fa():
    user = get_current_user()
    usecase.disable(user)
    return jsonify({'success': True}) 
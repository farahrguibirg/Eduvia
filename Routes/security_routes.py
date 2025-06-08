from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from Controllers.SecurityController import (
    send_2fa_code,
    verify_2fa_code,
    disable_2fa
)

security_bp = Blueprint('security', __name__, url_prefix='/api/security')

@security_bp.route('/2fa/send_code', methods=['POST'])
@jwt_required()
def send_code_route():
    return send_2fa_code()

@security_bp.route('/2fa/verify_code', methods=['POST'])
@jwt_required()
def verify_code_route():
    return verify_2fa_code()

@security_bp.route('/2fa/disable', methods=['POST'])
@jwt_required()
def disable_2fa_route():
    return disable_2fa()
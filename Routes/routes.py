
# Routes/routes.py
from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return jsonify({
        "status": "success",
        "message": "API fonctionne correctement"
    })

@main_bp.route('/api/test')
def test_route():
    return jsonify({
        "status": "success",
        "message": "Route de test",
        "data": {
            "test": True
        }
    })
#__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import DevelopmentConfig

# Initialisation de la base de données
db = SQLAlchemy()

def create_app(config_class=DevelopmentConfig):
    # Initialisation de l'application Flask
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialisation des extensions
    db.init_app(app)
    CORS(app)  # Permet les requêtes cross-origin
    
    # Import et enregistrement des blueprints
    from Controllers.ChatbotController import chatbot_bp
    from Controllers.resume_controller import resume_bp
    
    app.register_blueprint(chatbot_bp, url_prefix='/api')
    app.register_blueprint(resume_bp)  # Le resume_bp a déjà le préfixe /api dans ses routes
    
    # Création des tables de la base de données
    with app.app_context():
        db.create_all()
    
    return app
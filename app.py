# app.py
from flask import Flask
from flask_cors import CORS
from config import DevelopmentConfig, ProductionConfig, TestingConfig
from database import db, connect_db
from Routes.TraductionRoutes import register_traduction_routes
from Routes.resumeRoutes import resume_bp
from Routes.quiz_routes import quiz_bp
from Routes.UserRoutes import user_bp
from Routes.UtilisateurRoutes import auth_bp
from flask_mail import Mail
from Routes.EmailRoutes import email_bp
from Routes.TestEmail import test
from Routes.AdminRoutes import admin_bp 
import os
import logging
from Models.Resume import Resume
from flask import Blueprint
from flask_jwt_extended import JWTManager
from extensions import bcrypt  # Importer bcrypt depuis extensions

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    
    # Configuration du logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Charger la configuration
    env = os.getenv('FLASK_ENV', 'development')
    
    if env == 'production':
        app.config.from_object(ProductionConfig)
    elif env == 'testing':
        app.config.from_object(TestingConfig)
    else:
        app.config.from_object(DevelopmentConfig)
        
    # Initialiser la base de données
    db.init_app(app)
    
    # Initialiser JWT
    jwt = JWTManager(app)
    
    # Initialiser Flask-Bcrypt
    bcrypt.init_app(app)
    
    # Configurer CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Création des répertoires nécessaires
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Importer et enregistrer les blueprints
    from Routes.chatbotRoutes import chatbot_bp
    app.register_blueprint(chatbot_bp, url_prefix='/api')
    app.register_blueprint(test)

    # Enregistrer le blueprint pour les résumés
    app.register_blueprint(resume_bp, url_prefix='/api')  # Enregistrement avec le préfixe '/api'
    
    from Routes.ExerciceRoutes import exercice_bp
    app.register_blueprint(exercice_bp, url_prefix='/api')
    
    from Routes.CoursRoutes import pdf_cours_blueprint
    app.register_blueprint(pdf_cours_blueprint)
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp, url_prefix='/api')

    # Enregistrer le blueprint pour les quiz
    app.register_blueprint(quiz_bp, url_prefix='/api')
    app.register_blueprint(email_bp, url_prefix='/api/email')  # Enregistrement avec le préfixe '/api'
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Enregistrer le blueprint pour les visites de cours
    from Routes.VisiteCoursRoutes import visite_cours_bp
    app.register_blueprint(visite_cours_bp, url_prefix='/api')
    
    from Routes.security_routes import security_bp
    app.register_blueprint(security_bp)
    
    from Routes.ImportRoutes import import_bp
    app.register_blueprint(import_bp)
    app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024


    # Enregistrer le blueprint pour la traduction
    register_traduction_routes(app)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)

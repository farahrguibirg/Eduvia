from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from config import DevelopmentConfig
import logging

# Configuration du logging
logger = logging.getLogger(__name__)

# Instance globale de db
db = SQLAlchemy()

def connect_db(app):
    """Connexion à la base de données sans réinitialiser db"""
    try:
        # Configurer l'application avec les paramètres de développement
        app.config.from_object(DevelopmentConfig)
        
        # Initialiser la base de données avec l'application
        db.init_app(app)
        
        with app.app_context():
            db.engine.connect()  # Connexion test améliorée
            logger.info("Connexion à la base de données réussie")
            logger.info(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    except SQLAlchemyError as e:
        logger.error(f"Impossible de se connecter à la base de données : {e}")
        exit(1)
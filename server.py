# server.py
from flask_cors import CORS
from config import DevelopmentConfig
from app import create_app
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Créer une instance de l'application Flask
app = create_app()

# Configurer CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Lancer le serveur
if __name__ == "__main__":
    logger.info(f"Server starting on port {DevelopmentConfig.PORT}")
    logger.info(f"Database URI: {DevelopmentConfig.SQLALCHEMY_DATABASE_URI}")
    app.run(host='0.0.0.0', port=DevelopmentConfig.PORT, debug=True)
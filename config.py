# config.py
import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis un fichier .env
load_dotenv()
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'un_autre_secret_pour_jwt'
JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 heure

class Config:
    PORT = int(os.getenv('PORT', 5000))
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'stage')
    DB_PORT = os.getenv('DB_PORT', '3306')
    
    # Configuration de base de données
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'un-secret-par-defaut-a-changer')
    JWT_SECRET_KEY = JWT_SECRET_KEY  # Ajout explicite pour Flask
    
    # Configuration JWT
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    JWT_ACCESS_TOKEN_EXPIRES = JWT_ACCESS_TOKEN_EXPIRES
    
    # Clé API pour Bard
    BARD_API_KEY = os.getenv('BARD_API_KEY', 'g.a000vQjPxcQRWLqSphrgVITZMTz5sQr_8rCmfQCPQQqXDm7WeKAyY8xLNXnh2nEUzFxkyziYXAACgYKATUSARcSFQHGX2MixDZvCxXSppGqo7-H34FDZxoVAUF8yKp29hRxiKfrIuisi-pTHxGi0076')
    
    # Dossier pour sauvegarder les fichiers PDF (si nécessaire)
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size

class DevelopmentConfig(Config):
    DEBUG = True
    # Utiliser MySQL pour le développement
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://{user}:{password}@{host}:{port}/{db}?charset=utf8mb4'.format(
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        db=Config.DB_NAME
    )

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://{user}:{password}@{host}:{port}/{db}?charset=utf8mb4'.format(
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        db=Config.DB_NAME
    )
      
   # SMTP Brevo
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp-relay.brevo.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True") == "True"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "farahrguibi@gmail.com")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")  # Votre mot de passe d'application Gmail
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER", "farahrguibi@gmail.com")

    # Chemins et autres clés
    FRONTEND_URL = os.getenv('FRONTEND_URL')
    BREVO_API_KEY = os.getenv('BREVO_API_KEY')
    SENDER_EMAIL = os.getenv('SENDER_EMAIL')
    SENDER_NAME = os.getenv('SENDER_NAME')


class TestingConfig(Config):
    TESTING = True
    # Utiliser une base de données en mémoire pour les tests
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False

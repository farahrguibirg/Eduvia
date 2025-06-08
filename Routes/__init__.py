# routes/__init__.py
from flask import Blueprint

# Créer un blueprint pour les routes principales
main_bp = Blueprint('main', __name__)

# Importer les routes
from Routes.chatbotRoutes import chatbot_bp
#from Routes.routes import *
from app import create_app
from database import db
from Models.Question import Question
from Models.Quiz import Quiz
from Models.Exercice import Exercice
from Models.Reponse import Reponse
from sqlalchemy import text

def update_database():
    app = create_app()
    with app.app_context():
        # Créer uniquement les tables qui n'existent pas
        db.create_all()
        print("Tables manquantes créées avec succès!")

if __name__ == '__main__':
    update_database() 
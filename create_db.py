import pymysql
from config import Config

def create_database():
    try:
        # Connexion à MySQL sans spécifier de base de données
        connection = pymysql.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD
        )
        
        with connection.cursor() as cursor:
            # Créer la base de données si elle n'existe pas
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {Config.DB_NAME}")
            print(f"Base de données '{Config.DB_NAME}' créée ou déjà existante.")
            
        connection.close()
        print("Connexion à la base de données réussie!")
        
    except Exception as e:
        print(f"Erreur lors de la création de la base de données: {str(e)}")

if __name__ == "__main__":
    create_database() 
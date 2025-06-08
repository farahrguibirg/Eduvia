import subprocess
import sys

def install_package(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

# Liste des dépendances nécessaires
dependencies = [
    "flask",
    "flask-sqlalchemy",
    "pymysql",
    "python-dotenv",
    "PyPDF2",
    "bardapi",
    "werkzeug",
    "SQLAlchemy",
    "transformers",
    "torch",
    "langdetect",
    "PyMuPDF",
    "nltk"
]

print("Installation des dépendances...")
for package in dependencies:
    try:
        print(f"Installation de {package}...")
        install_package(package)
        print(f"✅ {package} installé avec succès")
    except Exception as e:
        print(f"❌ Erreur lors de l'installation de {package}: {str(e)}")

print("\nInstallation terminée !") 
# Pdfcours repository - à compléter
# Repository (Data Access Layer)
# repository/pdf_cours_repository.py
from Models.PdfCours import PdfCours
from app import db
import os
from werkzeug.utils import secure_filename
from flask import current_app

class PdfCoursRepository:
    @staticmethod
    def get_all():
        return PdfCours.query.all()
    
    @staticmethod
    def get_by_id(pdf_id):
        return PdfCours.query.get(pdf_id)
    
    @staticmethod
    def get_by_enseignant(enseignant_id):
        return PdfCours.query.filter_by(utilisateur_id=enseignant_id).all()
    
    @staticmethod
    def create(titre, url, utilisateur_id):
        pdf_cours = PdfCours(titre=titre, url=url, utilisateur_id=utilisateur_id)
        db.session.add(pdf_cours)
        db.session.commit()
        return pdf_cours
    
    @staticmethod
    def update(pdf_id, titre=None, url=None):
        pdf_cours = PdfCoursRepository.get_by_id(pdf_id)
        if not pdf_cours:
            return None
        
        if titre:
            pdf_cours.titre = titre
        if url:
            pdf_cours.url = url
        
        db.session.commit()
        return pdf_cours
    
    @staticmethod
    def delete(pdf_id):
        pdf_cours = PdfCoursRepository.get_by_id(pdf_id)
        if not pdf_cours:
            return False
        
        # Supprimer le fichier physique
        try:
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], os.path.basename(pdf_cours.url))
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Erreur lors de la suppression du fichier: {str(e)}")
        
        db.session.delete(pdf_cours)
        db.session.commit()
        return True
    
    @staticmethod
    def save_file(file):
        """Sauvegarde un fichier dans le dossier uploads"""
        try:
            # Sécuriser le nom du fichier
            filename = secure_filename(file.filename)
            print(f"Sauvegarde du fichier: {filename}")
            
            # Créer le dossier uploads s'il n'existe pas
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            if not os.path.exists(upload_folder):
                os.makedirs(upload_folder)
                print(f"Dossier uploads créé: {upload_folder}")
            
            # Sauvegarder le fichier
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            print(f"Fichier sauvegardé avec succès: {file_path}")
            
            return filename
        except Exception as e:
            print(f"Erreur lors de la sauvegarde du fichier: {str(e)}")
            return None


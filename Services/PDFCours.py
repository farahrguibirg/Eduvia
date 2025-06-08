# Service Layer
# service/pdf_cours_service.py
from Repository.pdfcours_repository import PdfCoursRepository
from Models.Enseignant import Enseignant
from Models.Etudiant import Etudiant
from Models.Utilisateur import Utilisateur
from flask import abort, current_app
import os

class PdfCoursService:
    def __init__(self, repository=None):
        self.repository = repository or PdfCoursRepository()
    
    def get_all_pdfs(self):
        return self.repository.get_all()
    
    def get_pdf_by_id(self, pdf_id):
        return self.repository.get_by_id(pdf_id)
    
    def get_pdfs_by_enseignant(self, enseignant_id):
        return self.repository.get_by_enseignant(enseignant_id)
    
    def creer_pdf(self, titre, file, utilisateur_id):
        # Vérifier si l'utilisateur est un enseignant
        utilisateur = Utilisateur.query.get(utilisateur_id)
        if not isinstance(utilisateur, Enseignant):
            abort(403, description="Seuls les enseignants peuvent ajouter des PDF de cours")
        
        # Sauvegarder le fichier
        url = self.repository.save_file(file)
        if not url:
            abort(400, description="Échec de l'enregistrement du fichier")
        
        # Créer l'entrée dans la base de données
        return self.repository.create(titre, url, utilisateur_id)
    
    def mettre_a_jour_pdf(self, pdf_id, titre=None, file=None, utilisateur_id=None):
        # Vérifier si le PDF existe
        pdf_cours = self.repository.get_by_id(pdf_id)
        if not pdf_cours:
            abort(404, description="PDF non trouvé")
        
        # Vérifier si l'utilisateur est l'enseignant qui a créé ce PDF
        if utilisateur_id and pdf_cours.utilisateur_id != utilisateur_id:
            abort(403, description="Vous n'êtes pas autorisé à modifier ce PDF")
        
        # Mise à jour du fichier si nécessaire
        url = None
        if file:
            print(f"Mise à jour du fichier pour le PDF {pdf_id}")
            # Supprimer l'ancien fichier
            try:
                old_file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 
                                         os.path.basename(pdf_cours.url))
                print(f"Ancien chemin du fichier: {old_file_path}")
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
                    print("Ancien fichier supprimé avec succès")
            except Exception as e:
                print(f"Erreur lors de la suppression de l'ancien fichier: {str(e)}")
            
            # Sauvegarder le nouveau fichier
            url = self.repository.save_file(file)
            print(f"Nouvelle URL du fichier: {url}")
        
        # Mise à jour dans la base de données
        updated_pdf = self.repository.update(pdf_id, titre, url)
        print(f"PDF mis à jour dans la base de données: {updated_pdf.titre}")
        return updated_pdf
    
    def supprimer_pdf(self, pdf_id, utilisateur_id):
        # Vérifier si le PDF existe
        pdf_cours = self.repository.get_by_id(pdf_id)
        if not pdf_cours:
            abort(404, description="PDF non trouvé")
        
        # Vérifier si l'utilisateur est l'enseignant qui a créé ce PDF
        if pdf_cours.utilisateur_id != utilisateur_id:
            abort(403, description="Vous n'êtes pas autorisé à supprimer ce PDF")
        
        # Supprimer le PDF
        if self.repository.delete(pdf_id):
            return True
        return False


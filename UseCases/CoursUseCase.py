
# Use Case Layer
# usecase/pdf_cours_usecase.py
from Services.PDFCours import PdfCoursService
from flask import abort
import os

class PdfCoursUseCase:
    def __init__(self, service=None):
        self.service = service or PdfCoursService()
    
    def lister_tous_les_pdfs(self):
        """Liste tous les PDFs disponibles"""
        return self.service.get_all_pdfs()
    
    def afficher_pdf(self, pdf_id):
        """Affiche un PDF spécifique"""
        pdf = self.service.get_pdf_by_id(pdf_id)
        if not pdf:
            abort(404, description="PDF non trouvé")
        return pdf
    
    def lister_pdfs_enseignant(self, enseignant_id):
        """Liste les PDFs créés par un enseignant spécifique"""
        return self.service.get_pdfs_by_enseignant(enseignant_id)
    
    def ajouter_pdf(self, titre, file, utilisateur_id):
        """Ajoute un nouveau PDF de cours"""
        return self.service.creer_pdf(titre, file, utilisateur_id)
    
    def modifier_pdf(self, pdf_id, titre, file, utilisateur_id):
        """Modifie un PDF existant"""
        return self.service.mettre_a_jour_pdf(pdf_id, titre, file, utilisateur_id)
    
    def supprimer_pdf(self, pdf_id, utilisateur_id):
        """Supprime un PDF existant"""
        return self.service.supprimer_pdf(pdf_id, utilisateur_id)
    
    def verifier_acces_utilisateur(self, utilisateur, pdf_id=None):
        """Vérifie les droits d'accès de l'utilisateur"""
        from Models.Enseignant import Enseignant
        from Models.Etudiant import Etudiant
        
        if isinstance(utilisateur, Enseignant):
            # Les enseignants ont tous les droits sur leurs propres PDF
            if pdf_id:
                pdf = self.service.get_pdf_by_id(pdf_id)
                return pdf and pdf.utilisateur_id == utilisateur.id
            return True
        
        elif isinstance(utilisateur, Etudiant):
            # Les étudiants ont seulement le droit de consulter
            return {'can_view': True, 'can_edit': False, 'can_delete': False}
        
        return False


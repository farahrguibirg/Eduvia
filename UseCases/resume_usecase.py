# Resume usecase - à compléter
from Services.resume_services import ResumeService
from Repository.resume_repository import ResumeRepository

class ResumeUseCase:
    def __init__(self):
        self.service = ResumeService()
        self.repository = ResumeRepository()

    def generate(self, text, length="medium"):
        # Validation simple du texte
        if not text or not text.strip():
            raise ValueError("Le texte ne peut pas être vide.")
        
        # Générer le résumé
        summary = self.service.generer_resume(text, length)

        # Sauvegarder le résumé dans le repository
        try:
            self.repository.save(text, summary, length)
        except Exception as e:
            raise Exception(f"Erreur lors de la sauvegarde du résumé : {e}")

        return summary

    def get_all_resumes(self):
        # Récupérer les résumés de la base de données
        return self.repository.get_all()

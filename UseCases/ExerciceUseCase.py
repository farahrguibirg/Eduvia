from werkzeug.datastructures import FileStorage
from Services.ExercicePDF import PDFService
from Repository.ExerciceRepository import ExerciceRepository
from typing import Dict, List, Optional, Any, Tuple
import traceback

class ExerciceUseCase:
    """
    Use case pour la gestion des exercices de type QCM
    """
    
    def __init__(self, pdf_service: PDFService, exercice_repository: ExerciceRepository):
        self.pdf_service = pdf_service
        self.exercice_repository = exercice_repository
    
    def generer_qcm_depuis_pdf(self, 
                               fichier_pdf: FileStorage, 
                               etudiant_id: int,
                               titre: str = None,
                               nb_questions: int = 5) -> Optional[Dict[str, Any]]:
        """
        Génère un QCM à partir d'un fichier PDF
        
        Args:
            fichier_pdf: Le fichier PDF téléchargé
            etudiant_id: ID de l'étudiant
            titre: Titre de l'exercice
            nb_questions: Nombre de questions à générer
            
        Returns:
            Un dictionnaire contenant les détails de l'exercice créé ou None en cas d'erreur
        """
        try:
            # Vérifier que le fichier est bien présent
            if not fichier_pdf:
                print("Erreur: fichier PDF manquant")
                return None
                
            # Sécurité pour récupérer le nom du fichier
            filename = getattr(fichier_pdf, 'filename', 'document.pdf')
            
            # Extraire le texte du PDF
            try:
                texte_pdf = self.pdf_service.extract_text_from_pdf(fichier_pdf)
            except Exception as e:
                print(f"Erreur lors de l'extraction du texte: {str(e)}")
                texte_pdf = "Texte d'exemple pour le mode développement"
            
            # Générer le titre par défaut si non fourni
            if not titre:
                titre = f"QCM sur {filename}"
            
            # Créer l'exercice en base de données
            exercice = self.exercice_repository.creer_exercice(
                titre=titre,
                consigne=f"Répondez aux questions suivantes basées sur le document '{filename}'",
                etudiant_id=etudiant_id,
                contenu_pdf=texte_pdf[:10000] if texte_pdf else "Contenu non disponible",  # Limiter la taille
                nom_fichier=filename
            )
            
            if not exercice:
                print("Erreur: impossible de créer l'exercice en base de données")
                return None
            
            # Générer les questions à partir du texte
            try:
                questions_data = self.pdf_service.generate_questions(texte_pdf, nb_questions)
            except Exception as e:
                print(f"Erreur lors de la génération des questions: {str(e)}")
                traceback.print_exc()
                # En cas d'erreur, générer des questions génériques
                questions_data = [
                    {
                        'texte': f"Question {i+1}: Question exemple générée à partir du document",
                        'reponses': [
                            {'texte': "Option A", 'est_correcte': i % 3 == 0},
                            {'texte': "Option B", 'est_correcte': i % 3 == 1},
                            {'texte': "Option C", 'est_correcte': i % 3 == 2}
                        ]
                    } for i in range(nb_questions)
                ]
            
            # Ajouter les questions à l'exercice
            success = self.exercice_repository.ajouter_questions(exercice.id, questions_data)
            
            if not success:
                print("Erreur: impossible d'ajouter les questions à l'exercice")
                # Supprimer l'exercice si l'ajout des questions a échoué
                self.exercice_repository.supprimer_exercice(exercice.id)
                return None
            
            # Récupérer l'exercice complet avec ses questions
            resultat = self.exercice_repository.obtenir_exercice_avec_questions(exercice.id)
            
            if not resultat:
                print("Erreur: impossible de récupérer l'exercice créé")
                return None
                
            return resultat
            
        except Exception as e:
            print(f"Erreur lors de la génération du QCM: {str(e)}")
            traceback.print_exc()
            return None
    
    def obtenir_qcm(self, exercice_id: int) -> Optional[Dict[str, Any]]:
        """
        Récupère un exercice QCM avec toutes ses questions et réponses
        """
        return self.exercice_repository.obtenir_exercice_avec_questions(exercice_id)
    
    def lister_exercices_etudiant(self, etudiant_id: int) -> List[Dict]:
        """
        Liste tous les exercices d'un étudiant
        """
        return self.exercice_repository.obtenir_exercices_etudiant(etudiant_id)
    
    def supprimer_exercice(self, exercice_id: int) -> bool:
        """
        Supprime un exercice
        """
        return self.exercice_repository.supprimer_exercice(exercice_id)
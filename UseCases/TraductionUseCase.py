# UseCases/TraductionUseCase.py
from Services.TraductionService import TraductionService
from Repository.TraductionRepository import TraductionRepository
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TraductionUseCase:
    def __init__(self, traduction_service: TraductionService, traduction_repository: TraductionRepository):
        self.traduction_service = traduction_service
        self.traduction_repository = traduction_repository
    
    def traduire_texte(self, texte, langue_source, langue_cible, etudiant_id=None):
        """
        Traduit un texte et enregistre la traduction
        """
        try:
            if not texte or not texte.strip():
                raise ValueError("Le texte à traduire ne peut pas être vide")
                
            logger.info(f"Tentative de traduction du texte: {texte}")
            
            # Traduire le texte
            texte_traduit = self.traduction_service.translate_text(texte, langue_source, langue_cible)
            
            if not texte_traduit or not texte_traduit.strip():
                raise ValueError("La traduction a retourné un résultat vide")
            
            logger.info(f"Texte traduit: {texte_traduit}")
            
            # Enregistrer la traduction en base de données
            traduction_data = {
                'contenu_original': texte,
                'contenu_traduit': texte_traduit,
                'langue_source': langue_source,
                'langue_cible': langue_cible,
                'etudiant_id': etudiant_id
            }
            
            traduction = self.traduction_repository.create(traduction_data)
            
            result = {
                'id': traduction.id,
                'contenu_original': traduction.contenu_original,
                'contenu_traduit': traduction.contenu_traduit,
                'langue_source': traduction.langue_source,
                'langue_cible': traduction.langue_cible
            }
            
            logger.info(f"Traduction enregistrée avec succès: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Erreur lors de la traduction: {str(e)}")
            raise e
    
    def traduire_pdf(self, pdf_file, langue_source, langue_cible, etudiant_id=None):
        """
        Traduit le contenu d'un fichier PDF et enregistre la traduction
        """
        try:
            # Extraire et traduire le texte du PDF
            texte_original, texte_traduit, filepath = self.traduction_service.translate_pdf(
                pdf_file, langue_source, langue_cible
            )
            
            # Enregistrer la traduction en base de données
            traduction_data = {
                'contenu_original': texte_original,
                'contenu_traduit': texte_traduit,
                'langue_source': langue_source,
                'langue_cible': langue_cible,
                'etudiant_id': etudiant_id,
                'fichier_source': filepath
            }
            
            traduction = self.traduction_repository.create(traduction_data)
            
            return {
                'id': traduction.id,
                'contenu_original': traduction.contenu_original,
                'contenu_traduit': traduction.contenu_traduit,
                'langue_source': traduction.langue_source,
                'langue_cible': traduction.langue_cible,
                'fichier_source': traduction.fichier_source
            }
        except Exception as e:
            raise e
    
    def obtenir_traduction(self, traduction_id):
        """
        Récupère une traduction par son ID
        """
        traduction = self.traduction_repository.get_by_id(traduction_id)
        if not traduction:
            return None
        
        return {
            'id': traduction.id,
            'contenu_original': traduction.contenu_original,
            'contenu_traduit': traduction.contenu_traduit,
            'langue_source': traduction.langue_source,
            'langue_cible': traduction.langue_cible,
            'date_creation': traduction.date_creation.isoformat(),
            'etudiant_id': traduction.etudiant_id,
            'fichier_source': traduction.fichier_source
        }
    
    def obtenir_traductions_etudiant(self, etudiant_id):
        """
        Récupère toutes les traductions d'un étudiant
        """
        traductions = self.traduction_repository.get_by_etudiant(etudiant_id)
        
        return [{
            'id': t.id,
            'contenu_original': t.contenu_original,
            'contenu_traduit': t.contenu_traduit,
            'langue_source': t.langue_source,
            'langue_cible': t.langue_cible,
            'date_creation': t.date_creation.isoformat(),
            'fichier_source': t.fichier_source
        } for t in traductions]

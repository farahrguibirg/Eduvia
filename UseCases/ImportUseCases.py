# usecases/import_users_usecase.py
from typing import Dict, Any
from werkzeug.datastructures import FileStorage
from Services.ImportServices import ExcelImportService
from Repository.ImportRepository import UtilisateurRepository
import logging

logger = logging.getLogger(__name__)

class ImportUsersUseCase:
    """Use Case pour l'importation d'utilisateurs depuis Excel"""
    
    def __init__(self):
        self.excel_service = ExcelImportService()
        self.user_repository = UtilisateurRepository()
    
    def execute(self, file: FileStorage, user_id: int = None) -> Dict[str, Any]:
        """
        Exécute l'importation d'utilisateurs depuis un fichier Excel
        
        Args:
            file: Fichier Excel uploadé
            user_id: ID de l'utilisateur qui effectue l'import (pour les logs)
        
        Returns:
            Dict contenant les résultats de l'import
        """
        try:
            logger.info(f"Début d'import Excel par l'utilisateur {user_id}")
            
            # Validation préliminaire
            if not file:
                return self._create_error_response("Aucun fichier fourni")
            
            # Exécuter l'import via le service
            result = self.excel_service.import_users_from_excel(file)
            
            # Log des résultats
            if result['success']:
                logger.info(f"Import réussi - Créés: {result['total_created']}, Échecs: {result['total_failed']}")
            else:
                logger.warning(f"Import échoué: {result['message']}")
            
            # Enrichir la réponse avec des métadonnées
            result['imported_by'] = user_id
            result['import_type'] = 'excel'
            
            return result
            
        except Exception as e:
            logger.error(f"Erreur dans ImportUsersUseCase: {e}")
            return self._create_error_response(f"Erreur inattendue: {str(e)}")
    
    def validate_import_permissions(self, user_id: int) -> Dict[str, Any]:
        """
        Valide si un utilisateur a les permissions pour importer des utilisateurs
        
        Args:
            user_id: ID de l'utilisateur
            
        Returns:
            Dict contenant le résultat de la validation
        """
        try:
            user = self.user_repository.get_by_id(user_id)
            
            if not user:
                return {
                    'allowed': False,
                    'message': 'Utilisateur non trouvé'
                }
            
            # Vérifier les permissions (ajustez selon votre logique métier)
            if user.type in ['admin', 'super_admin']:
                return {
                    'allowed': True,
                    'message': 'Permissions suffisantes'
                }
            else:
                return {
                    'allowed': False,
                    'message': 'Permissions insuffisantes pour importer des utilisateurs'
                }
                
        except Exception as e:
            logger.error(f"Erreur lors de la validation des permissions: {e}")
            return {
                'allowed': False,
                'message': 'Erreur lors de la validation des permissions'
            }
    
    def _create_error_response(self, message: str) -> Dict[str, Any]:
        """Crée une réponse d'erreur standardisée"""
        return {
            'success': False,
            'message': message,
            'total_processed': 0,
            'total_created': 0,
            'total_failed': 0,
            'created_users': [],
            'failed_users': [],
            'warnings': []
        }
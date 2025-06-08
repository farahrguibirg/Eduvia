# services/excel_import_service.py
import pandas as pd
import logging
from typing import List, Dict, Any
from werkzeug.datastructures import FileStorage
from Repository.ImportRepository import UtilisateurRepository
import tempfile
import os
import openpyxl

logger = logging.getLogger(__name__)

class ExcelImportService:
    """Service pour l'importation de données depuis des fichiers Excel"""
    
    REQUIRED_COLUMNS = ['nom', 'prenom', 'email', 'mot_de_passe']
    OPTIONAL_COLUMNS = ['type', 'tfa_enabled']
    ALLOWED_EXTENSIONS = {'xlsx', 'xls'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    MAX_ROWS = 1000  # Limite de 1000 lignes par fichier Excel
    
    @staticmethod
    def validate_file(file: FileStorage) -> bool:
        """Valide le fichier uploadé"""
        if not file:
            raise ValueError("Aucun fichier fourni")
        
        if file.filename == '':
            raise ValueError("Nom de fichier vide")
        
        # Vérifier l'extension
        if not ExcelImportService._allowed_file(file.filename):
            raise ValueError("Type de fichier non autorisé. Utilisez .xlsx ou .xls")
        
        # Vérifier la taille (approximative)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > ExcelImportService.MAX_FILE_SIZE:
            raise ValueError(f"Fichier trop volumineux. Taille maximale: {ExcelImportService.MAX_FILE_SIZE / (1024*1024):.1f}MB")
        
        return True
    
    @staticmethod
    def _allowed_file(filename: str) -> bool:
        """Vérifie si l'extension du fichier est autorisée"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in ExcelImportService.ALLOWED_EXTENSIONS
    
    @staticmethod
    def read_excel_file(file: FileStorage) -> pd.DataFrame:
        """Lit le fichier Excel et retourne un DataFrame"""
        try:
            ExcelImportService.validate_file(file)
            
            # Sauvegarder temporairement le fichier
            with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as temp_file:
                file.save(temp_file.name)
                temp_file_path = temp_file.name
            
            try:
                # Lire le fichier Excel avec limitation du nombre de lignes
                df = pd.read_excel(temp_file_path, engine='openpyxl', nrows=ExcelImportService.MAX_ROWS)
                
                # Vérifier si le fichier dépasse la limite
                total_rows = len(pd.read_excel(temp_file_path, engine='openpyxl'))
                if total_rows > ExcelImportService.MAX_ROWS:
                    logger.warning(f"Fichier tronqué: {total_rows} lignes trouvées, limite de {ExcelImportService.MAX_ROWS} appliquée")
                
                logger.info(f"Fichier Excel lu avec succès. Nombre de lignes traitées: {len(df)}")
                return df
            finally:
                # Nettoyer le fichier temporaire
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            logger.error(f"Erreur lors de la lecture du fichier Excel: {e}")
            raise ValueError(f"Impossible de lire le fichier Excel: {str(e)}")
    
    @staticmethod
    def validate_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
        """Valide la structure du DataFrame"""
        validation_result = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        # Vérifier la limite de lignes
        if len(df) > ExcelImportService.MAX_ROWS:
            validation_result['warnings'].append(f"Fichier tronqué à {ExcelImportService.MAX_ROWS} lignes")
        
        # Vérifier les colonnes requises
        missing_columns = [col for col in ExcelImportService.REQUIRED_COLUMNS if col not in df.columns]
        if missing_columns:
            validation_result['valid'] = False
            validation_result['errors'].append(f"Colonnes manquantes: {', '.join(missing_columns)}")
        
        # Vérifier si le DataFrame est vide
        if df.empty:
            validation_result['valid'] = False
            validation_result['errors'].append("Le fichier Excel est vide")
        
        # Vérifier les données manquantes dans les colonnes requises
        for col in ExcelImportService.REQUIRED_COLUMNS:
            if col in df.columns:
                null_count = df[col].isnull().sum()
                if null_count > 0:
                    validation_result['warnings'].append(f"Colonne '{col}': {null_count} valeurs manquantes")
        
        return validation_result
    
    @staticmethod
    def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
        """Nettoie le DataFrame"""
        # Supprimer les lignes complètement vides
        df = df.dropna(how='all')
        
        # Nettoyer les espaces en début/fin de chaîne
        string_columns = df.select_dtypes(include=['object']).columns
        for col in string_columns:
            df[col] = df[col].astype(str).str.strip()
        
        # Remplacer 'nan' par None pour les colonnes optionnelles
        for col in ExcelImportService.OPTIONAL_COLUMNS:
            if col in df.columns:
                df[col] = df[col].replace('nan', None)
        
        return df
    
    @staticmethod
    def convert_to_user_data(df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Convertit le DataFrame en liste de dictionnaires pour créer des utilisateurs"""
        users_data = []
        
        for index, row in df.iterrows():
            try:
                # Vérifier que les champs requis ne sont pas vides
                if pd.isna(row['nom']) or pd.isna(row['prenom']) or pd.isna(row['email']) or pd.isna(row['mot_de_passe']):
                    logger.warning(f"Ligne {index + 2}: Données manquantes, ligne ignorée")
                    continue
                
                user_data = {
                    'nom': str(row['nom']).strip(),
                    'prenom': str(row['prenom']).strip(),
                    'email': str(row['email']).strip().lower(),
                    'mot_de_passe': str(row['mot_de_passe']).strip(),  # Sera haché par le repository
                    'type': str(row.get('type', 'utilisateur')).strip() if not pd.isna(row.get('type')) else 'utilisateur',
                    'tfa_enabled': bool(row.get('tfa_enabled', False)) if not pd.isna(row.get('tfa_enabled')) else False
                }
                
                # Validation basique de l'email
                if '@' not in user_data['email']:
                    logger.warning(f"Ligne {index + 2}: Email invalide '{user_data['email']}', ligne ignorée")
                    continue
                
                users_data.append(user_data)
                
            except Exception as e:
                logger.error(f"Erreur lors du traitement de la ligne {index + 2}: {e}")
                continue
        
        return users_data
    
    @staticmethod
    def import_users_from_excel(file: FileStorage) -> Dict[str, Any]:
        """Importe les utilisateurs depuis un fichier Excel"""
        try:
            # Lire le fichier Excel
            df = ExcelImportService.read_excel_file(file)
            
            # Valider la structure
            validation = ExcelImportService.validate_dataframe(df)
            if not validation['valid']:
                return {
                    'success': False,
                    'message': 'Validation échouée',
                    'errors': validation['errors'],
                    'warnings': validation['warnings']
                }
            
            # Nettoyer les données
            df = ExcelImportService.clean_dataframe(df)
            
            # Convertir en données utilisateur
            users_data = ExcelImportService.convert_to_user_data(df)
            
            if not users_data:
                return {
                    'success': False,
                    'message': 'Aucune donnée valide trouvée dans le fichier',
                    'total_processed': 0,
                    'total_created': 0,
                    'total_failed': 0
                }
            
            # Créer les utilisateurs en lot (les mots de passe seront hachés automatiquement)
            result = UtilisateurRepository.bulk_create_users(users_data)
            
            return {
                'success': True,
                'message': f'Import terminé: {result["total_created"]} utilisateurs créés, {result["total_failed"]} échecs',
                'total_processed': len(users_data),
                'total_created': result['total_created'],
                'total_failed': result['total_failed'],
                'created_users': [{'id': u.id, 'email': u.email} for u in result['created']],
                'failed_users': result['failed'],
                'warnings': validation['warnings']
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de l'import Excel: {e}")
            return {
                'success': False,
                'message': f'Erreur lors de l\'import: {str(e)}',
                'total_processed': 0,
                'total_created': 0,
                'total_failed': 0
            }
# controllers/import_controller.py
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from UseCases.ImportUseCases import ImportUsersUseCase
from Repository.ImportRepository import UtilisateurRepository
from functools import wraps
import logging
import openpyxl

logger = logging.getLogger(__name__)

class ImportController:
    """Contrôleur pour les fonctionnalités d'import"""
    
    def __init__(self):
        self.import_usecase = ImportUsersUseCase()
        self.user_repository = UtilisateurRepository()
    
    @jwt_required()
    def import_users_from_excel(self):
        """
        Endpoint pour importer des utilisateurs depuis un fichier Excel
        
        Returns:
            JSON response avec les résultats de l'import
        """
        try:
            # Récupérer l'identité de l'utilisateur authentifié
            current_user_id = get_jwt_identity()
            logger.info(f"Tentative d'import par l'utilisateur ID: {current_user_id}")
            
            # Vérifier si un fichier a été uploadé
            if 'file' not in request.files:
                logger.warning("Aucun fichier trouvé dans la requête")
                return jsonify({
                    'success': False,
                    'message': 'Aucun fichier trouvé dans la requête'
                }), 400
            
            file = request.files['file']
            
            if file.filename == '':
                logger.warning("Nom de fichier vide")
                return jsonify({
                    'success': False,
                    'message': 'Aucun fichier sélectionné'
                }), 400
            
            # Valider les permissions
            permission_check = self.import_usecase.validate_import_permissions(current_user_id)
            if not permission_check['allowed']:
                logger.warning(f"Permission refusée pour l'utilisateur {current_user_id}: {permission_check['message']}")
                return jsonify({
                    'success': False,
                    'message': permission_check['message']
                }), 403
            
            # Exécuter l'import
            result = self.import_usecase.execute(file, current_user_id)
            
            # Déterminer le code de statut HTTP
            status_code = 200 if result['success'] else 400
            
            logger.info(f"Import terminé pour l'utilisateur {current_user_id}: {result['message']}")
            return jsonify(result), status_code
            
        except Exception as e:
            logger.error(f"Erreur dans import_users_from_excel: {e}")
            return jsonify({
                'success': False,
                'message': 'Erreur interne du serveur'
            }), 500
    
    @jwt_required()
    def validate_excel_file(self):
        """
        Endpoint pour valider un fichier Excel avant import
        
        Returns:
            JSON response avec les résultats de validation
        """
        try:
            current_user_id = get_jwt_identity()
            
            # Vérifier les permissions
            permission_check = self.import_usecase.validate_import_permissions(current_user_id)
            if not permission_check['allowed']:
                return jsonify({
                    'success': False,
                    'message': permission_check['message']
                }), 403
            
            if 'file' not in request.files:
                return jsonify({
                    'success': False,
                    'message': 'Aucun fichier trouvé'
                }), 400
            
            file = request.files['file']
            
            if file.filename == '':
                return jsonify({
                    'success': False,
                    'message': 'Aucun fichier sélectionné'
                }), 400
            
            from Services.ImportServices import ExcelImportService
            
            # Lire et valider le fichier
            df = ExcelImportService.read_excel_file(file)
            validation = ExcelImportService.validate_dataframe(df)
            
            # Compter les lignes valides
            users_data = ExcelImportService.convert_to_user_data(
                ExcelImportService.clean_dataframe(df)
            )
            
            return jsonify({
                'success': True,
                'validation': validation,
                'preview': {
                    'total_rows': len(df),
                    'valid_rows': len(users_data),
                    'columns_found': list(df.columns),
                    'sample_data': df.head(3).to_dict('records') if not df.empty else []
                }
            }), 200
            
        except Exception as e:
            logger.error(f"Erreur dans validate_excel_file: {e}")
            return jsonify({
                'success': False,
                'message': f'Erreur de validation: {str(e)}'
            }), 400

    @jwt_required()
    def test_permissions(self):
        """
        Teste les permissions d'import de l'utilisateur actuel
        """
        try:
            current_user_id = get_jwt_identity()
            
            if not current_user_id:
                return jsonify({
                    'success': False,
                    'message': 'Utilisateur non authentifié'
                }), 401
            
            permission_check = self.import_usecase.validate_import_permissions(current_user_id)
            
            return jsonify({
                'success': True,
                'permissions': permission_check,
                'user_id': current_user_id
            }), 200
            
        except Exception as e:
            logger.error(f"Erreur dans test_permissions: {e}")
            return jsonify({
                'success': False,
                'message': 'Erreur lors du test des permissions'
            }), 500
"""       
 @jwt_required()
    def get_import_template(self):
        
        Endpoint pour récupérer les informations du template d'import
        
        Returns:
            JSON response avec la structure du template
        
        try:
            current_user_id = get_jwt_identity()
            
            # Vérifier les permissions
            permission_check = self.import_usecase.validate_import_permissions(current_user_id)
            if not permission_check['allowed']:
                return jsonify({
                    'success': False,
                    'message': permission_check['message']
                }), 403
            
            template_info = self.import_usecase.get_import_template()
            return jsonify({
                'success': True,
                'template': template_info
            }), 200
            
        except Exception as e:
            logger.error(f"Erreur dans get_import_template: {e}")
            return jsonify({
                'success': False,
                'message': 'Erreur lors de la récupération du template'
            }), 500
    
    @jwt_required()
    def download_template(self):
        
        Endpoint pour télécharger un fichier Excel template
        
        Returns:
            Fichier Excel ou erreur JSON
        
        try:
            current_user_id = get_jwt_identity()
            
            # Vérifier les permissions
            permission_check = self.import_usecase.validate_import_permissions(current_user_id)
            if not permission_check['allowed']:
                return jsonify({
                    'success': False,
                    'message': permission_check['message']
                }), 403
            
            from flask import send_file
            import pandas as pd
            import tempfile
            import os
            
            # Récupérer les informations du template
            template_info = self.import_usecase.get_import_template()
            
            # Créer un DataFrame avec les données d'exemple
            df = pd.DataFrame(template_info['example_data'])
            
            # Créer un fichier temporaire
            with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as temp_file:
                temp_file_path = temp_file.name
            
            try:
                # Écrire le DataFrame dans le fichier Excel
                with pd.ExcelWriter(temp_file_path, engine='openpyxl') as writer:
                    df.to_excel(writer, sheet_name='Utilisateurs', index=False)
                    
                    # Ajouter une feuille avec les instructions
                    instructions_df = pd.DataFrame([
                        ['Colonnes obligatoires:', ', '.join(template_info['required_columns'])],
                        ['Colonnes optionnelles:', ', '.join(template_info['optional_columns'])],
                        ['', ''],
                        ['Instructions:', ''],
                        ['1. Remplissez les colonnes obligatoires pour chaque utilisateur'],
                        ['2. Les mots de passe seront automatiquement hashés'],
                        ['3. L\'email doit être unique dans le système'],
                        ['4. Le type par défaut est "utilisateur"'],
                        ['5. Sauvegardez le fichier et importez-le via l\'interface']
                    ], columns=['Description', 'Valeur'])
                    
                    instructions_df.to_excel(writer, sheet_name='Instructions', index=False)
                
                return send_file(
                    temp_file_path,
                    as_attachment=True,
                    download_name='template_import_utilisateurs.xlsx',
                    mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
                
            finally:
                # Nettoyer le fichier temporaire après un délai
                try:
                    os.unlink(temp_file_path)
                except:
                    pass
                    
        except Exception as e:
            logger.error(f"Erreur dans download_template: {e}")
            return jsonify({
                'success': False,
                'message': 'Erreur lors de la génération du template'
            }), 500
    
    @jwt_required()
    def get_import_status(self):
        
        Endpoint pour récupérer le statut des imports récents
        
        Returns:
            JSON response avec l'historique des imports
        
        try:
            current_user_id = get_jwt_identity()
            limit = request.args.get('limit', 10, type=int)
            
            # Vérifier les permissions
            permission_check = self.import_usecase.validate_import_permissions(current_user_id)
            if not permission_check['allowed']:
                return jsonify({
                    'success': False,
                    'message': permission_check['message']
                }), 403
            
            history = self.import_usecase.get_import_history(current_user_id, limit)
            
            return jsonify({
                'success': True,
                'history': history
            }), 200
            
        except Exception as e:
            logger.error(f"Erreur dans get_import_status: {e}")
            return jsonify({
                'success': False,
                'message': 'Erreur lors de la récupération du statut'
            }), 500"""
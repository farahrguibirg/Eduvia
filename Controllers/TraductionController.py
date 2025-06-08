from flask import request, jsonify, current_app
from Services.TraductionService import TraductionService
from UseCases.TraductionUseCase import TraductionUseCase
from Repository.TraductionRepository import TraductionRepository
import os

def traduire_texte():
    """
    Endpoint pour traduire un texte
    """
    try:
        # Récupérer les données du corps de la requête
        data = request.get_json()
        
        # Vérifier les données requises
        if not all(k in data for k in ['texte', 'langue_source', 'langue_cible']):
            return jsonify({
                'success': False,
                'message': 'Les champs texte, langue_source et langue_cible sont requis'
            }), 400
        
        # Récupérer l'ID de l'étudiant s'il est présent
        etudiant_id = data.get('etudiant_id')
        
        # Initialiser les services
        upload_folder = os.path.join(current_app.root_path, 'uploads')
        traduction_service = TraductionService(upload_folder=upload_folder)
        traduction_repository = TraductionRepository()
        traduction_use_case = TraductionUseCase(traduction_service, traduction_repository)
        
        # Exécuter la traduction
        result = traduction_use_case.traduire_texte(
            data['texte'], 
            data['langue_source'], 
            data['langue_cible'], 
            etudiant_id
        )
        
        # Formater la réponse pour correspondre à ce qu'attend le frontend
        return jsonify({
            'success': True,
            'traduction': {
                'contenu_traduit': result.get('contenu_traduit', ''),
                'langue_source': result.get('langue_source', ''),
                'langue_cible': result.get('langue_cible', ''),
                'id': result.get('id', ''),
                'date_creation': result.get('date_creation', ''),
                'texte_original': result.get('contenu_original', '')
            }
        })
        
    except ValueError as e:
        # Pour les erreurs de validation/traduction
        return jsonify({
            'success': False,
            'message': f'Erreur de validation: {str(e)}'
        }), 400
    except Exception as e:
        # Pour les erreurs générales
        current_app.logger.error(f"Erreur lors de la traduction de texte: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Une erreur est survenue: {str(e)}'
        }), 500

def traduire_pdf():
    """
    Endpoint pour traduire un fichier PDF
    """
    try:
        # Vérifier si un fichier est présent dans la requête
        if 'fichier' not in request.files:
            return jsonify({
                'success': False,
                'message': 'Aucun fichier n\'a été fourni'
            }), 400
        
        fichier = request.files['fichier']
        
        # Vérifier si le fichier est vide
        if fichier.filename == '':
            return jsonify({
                'success': False,
                'message': 'Aucun fichier sélectionné'
            }), 400
        
        # Vérifier si le fichier est un PDF
        if not fichier.filename.lower().endswith('.pdf'):
            return jsonify({
                'success': False,
                'message': 'Le fichier doit être au format PDF'
            }), 400
        
        # Récupérer les langues source et cible
        langue_source = request.form.get('langue_source')
        langue_cible = request.form.get('langue_cible')
        
        if not langue_source or not langue_cible:
            return jsonify({
                'success': False,
                'message': 'Les paramètres langue_source et langue_cible sont requis'
            }), 400
        
        # Récupérer l'ID de l'étudiant s'il est présent
        etudiant_id = request.form.get('etudiant_id')
        
        # Initialiser les services
        upload_folder = os.path.join(current_app.root_path, 'uploads')
        # Créer le dossier s'il n'existe pas
        os.makedirs(upload_folder, exist_ok=True)
        
        traduction_service = TraductionService(upload_folder=upload_folder)
        traduction_repository = TraductionRepository()
        traduction_use_case = TraductionUseCase(traduction_service, traduction_repository)
        
        # Exécuter la traduction
        result = traduction_use_case.traduire_pdf(
            fichier, 
            langue_source, 
            langue_cible, 
            etudiant_id
        )
        
        # Formater la réponse pour correspondre à ce qu'attend le frontend
        return jsonify({
            'success': True,
            'traduction': {
                'contenu_traduit': result.get('contenu_traduit', ''),
                'langue_source': result.get('langue_source', ''),
                'langue_cible': result.get('langue_cible', ''),
                'id': result.get('id', ''),
                'date_creation': result.get('date_creation', ''),
                'texte_original': result.get('contenu_original', ''),
                'fichier_path': result.get('fichier_path', '')
            }
        })
        
    except ValueError as e:
        # Pour les erreurs de validation/traduction
        return jsonify({
            'success': False,
            'message': f'Erreur de validation: {str(e)}'
        }), 400
    except Exception as e:
        # Pour les erreurs générales
        current_app.logger.error(f"Erreur lors de la traduction de PDF: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Une erreur est survenue: {str(e)}'
        }), 500

def obtenir_traduction(traduction_id):
    """
    Endpoint pour récupérer une traduction par son ID
    """
    try:
        # Initialiser les services
        upload_folder = os.path.join(current_app.root_path, 'uploads')
        traduction_service = TraductionService(upload_folder=upload_folder)
        traduction_repository = TraductionRepository()
        traduction_use_case = TraductionUseCase(traduction_service, traduction_repository)
        
        # Récupérer la traduction
        result = traduction_use_case.obtenir_traduction(traduction_id)
        
        if not result:
            return jsonify({
                'success': False,
                'message': f'Traduction avec ID {traduction_id} non trouvée'
            }), 404
        
        # Formater la réponse pour correspondre à ce qu'attend le frontend
        return jsonify({
            'success': True,
            'traduction': {
                'contenu_traduit': result.get('contenu_traduit', ''),
                'langue_source': result.get('langue_source', ''),
                'langue_cible': result.get('langue_cible', ''),
                'id': result.get('id', ''),
                'date_creation': result.get('date_creation', ''),
                'texte_original': result.get('contenu_original', '')
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Erreur lors de la récupération de la traduction: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Une erreur est survenue: {str(e)}'
        }), 500

def obtenir_traductions_etudiant(etudiant_id):
    """
    Endpoint pour récupérer toutes les traductions d'un étudiant
    """
    try:
        # Initialiser les services
        upload_folder = os.path.join(current_app.root_path, 'uploads')
        traduction_service = TraductionService(upload_folder=upload_folder)
        traduction_repository = TraductionRepository()
        traduction_use_case = TraductionUseCase(traduction_service, traduction_repository)
        
        # Récupérer les traductions
        result = traduction_use_case.obtenir_traductions_etudiant(etudiant_id)
        
        # Formater la réponse pour correspondre à ce qu'attend le frontend
        return jsonify({
            'success': True,
            'traductions': result
        })
        
    except Exception as e:
        current_app.logger.error(f"Erreur lors de la récupération des traductions de l'étudiant: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Une erreur est survenue: {str(e)}'
        }), 500
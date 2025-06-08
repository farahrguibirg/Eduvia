"""
from flask import Blueprint, request, jsonify
from Controllers.resume_controller import ResumeController
import logging
import json
from Models.Resume import Resume
from app import db

logger = logging.getLogger(__name__)

resume_bp = Blueprint('resume', __name__, url_prefix='/api')
resume_controller = ResumeController()

# Route POST pour créer un résumé à partir d'un texte
@resume_bp.route('/resume', methods=['POST'])
def create_resume():
    logger.info("Route POST /resume appelée")
    try:
        # Vérifier le Content-Type
        if not request.is_json:
            logger.error("Content-Type n'est pas application/json")
            return jsonify({'error': 'Content-Type doit être application/json'}), 400

        # Tenter de parser le JSON
        try:
            data = request.get_json()
            logger.info(f"Données reçues: {data}")
        except json.JSONDecodeError as e:
            logger.error(f"Erreur de parsing JSON: {e}")
            return jsonify({'error': 'Format JSON invalide'}), 400

        # Vérifier que les données requises sont présentes
        if not data or 'text' not in data:
            logger.error("Données manquantes: 'text' est requis")
            return jsonify({'error': "Le champ 'text' est requis"}), 400
        
        # Appeler le contrôleur avec les données
        result = resume_controller.create_resume()
        return result
    except Exception as e:
        logger.error(f"Erreur lors de la création du résumé: {e}")
        return jsonify({'error': str(e)}), 500

# Route POST pour générer un résumé à partir d'un fichier PDF
@resume_bp.route('/resume/pdf', methods=['POST'])
def generate_resume_from_pdf():
    logger.info("Route POST /resume/pdf appelée")
    try:
        # Log des headers reçus
        logger.info(f"Headers reçus: {dict(request.headers)}")
        
        # Vérifier que le fichier est présent
        if 'file' not in request.files:
            logger.error("Aucun fichier PDF fourni dans request.files")
            logger.debug(f"Contenu de request.files: {request.files}")
            logger.debug(f"Contenu de request.form: {request.form}")
            logger.debug(f"Contenu de request.data: {request.data}")
            return jsonify({'error': 'Aucun fichier PDF fourni'}), 400

        file = request.files['file']
        logger.info(f"Fichier reçu: {file.filename}")
        logger.info(f"Type MIME du fichier: {file.content_type}")
        
        # Vérifier que le fichier n'est pas vide
        if file.filename == '':
            logger.error("Aucun fichier sélectionné")
            return jsonify({'error': 'Aucun fichier sélectionné'}), 400

        # Vérifier que le fichier est un PDF
        if not file.filename.lower().endswith('.pdf'):
            logger.error(f"Le fichier n'est pas un PDF: {file.filename}")
            return jsonify({'error': 'Le fichier doit être un PDF'}), 400

        # Récupérer la longueur du résumé
        length = request.form.get('length', 'medium')
        logger.info(f"Longueur du résumé demandée: {length}")

        result = resume_controller.generate_resume_from_pdf()
        return result

    except Exception as e:
        logger.error(f"Erreur lors de la génération du résumé à partir du PDF: {str(e)}")
        logger.exception("Détails de l'erreur:")
        return jsonify({'error': str(e)}), 500

# Route GET pour lister les résumés
@resume_bp.route('/resume', methods=['GET'])
def list_resumes():
    logger.info("Route GET /resume appelée")
    try:
        result = resume_controller.list_resumes()
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Erreur lors de la liste des résumés: {e}")
        return jsonify({'error': str(e)}), 500

# Route GET pour obtenir un résumé spécifique
@resume_bp.route('/resume/<int:resume_id>', methods=['GET'])
def get_resume(resume_id):
    logger.info(f"Route GET /resume/{resume_id} appelée")
    try:
        result = resume_controller.get_resume(resume_id)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du résumé: {e}")
        return jsonify({'error': str(e)}), 500

# Route PUT pour mettre à jour un résumé spécifique
@resume_bp.route('/resume/<int:resume_id>', methods=['PUT'])
def update_resume(resume_id):
    logger.info(f"Route PUT /resume/{resume_id} appelée")
    try:
        data = request.get_json()
        result = resume_controller.update_resume(resume_id, data)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du résumé: {e}")
        return jsonify({'error': str(e)}), 500

# Route DELETE pour supprimer un résumé spécifique
@resume_bp.route('/resume/<int:resume_id>', methods=['DELETE'])
def delete_resume(resume_id):
    logger.info(f"Route DELETE /resume/{resume_id} appelée")
    try:
        result = resume_controller.delete_resume(resume_id)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du résumé: {e}")
        return jsonify({'error': str(e)}), 500

# Route GET pour lister l'historique des résumés d'un étudiant
@resume_bp.route('/resume/historique/etudiant/<etudiant_id>', methods=['GET'])
def get_resume_history_by_etudiant(etudiant_id):
    try:
        resumes = Resume.query.filter_by(etudiant_id=etudiant_id).order_by(Resume.created_at.desc()).all()
        resumes_list = [r.to_dict() for r in resumes]
        return jsonify({'success': True, 'resumes': resumes_list}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Route POST pour ajouter un résumé à l'historique
@resume_bp.route('/resume/historique', methods=['POST'])
def add_resume_to_history():
    try:
        data = request.get_json()
        resume = Resume(
            etudiant_id=data['etudiantId'],
            original_text=data.get('original_text', ''),
            summary=data.get('summary', ''),
            length=data.get('length', 'medium'),
            created_at=data.get('created_at')
        )
        db.session.add(resume)
        db.session.commit()
        return jsonify({'success': True, 'resume': resume.to_dict()}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

# Route DELETE pour supprimer un résumé de l'historique
@resume_bp.route('/resume/historique/<int:resume_id>', methods=['DELETE'])
def delete_resume_from_history(resume_id):
    try:
        resume = Resume.query.get(resume_id)
        if not resume:
            return jsonify({'success': False, 'message': 'Résumé non trouvé'}), 404
        db.session.delete(resume)
        db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400"""
# Route GET pour obtenir les modèles disponibles
from flask import Blueprint, request, jsonify
from Controllers.resume_controller import ResumeController
import logging
import json
from Models.Resume import Resume
from app import db

logger = logging.getLogger(__name__)

resume_bp = Blueprint('resume', __name__, url_prefix='/api')
resume_controller = ResumeController()

@resume_bp.route('/resume/models', methods=['GET'])
def get_available_models():
    logger.info("Route GET /resume/models appelée")
    try:
        result = resume_controller.get_available_models()
        return result
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des modèles: {e}")
        return jsonify({'error': str(e)}), 500

# Route POST pour créer un résumé à partir d'un texte (mise à jour)
@resume_bp.route('/resume', methods=['POST'])
def create_resume():
    logger.info("Route POST /resume appelée")
    try:
        # Vérifier le Content-Type
        if not request.is_json:
            logger.error("Content-Type n'est pas application/json")
            return jsonify({'error': 'Content-Type doit être application/json'}), 400

        # Tenter de parser le JSON
        try:
            data = request.get_json()
            logger.info(f"Données reçues: {data}")
        except json.JSONDecodeError as e:
            logger.error(f"Erreur de parsing JSON: {e}")
            return jsonify({'error': 'Format JSON invalide'}), 400

        # Vérifier que les données requises sont présentes
        if not data or 'text' not in data:
            logger.error("Données manquantes: 'text' est requis")
            return jsonify({'error': "Le champ 'text' est requis"}), 400
        
        # Log du modèle demandé
        model_preference = data.get('model', 'auto')
        logger.info(f"Modèle demandé: {model_preference}")
        
        # Appeler le contrôleur avec les données
        result = resume_controller.create_resume()
        return result
    except Exception as e:
        logger.error(f"Erreur lors de la création du résumé: {e}")
        return jsonify({'error': str(e)}), 500

# Route POST pour générer un résumé à partir d'un fichier PDF (mise à jour)
@resume_bp.route('/resume/pdf', methods=['POST'])
def generate_resume_from_pdf():
    logger.info("Route POST /resume/pdf appelée")
    try:
        # Log des headers reçus
        logger.info(f"Headers reçus: {dict(request.headers)}")
        
        # Vérifier que le fichier est présent
        if 'file' not in request.files:
            logger.error("Aucun fichier PDF fourni dans request.files")
            logger.debug(f"Contenu de request.files: {request.files}")
            logger.debug(f"Contenu de request.form: {request.form}")
            logger.debug(f"Contenu de request.data: {request.data}")
            return jsonify({'error': 'Aucun fichier PDF fourni'}), 400

        file = request.files['file']
        logger.info(f"Fichier reçu: {file.filename}")
        logger.info(f"Type MIME du fichier: {file.content_type}")
        
        # Vérifier que le fichier n'est pas vide
        if file.filename == '':
            logger.error("Aucun fichier sélectionné")
            return jsonify({'error': 'Aucun fichier sélectionné'}), 400

        # Vérifier que le fichier est un PDF
        if not file.filename.lower().endswith('.pdf'):
            logger.error(f"Le fichier n'est pas un PDF: {file.filename}")
            return jsonify({'error': 'Le fichier doit être un PDF'}), 400

        # Récupérer les paramètres
        length = request.form.get('length', 'medium')
        model_preference = request.form.get('model', 'auto')
        logger.info(f"Longueur du résumé demandée: {length}")
        logger.info(f"Modèle demandé: {model_preference}")

        result = resume_controller.generate_resume_from_pdf()
        return result

    except Exception as e:
        logger.error(f"Erreur lors de la génération du résumé à partir du PDF: {str(e)}")
        logger.exception("Détails de l'erreur:")
        return jsonify({'error': str(e)}), 500
# Route GET pour lister les résumés
@resume_bp.route('/resume', methods=['GET'])
def list_resumes():
    logger.info("Route GET /resume appelée")
    try:
        result = resume_controller.list_resumes()
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Erreur lors de la liste des résumés: {e}")
        return jsonify({'error': str(e)}), 500

# Route GET pour obtenir un résumé spécifique
@resume_bp.route('/resume/<int:resume_id>', methods=['GET'])
def get_resume(resume_id):
    logger.info(f"Route GET /resume/{resume_id} appelée")
    try:
        result = resume_controller.get_resume(resume_id)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du résumé: {e}")
        return jsonify({'error': str(e)}), 500

# Route PUT pour mettre à jour un résumé spécifique
@resume_bp.route('/resume/<int:resume_id>', methods=['PUT'])
def update_resume(resume_id):
    logger.info(f"Route PUT /resume/{resume_id} appelée")
    try:
        data = request.get_json()
        result = resume_controller.update_resume(resume_id, data)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du résumé: {e}")
        return jsonify({'error': str(e)}), 500

# Route DELETE pour supprimer un résumé spécifique
@resume_bp.route('/resume/<int:resume_id>', methods=['DELETE'])
def delete_resume(resume_id):
    logger.info(f"Route DELETE /resume/{resume_id} appelée")
    try:
        result = resume_controller.delete_resume(resume_id)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du résumé: {e}")
        return jsonify({'error': str(e)}), 500

# Route GET pour lister l'historique des résumés d'un étudiant
@resume_bp.route('/resume/historique/etudiant/<etudiant_id>', methods=['GET'])
def get_resume_history_by_etudiant(etudiant_id):
    try:
        resumes = Resume.query.filter_by(etudiant_id=etudiant_id).order_by(Resume.created_at.desc()).all()
        resumes_list = [r.to_dict() for r in resumes]
        return jsonify({'success': True, 'resumes': resumes_list}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Route POST pour ajouter un résumé à l'historique
@resume_bp.route('/resume/historique', methods=['POST'])
def add_resume_to_history():
    try:
        data = request.get_json()
        resume = Resume(
            etudiant_id=data['etudiantId'],
            original_text=data.get('original_text', ''),
            summary=data.get('summary', ''),
            length=data.get('length', 'medium'),
            created_at=data.get('created_at')
        )
        db.session.add(resume)
        db.session.commit()
        return jsonify({'success': True, 'resume': resume.to_dict()}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

# Route DELETE pour supprimer un résumé de l'historique
@resume_bp.route('/resume/historique/<int:resume_id>', methods=['DELETE'])
def delete_resume_from_history(resume_id):
    try:
        resume = Resume.query.get(resume_id)
        if not resume:
            return jsonify({'success': False, 'message': 'Résumé non trouvé'}), 404
        db.session.delete(resume)
        db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

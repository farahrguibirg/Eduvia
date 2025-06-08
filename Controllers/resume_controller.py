"""from flask import Blueprint, request, jsonify, render_template
from Services.resume_services import ResumeService
import os
import tempfile
from werkzeug.utils import secure_filename
import time

resume_bp = Blueprint('resume_bp', __name__)
resume_service = ResumeService()

@resume_bp.route('/resume', methods=['GET'])
def resume_page():
    return render_template('resume.html')

@resume_bp.route('/generate_resume', methods=['POST'])
def generate_resume():
    try:
        # Vérifier si un fichier a été envoyé
        if 'pdf_file' not in request.files:
            return jsonify({'error': 'Aucun fichier PDF fourni'}), 400

        file = request.files['pdf_file']
        length = request.form.get('length', 'medium')

        # Vérifier si le fichier est vide
        if file.filename == '':
            return jsonify({'error': 'Aucun fichier sélectionné'}), 400

        # Vérifier si c'est un PDF
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Le fichier doit être un PDF'}), 400

        # Créer un fichier temporaire sécurisé
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            file_path = temp_file.name
            file.save(file_path)

            try:
                # Extraire texte et générer résumé
                text = resume_service.extract_text_from_pdf(file_path)
                if not text:
                    return jsonify({'error': 'Impossible d\'extraire le texte du PDF'}), 400

                summary = resume_service.generate_summary(text, length)
                
                # Sauvegarder dans la base de données
                resume_data = {
                    "original_text": text,
                    "summary": summary,
                    "length": length
                }
                resume_service.create_resume(resume_data)
                
                # Retourner le template avec le résumé
                return render_template('resume.html', resume=summary)

            finally:
                # Nettoyer le fichier temporaire
                try:
                    if os.path.exists(file_path):
                        os.unlink(file_path)
                except Exception as e:
                    print(f"Erreur lors de la suppression du fichier temporaire: {e}")

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resume_bp.route('/resume/<int:resume_id>', methods=['GET'])
def get_resume(resume_id):
    resume = resume_service.get_resume(resume_id)
    if not resume:
        return jsonify({'error': 'Résumé non trouvé'}), 404

    return jsonify({
        'id': resume.id,
        'original_text': resume.original_text,
        'summary': resume.summary,
        'length': resume.length,
        'created_at': resume.created_at
    })

@resume_bp.route('/resumes', methods=['GET'])
def list_resumes():
    resumes = resume_service.list_resumes()
    return jsonify([{
        'id': r.id,
        'original_text': r.original_text,
        'summary': r.summary,
        'length': r.length,
        'created_at': r.created_at
    } for r in resumes])

class ResumeController:
    def __init__(self):
        self.resume_service = ResumeService()

    def create_resume(self):
        try:
            data = request.get_json()
            text = data.get('text')
            length = data.get('length', 'medium')
            etudiant_id = data.get('etudiant_id', '1')  # Default to '1' if not provided
            
            if not text:
                return jsonify({'error': 'Text is required'}), 400
                
            summary = self.resume_service.generate_summary(text, length)
            resume_data = {
                "etudiant_id": etudiant_id,
                "original_text": text,
                "summary": summary,
                "length": length
            }
            
            created_resume = self.resume_service.create_resume(resume_data)
            return jsonify(created_resume), 200
        except Exception as e:
            print(f"Erreur dans create_resume: {str(e)}")
            return jsonify({'error': str(e)}), 500

    def generate_resume_from_pdf(self):
        temp_file = None
        try:
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400

            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400

            if not file.filename.lower().endswith('.pdf'):
                return jsonify({'error': 'File must be a PDF'}), 400

            length = request.form.get('length', 'medium')
            etudiant_id = request.form.get('etudiant_id')
            
            if not etudiant_id:
                return jsonify({'error': 'Le champ etudiant_id est requis'}), 400
            
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            file_path = temp_file.name
            file.save(file_path)
            temp_file.close()
            
            try:
                text = self.resume_service.extract_text_from_pdf(file_path)
                if not text:
                    return jsonify({'error': 'Could not extract text from PDF'}), 400

                summary = self.resume_service.generate_summary(text, length)
                resume_data = {
                    "original_text": text,
                    "summary": summary,
                    "length": length,
                    "etudiant_id": etudiant_id
                }
                
                # Sauvegarder dans la base de données
                created_resume = self.resume_service.create_resume(resume_data)
                
                # Retourner le résumé avec toutes les informations
                return jsonify(created_resume), 200
            finally:
                time.sleep(0.5)
                try:
                    if os.path.exists(file_path):
                        os.unlink(file_path)
                except Exception as e:
                    print(f"Warning: Could not delete temporary file: {e}")
                        
        except Exception as e:
            print(f"Erreur dans generate_resume_from_pdf: {str(e)}")
            return jsonify({'error': str(e)}), 500

    def list_resumes(self):
        try:
            resumes = self.resume_service.list_resumes()
            return [{
                'id': r.id,
                'original_text': r.original_text,
                'summary': r.summary,
                'length': r.length,
                'created_at': r.created_at
            } for r in resumes]
        except Exception as e:
            print(f"Erreur dans list_resumes: {str(e)}")
            return {'error': str(e)}, 500

    def get_resume(self, resume_id):
        try:
            resume = self.resume_service.get_resume(resume_id)
            if not resume:
                return {'error': 'Resume not found'}, 404
                
            return {
                'id': resume.id,
                'original_text': resume.original_text,
                'summary': resume.summary,
                'length': resume.length,
                'created_at': resume.created_at
            }
        except Exception as e:
            print(f"Erreur dans get_resume: {str(e)}")
            return {'error': str(e)}, 500

    def update_resume(self, resume_id, data):
        try:
            updated = self.resume_service.update_resume(resume_id, data)
            return {'success': bool(updated)}
        except Exception as e:
            print(f"Erreur dans update_resume: {str(e)}")
            return {'error': str(e)}, 500

    def delete_resume(self, resume_id):
        try:
            deleted = self.resume_service.delete_resume(resume_id)
            return {'success': bool(deleted)}
        except Exception as e:
            print(f"Erreur dans delete_resume: {str(e)}")
            return {'error': str(e)}, 500"""


# Controllers/resume_controller.py
from flask import request, jsonify
from Services.resume_services import ResumeService
import os
import tempfile
from werkzeug.utils import secure_filename
import time

class ResumeController:
    def __init__(self):
        self.resume_service = None
    
    def _get_service(self):
        """Initialisation paresseuse du service"""
        if self.resume_service is None:
            self.resume_service = ResumeService()
        return self.resume_service

    def create_resume(self):
        try:
            data = request.get_json()
            text = data.get('text')
            length = data.get('length', 'medium')
            etudiant_id = data.get('etudiant_id', '1')  # Default to '1' if not provided
            
            if not text:
                return jsonify({'error': 'Text is required'}), 400
                
            service = self._get_service()
            summary = service.generate_summary(text, length)
            resume_data = {
                "etudiant_id": etudiant_id,
                "original_text": text,
                "summary": summary,
                "length": length
            }
            
            created_resume = service.create_resume(resume_data)
            return jsonify(created_resume), 200
        except Exception as e:
            print(f"Erreur dans create_resume: {str(e)}")
            return jsonify({'error': str(e)}), 500

    def generate_resume_from_pdf(self):
        temp_file = None
        try:
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400

            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400

            if not file.filename.lower().endswith('.pdf'):
                return jsonify({'error': 'File must be a PDF'}), 400

            length = request.form.get('length', 'medium')
            etudiant_id = request.form.get('etudiant_id')
            
            if not etudiant_id:
                return jsonify({'error': 'Le champ etudiant_id est requis'}), 400
            
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            file_path = temp_file.name
            file.save(file_path)
            temp_file.close()
            
            try:
                service = self._get_service()
                text = service.extract_text_from_pdf(file_path)
                if not text:
                    return jsonify({'error': 'Could not extract text from PDF'}), 400

                summary = service.generate_summary(text, length)
                resume_data = {
                    "original_text": text,
                    "summary": summary,
                    "length": length,
                    "etudiant_id": etudiant_id
                }
                
                # Sauvegarder dans la base de données
                created_resume = service.create_resume(resume_data)
                
                # Retourner le résumé avec toutes les informations
                return jsonify(created_resume), 200
            finally:
                time.sleep(0.5)
                try:
                    if os.path.exists(file_path):
                        os.unlink(file_path)
                except Exception as e:
                    print(f"Warning: Could not delete temporary file: {e}")
                        
        except Exception as e:
            print(f"Erreur dans generate_resume_from_pdf: {str(e)}")
            return jsonify({'error': str(e)}), 500

    def list_resumes(self):
        try:
            service = self._get_service()
            resumes = service.list_resumes()
            return [{
                'id': r['id'],
                'original_text': r['original_text'],
                'summary': r['summary'],
                'length': r['length'],
                'created_at': r['created_at']
            } for r in resumes]
        except Exception as e:
            print(f"Erreur dans list_resumes: {str(e)}")
            return {'error': str(e)}, 500

    def get_resume(self, resume_id):
        try:
            service = self._get_service()
            resume = service.get_resume(resume_id)
            if not resume:
                return {'error': 'Resume not found'}, 404
                
            return {
                'id': resume['id'],
                'original_text': resume['original_text'],
                'summary': resume['summary'],
                'length': resume['length'],
                'created_at': resume['created_at']
            }
        except Exception as e:
            print(f"Erreur dans get_resume: {str(e)}")
            return {'error': str(e)}, 500

    def update_resume(self, resume_id, data):
        try:
            service = self._get_service()
            updated = service.update_resume(resume_id, data)
            return {'success': bool(updated)}
        except Exception as e:
            print(f"Erreur dans update_resume: {str(e)}")
            return {'error': str(e)}, 500

    def delete_resume(self, resume_id):
        try:
            service = self._get_service()
            deleted = service.delete_resume(resume_id)
            return {'success': bool(deleted)}
        except Exception as e:
            print(f"Erreur dans delete_resume: {str(e)}")
            return {'error': str(e)}, 500
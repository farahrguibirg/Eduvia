# controller/pdf_cours_controller.py
# Ajout des imports nécessaires pour la prévisualisation
# controller/pdf_cours_controller.py
from flask import request, jsonify, send_from_directory, current_app, abort, g
from werkzeug.utils import secure_filename
from UseCases.CoursUseCase import PdfCoursUseCase
import os
from Models.Enseignant import Enseignant
from Models.Etudiant import Etudiant
from PyPDF2 import PdfReader
import base64  # Import base64 pour l'encodage du texte en prévisualisation
import jwt

class PdfCoursController:
    # Définir les extensions autorisées comme constante de classe
    ALLOWED_EXTENSIONS = {'pdf'}
    
    def __init__(self, usecase=None):
        self.usecase = usecase or PdfCoursUseCase()
    
    def get_all_pdfs(self):
        try:
            # Récupérer l'utilisateur courant depuis le contexte
            current_user = g.get('user')
            if not current_user:
                return jsonify({'error': 'Utilisateur non authentifié'}), 401

            # Vérifier le type d'utilisateur
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Authentification requise'}), 401

            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            user_type = payload.get('type')

            # Les enseignants et les étudiants voient tous les cours
            pdfs = self.usecase.lister_tous_les_pdfs()

            return jsonify([{
                'id': pdf.id,
                'titre': pdf.titre,
                'url': pdf.url,
                'utilisateur_id': pdf.utilisateur_id,
                'can_edit': user_type == 'enseignant' and pdf.utilisateur_id == current_user.id,
                'can_delete': user_type == 'enseignant' and pdf.utilisateur_id == current_user.id
            } for pdf in pdfs]), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def get_pdf(self, pdf_id):
        try:
            pdf = self.usecase.afficher_pdf(pdf_id)
            if not pdf:
                return jsonify({'error': 'PDF non trouvé'}), 404
                
            return jsonify({
                'id': pdf.id,
                'titre': pdf.titre,
                'url': pdf.url,
                'utilisateur_id': pdf.utilisateur_id
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def download_pdf(self, pdf_id):
        """Télécharge le PDF comme pièce jointe"""
        try:
            pdf = self.usecase.afficher_pdf(pdf_id)
            if not pdf:
                return jsonify({'error': 'PDF non trouvé'}), 404
                
            filename = os.path.basename(pdf.url)
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            file_path = os.path.join(upload_folder, filename)
            
            # Vérifier si le fichier existe
            if not os.path.exists(file_path):
                return jsonify({'error': 'Fichier PDF non trouvé sur le serveur'}), 404
            
            # Forcer le téléchargement avec as_attachment=True et le nom de fichier
            return send_from_directory(
                upload_folder,
                filename,
                as_attachment=True,  # TRÈS IMPORTANT: True force le téléchargement
                download_name=f"{pdf.titre}.pdf",  # Nom personnalisé pour le téléchargement
                mimetype='application/pdf'
            )
        except Exception as e:
            current_app.logger.error(f"Erreur dans download_pdf: {str(e)}")
            return jsonify({'error': str(e)}), 500

    def view_pdf(self, pdf_id):
        """Affiche le PDF directement dans le navigateur"""
        try:
            # Journalisation pour débogage
            current_app.logger.info(f"Demande de visualisation du PDF {pdf_id}")
            
            # Vérifier si le PDF existe
            pdf = self.usecase.afficher_pdf(pdf_id)
            if not pdf:
                current_app.logger.error(f"PDF {pdf_id} non trouvé")
                return jsonify({'error': 'PDF non trouvé'}), 404
            
            # Journalisation pour débogage
            current_app.logger.info(f"PDF trouvé: {pdf.titre}, URL: {pdf.url}")
            
            # Vérifier le chemin du fichier
            filename = os.path.basename(pdf.url)
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            file_path = os.path.join(upload_folder, filename)
            
            # Vérifier si le fichier existe
            if not os.path.exists(file_path):
                current_app.logger.error(f"Fichier non trouvé: {file_path}")
                return jsonify({'error': 'Fichier PDF non trouvé sur le serveur'}), 404
            
            # Journalisation pour débogage
            current_app.logger.info(f"Envoi du fichier: {file_path}")
            
            # Définir explicitement les en-têtes pour la visualisation
            response = send_from_directory(
                upload_folder,
                filename,
                as_attachment=False,  # TRÈS IMPORTANT: False permet l'affichage dans le navigateur
                mimetype='application/pdf'
            )
            
            # Ajouter des en-têtes spécifiques pour forcer l'affichage et empêcher la mise en cache
            response.headers["Content-Disposition"] = "inline; filename={}".format(filename)
            response.headers["Content-Type"] = "application/pdf"
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
            
            return response
                
        except Exception as e:
            current_app.logger.error(f"Erreur dans view_pdf: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    def preview_pdf(self, pdf_id):
        """Génère un aperçu textuel du PDF (sans image)"""
        try:
            # Journalisation pour débogage
            current_app.logger.info(f"Demande de prévisualisation du PDF {pdf_id}")
            
            # Vérifier si le PDF existe
            pdf = self.usecase.afficher_pdf(pdf_id)
            if not pdf:
                current_app.logger.error(f"PDF {pdf_id} non trouvé")
                return jsonify({'error': 'PDF non trouvé'}), 404
            
            # Récupérer le chemin du fichier
            filename = os.path.basename(pdf.url)
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            file_path = os.path.join(upload_folder, filename)
            
            # Vérifier si le fichier existe
            if not os.path.exists(file_path):
                current_app.logger.error(f"Fichier non trouvé: {file_path}")
                return jsonify({'error': 'Fichier PDF non trouvé sur le serveur'}), 404
            
            # Créer l'aperçu textuel
            preview_data = self._generate_text_preview(file_path)
            
            return jsonify({
                'id': pdf.id,
                'titre': pdf.titre,
                'page_count': preview_data['page_count'],
                'text_preview': preview_data['text_preview']
            }), 200
                
        except Exception as e:
            current_app.logger.error(f"Erreur dans preview_pdf: {str(e)}")
            return jsonify({'error': str(e)}), 500

    def _generate_text_preview(self, file_path):
        """Génère uniquement un aperçu textuel du PDF sans image"""
        result = {
            'page_count': 0,
            'text_preview': ''
        }
        
        try:
            # Extraction du nombre de pages et d'un aperçu du texte
            with open(file_path, 'rb') as pdf_file:
                pdf_reader = PdfReader(pdf_file)
                result['page_count'] = len(pdf_reader.pages)
                
                # Extraire le texte des premières pages (limitées à 2 pages ou moins)
                max_pages_for_text = min(2, result['page_count'])
                text_preview = ""
                for i in range(max_pages_for_text):
                    page_text = pdf_reader.pages[i].extract_text()
                    if page_text:
                        # Limiter la taille du texte (~ 500 premiers caractères)
                        text_preview += page_text[:500]
                        if len(text_preview) > 500:
                            text_preview = text_preview[:500] + "..."
                            break
                
                result['text_preview'] = text_preview
        
        except Exception as e:
            current_app.logger.error(f"Erreur lors de la génération de l'aperçu textuel: {str(e)}")
            # Régler sur des valeurs par défaut en cas d'échec
            result['text_preview'] = "Impossible de générer un aperçu du texte."
        
        return result    
    def create_pdf(self):
        # Vérifier si l'utilisateur est un enseignant via le token JWT
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentification requise'}), 401

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            user_type = payload.get('type')
            
            if user_type != 'enseignant':
                return jsonify({'error': 'Accès refusé. Rôle enseignant requis'}), 403

            # Vérifier si un fichier est inclus dans la requête
            if 'file' not in request.files:
                return jsonify({'error': 'Aucun fichier trouvé'}), 400
            
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'Aucun fichier sélectionné'}), 400
            
            if file and self._allowed_file(file.filename):
                try:
                    # Récupérer les données du formulaire
                    titre = request.form.get('titre')
                    if not titre:
                        return jsonify({'error': 'Le titre est requis'}), 400

                    # Récupérer l'ID de l'utilisateur depuis le token
                    user_id = int(payload.get('sub'))

                    # Créer le PDF
                    pdf = self.usecase.ajouter_pdf(titre, file, user_id)
                    return jsonify({
                        'id': pdf.id,
                        'titre': pdf.titre,
                        'url': pdf.url,
                        'utilisateur_id': pdf.utilisateur_id
                    }), 201
                except Exception as e:
                    return jsonify({'error': str(e)}), 500
            return jsonify({'error': 'Type de fichier non autorisé'}), 400
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token invalide'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def update_pdf(self, pdf_id):
        # Vérifier si l'utilisateur est un enseignant via le token JWT
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentification requise'}), 401

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            user_type = payload.get('type')
            user_id = int(payload.get('sub'))
            
            if user_type != 'enseignant':
                return jsonify({'error': 'Accès refusé. Rôle enseignant requis'}), 403

            # Vérifier si le PDF existe et appartient à l'enseignant
            pdf = self.usecase.afficher_pdf(pdf_id)
            if not pdf:
                return jsonify({'error': 'PDF non trouvé'}), 404
            if pdf.utilisateur_id != user_id:
                return jsonify({'error': 'Accès refusé. Vous n\'êtes pas le propriétaire de ce PDF'}), 403

            # Récupérer les données du formulaire
            titre = request.form.get('titre')
            if not titre:
                return jsonify({'error': 'Le titre est requis'}), 400

            # Vérifier si un fichier est inclus dans la requête
            file = None
            if 'file' in request.files:
                file = request.files['file']
                if file.filename == '':
                    file = None
                elif not self._allowed_file(file.filename):
                    return jsonify({'error': 'Type de fichier non autorisé'}), 400

            try:
                # Mettre à jour le PDF
                pdf = self.usecase.modifier_pdf(pdf_id, titre, file, user_id)
                return jsonify({
                    'id': pdf.id,
                    'titre': pdf.titre,
                    'url': pdf.url,
                    'utilisateur_id': pdf.utilisateur_id
                }), 200
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token invalide'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def delete_pdf(self, pdf_id):
        # Vérifier si l'utilisateur est un enseignant via le token JWT
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentification requise'}), 401

        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            user_type = payload.get('type')
            user_id = int(payload.get('sub'))
            
            if user_type != 'enseignant':
                return jsonify({'error': 'Accès refusé. Rôle enseignant requis'}), 403

            # Vérifier si le PDF existe et appartient à l'enseignant
            pdf = self.usecase.afficher_pdf(pdf_id)
            if not pdf:
                return jsonify({'error': 'PDF non trouvé'}), 404
            if pdf.utilisateur_id != user_id:
                return jsonify({'error': 'Accès refusé. Vous n\'êtes pas le propriétaire de ce PDF'}), 403

            try:
                self.usecase.supprimer_pdf(pdf_id, user_id)
                return jsonify({'message': 'PDF supprimé avec succès'}), 200
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token invalide'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def _allowed_file(self, filename):
        """Vérifie si l'extension du fichier est autorisée"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.ALLOWED_EXTENSIONS

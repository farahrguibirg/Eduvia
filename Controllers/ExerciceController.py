from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
import traceback
from UseCases.ExerciceUseCase import ExerciceUseCase
from Repository.ExerciceRepository import ExerciceRepository
from Services.ExercicePDF import PDFService
from PyPDF2 import PdfReader, errors

class ExerciceController:
    @staticmethod
    def get_exercice_usecase():
        """
        Factory pour créer l'instance du UseCase
        """
        try:
            bard_api_key = current_app.config.get('BARD_API_KEY')
            # Utiliser une clé de développement si aucune clé n'est définie
            if not bard_api_key:
                print("AVERTISSEMENT: Aucune clé BARD_API_KEY définie, utilisation du mode développement")
                bard_api_key = "dev"
                
            pdf_service = PDFService(bard_api_key=bard_api_key)
            exercice_repository = ExerciceRepository()
            return ExerciceUseCase(pdf_service, exercice_repository)
        except Exception as e:
            print(f"Erreur lors de la création du usecase: {str(e)}")
            traceback.print_exc()
            # Fallback pour éviter les erreurs critiques
            return ExerciceUseCase(PDFService(bard_api_key="dev"), ExerciceRepository())

    def is_valid_pdf(pdf_file):
        try:
            pdf_file.seek(0, 2)
            size = pdf_file.tell()
            if size == 0:
                return False, "Le fichier PDF est vide."
            pdf_file.seek(0)
            reader = PdfReader(pdf_file)
            _ = reader.pages[0]
            return True, ""
        except errors.PdfReadError as e:
            return False, f"PDF corrompu: {e}"
        except Exception as e:
            return False, f"Erreur lors de la lecture du PDF: {e}"

    @staticmethod
    def generer_qcm():
        """
        Contrôleur pour générer un QCM à partir d'un fichier PDF
        """
        try:
            # Vérifier si un fichier a été envoyé
            if 'fichier' not in request.files:
                print("Erreur: Aucun fichier trouvé dans la requête")
                return jsonify({'erreur': 'Aucun fichier trouvé'}), 400
            
            fichier = request.files['fichier']
            
            # Vérification automatique du PDF
            is_valid, msg = ExerciceController.is_valid_pdf(fichier)
            if not is_valid:
                print(f"Erreur: {msg}")
                return jsonify({'erreur': f'Fichier PDF invalide: {msg}'}), 400
            fichier.seek(0)  # Remettre le curseur au début pour la suite
            
            # Vérifier si le fichier est valide
            if fichier.filename == '':
                print("Erreur: Nom de fichier vide")
                return jsonify({'erreur': 'Nom de fichier invalide'}), 400
            
            if not fichier.filename.lower().endswith('.pdf'):
                print(f"Erreur: Format de fichier invalide: {fichier.filename}")
                return jsonify({'erreur': 'Le fichier doit être au format PDF'}), 400
            
            # Récupérer les paramètres
            etudiant_id = request.form.get('etudiant_id')
            if not etudiant_id:
                print("Erreur: ID étudiant manquant")
                return jsonify({'erreur': 'ID étudiant requis'}), 400
            
            try:
                etudiant_id = int(etudiant_id)
            except ValueError:
                print(f"Erreur: ID étudiant invalide: {etudiant_id}")
                return jsonify({'erreur': 'ID étudiant invalide'}), 400
            
            titre = request.form.get('titre', None)
            
            try:
                nb_questions = int(request.form.get('nb_questions', 5))
            except ValueError:
                print(f"Erreur: Nombre de questions invalide: {request.form.get('nb_questions')}")
                nb_questions = 5
            
            # Limiter le nombre de questions
            if nb_questions < 1:
                nb_questions = 1
            elif nb_questions > 20:
                nb_questions = 20
            
            # Sauvegarder temporairement le fichier si nécessaire
            filepath = None
            if current_app.config.get('UPLOAD_FOLDER'):
                try:
                    filename = secure_filename(fichier.filename)
                    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                    fichier.save(filepath)
                    # Remettre le pointeur du fichier au début pour la lecture
                    fichier.seek(0)
                except Exception as e:
                    print(f"Avertissement: Impossible de sauvegarder le fichier temporaire: {str(e)}")
            
            # Générer le QCM
            usecase = ExerciceController.get_exercice_usecase()
            resultat = usecase.generer_qcm_depuis_pdf(
                fichier_pdf=fichier,
                etudiant_id=etudiant_id,
                titre=titre,
                nb_questions=nb_questions
            )
            
            if not resultat:
                # En mode développement, générer un exercice fictif
                print("Mode développement: Génération d'un exercice fictif")
                if current_app.config.get('DEBUG', False):
                    return jsonify({
                        'message': 'QCM généré en mode développement',
                        'exercice': {
                            'id': 999,
                            'titre': titre or f"QCM sur {fichier.filename}",
                            'consigne': f"Répondez aux questions suivantes basées sur le document '{fichier.filename}'",
                            'date_creation': '2025-01-01T12:00:00',
                            'questions': [
                                {
                                    'id': i,
                                    'texte': f"Question {i+1}: Question exemple générée à partir du document",
                                    'reponses': [
                                        {'id': i*3, 'texte': "Option A", 'est_correcte': i % 3 == 0},
                                        {'id': i*3+1, 'texte': "Option B", 'est_correcte': i % 3 == 1},
                                        {'id': i*3+2, 'texte': "Option C", 'est_correcte': i % 3 == 2}
                                    ]
                                } for i in range(nb_questions)
                            ]
                        }
                    }), 201
                
                return jsonify({
                    'erreur': 'Erreur lors de la génération du QCM'
                }), 500
            
            return jsonify({
                'message': 'QCM généré avec succès',
                'exercice': resultat
            }), 201
        except Exception as e:
            print(f"Erreur critique dans generer_qcm: {str(e)}")
            traceback.print_exc()
            return jsonify({'erreur': f'Erreur lors de la génération du QCM: {str(e)}'}), 500

    @staticmethod
    def obtenir_exercice(exercice_id):
        """
        Contrôleur pour obtenir les détails d'un exercice
        """
        try:
            usecase = ExerciceController.get_exercice_usecase()
            exercice = usecase.obtenir_qcm(exercice_id)
            
            if not exercice:
                return jsonify({'erreur': 'Exercice non trouvé'}), 404
            
            return jsonify({'exercice': exercice}), 200
        except Exception as e:
            print(f"Erreur dans obtenir_exercice: {str(e)}")
            return jsonify({'erreur': f"Erreur lors de la récupération de l'exercice: {str(e)}"}), 500

    @staticmethod
    def lister_exercices(etudiant_id):
        """
        Contrôleur pour lister tous les exercices d'un étudiant
        """
        try:
            usecase = ExerciceController.get_exercice_usecase()
            exercices = usecase.lister_exercices_etudiant(etudiant_id)
            
            return jsonify({
                'exercices': exercices
            }), 200
        except Exception as e:
            print(f"Erreur dans lister_exercices: {str(e)}")
            return jsonify({'erreur': f'Erreur lors de la récupération des exercices: {str(e)}'}), 500

    @staticmethod
    def supprimer_exercice(exercice_id):
        """
        Contrôleur pour supprimer un exercice
        """
        try:
            usecase = ExerciceController.get_exercice_usecase()
            success = usecase.supprimer_exercice(exercice_id)
            
            if not success:
                return jsonify({'erreur': 'Exercice non trouvé ou erreur lors de la suppression'}), 404
            
            return jsonify({'message': 'Exercice supprimé avec succès'}), 200
        except Exception as e:
            print(f"Erreur dans supprimer_exercice: {str(e)}")
            return jsonify({'erreur': f'Erreur lors de la suppression de l\'exercice: {str(e)}'}), 500

    @staticmethod
    def generer_qcm_from_cours():
        """
        Contrôleur pour générer un QCM à partir d'un cours existant (PDF déjà stocké)
        """
        try:
            data = request.get_json()
            cours_id = data.get('cours_id')
            etudiant_id = data.get('etudiant_id')
            titre = data.get('titre')
            nb_questions = data.get('nb_questions', 5)

            print(f"[DEBUG] cours_id={cours_id}, etudiant_id={etudiant_id}, titre={titre}, nb_questions={nb_questions}")

            # Récupérer le PDF associé au cours
            from Repository.pdfcours_repository import PdfCoursRepository
            pdf_obj = PdfCoursRepository.get_by_id(int(cours_id))
            print(f"[DEBUG] pdf_obj={pdf_obj}")
            if not pdf_obj or not pdf_obj.url:
                print("[DEBUG] Aucun PDF associé à ce cours.")
                return jsonify({'erreur': 'Aucun PDF associé à ce cours.'}), 404

            # Correction du chemin du PDF
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            chemin_pdf = os.path.join(upload_folder, os.path.basename(pdf_obj.url))
            print(f"[DEBUG] chemin_pdf={chemin_pdf}")
            print(f"[DEBUG] Fichier existe: {os.path.exists(chemin_pdf)}")
            try:
                with open(chemin_pdf, 'rb') as f:
                    # Vérification du PDF
                    is_valid, msg = ExerciceController.is_valid_pdf(f)
                    print(f"[DEBUG] is_valid={is_valid}, msg={msg}")
                    if not is_valid:
                        print(f"[DEBUG] PDF du cours invalide: {msg}")
                        return jsonify({'erreur': f'PDF du cours invalide: {msg}'}), 400
                    f.seek(0)
                    # Générer le QCM comme d'habitude
                    usecase = ExerciceController.get_exercice_usecase()
                    resultat = usecase.generer_qcm_depuis_pdf(
                        fichier_pdf=f,
                        etudiant_id=etudiant_id,
                        titre=titre,
                        nb_questions=nb_questions
                    )
            except Exception as e:
                print(f"[DEBUG] Exception lors de la lecture du PDF: {e}")
                import traceback
                traceback.print_exc()
                return jsonify({'erreur': f'Erreur lors de la lecture du PDF: {e}'}), 500

            if not resultat:
                print("[DEBUG] Erreur lors de la génération du QCM")
                return jsonify({'erreur': 'Erreur lors de la génération du QCM'}), 500

            print("[DEBUG] QCM généré avec succès")
            return jsonify({'message': 'QCM généré avec succès', 'exercice': resultat}), 201
        except Exception as e:
            print(f"[DEBUG] Erreur critique dans generer_qcm_from_cours: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'erreur': f'Erreur lors de la génération du QCM: {str(e)}'}), 500
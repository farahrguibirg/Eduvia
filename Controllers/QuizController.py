# Controllers/QuizController.py

from flask import request, jsonify
from UseCases.QuizUseCase import QuizCreationUseCase
from UseCases.QuizUseCase import QuizSubmissionUseCase
from UseCases.QuizUseCase import QuizResultsUseCase
from UseCases.QuizUseCase import QuizGenerationUseCase
from Models.Enseignant import Enseignant
from Models.Utilisateur import Utilisateur
from database import db

class QuizController:
    def __init__(self):
        self.creation_use_case = QuizCreationUseCase()
        self.submission_use_case = QuizSubmissionUseCase()
        self.results_use_case = QuizResultsUseCase()
        self.generation_use_case = QuizGenerationUseCase()
    
    def create_quiz(self):
        try:
            data = request.get_json()
            
            # Vérifier si l'enseignant existe
            createur_id = data.get('createur_id') or data.get('enseignantId')
            if createur_id:
                # Vérifier d'abord dans la table utilisateur
                utilisateur = Utilisateur.query.get(createur_id)
                if not utilisateur:
                    return jsonify({'error': 'Utilisateur non trouvé'}), 404
                
                # Vérifier si c'est un enseignant
                if utilisateur.type != 'enseignant':
                    return jsonify({'error': 'L\'utilisateur n\'est pas un enseignant'}), 400
                
                # Vérifier si l'enseignant existe dans la table enseignant
                enseignant = Enseignant.query.get(createur_id)
                if not enseignant:
                    # Créer l'entrée dans la table enseignant
                    enseignant = Enseignant(id=createur_id)
                    db.session.add(enseignant)
                    db.session.commit()
            
            result = self.creation_use_case.create_quiz(data)
            return jsonify({'message': 'Quiz créé', 'quiz_id': result}), 201
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def list_quiz(self):
        try:
            quizzes = self.creation_use_case.list_all_quizzes()
            return jsonify(quizzes)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def list_quiz_enseignant(self, enseignant_id):
        try:
            quizzes = self.creation_use_case.list_quizzes_by_enseignant(enseignant_id)
            return jsonify(quizzes)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def get_quiz(self, quiz_id):
        try:
            quiz_data = self.creation_use_case.get_quiz_details(quiz_id)
            if not quiz_data:
                return jsonify({'error': 'Quiz non trouvé'}), 404
            return jsonify(quiz_data)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def submit_quiz(self, quiz_id):
        try:
            data = request.get_json()
            result = self.submission_use_case.submit_quiz_answers(quiz_id, data)
            return jsonify(result)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def quiz_results(self, quiz_id):
        try:
            results = self.results_use_case.get_quiz_results(quiz_id)
            return jsonify(results)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def update_quiz(self, quiz_id):
        try:
            data = request.get_json()
            self.creation_use_case.update_quiz(quiz_id, data)
            return jsonify({'message': 'Quiz modifié'}), 200
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def delete_quiz(self, quiz_id):
        try:
            self.creation_use_case.delete_quiz(quiz_id)
            return jsonify({'message': 'Quiz supprimé'}), 200
        except ValueError as e:
            return jsonify({'error': str(e)}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def generate_from_quiz(self, quiz_id):
        try:
            data = request.get_json()
            result = self.generation_use_case.generate_from_existing_quiz(quiz_id, data)
            return jsonify(result), 201
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    def generate_quiz_from_qcm(self, exercice_id):
        try:
            data = request.get_json()
            print(f"Données reçues pour la génération du quiz: {data}")
            result = self.generation_use_case.generate_from_qcm(exercice_id, data)
            print(f"Quiz généré avec succès, ID: {result}")
            return jsonify({'message': 'Quiz généré avec succès', 'quiz_id': result}), 201
        except ValueError as e:
            print(f"Erreur de validation: {str(e)}")
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            print(f"Erreur lors de la génération du quiz: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return jsonify({'error': str(e)}), 500
    



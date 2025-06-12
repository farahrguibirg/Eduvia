# Quiz usecase - à compléter
from Services.QuizServices import QuizService
from Repository.QuizRepository import QuizRepository
import random
from database import db

class QuizCreationUseCase:
    def __init__(self):
        self.quiz_service = QuizService()
        self.quiz_repository = QuizRepository()
    
    def create_quiz(self, data):
        """Crée un nouveau quiz"""
        # Validation des données
        createur_id = self.quiz_service.validate_quiz_data(data)
        
        # Création du quiz dans le repository
        quiz_id = self.quiz_repository.create(
            titre=data['titre'],
            chrono=data.get('chrono'),
            createur_id=createur_id,
            questions=data['questions']
        )
        
        return quiz_id
    
    def list_all_quizzes(self):
        """Liste tous les quiz"""
        quizzes = self.quiz_repository.find_all()
        return [self.quiz_service.format_quiz_for_response(q) for q in quizzes]
    
    def list_quizzes_by_enseignant(self, enseignant_id):
        """Liste les quiz d'un enseignant"""
        quizzes = self.quiz_repository.find_by_enseignant(enseignant_id)
        return [self.quiz_service.format_quiz_for_response(q) for q in quizzes]
    
    def get_quiz_details(self, quiz_id):
        """Récupère les détails d'un quiz"""
        quiz = self.quiz_repository.find_by_id(quiz_id)
        if not quiz:
            return None
        return self.quiz_service.format_quiz_details(quiz)
    
    def update_quiz(self, quiz_id, data):
        """Met à jour un quiz existant"""
        quiz = self.quiz_repository.find_by_id(quiz_id)
        if not quiz:
            raise ValueError('Quiz non trouvé')
            
        # Mise à jour du quiz
        self.quiz_repository.update(
            quiz_id=quiz_id,
            titre=data.get('titre'),
            chrono=data.get('chrono'),
            questions=data.get('questions', [])
        )
        
        return True
    
    def delete_quiz(self, quiz_id):
        """Supprime un quiz"""
        quiz = self.quiz_repository.find_by_id(quiz_id)
        if not quiz:
            raise ValueError('Quiz non trouvé')
            
        self.quiz_repository.delete(quiz_id)
        return True


class QuizSubmissionUseCase:
    def __init__(self):
        self.quiz_service = QuizService()
        self.quiz_repository = QuizRepository()
    
    def submit_quiz_answers(self, quiz_id, data):
        """Traite la soumission d'un quiz par un étudiant"""
        # Extraction des données
        etudiant_id = data.get('etudiant_id')
        answers = data.get('answers', [])
        temps_ecoule = data.get('temps_ecoule', False)
        
        if not etudiant_id:
            raise ValueError('etudiantId requis')
        
        # Récupération du quiz
        quiz = self.quiz_repository.find_by_id(quiz_id)
        if not quiz:
            raise ValueError('Quiz non trouvé')
        
        # Calcul du score
        result_data = self.quiz_service.calculate_quiz_score(quiz, answers)
        
        # Enregistrement du résultat
        self.quiz_repository.save_result(
            quiz_id=quiz_id,
            etudiant_id=etudiant_id,
            score=result_data['score'],
            temps_ecoule=temps_ecoule,
            reponses_completes=result_data['reponses_completes'],
            reponses_detail=result_data['reponses_detail']
        )
        
        # Ajout d'informations supplémentaires pour la réponse
        result_data['temps_ecoule'] = temps_ecoule
        
        return result_data


class QuizResultsUseCase:
    def __init__(self):
        self.quiz_repository = QuizRepository()
    
    def get_quiz_results(self, quiz_id):
        """Récupère les résultats d'un quiz"""
        # Vérifier que le quiz existe
        quiz = self.quiz_repository.find_by_id(quiz_id)
        if not quiz:
            raise ValueError('Quiz non trouvé')
            
        # Récupérer et formater les résultats
        return self.quiz_repository.get_results_with_students(quiz_id)


class QuizGenerationUseCase:
    def __init__(self):
        self.quiz_service = QuizService()
        self.quiz_repository = QuizRepository()
    
    def generate_from_qcm(self, exercice_id, data):
        """Génère un quiz à partir d'un exercice QCM"""
        # Extraction et validation des données
        etudiant_id = data.get('etudiantId')
        chrono = data.get('chrono', 15)
        
        if not etudiant_id:
            raise ValueError('etudiantId requis')
            
        chrono = self.quiz_service.validate_chrono(chrono)
        
        # Récupération de l'exercice source
        exercice = self.quiz_repository.find_exercice_by_id(exercice_id)
        if not exercice:
            raise ValueError('QCM non trouvé')
            
        # Création du nouveau quiz avec le nouveau format de titre pour les étudiants
        return self.quiz_repository.create_from_exercice(
            exercice=exercice,
            etudiant_id=etudiant_id,
            chrono=chrono,
            titre=f"Exercice interactif : {exercice.titre}"
        )
    
    def generate_from_existing_quiz(self, quiz_id, data):
        """Génère un quiz à partir d'un quiz existant avec variations"""
        # Validation des données
        enseignant_id = data.get('enseignantId')
        etudiant_id = data.get('etudiantId')
        variations = data.get('variations', False)
        options = data.get('options', {})
        
        if not enseignant_id and not etudiant_id:
            raise ValueError('enseignantId ou etudiantId requis')
            
        # Récupération du quiz source
        source_quiz = self.quiz_repository.find_by_id(quiz_id)
        if not source_quiz:
            raise ValueError('Quiz source non trouvé')
            
        # Création du nouveau quiz avec variations
        creator_id = enseignant_id if enseignant_id else etudiant_id
        
        # Déterminer le titre en fonction du type d'utilisateur
        if etudiant_id:
            titre = f"Exercice interactif : {source_quiz.titre}"
        else:
            titre = f"Quiz généré depuis: {source_quiz.titre}"
        
        new_quiz = self.quiz_repository.create_empty(
            titre=titre,
            chrono=source_quiz.chrono,
            createur_id=creator_id
        )
        
        # Copier et modifier les questions
        questions = source_quiz.questions
        if options.get('shuffleQuestions'):
            questions = random.sample(list(questions), len(questions))
            
        # Traitement des questions
        for question in questions:
            # Reformulation de la question si demandé
            if variations:
                question_text = self.quiz_service.reformulate_question(question.question)
            else:
                question_text = question.question
                
            # Création de la question
            quiz_question_id = self.quiz_repository.add_question(
                quiz_id=new_quiz.id,
                question_text=question_text
            )
            
            # Génération de nouvelles options si demandé
            if variations:
                options_list = self.quiz_service.generate_options(question_text)
                if not options_list:  # Fallback sur les options originales
                    options_list = [r.texte for r in question.reponses]
            else:
                options_list = [r.texte for r in question.reponses]
                
            # S'assurer d'avoir au moins 4 options
            while len(options_list) < 4:
                options_list.append(f"Distracteur {len(options_list)+1}")
                
            # Ajout des options
            for idx, option in enumerate(options_list):
                self.quiz_repository.add_reponse(
                    quiz_question_id,
                    option,
                    est_correcte=(idx == 0)
                )
        
        # Commit pour enregistrer les questions/réponses
        db.session.commit()
        # Récupérer le quiz complet
        quiz_complet = self.quiz_repository.find_by_id(new_quiz.id)
        quiz_details = self.quiz_service.format_quiz_details(quiz_complet)
        return quiz_details

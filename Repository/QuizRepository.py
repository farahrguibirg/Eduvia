# Repositories/QuizRepository.py
from database import db
from Models.Quiz import Quiz, QuizResult
from Models.Exercice import Exercice
from Models.Question import Question
from Models.Reponse import Reponse
from Models.Etudiant import Etudiant
from datetime import datetime

class QuizRepository:
    def create(self, titre, chrono, createur_id, questions):
        """Crée un nouveau quiz avec ses questions et réponses"""
        quiz = Quiz(
            titre=titre,
            chrono=chrono,
            createur_id=createur_id,
            type="prof"  # Création par un enseignant
        )
        db.session.add(quiz)
        db.session.flush()
        
        for q_data in questions:
            question = Question(
                question=q_data['texte'],
                quiz_id=quiz.id,
                choices=[r['texte'] for r in q_data['reponses']],
                correct_answer='A'  # Par défaut, la première réponse est correcte
            )
            db.session.add(question)
            db.session.flush()
            
            # Ajouter les réponses
            for idx, r_data in enumerate(q_data['reponses']):
                reponse = Reponse(
                    texte=r_data['texte'],
                    est_correcte=r_data.get('est_correcte', False),
                    question_id=question.id
                )
                db.session.add(reponse)
            
        db.session.commit()
        return quiz.id
    
    def create_empty(self, titre, chrono, createur_id):
        """Crée un quiz vide sans questions"""
        quiz = Quiz(
            titre=titre,
            chrono=chrono,
            createur_id=createur_id,
            type="prof"  # Création par un enseignant
        )
        db.session.add(quiz)
        db.session.commit()
        return quiz
    
    def add_question(self, quiz_id, question_text):
        """Ajoute une question à un quiz existant"""
        question = Question(
            question=question_text,
            quiz_id=quiz_id,
            choices=[],  # Liste vide de choix
            correct_answer='A'  # Par défaut
        )
        db.session.add(question)
        db.session.flush()
        return question.id
    
    def add_reponse(self, question_id, texte, est_correcte=False):
        """Ajoute une réponse à une question existante"""
        reponse = Reponse(
            question_id=question_id,
            texte=texte,
            est_correcte=est_correcte
        )
        db.session.add(reponse)
        db.session.flush()
        return reponse.id
    
    def find_all(self):
        """Récupère tous les quiz"""
        return Quiz.query.all()
    
    def find_by_enseignant(self, enseignant_id):
        """Récupère les quiz créés par un enseignant"""
        return Quiz.query.filter_by(createur_id=enseignant_id).all()
    
    def find_by_id(self, quiz_id):
        """Récupère un quiz par son ID"""
        return Quiz.query.get(quiz_id)
    
    def update(self, quiz_id, titre=None, chrono=None, questions=None):
        """Met à jour un quiz existant"""
        quiz = self.find_by_id(quiz_id)
        if not quiz:
            return False
            
        # Mise à jour des attributs du quiz
        if titre:
            quiz.titre = titre
        if chrono is not None:
            quiz.chrono = chrono
            
        # Si des questions sont fournies, remplacer les questions existantes
        if questions is not None:
            # Supprimer les anciennes questions et réponses
            for question in quiz.questions:
                for reponse in question.reponses:
                    db.session.delete(reponse)
                db.session.delete(question)
            quiz.questions = []
            
            # Ajouter les nouvelles questions et réponses
            for q_data in questions:
                question = Question(
                    question=q_data['texte'],
                    quiz_id=quiz_id,
                    choices=[r['texte'] for r in q_data.get('reponses', [])],
                    correct_answer='A'  # Par défaut
                )
                db.session.add(question)
                db.session.flush()
                
                for idx, r_data in enumerate(q_data.get('reponses', [])):
                    reponse = Reponse(
                        texte=r_data['texte'],
                        est_correcte=r_data.get('est_correcte', False),
                        question_id=question.id
                    )
                    db.session.add(reponse)
                
        db.session.commit()
        return True
    
    def delete(self, quiz_id):
        """Supprime un quiz et toutes ses données associées"""
        quiz = self.find_by_id(quiz_id)
        if not quiz:
            return False
            
        # Supprime toutes les questions et réponses associées
        for question in quiz.questions:
            for reponse in question.reponses:
                db.session.delete(reponse)
            db.session.delete(question)
            
        db.session.delete(quiz)
        db.session.commit()
        return True
    
    def save_result(self, quiz_id, etudiant_id, score, temps_ecoule, reponses_completes, reponses_detail):
        """Enregistre le résultat d'un quiz pour un étudiant"""
        result = QuizResult(
            quiz_id=quiz_id,
            etudiant_id=etudiant_id,
            score=score,
            temps_ecoule=temps_ecoule,
            reponses_completes=reponses_completes,
            reponses_detail=reponses_detail
        )
        
        db.session.add(result)
        db.session.commit()
        return result.id
    
    def get_results_with_students(self, quiz_id):
        """Récupère les résultats d'un quiz avec les informations des étudiants"""
        results = QuizResult.query.filter_by(quiz_id=quiz_id).all()
        formatted_results = []
        
        for r in results:
            etudiant = Etudiant.query.get(r.etudiant_id)
            formatted_results.append({
                'etudiant_id': r.etudiant_id,
                'etudiant_nom': etudiant.nom if etudiant else 'Étudiant inconnu',
                'etudiant_prenom': etudiant.prenom if etudiant else '',
                'score': r.score,
                'date_passage': r.date_passage.strftime('%Y-%m-%d %H:%M'),
                'temps_ecoule': r.temps_ecoule,
                'reponses_completes': r.reponses_completes,
                'reponses_detail': r.reponses_detail
            })
            
        return formatted_results
    
    def find_exercice_by_id(self, exercice_id):
        """Récupère un exercice QCM par son ID"""
        return Exercice.query.get(exercice_id)
    
    def create_from_exercice(self, exercice, etudiant_id, chrono, titre=None):
        """Crée un quiz à partir d'un exercice QCM existant"""
        new_quiz = Quiz(
            titre=titre if titre else f"Quiz généré depuis QCM: {exercice.titre}",
            chrono=chrono,
            createur_id=etudiant_id,
            type="etudiant"  # Création par un étudiant
        )
        db.session.add(new_quiz)
        db.session.flush()

        # Récupérer toutes les questions de l'exercice
        questions = Question.query.filter_by(exercice_id=exercice.id).all()
        for q in questions:
            # Créer la question pour le quiz
            quiz_question = Question(
                question=q.question,
                quiz_id=new_quiz.id,
                choices=q.choices,
                correct_answer=q.correct_answer
            )
            db.session.add(quiz_question)
            db.session.flush()
            
            # Récupérer et ajouter les réponses
            reponses = Reponse.query.filter_by(question_id=q.id).all()
            for r in reponses:
                quiz_reponse = Reponse(
                    question_id=quiz_question.id,
                    texte=r.texte,
                    est_correcte=r.est_correcte
                )
                db.session.add(quiz_reponse)

        db.session.commit()
        return new_quiz.id

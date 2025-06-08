from database import db
from Models.Exercice import Exercice
from Models.Question import Question
from Models.Reponse import Reponse
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Dict, Optional, Tuple, Any

class ExerciceRepository:
    """
    Repository pour accéder et manipuler les données des exercices QCM
    """
    
    @staticmethod
    def creer_exercice(titre: str, consigne: str, etudiant_id: int, 
                       contenu_pdf: str = None, nom_fichier: str = None) -> Optional[Exercice]:
        """
        Crée un nouvel exercice dans la base de données
        """
        try:
            exercice = Exercice(
                titre=titre,
                consigne=consigne,
                etudiant_id=etudiant_id,
                contenu_pdf=contenu_pdf,
                nom_fichier=nom_fichier
            )
            
            db.session.add(exercice)
            db.session.commit()
            return exercice
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Erreur lors de la création de l'exercice: {str(e)}")
            return None
    
    @staticmethod
    def ajouter_questions(exercice_id: int, questions_data: List[Dict]) -> bool:
        """
        Ajoute des questions et leurs réponses à un exercice existant
        
        questions_data format:
        [
            {
                'texte': 'Question text',
                'reponses': [
                    {'texte': 'Answer 1', 'est_correcte': True},
                    {'texte': 'Answer 2', 'est_correcte': False},
                    ...
                ]
            },
            ...
        ]
        """
        try:
            exercice = Exercice.query.get(exercice_id)
            if not exercice:
                return False
                
            for q_data in questions_data:
                question = Question(
                    question=q_data['texte'],
                    exercice_id=exercice_id,
                    choices=[r['texte'] for r in q_data.get('reponses', [])],
                    correct_answer='A'  # Par défaut, la première réponse est correcte
                )
                db.session.add(question)
                db.session.flush()  # Pour obtenir l'ID de la question
                
                for idx, r_data in enumerate(q_data.get('reponses', [])):
                    reponse = Reponse(
                        texte=r_data['texte'],
                        est_correcte=r_data.get('est_correcte', False),
                        question_id=question.id
                    )
                    db.session.add(reponse)
            
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Erreur lors de l'ajout des questions: {str(e)}")
            return False

    @staticmethod
    def obtenir_exercice_avec_questions(exercice_id: int) -> Optional[Dict[str, Any]]:
        """
        Récupère un exercice complet avec toutes ses questions et réponses
        """
        try:
            exercice = Exercice.query.get(exercice_id)
            if not exercice:
                return None
                
            # Structurer les données
            exercice_data = {
                'id': exercice.id,
                'titre': exercice.titre,
                'consigne': exercice.consigne,
                'nom_fichier': exercice.nom_fichier,
                'date_creation': exercice.date_creation,
                'questions': []
            }
            
            for question in exercice.questions:
                q_data = {
                    'id': question.id,
                    'texte': question.question,
                    'reponses': []
                }
                
                for reponse in question.reponses:
                    q_data['reponses'].append({
                        'id': reponse.id,
                        'texte': reponse.texte,
                        'est_correcte': reponse.est_correcte
                    })
                    
                exercice_data['questions'].append(q_data)
                
            return exercice_data
        except SQLAlchemyError as e:
            print(f"Erreur lors de la récupération de l'exercice: {str(e)}")
            return None
    
    @staticmethod
    def obtenir_exercices_etudiant(etudiant_id: int) -> List[Dict]:
        """
        Récupère tous les exercices d'un étudiant
        """
        try:
            exercices = Exercice.query.filter_by(etudiant_id=etudiant_id).all()
            return [{
                'id': ex.id,
                'titre': ex.titre,
                'date_creation': ex.date_creation,
                'nb_questions': len(ex.questions)
            } for ex in exercices]
        except SQLAlchemyError as e:
            print(f"Erreur lors de la récupération des exercices: {str(e)}")
            return []
    
    @staticmethod
    def supprimer_exercice(exercice_id: int) -> bool:
        """
        Supprime un exercice et toutes ses questions associées
        """
        try:
            exercice = Exercice.query.get(exercice_id)
            if not exercice:
                return False
                
            db.session.delete(exercice)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Erreur lors de la suppression de l'exercice: {str(e)}")
            return False
# Services/QuizService.py
import random
import re
from Services.PDFServices import PDFService
from config import Config
from Models.Enseignant import Enseignant
from Models.Question import Question
from Models.Reponse import Reponse

class QuizService:
    def __init__(self):
        self.pdf_service = PDFService(bard_api_key=Config.BARD_API_KEY)
    
    def format_quiz_for_response(self, quiz):
        """Formate un quiz pour la réponse API"""
        return {
            'id': quiz.id,
            'titre': quiz.titre,
            'chrono': quiz.chrono,
            'createur_id': quiz.createur_id,
            'type': quiz.type
        }
    
    def format_quiz_details(self, quiz):
        """Formate les détails complets d'un quiz"""
        return {
            'id': quiz.id,
            'titre': quiz.titre,
            'chrono': quiz.chrono,
            'questions': [
                {
                    'id': q.id,
                    'texte': q.question,
                    'reponses': [
                        {'id': r.id, 'texte': r.texte, 'est_correcte': r.est_correcte}
                        for r in q.reponses
                    ]
                } for q in quiz.questions
            ]
        }
    
    def calculate_quiz_score(self, quiz, answers):
        """Calcule le score d'un quiz soumis"""
        score = 0
        total = len(quiz.questions)
        reponses_detail = []
        
        # Récupérer tous les IDs de questions du quiz
        questions_ids = set(q.id for q in quiz.questions)
        questions_repondues = set(ans['question_id'] for ans in answers)
        
        for ans in answers:
            question_id = ans['question_id']
            reponse_id = ans['reponse_id']
            
            question = Question.query.get(question_id)
            reponse = Reponse.query.get(reponse_id)
            
            est_correcte = reponse and reponse.est_correcte
            if est_correcte:
                score += 1
                
            if question and reponse:
                reponses_detail.append({
                    'question_id': question_id,
                    'question_texte': question.question,
                    'reponse_id': reponse_id,
                    'reponse_texte': reponse.texte,
                    'est_correcte': est_correcte
                })
        
        percent = (score / total) * 100 if total > 0 else 0
        reponses_completes = questions_ids.issubset(questions_repondues)
        
        # Si score est 100%, réponses forcément complètes
        if percent == 100:
            reponses_completes = True
            
        return {
            'score': percent,
            'total': total,
            'correct': score,
            'reponses_completes': reponses_completes,
            'reponses_detail': reponses_detail,
            'questions_ids': sorted(list(questions_ids)),
            'questions_repondues': sorted(list(questions_repondues))
        }
    
    def reformulate_question(self, question_text):
        """Reformule une question via le service Bard"""
        prompt_q = (
            "Reformule cette question de QCM sur l'intelligence artificielle en une version claire, précise et académique, "
            "en évitant toute formulation à la première personne ou toute ambiguïté. "
            "La question doit être directement liée à l'intelligence artificielle. "
            "Donne uniquement la question reformulée : "
            f"{question_text}"
        )
        
        try:
            new_text = self.pdf_service.get_bard_response(prompt_q)
            # Vérification de la qualité de la réponse
            if (not new_text or
                'erreur' in new_text.lower() or
                'je ne peux pas répondre' in new_text.lower() or
                'api rencontre un problème' in new_text.lower() or
                'httpsconnectionpool' in new_text.lower() or
                len(new_text) < 15 or
                (('ai' in new_text.lower() or 'a_i' in new_text.lower()) and 'intelligence' not in new_text.lower())):
                return question_text
            else:
                # Nettoyage du texte
                new_text = re.sub(r"(?i)^.*(to give you|pour te donner)[^.]*\\.?\\s*", "", new_text).strip()
                new_text = new_text.replace('\n', ' ')
                new_text = new_text[:150].strip()
                return new_text
        except Exception as e:
            print(f"Erreur Bard: {e} (question non reformulée)")
            return question_text
    
    def generate_options(self, question_text):
        """Génère des options de réponse via le service Bard"""
        prompt_r = (
            "Génère 4 propositions de réponses plausibles pour cette question de QCM sur l'intelligence artificielle, "
            "dont une seule correcte, en style académique, sans explication, format : une option par ligne :\n"
            f"{question_text}"
        )
        
        try:
            options_text = self.pdf_service.get_bard_response(prompt_r)
            options_list = [opt.strip() for opt in options_text.split('\n') if opt.strip()]
            
            # Prendre les 4 premières options générées
            options_list = options_list[:4] if len(options_list) >= 4 else options_list
            
            # Vérifier la qualité des options
            if (not options_list or
                any('erreur' in opt.lower() or
                    'je ne peux pas répondre' in opt.lower() or
                    'api rencontre un problème' in opt.lower() or
                    'httpsconnectionpool' in opt.lower()
                    for opt in options_list)):
                return []
                
            # Compléter avec des distracteurs si nécessaire
            while len(options_list) < 4:
                options_list.append(f"Distracteur {len(options_list)+1}")
                
            return options_list
            
        except Exception as e:
            print(f"Erreur Bard (génération options): {e}")
            return []
    
    def validate_quiz_data(self, data):
        """Valide les données d'un quiz"""
        if 'questions' in data and len(data['questions']) > 20:
            raise ValueError('Le nombre maximum de questions autorisé est de 20')
        
        # Vérifier l'ID du créateur
        createur_id = data.get('createur_id') or data.get('enseignantId')
        if not createur_id:
            raise ValueError("ID de l'enseignant manquant")
            
        # Vérifier que l'enseignant existe
        enseignant = Enseignant.query.get(createur_id)
        if not enseignant:
            raise ValueError("Enseignant non trouvé")
            
        return createur_id
    
    def validate_chrono(self, chrono):
        """Valide la durée d'un quiz"""
        try:
            chrono = int(chrono)
            if chrono < 1 or chrono > 60:
                raise ValueError('La durée doit être entre 1 et 60 minutes')
            return chrono
        except ValueError:
            raise ValueError('La durée doit être un nombre entier')
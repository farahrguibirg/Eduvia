import os
import re
from PyPDF2 import PdfReader
from werkzeug.datastructures import FileStorage
from typing import List, Dict, Tuple, Optional, Any
import json
import traceback
from langdetect import detect  # Ajout pour la détection de langue

# Remplacer l'import de Bard par une simulation pour le développement
# from bardapi import Bard  # Commenté pour le dépannage

class PDFService:
    """
    Service pour traiter les fichiers PDF et générer des QCM
    """
    
    def __init__(self, bard_api_key: str = None):
        """
        Initialise le service avec la clé API Bard
        """
        self.bard_api_key = bard_api_key or os.environ.get('_BARD_API_KEY')
        
        # Vérifier si nous sommes en mode développement
        self.dev_mode = not self.bard_api_key or self.bard_api_key == "dev"
        
        if not self.dev_mode and not self.bard_api_key:
            print("AVERTISSEMENT: La clé API Bard n'est pas définie, le service fonctionnera en mode dégradé")
        
        # Configurer la clé API pour Bard si disponible
        if not self.dev_mode and self.bard_api_key:
            os.environ['_BARD_API_KEY'] = self.bard_api_key
    
    def extract_text_from_pdf(self, pdf_file: FileStorage) -> str:
        """
        Extrait le texte d'un fichier PDF
        """
        try:
            reader = PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return self.clean_text(text)
        except Exception as e:
            print(f"Erreur lors de l'extraction du texte du PDF: {str(e)}")
            traceback.print_exc()
            # En cas d'erreur, retourner un texte par défaut pour continuer
            return "Texte extrait par défaut pour le développement."
    
    def clean_text(self, text: str) -> str:
        """
        Nettoie le texte extrait du PDF
        """
        text = re.sub(r'\s+', ' ', text)  # Supprimer les espaces multiples
        text = re.sub(r'[^\w\s.,;:!?()[\]{}"\'-]', '', text)  # Conserver les caractères utiles
        return text.strip()
    
    def split_into_sentences(self, text: str) -> List[str]:
        """
        Divise le texte en phrases distinctes
        """
        sentences = re.split(r'[.!?]', text)
        sentences = [sentence.strip() for sentence in sentences if sentence.strip()]
        return sentences
    
    def get_bard_response(self, prompt: str) -> Dict[str, Any]:
        """
        Obtient une réponse de Bard en utilisant la clé API
        """
        try:
            if self.dev_mode:
                print("Mode développement: simulation de réponse Bard")
                # Simuler une réponse en mode développement
                return {
                    'content': json.dumps([
                        {
                            "question": "Question exemple générée en mode développement",
                            "options": [
                                {"texte": "Première option (correcte)", "est_correcte": True},
                                {"texte": "Deuxième option", "est_correcte": False},
                                {"texte": "Troisième option", "est_correcte": False}
                            ]
                        },
                        {
                            "question": "Autre question exemple",
                            "options": [
                                {"texte": "Option A", "est_correcte": False},
                                {"texte": "Option B (correcte)", "est_correcte": True},
                                {"texte": "Option C", "est_correcte": False}
                            ]
                        }
                    ])
                }
            else:
                # Importer Bard ici pour éviter l'erreur si non disponible
                from bardapi import Bard
                response = Bard().get_answer(prompt)
                return response
        except Exception as e:
            print(f"Erreur lors de la communication avec Bard: {str(e)}")
            traceback.print_exc()
            # Retourner une réponse par défaut en cas d'erreur
            return {
                'content': json.dumps([
                    {
                        "question": "Question par défaut (erreur de communication avec l'API)",
                        "options": [
                            {"texte": "Option correcte", "est_correcte": True},
                            {"texte": "Autre option", "est_correcte": False},
                            {"texte": "Troisième option", "est_correcte": False}
                        ]
                    }
                ])
            }
    
    def generate_questions(self, text: str, num_questions: int = 5) -> List[Dict]:
        """
        Génère des questions QCM à partir du texte du PDF
        """
        try:
            # Détecter la langue du texte
            try:
                langue = detect(text)
            except Exception:
                langue = 'fr'  # fallback

            # Diviser le texte en phrases
            sentences = self.split_into_sentences(text)
            
            # Limiter le nombre de phrases selon le nombre de questions demandées
            if len(sentences) < num_questions:
                num_questions = len(sentences)
            
            # En mode développement, générer des questions de test
            if self.dev_mode or len(sentences) < 3:
                print("Mode développement: génération de questions fictives")
                return self._generate_mock_questions(num_questions)
            
            sentences_sample = sentences[:min(num_questions*3, 50)]  # Limiter pour éviter les problèmes de taille
            
            # Construire un prompt pour Bard selon la langue détectée
            if langue == 'en':
                prompt = f"""
Generate {num_questions} multiple-choice questions based on the following text:

{' '.join(sentences_sample)}

For each question, provide:
1. The question text
2. Three answer options (A, B, C)
3. Indicate which option is correct

Respond only with the following JSON format:
[
    {{
        "question": "Question text 1",
        "options": [
            {{"texte": "Option A", "est_correcte": true}},
            {{"texte": "Option B", "est_correcte": false}},
            {{"texte": "Option C", "est_correcte": false}}
        ]
    }},
    ...
]
"""
            else:
                prompt = f"""
Génère {num_questions} questions à choix multiples basées sur le texte suivant:

{' '.join(sentences_sample)}

Pour chaque question, fournit:
1. Le texte de la question
2. Trois options de réponse (A, B, C)
3. Indique quelle option est correcte

Format de réponse souhaité (en JSON):
[
    {{
        "question": "Texte de la question 1",
        "options": [
            {{"texte": "Option A", "est_correcte": true}},
            {{"texte": "Option B", "est_correcte": false}},
            {{"texte": "Option C", "est_correcte": false}}
        ]
    }},
    ...
]
Réponds uniquement avec le JSON.
"""
            
            # Obtenir la réponse de Bard
            response = self.get_bard_response(prompt)
            content = response['content']
            
            # Extraire le JSON de la réponse
            json_match = re.search(r'\[\s*{.*}\s*\]', content.replace('\n', ''), re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                try:
                    questions_data = json.loads(json_str)
                    
                    # Reformater les données pour notre structure
                    formatted_questions = []
                    for q in questions_data:
                        formatted_question = {
                            'texte': q['question'],
                            'reponses': q['options'] if 'options' in q else []
                        }
                        formatted_questions.append(formatted_question)
                    
                    return formatted_questions
                except json.JSONDecodeError:
                    # Si le JSON est invalide, essayer un parsing manuel
                    return self._fallback_parsing(content)
            else:
                # Aucun JSON trouvé, utiliser le parsing de secours
                return self._fallback_parsing(content)
                
        except Exception as e:
            print(f"Erreur lors de la génération de questions: {str(e)}")
            traceback.print_exc()
            # Retourner des questions par défaut en cas d'erreur
            return self._generate_mock_questions(num_questions)
    
    def _generate_mock_questions(self, num_questions: int = 5) -> List[Dict]:
        """
        Génère des questions de test pour le mode développement
        """
        questions = []
        for i in range(num_questions):
            questions.append({
                'texte': f"Question {i+1}: Question exemple {i+1} générée à partir du document",
                'reponses': [
                    {'texte': "Option A", 'est_correcte': i % 3 == 0},
                    {'texte': "Option B", 'est_correcte': i % 3 == 1},
                    {'texte': "Option C", 'est_correcte': i % 3 == 2}
                ]
            })
        return questions
    
    def _fallback_parsing(self, content: str) -> List[Dict]:
        """
        Méthode de secours pour extraire les questions et réponses si le format JSON n'est pas correct
        """
        questions = []
        current_question = None
        
        # Rechercher les questions et réponses avec des expressions régulières
        question_pattern = re.compile(r'Question[^:]*:(.+?)(?=Option|$)', re.DOTALL)
        option_pattern = re.compile(r'Option ([A-C])\s*:(.+?)(?=Option|Réponse correcte|$)', re.DOTALL)
        correct_pattern = re.compile(r'Réponse correcte\s*:\s*([A-C])', re.DOTALL)
        
        # Extraire les blocs de questions
        question_blocks = re.split(r'(?:Question\s*\d+)', content)
        
        for block in question_blocks[1:]:  # Skip the first element which is empty or intro text
            q_text_match = question_pattern.search(block)
            if q_text_match:
                current_question = {
                    'texte': q_text_match.group(1).strip(),
                    'reponses': []
                }
                
                # Trouver les options
                options = option_pattern.findall(block)
                
                # Trouver la réponse correcte
                correct_match = correct_pattern.search(block)
                correct_option = correct_match.group(1) if correct_match else 'A'  # Default to A if not found
                
                # Ajouter les options
                for option_letter, option_text in options:
                    current_question['reponses'].append({
                        'texte': f"Option {option_letter}: {option_text.strip()}",
                        'est_correcte': option_letter == correct_option
                    })
                
                # S'assurer qu'il y a au moins 3 options
                while len(current_question['reponses']) < 3:
                    letter = chr(65 + len(current_question['reponses']))  # A, B, C, ...
                    current_question['reponses'].append({
                        'texte': f"Option {letter}",
                        'est_correcte': letter == correct_option
                    })
                
                questions.append(current_question)
        
        # S'assurer qu'au moins une question est générée
        if not questions:
            questions = self._generate_mock_questions(3)
        
        return questions
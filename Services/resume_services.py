# app/services/resume_service.py
"""
from Repository.resume_repository import ResumeRepository
from Models.Resume import Resume
from transformers import pipeline, AutoModelForSeq2SeqLM, AutoTokenizer
import fitz  # PyMuPDF
from app import db
from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException
import re
import logging
import nltk
from nltk.corpus import stopwords
import torch

logger = logging.getLogger(__name__)

# Télécharger les ressources NLTK nécessaires
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

def clean_text(text):
    
    Nettoie le texte extrait du PDF.
    
    if not text:
        return ""
    # Supprimer les tirets multiples
    text = re.sub(r'-{2,}', '', text)
    # Supprimer les espaces multiples
    text = re.sub(r'\s+', ' ', text)
    # Garder les caractères utiles et la ponctuation
    text = re.sub(r'[^\w\s.,!?;:()\-\'"]', '', text)
    # Nettoyer les espaces autour de la ponctuation
    text = re.sub(r'\s+([.,!?;:])', r'\1', text)
    return text.strip()

def split_into_sentences(text):
    
    Divise le texte en phrases distinctes
    
    if not text:
        return []
    # Diviser sur les points, points d'exclamation et points d'interrogation
    sentences = re.split(r'(?<=[.!?])\s+', text)
    # Nettoyer chaque phrase
    sentences = [sentence.strip() for sentence in sentences if sentence.strip()]
    return sentences

class ResumeService:
    def __init__(self):
        self.resume_repository = ResumeRepository()
        self.model_name = "facebook/bart-large-cnn"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)
        self.max_input_length = 1024
        self.stop_words = set(stopwords.words('french'))

    def split_into_sentences(self, text):
        try:
            # Utiliser directement nltk.sent_tokenize avec la langue française
            sentences = nltk.sent_tokenize(text, language='french')
            return [s.strip() for s in sentences if len(s.strip()) > 20]
        except Exception as e:
            logger.error(f"Erreur lors de la segmentation des phrases: {str(e)}")
            # Fallback : diviser sur les points
            return [s.strip() for s in text.split('.') if len(s.strip()) > 20]

    def clean_text(self, text):
        # Supprimer les caractères spéciaux et la ponctuation excessive
        text = re.sub(r'[^\w\s.,!?-]', ' ', text)
        # Remplacer les espaces multiples par un seul espace
        text = re.sub(r'\s+', ' ', text)
        # Supprimer les tirets multiples
        text = re.sub(r'-+', '-', text)
        # Nettoyer les points et virgules multiples
        text = re.sub(r'\.+', '.', text)
        text = re.sub(r',+', ',', text)
        return text.strip()

    def preprocess_text(self, text):
        # Nettoyer le texte
        text = self.clean_text(text)
        # Détecter la langue
        try:
            lang = detect(text)
            if lang != 'fr':
                # Si le texte n'est pas en français, on le traduit
                # TODO: Implémenter la traduction si nécessaire
                pass
        except:
            pass
        return text

    def generate_summary(self, text, length='medium'):
        # Prétraiter le texte
        text = self.preprocess_text(text)
        
        # Définir la longueur du résumé en fonction du paramètre
        if length == 'short':
            max_length = 100
            min_length = 30
        elif length == 'medium':
            max_length = 200
            min_length = 50
        else:  # long
            max_length = 400
            min_length = 100

        # Diviser le texte en morceaux si nécessaire
        chunks = []
        current_chunk = ""
        sentences = self.split_into_sentences(text)
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) < self.max_input_length:
                current_chunk += " " + sentence
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence
        
        if current_chunk:
            chunks.append(current_chunk.strip())

        # Générer le résumé pour chaque morceau
        summaries = []
        for chunk in chunks:
            inputs = self.tokenizer(chunk, max_length=self.max_input_length, truncation=True, return_tensors="pt")
            summary_ids = self.model.generate(
                inputs["input_ids"],
                max_length=max_length,
                min_length=min_length,
                length_penalty=2.0,
                num_beams=4,
                early_stopping=True
            )
            summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            summaries.append(summary)

        # Combiner les résumés si nécessaire
        if len(summaries) > 1:
            combined_summary = " ".join(summaries)
            # Générer un résumé final du résumé combiné
            inputs = self.tokenizer(combined_summary, max_length=self.max_input_length, truncation=True, return_tensors="pt")
            summary_ids = self.model.generate(
                inputs["input_ids"],
                max_length=max_length,
                min_length=min_length,
                length_penalty=2.0,
                num_beams=4,
                early_stopping=True
            )
            final_summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            return final_summary
        else:
            return summaries[0]

    def extract_text_from_pdf(self, file_path):
        
        Extrait le texte d'un fichier PDF.
        
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return self.clean_text(text)
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction du texte du PDF: {str(e)}")
            return None

    def create_resume(self, data):
        try:
            if not isinstance(data, dict):
                raise ValueError("Les données doivent être un dictionnaire")
                
            required_fields = ['original_text', 'summary', 'length', 'etudiant_id']
            for field in required_fields:
                if field not in data:
                    raise ValueError(f"Le champ {field} est requis")
                    
            # Créer l'objet Resume
            resume = Resume(
                etudiant_id=data['etudiant_id'],
                original_text=data['original_text'],
                summary=data['summary'],
                length=data['length']
            )
            
            # Sauvegarder dans la base de données
            created_resume = self.resume_repository.create(resume)
            
            # Le repository retourne déjà un dictionnaire via to_dict()
            return created_resume
            
        except Exception as e:
            logger.error(f"Erreur lors de la création du résumé: {str(e)}")
            raise

    def get_resume(self, resume_id):
        try:
            return self.resume_repository.get_by_id(resume_id)
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du résumé: {str(e)}")
            raise

    def list_resumes(self):
        try:
            return self.resume_repository.list_all()
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des résumés: {str(e)}")
            raise

    def update_resume(self, resume_id, data):
        try:
            if not isinstance(data, dict):
                raise ValueError("Les données doivent être un dictionnaire")
                
            resume = Resume(
                original_text=data.get('original_text', ''),
                summary=data.get('summary', ''),
                length=data.get('length', 'medium')
            )
            resume.id = resume_id
            return self.resume_repository.update(resume)
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour du résumé: {str(e)}")
            raise

    def delete_resume(self, resume_id):
        try:
            return self.resume_repository.delete(resume_id)
        except Exception as e:
            logger.error(f"Erreur lors de la suppression du résumé: {str(e)}")
            raise"""
# app/services/resume_service.py
# app/services/resume_service.py
from Repository.resume_repository import ResumeRepository
from Models.Resume import Resume
import fitz  # PyMuPDF
from app import db
from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException
import re
import logging
import nltk
from nltk.corpus import stopwords
import google.generativeai as genai
from flask import current_app
import os

logger = logging.getLogger(__name__)

# Télécharger les ressources NLTK nécessaires
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

def clean_text(text):
    """
    Nettoie le texte extrait du PDF.
    """
    if not text:
        return ""
    # Supprimer les tirets multiples
    text = re.sub(r'-{2,}', '', text)
    # Supprimer les espaces multiples
    text = re.sub(r'\s+', ' ', text)
    # Garder les caractères utiles et la ponctuation
    text = re.sub(r'[^\w\s.,!?;:()\-\'"]', '', text)
    # Nettoyer les espaces autour de la ponctuation
    text = re.sub(r'\s+([.,!?;:])', r'\1', text)
    return text.strip()

def split_into_sentences(text):
    """
    Divise le texte en phrases distinctes
    """
    if not text:
        return []
    # Diviser sur les points, points d'exclamation et points d'interrogation
    sentences = re.split(r'(?<=[.!?])\s+', text)
    # Nettoyer chaque phrase
    sentences = [sentence.strip() for sentence in sentences if sentence.strip()]
    return sentences

class ResumeService:
    def __init__(self):
        self.resume_repository = ResumeRepository()
        self.stop_words = set(stopwords.words('french'))
        self.model = None  # Sera initialisé lors du premier usage
        
    def _init_gemini(self):
        """
        Initialise Gemini de manière paresseuse (lazy initialization)
        """
        if self.model is not None:
            return
            
        try:
            # Récupérer la clé API depuis la configuration ou les variables d'environnement
            api_key = None
            
            # Essayer d'abord les variables d'environnement
            api_key = os.getenv('BARD_API_KEY')
            
            # Si pas trouvé et que nous sommes dans un contexte d'application, essayer la config
            if not api_key:
                try:
                    from flask import has_app_context
                    if has_app_context():
                        api_key = current_app.config.get('BARD_API_KEY')
                except:
                    pass
            
            if not api_key:
                raise ValueError("Clé API Gemini non trouvée. Veuillez définir la variable d'environnement BARD_API_KEY")
            
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            logger.info("Modèle Gemini initialisé avec succès")
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation de Gemini: {str(e)}")
            raise

    def split_into_sentences(self, text):
        try:
            # Utiliser directement nltk.sent_tokenize avec la langue française
            sentences = nltk.sent_tokenize(text, language='french')
            return [s.strip() for s in sentences if len(s.strip()) > 20]
        except Exception as e:
            logger.error(f"Erreur lors de la segmentation des phrases: {str(e)}")
            # Fallback : diviser sur les points
            return [s.strip() for s in text.split('.') if len(s.strip()) > 20]

    def clean_text(self, text):
        # Supprimer les caractères spéciaux et la ponctuation excessive
        text = re.sub(r'[^\w\s.,!?-]', ' ', text)
        # Remplacer les espaces multiples par un seul espace
        text = re.sub(r'\s+', ' ', text)
        # Supprimer les tirets multiples
        text = re.sub(r'-+', '-', text)
        # Nettoyer les points et virgules multiples
        text = re.sub(r'\.+', '.', text)
        text = re.sub(r',+', ',', text)
        return text.strip()

    def preprocess_text(self, text):
        # Nettoyer le texte
        text = self.clean_text(text)
        # Détecter la langue
        try:
            lang = detect(text)
            if lang != 'fr':
                # Si le texte n'est pas en français, on le traduit
                # TODO: Implémenter la traduction si nécessaire
                pass
        except:
            pass
        return text

    def generate_summary_with_gemini(self, text, length='medium'):
        """
        Génère un résumé avec Gemini selon les spécifications de longueur
        """
        try:
            # Initialiser Gemini si ce n'est pas déjà fait
            self._init_gemini()
            
            # Définir les paramètres selon la longueur demandée
            if length == 'short':
                sentence_count = "4 à 5 phrases"
                detail_level = "très concis"
            elif length == 'medium':
                sentence_count = "6 à 9 phrases"
                detail_level = "équilibré"
            else:  # long
                sentence_count = "10 à 20 phrases"
                detail_level = "détaillé"

            # Construire le prompt pour Gemini
            prompt = f"""
            Veuillez créer un résumé {detail_level} du texte suivant en français.
            
            Consignes spécifiques :
            - Le résumé doit contenir exactement {sentence_count}
            - Conservez les informations les plus importantes et pertinentes
            - Rédigez dans un style clair et professionnel
            - Évitez les répétitions
            - Structurez les idées de manière logique
            
            Texte à résumer :
            {text}
            
            Résumé :
            """

            # Générer le résumé avec Gemini
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                summary = response.text.strip()
                
                # Vérifier que le résumé respecte les contraintes de longueur
                sentences = self.split_into_sentences(summary)
                sentence_count_actual = len(sentences)
                
                logger.info(f"Résumé généré avec {sentence_count_actual} phrases (attendu: {sentence_count})")
                
                return summary
            else:
                raise Exception("Aucune réponse générée par Gemini")
                
        except Exception as e:
            logger.error(f"Erreur lors de la génération du résumé avec Gemini: {str(e)}")
            # Fallback vers un résumé simple basé sur les premières phrases
            return self.generate_fallback_summary(text, length)

    def generate_fallback_summary(self, text, length='medium'):
        """
        Génère un résumé de secours en cas d'échec de Gemini
        """
        try:
            sentences = self.split_into_sentences(text)
            
            if length == 'short':
                target_sentences = min(5, len(sentences))
            elif length == 'medium':
                target_sentences = min(8, len(sentences))
            else:  # long
                target_sentences = min(15, len(sentences))
            
            # Prendre les premières phrases les plus importantes
            selected_sentences = sentences[:target_sentences]
            return ' '.join(selected_sentences)
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération du résumé de secours: {str(e)}")
            return "Résumé non disponible en raison d'une erreur technique."

    def generate_summary(self, text, length='medium'):
        """
        Point d'entrée principal pour la génération de résumé
        """
        # Prétraiter le texte
        text = self.preprocess_text(text)
        
        if not text or len(text.strip()) < 50:
            raise ValueError("Le texte est trop court pour générer un résumé significatif")
        
        # Générer le résumé avec Gemini
        return self.generate_summary_with_gemini(text, length)

    def extract_text_from_pdf(self, file_path):
        """
        Extrait le texte d'un fichier PDF.
        """
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return self.clean_text(text)
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction du texte du PDF: {str(e)}")
            return None

    def create_resume(self, data):
        try:
            if not isinstance(data, dict):
                raise ValueError("Les données doivent être un dictionnaire")
                
            required_fields = ['original_text', 'summary', 'length', 'etudiant_id']
            for field in required_fields:
                if field not in data:
                    raise ValueError(f"Le champ {field} est requis")
                    
            # Créer l'objet Resume
            resume = Resume(
                etudiant_id=data['etudiant_id'],
                original_text=data['original_text'],
                summary=data['summary'],
                length=data['length']
            )
            
            # Sauvegarder dans la base de données
            created_resume = self.resume_repository.create(resume)
            
            # Le repository retourne déjà un dictionnaire via to_dict()
            return created_resume
            
        except Exception as e:
            logger.error(f"Erreur lors de la création du résumé: {str(e)}")
            raise

    def get_resume(self, resume_id):
        try:
            return self.resume_repository.get_by_id(resume_id)
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du résumé: {str(e)}")
            raise

    def list_resumes(self):
        try:
            return self.resume_repository.list_all()
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des résumés: {str(e)}")
            raise

    def update_resume(self, resume_id, data):
        try:
            if not isinstance(data, dict):
                raise ValueError("Les données doivent être un dictionnaire")
                
            resume = Resume(
                original_text=data.get('original_text', ''),
                summary=data.get('summary', ''),
                length=data.get('length', 'medium')
            )
            resume.id = resume_id
            return self.resume_repository.update(resume)
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour du résumé: {str(e)}")
            raise

    def delete_resume(self, resume_id):
        try:
            return self.resume_repository.delete(resume_id)
        except Exception as e:
            logger.error(f"Erreur lors de la suppression du résumé: {str(e)}")
            raise
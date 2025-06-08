import os
import PyPDF2
from werkzeug.utils import secure_filename
from typing import Tuple, Dict, Any
import torch
import logging

# Utilisation de transformers et d'un modèle pivot pour les paires de langues non disponibles directement
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TraductionService:
    # Définition des langues supportées
    LANGUES_SUPPORTEES = {
        'fr': 'French',
        'en': 'English',
        'es': 'Spanish',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'nl': 'Dutch',
        'ru': 'Russian',
        'ar': 'Arabic',
        'zh': 'Chinese',
        'ja': 'Japanese'
    }
    
    # Mapping des codes de langue pour M2M100
    M2M100_LANG_CODES = {
        'fr': 'fr',
        'en': 'en',
        'es': 'es',
        'de': 'de',
        'it': 'it',
        'pt': 'pt',
        'nl': 'nl',
        'ru': 'ru',
        'ar': 'ar',
        'zh': 'zh',
        'ja': 'ja'
    }
    
    # Mapping des paires de langues vers les modèles disponibles confirmés
    MODELES_DISPONIBLES = {
        ('en', 'fr'): 'Helsinki-NLP/opus-mt-en-fr',
        ('fr', 'en'): 'Helsinki-NLP/opus-mt-fr-en',
        ('en', 'es'): 'Helsinki-NLP/opus-mt-en-es',
        ('es', 'en'): 'Helsinki-NLP/opus-mt-es-en',
        ('fr', 'es'): 'Helsinki-NLP/opus-mt-fr-es',
        ('es', 'fr'): 'Helsinki-NLP/opus-mt-es-fr',
        ('en', 'de'): 'Helsinki-NLP/opus-mt-en-de',
        ('de', 'en'): 'Helsinki-NLP/opus-mt-de-en',
        ('fr', 'de'): 'Helsinki-NLP/opus-mt-fr-de',
        ('de', 'fr'): 'Helsinki-NLP/opus-mt-de-fr',
        ('en', 'ru'): 'Helsinki-NLP/opus-mt-en-ru',
        ('ru', 'en'): 'Helsinki-NLP/opus-mt-ru-en',
        ('en', 'zh'): 'Helsinki-NLP/opus-mt-en-zh',
        ('zh', 'en'): 'Helsinki-NLP/opus-mt-zh-en',
        ('en', 'ja'): 'Helsinki-NLP/opus-mt-en-jap',
        ('ja', 'en'): 'Helsinki-NLP/opus-mt-jap-en',
    }
    
    # Modèle fallback pour traduction multi-langues
    MODELE_FALLBACK = "facebook/m2m100_418M"
    
    def __init__(self, upload_folder=None):
        """
        Initialise le service de traduction
        """
        self.upload_folder = upload_folder
        self.pipelines = {}  # Cache pour stocker les pipelines de traduction
        self.fallback_model = None
        self.fallback_tokenizer = None
        logger.info("Service de traduction initialisé")
    
    def _get_model_name(self, src_lang: str, tgt_lang: str) -> str:
        """
        Détermine le nom du modèle à utiliser pour la paire de langues donnée
        """
        # Vérifier si la paire de langue existe directement dans notre mapping
        if (src_lang, tgt_lang) in self.MODELES_DISPONIBLES:
            return self.MODELES_DISPONIBLES[(src_lang, tgt_lang)]
        
        # Sinon, retourner None pour indiquer qu'il faut utiliser le fallback
        return None
    
    def _init_fallback_model(self):
        """
        Initialise le modèle de fallback pour la traduction entre paires de langues non disponibles directement
        """
        try:
            if self.fallback_model is None:
                logger.info("Initialisation du modèle M2M100...")
                self.fallback_tokenizer = AutoTokenizer.from_pretrained(self.MODELE_FALLBACK)
                self.fallback_model = AutoModelForSeq2SeqLM.from_pretrained(self.MODELE_FALLBACK)
                
                # Vérifier que le modèle est correctement initialisé
                if self.fallback_model is None or self.fallback_tokenizer is None:
                    raise ValueError("Le modèle M2M100 n'a pas été correctement initialisé")
                    
                # Tester le modèle avec une traduction simple
                test_text = "Hello"
                self.fallback_tokenizer.src_lang = "en"
                encoded = self.fallback_tokenizer(test_text, return_tensors="pt", padding=True)
                with torch.no_grad():
                    generated_tokens = self.fallback_model.generate(
                        **encoded,
                        forced_bos_token_id=self.fallback_tokenizer.get_lang_id("fr")
                    )
                test_result = self.fallback_tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
                
                if not test_result or not test_result.strip():
                    raise ValueError("Le test de traduction avec M2M100 a échoué")
                    
                logger.info("Modèle M2M100 initialisé et testé avec succès")
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation du modèle M2M100: {str(e)}")
            raise ValueError(f"Impossible d'initialiser le modèle de traduction: {str(e)}")
    
    def _translate_with_fallback(self, text: str, src_lang: str, tgt_lang: str) -> str:
        """
        Traduit un texte en utilisant le modèle de fallback (M2M100)
        """
        try:
            self._init_fallback_model()
            
            # Convertir les codes de langue pour M2M100
            src_lang = self.M2M100_LANG_CODES.get(src_lang, src_lang)
            tgt_lang = self.M2M100_LANG_CODES.get(tgt_lang, tgt_lang)
            
            logger.info(f"Traduction avec M2M100: {src_lang} -> {tgt_lang}")
            
            # Diviser le texte en chunks pour éviter de dépasser la limite de tokens
            max_chunk_length = 400  # Caractères maximum par chunk
            chunks = [text[i:i+max_chunk_length] for i in range(0, len(text), max_chunk_length)]
            
            translated_chunks = []
            for chunk in chunks:
                # Encoder le texte pour le modèle M2M100
                self.fallback_tokenizer.src_lang = src_lang
                encoded = self.fallback_tokenizer(chunk, return_tensors="pt", padding=True)
                
                # Générer la traduction
                with torch.no_grad():
                    generated_tokens = self.fallback_model.generate(
                        **encoded,
                        forced_bos_token_id=self.fallback_tokenizer.get_lang_id(tgt_lang)
                    )
                
                # Décoder le résultat
                translated_chunk = self.fallback_tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
                translated_chunks.append(translated_chunk)
            
            result = ' '.join(translated_chunks)
            if not result.strip():
                raise ValueError("La traduction a retourné un résultat vide")
                
            return result
            
        except Exception as e:
            logger.error(f"Erreur lors de la traduction avec M2M100: {str(e)}")
            raise ValueError(f"Erreur lors de la traduction avec le modèle M2M100: {str(e)}")
    
    def _translate_with_pivot(self, text: str, src_lang: str, tgt_lang: str) -> str:
        """
        Traduit en utilisant l'anglais comme langue pivot quand la paire directe n'est pas disponible
        """
        try:
            # Première étape: traduire de la langue source vers l'anglais
            if src_lang != 'en':
                text = self.translate_text(text, src_lang, 'en')
            
            # Deuxième étape: traduire de l'anglais vers la langue cible
            if tgt_lang != 'en':
                text = self.translate_text(text, 'en', tgt_lang)
                
            return text
        except Exception as e:
            logger.error(f"Erreur lors de la traduction avec pivot: {str(e)}")
            raise ValueError(f"Erreur lors de la traduction avec pivot: {str(e)}")
    
    def translate_text(self, text: str, src_lang: str, tgt_lang: str) -> str:
        """
        Traduit un texte d'une langue à une autre
        """
        if not text or not text.strip():
            raise ValueError("Le texte à traduire ne peut pas être vide")
            
        # Si les langues sont identiques, renvoyer le texte tel quel
        if src_lang == tgt_lang:
            return text
        
        # Vérifier si nous utilisons déjà un pivot (pour éviter la récursion)
        is_using_pivot = hasattr(self, '_using_pivot') and self._using_pivot
        
        try:
            model_name = self._get_model_name(src_lang, tgt_lang)
            
            # Si le modèle direct existe, l'utiliser
            if model_name:
                # Créer ou récupérer le pipeline depuis le cache
                if (src_lang, tgt_lang) not in self.pipelines:
                    logger.info(f"Initialisation du pipeline pour {src_lang} -> {tgt_lang}")
                    self.pipelines[(src_lang, tgt_lang)] = pipeline(
                        "translation", 
                        model=model_name,
                        tokenizer=model_name
                    )
                
                translate_pipeline = self.pipelines[(src_lang, tgt_lang)]
                
                # Diviser le texte en chunks pour éviter de dépasser la limite de tokens
                max_chunk_length = 500  # Caractères maximum par chunk
                chunks = [text[i:i+max_chunk_length] for i in range(0, len(text), max_chunk_length)]
                
                # Traduire chaque chunk
                translated_chunks = []
                for chunk in chunks:
                    result = translate_pipeline(chunk)
                    translated_chunks.append(result[0]['translation_text'])
                
                result = ' '.join(translated_chunks)
                if not result.strip():
                    raise ValueError("La traduction a retourné un résultat vide")
                    
                return result
            
            # Si pas de modèle direct et pas déjà en utilisant un pivot, essayer avec le pivot
            elif not is_using_pivot:
                # Marquer que nous utilisons maintenant le pivot
                self._using_pivot = True
                result = self._translate_with_pivot(text, src_lang, tgt_lang)
                # Réinitialiser le flag
                self._using_pivot = False
                return result
            
            # Si nous sommes déjà en pivot ou si le pivot a échoué, essayer avec le modèle fallback
            else:
                return self._translate_with_fallback(text, src_lang, tgt_lang)
            
        except Exception as e:
            error_message = str(e)
            logger.error(f"Erreur lors de la traduction: {error_message}")
            
            # Si l'erreur persiste, proposer une solution alternative
            if not is_using_pivot:
                try:
                    # Essayer avec le modèle fallback comme dernier recours
                    return self._translate_with_fallback(text, src_lang, tgt_lang)
                except Exception as fallback_error:
                    logger.error(f"Erreur avec le modèle fallback: {str(fallback_error)}")
                    raise ValueError(f"Erreur de traduction avec tous les modèles: {str(fallback_error)}")
            else:
                raise ValueError(f"Erreur lors de la traduction: {error_message}. Veuillez essayer une autre paire de langues.")
    
    def extract_text_from_pdf(self, pdf_file) -> str:
        """
        Extrait le texte d'un fichier PDF
        """
        text = ""
        try:
            # Sauvegarder temporairement le fichier
            filename = secure_filename(pdf_file.filename)
            filepath = os.path.join(self.upload_folder, filename)
            pdf_file.save(filepath)
            
            # Lire le PDF
            with open(filepath, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() or ""
            
            # Optionnel: supprimer le fichier temporaire
            # os.remove(filepath)
            
            return text
        except Exception as e:
            print(f"Erreur lors de l'extraction du texte du PDF: {str(e)}")
            raise
    
    def translate_pdf(self, pdf_file, src_lang: str, tgt_lang: str) -> Tuple[str, str, str]:
        """
        Extrait le texte d'un PDF et le traduit
        """
        # Étape 1: Extraire le texte du PDF
        original_text = self.extract_text_from_pdf(pdf_file)
        
        # Étape 2: Traduire le texte
        translated_text = self.translate_text(original_text, src_lang, tgt_lang)
        
        # Étape 3: Sauvegarder le fichier PDF et retourner le chemin
        filename = secure_filename(pdf_file.filename)
        filepath = os.path.join(self.upload_folder, filename)
        
        return original_text, translated_text, filepath
    
    @classmethod
    def get_langues_supportees(cls) -> Dict[str, str]:
        """
        Renvoie la liste des langues supportées
        """
        return cls.LANGUES_SUPPORTEES
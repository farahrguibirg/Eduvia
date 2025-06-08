from PyPDF2 import PdfReader
import re
import os
from bardapi import Bard
from werkzeug.datastructures import FileStorage
from typing import Tuple, Optional, Dict, Any

class PDFService:
    def __init__(self, bard_api_key: str = None):
        """
        Initialise le service avec la clé API Bard
        """
        self.bard_api_key = bard_api_key or os.environ.get('_BARD_API_KEY')
        if not self.bard_api_key:
            raise ValueError("La clé API Bard est requise")
        
        # Configurer la clé API pour Bard
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
            raise
    
    def clean_text(self, text: str) -> str:
        """
        Nettoie le texte extrait du PDF
        """
        text = re.sub(r'\s+', ' ', text)  # Supprimer les espaces multiples
        text = re.sub(r'[^\w\s.,;:!?()[\]{}"\'-]', '', text)  # Conserver les caractères utiles
        return text.strip()
    
    def get_bard_response(self, prompt: str) -> str:
        """
        Obtient une réponse de Bard en utilisant la clé API
        """
        try:
            try:
                response = Bard().get_answer(prompt)
                return response['content']  # Retourner le contenu de la réponse
            except Exception as api_error:
                print(f"Erreur API Bard: {str(api_error)}")
                # Réponse de secours en cas d'échec API
                return f"Je ne peux pas répondre à cette question pour le moment. L'API rencontre un problème: {str(api_error)}. Veuillez réessayer plus tard ou reformuler votre question."
        except Exception as e:
            print(f"Erreur lors de la communication avec Bard: {str(e)}")
            return f"Une erreur est survenue lors de la communication avec l'IA: {str(e)}"
    
    def process_pdf(self, pdf_file: FileStorage, question: Optional[str] = None) -> Tuple[str, str]:
        """
        Traite le fichier PDF et répond aux questions en utilisant Bard
        """
        # Étape 1: Extraire le texte du PDF
        text = self.extract_text_from_pdf(pdf_file)
        
        # Étape 2: Formuler une requête pour Bard
        if question and question.strip():
            prompt = f"Voici le contenu d'un PDF: {text[:4000]}...\n\nRéponds à ce message: {question}"
        else:
            prompt = f"Voici le contenu d'un PDF: {text[:4000]}...\n\nRésume ce contenu."
        
        # Étape 3: Obtenir une réponse de Bard
        answer = self.get_bard_response(prompt)
        
        return text, answer
    
    def save_pdf_content(self, pdf_file: FileStorage) -> Dict[str, Any]:
        """
        Sauvegarde le contenu du PDF pour référence ultérieure
        """
        filename = pdf_file.filename
        text = self.extract_text_from_pdf(pdf_file)
        
        return {
            'pdf_filename': filename,
            'pdf_content': text[:10000]  # Limiter la taille pour la base de données
        }
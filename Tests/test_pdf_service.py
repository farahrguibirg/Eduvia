# tests/_init_.py
# Initialisation du package tests

# tests/test_pdf_service.py
import unittest
import os
import io
from unittest.mock import patch, MagicMock
from Services.PDFServices import PDFService

class TestPDFService(unittest.TestCase):
    def setUp(self):
        # Configuration du test avec une clé API fictive
        os.environ['_BARD_API_KEY'] = 'fake_api_key'
        self.pdf_service = PDFService(bard_api_key='fake_api_key')
    
    def test_clean_text(self):
        """Test la fonction de nettoyage du texte"""
        input_text = "  Texte avec  des espaces   multiples et des caractères spéciaux @#$%^&*  "
        expected_output = "Texte avec des espaces multiples et des caractères spéciaux"
        
        cleaned_text = self.pdf_service.clean_text(input_text)
        self.assertEqual(cleaned_text, expected_output)
    
    @patch('services.PDFService.PdfReader')
    def test_extract_text_from_pdf(self, mock_pdf_reader):
        """Test l'extraction de texte d'un PDF"""
        # Simuler un objet FileStorage
        mock_file = MagicMock()
        
        # Configurer le mock pour PdfReader
        mock_page1 = MagicMock()
        mock_page1.extract_text.return_value = "Page 1 contenu"
        mock_page2 = MagicMock()
        mock_page2.extract_text.return_value = "Page 2 contenu"
        
        mock_pdf_reader.return_value.pages = [mock_page1, mock_page2]
        
        # Appeler la fonction à tester
        result = self.pdf_service.extract_text_from_pdf(mock_file)
        
        # Vérifier les résultats
        self.assertEqual(result, "Page 1 contenu Page 2 contenu")
        mock_pdf_reader.assert_called_once_with(mock_file)
    
    @patch('services.PDFService.Bard')
    def test_get_bard_response(self, mock_bard):
        """Test la fonction de réponse Bard"""
        # Configurer le mock pour Bard
        mock_bard_instance = MagicMock()
        mock_bard_instance.get_answer.return_value = {'content': 'Réponse de test de Bard'}
        mock_bard.return_value = mock_bard_instance
        
        # Appeler la fonction à tester
        result = self.pdf_service.get_bard_response("Prompt de test")
        
        # Vérifier les résultats
        self.assertEqual(result, "Réponse de test de Bard")
        mock_bard_instance.get_answer.assert_called_once_with("Prompt de test")
    
    @patch('services.PDFService.PDFService.extract_text_from_pdf')
    @patch('services.PDFService.PDFService.get_bard_response')
    def test_process_pdf(self, mock_get_bard_response, mock_extract_text):
        """Test le traitement complet d'un PDF"""
        # Configurer les mocks
        mock_file = MagicMock()
        mock_extract_text.return_value = "Contenu du PDF extrait"
        mock_get_bard_response.return_value = "Réponse générée par Bard"
        
        # Appeler la fonction à tester avec une question
        text, answer = self.pdf_service.process_pdf(mock_file, "Question de test?")
        
        # Vérifier les résultats
        self.assertEqual(text, "Contenu du PDF extrait")
        self.assertEqual(answer, "Réponse générée par Bard")
        mock_extract_text.assert_called_once_with(mock_file)
        
        # Tester le prompt envoyé à Bard
        expected_prompt = f"Voici le contenu d'un PDF éducatif: Contenu du PDF extrait...\n\nRéponds de manière détaillée et pédagogique à cette question: Question de test?"
        mock_get_bard_response.assert_called_once_with(expected_prompt)
    
    @patch('services.PDFService.PDFService.extract_text_from_pdf')
    def test_save_pdf_content(self, mock_extract_text):
        """Test la sauvegarde du contenu PDF"""
        # Configurer le mock
        mock_file = MagicMock()
        mock_file.filename = "test_document.pdf"
        mock_extract_text.return_value = "X" * 20000  # Contenu plus long que la limite
        
        # Appeler la fonction à tester
        result = self.pdf_service.save_pdf_content(mock_file)
        
        # Vérifier les résultats
        self.assertEqual(result['pdf_filename'], "test_document.pdf")
        self.assertEqual(len(result['pdf_content']), 10000)  # Vérifie que le contenu est tronqué

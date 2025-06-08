
# tests/test_chatbot_api.py
import unittest
import json
import io
from unittest.mock import patch, MagicMock
from app import create_app
from config import TestingConfig
from database import db
from Models.Chatbot import Chatbot
from Models.Utilisateur import Utilisateur
from Models.Etudiant import Etudiant

class TestChatbotAPI(unittest.TestCase):
    def setUp(self):
        """Configure l'environnement de test avant chaque test"""
        self.app = create_app(TestingConfig)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # Créer les tables dans la base de données de test
        db.create_all()
        
        # Créer un utilisateur de test
        user = Utilisateur(
            nom="Nom",
            prenom="Prenom",
            email="test@example.com",
            mot_de_passe="password123"
        )
        db.session.add(user)
        
        # Créer un étudiant de test
        etudiant = Etudiant(
            id=user.id,
            nom="Nom Etudiant",
            prenom="Prenom Etudiant",
            email="etudiant@example.com",
            mot_de_passe="password456"
        )
        db.session.add(etudiant)
        db.session.commit()
        
        self.etudiant_id = etudiant.id
    
    def tearDown(self):
        """Nettoie l'environnement de test après chaque test"""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    @patch('controllers.ChatbotController.PDFService')
    def test_process_pdf_question(self, mock_pdf_service):
        """Test la route de traitement PDF"""
        # Configurer les mocks
        mock_instance = MagicMock()
        mock_instance.process_pdf.return_value = ("Contenu du PDF", "Réponse de l'IA")
        mock_instance.save_pdf_content.return_value = {
            'pdf_filename': 'test.pdf',
            'pdf_content': 'Contenu du PDF'
        }
        mock_pdf_service.return_value = mock_instance
        
        # Créer un fichier PDF fictif
        data = {}
        data['pdf_file'] = (io.BytesIO(b"fake pdf content"), 'test.pdf')
        data['question'] = "Comment fonctionne ce système?"
        data['etudiant_id'] = str(self.etudiant_id)
        
        # Envoyer la requête
        response = self.client.post(
            '/api/chatbot/process',
            data=data,
            content_type='multipart/form-data'
        )
        
        # Vérifier la réponse
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data['pdf_content'], "Contenu du PDF")
        self.assertEqual(response_data['response'], "Réponse de l'IA")
        self.assertTrue(response_data['saved'])
        self.assertIn('chatbot_id', response_data)
        
        # Vérifier que l'entrée a été créée dans la base de données
        chatbot = Chatbot.query.get(response_data['chatbot_id'])
        self.assertIsNotNone(chatbot)
        self.assertEqual(chatbot.question, "Comment fonctionne ce système?")
        self.assertEqual(chatbot.reponse, "Réponse de l'IA")
    
    def test_get_student_history_empty(self):
        """Test la récupération d'un historique vide"""
        # Envoyer la requête
        response = self.client.get(f'/api/chatbot/history/{self.etudiant_id}')
        
        # Vérifier la réponse
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data['history'], [])
    
    def test_get_student_history_with_data(self):
        """Test la récupération d'un historique avec des données"""
        # Ajouter quelques entrées pour l'étudiant
        chatbot1 = Chatbot(
            question="Question 1",
            reponse="Réponse 1",
            pdf_filename="test1.pdf",
            etudiant_id=self.etudiant_id
        )
        chatbot2 = Chatbot(
            question="Question 2",
            reponse="Réponse 2",
            pdf_filename="test2.pdf",
            etudiant_id=self.etudiant_id
        )
        db.session.add(chatbot1)
        db.session.add(chatbot2)
        db.session.commit()
        
        # Envoyer la requête
        response = self.client.get(f'/api/chatbot/history/{self.etudiant_id}')
        
        # Vérifier la réponse
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        history = response_data['history']
        self.assertEqual(len(history), 2)
        self.assertEqual(history[0]['question'], "Question 1")
        self.assertEqual(history[1]['question'], "Question 2")
    
    def test_get_chatbot_details(self):
        """Test la récupération des détails d'un chatbot"""
        # Ajouter une entrée
        chatbot = Chatbot(
            question="Question détaillée",
            reponse="Réponse détaillée",
            pdf_filename="details.pdf",
            pdf_content="Contenu du PDF pour les détails",
            etudiant_id=self.etudiant_id
        )
        db.session.add(chatbot)
        db.session.commit()
        
        # Envoyer la requête
        response = self.client.get(f'/api/chatbot/{chatbot.id}')
        
        # Vérifier la réponse
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data['question'], "Question détaillée")
        self.assertEqual(response_data['reponse'], "Réponse détaillée")
        self.assertEqual(response_data['pdf_content'], "Contenu du PDF pour les détails")
    
    def test_healthcheck(self):
        """Test la route de vérification d'état"""
        response = self.client.get('/api/healthcheck')
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data['status'], "ok")

if __name__ == '__main__':
    unittest.main()
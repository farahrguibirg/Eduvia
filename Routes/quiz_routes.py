from flask import Blueprint, request, jsonify
from Models.Quiz import db, Quiz, QuizResult
from Models.Question import Question
from Models.Enseignant import Enseignant
from Models.Etudiant import Etudiant
from datetime import datetime
import random
from Services.PDFServices import PDFService
from config import Config
import re
from Models.Exercice import Exercice
from Controllers.QuizController import QuizController

quiz_bp = Blueprint('quiz', __name__, url_prefix='/api')
quiz_controller = QuizController()

# Créer un quiz (enseignant)
@quiz_bp.route('/quiz', methods=['POST'])
def create_quiz():
    return quiz_controller.create_quiz()

# Lister tous les quiz (élève)
@quiz_bp.route('/quiz', methods=['GET'])
def list_quiz():
    return quiz_controller.list_quiz()

# Lister les quiz d'un enseignant
@quiz_bp.route('/quiz/enseignant/<int:enseignant_id>', methods=['GET'])
def list_quiz_enseignant(enseignant_id):
    return quiz_controller.list_quiz_enseignant(enseignant_id)

# Détail d'un quiz (questions/réponses)
@quiz_bp.route('/quiz/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    return quiz_controller.get_quiz(quiz_id)

# Soumettre un quiz (élève)
@quiz_bp.route('/quiz/<int:quiz_id>/submit', methods=['POST'])
def submit_quiz(quiz_id):
    return quiz_controller.submit_quiz(quiz_id)

# Résultats d'un quiz (enseignant)
@quiz_bp.route('/quiz/<int:quiz_id>/results', methods=['GET'])
def quiz_results(quiz_id):
    return quiz_controller.quiz_results(quiz_id)

# Modifier un quiz (enseignant)
@quiz_bp.route('/quiz/<int:quiz_id>', methods=['PUT'])
def update_quiz(quiz_id):
    return quiz_controller.update_quiz(quiz_id)

# Supprimer un quiz (enseignant)
@quiz_bp.route('/quiz/<int:quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    return quiz_controller.delete_quiz(quiz_id)

# Générer un quiz à partir d'un QCM
@quiz_bp.route('/quiz/generate-from-qcm/<int:exercice_id>', methods=['POST'])
def generate_quiz_from_qcm(exercice_id):
    return quiz_controller.generate_quiz_from_qcm(exercice_id)

# Générer un quiz à partir d'un quiz existant
@quiz_bp.route('/quiz/generate-from-existing/<int:quiz_id>', methods=['POST', 'GET'])
def generate_quiz_from_existing(quiz_id):
    return quiz_controller.generate_from_quiz(quiz_id)

# Route alternative pour la génération de quiz
@quiz_bp.route('/quiz-generator/generate-from-existing/<int:quiz_id>', methods=['POST', 'GET'])
def generate_quiz_from_existing_alt(quiz_id):
    return quiz_controller.generate_from_quiz(quiz_id)

def create_quiz_routes():
    return quiz_bp



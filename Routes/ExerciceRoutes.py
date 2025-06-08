from flask import Blueprint, request
from Controllers.ExerciceController import ExerciceController

# Création du blueprint pour les routes d'exercices
#exercice_bp = Blueprint('exercice', __name__)
exercice_bp = Blueprint('exercice', __name__, url_prefix='/api')

@exercice_bp.route('/exercices/qcm', methods=['POST'])
def generer_qcm():
    """
    Route pour générer un QCM à partir d'un fichier PDF
    """
    return ExerciceController.generer_qcm()

@exercice_bp.route('/exercices/qcm-from-cours', methods=['POST'])
def generer_qcm_from_cours():
    return ExerciceController.generer_qcm_from_cours()

@exercice_bp.route('/exercices/<int:exercice_id>', methods=['GET'])
def obtenir_exercice(exercice_id):
    """
    Route pour obtenir les détails d'un exercice
    """
    return ExerciceController.obtenir_exercice(exercice_id)

@exercice_bp.route('/exercices/etudiant/<int:etudiant_id>', methods=['GET'])
def lister_exercices(etudiant_id):
    """
    Route pour lister tous les exercices d'un étudiant
    """
    return ExerciceController.lister_exercices(etudiant_id)

@exercice_bp.route('/exercices/<int:exercice_id>', methods=['DELETE'])
def supprimer_exercice(exercice_id):
    """
    Route pour supprimer un exercice
    """
    return ExerciceController.supprimer_exercice(exercice_id)
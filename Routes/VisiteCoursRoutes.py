from flask import Blueprint, request, g
from Controllers.VisiteCoursController import VisiteCoursController
from Middleware.AuthMiddleware import role_required

visite_cours_bp = Blueprint('visite_cours', __name__)

@visite_cours_bp.route('/visites/cours/<int:cours_id>', methods=['POST'])
@role_required('etudiant')
def enregistrer_visite(cours_id):
    data = request.get_json()
    duree = data.get('duree', 0)
    etudiant_id = g.user.id
    return VisiteCoursController.enregistrer_visite(cours_id, etudiant_id, duree)

@visite_cours_bp.route('/visites/cours/<int:cours_id>/statistiques', methods=['GET'])
@role_required('enseignant')
def get_statistiques_cours(cours_id):
    return VisiteCoursController.get_statistiques_cours(cours_id)

@visite_cours_bp.route('/visites/enseignant/<int:enseignant_id>/statistiques', methods=['GET'])
@role_required('enseignant')
def get_statistiques_enseignant(enseignant_id):
    return VisiteCoursController.get_statistiques_enseignant(enseignant_id) 
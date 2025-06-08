
# Routes
# routes/pdf_cours_routes.py
from flask import Blueprint, jsonify
from Controllers.CoursController import PdfCoursController
from Middleware.AuthMiddleware import role_required
from Middleware.AuthMiddleware import auth_required
from UseCases.CoursUseCase import PdfCoursUseCase

# Correction: Utiliser __name__ correctement (sans astérisques)
pdf_cours_blueprint = Blueprint('pdf_cours', __name__, url_prefix='/api')
controller = PdfCoursController()

# Routes publiques (accessibles à tous les utilisateurs authentifiés)
@pdf_cours_blueprint.route('/pdfs', methods=['GET'])
@auth_required
def get_all_pdfs():
    return controller.get_all_pdfs()

@pdf_cours_blueprint.route('/pdfs/<int:pdf_id>', methods=['GET'])
def get_pdf(pdf_id):
    return controller.get_pdf(pdf_id)

@pdf_cours_blueprint.route('/pdfs/<int:pdf_id>/download', methods=['GET'])
def download_pdf(pdf_id):
    return controller.download_pdf(pdf_id)

@pdf_cours_blueprint.route('/pdfs/<int:pdf_id>/view', methods=['GET'])
def view_pdf(pdf_id):
    # S'assurer que cette route est correctement enregistrée
    return controller.view_pdf(pdf_id)

# Routes pour les enseignants
@pdf_cours_blueprint.route('/pdfs', methods=['POST'])
@role_required('enseignant')  # Middleware qui vérifie le rôle
def create_pdf():
    return controller.create_pdf()

@pdf_cours_blueprint.route('/pdfs/<int:pdf_id>', methods=['PUT'])
@role_required('enseignant')
def update_pdf(pdf_id):
    return controller.update_pdf(pdf_id)

@pdf_cours_blueprint.route('/pdfs/<int:pdf_id>', methods=['DELETE'])
@role_required('enseignant')
def delete_pdf(pdf_id):
    return controller.delete_pdf(pdf_id)

# Route pour les PDFs d'un enseignant spécifique
@pdf_cours_blueprint.route('/enseignants/<int:enseignant_id>/pdfs', methods=['GET'])
def get_pdfs_by_enseignant(enseignant_id):
    pdfs = PdfCoursUseCase().lister_pdfs_enseignant(enseignant_id)
    return jsonify([{
        'id': pdf.id,
        'titre': pdf.titre,
        'url': pdf.url,
        'utilisateur_id': pdf.utilisateur_id
    } for pdf in pdfs]), 200
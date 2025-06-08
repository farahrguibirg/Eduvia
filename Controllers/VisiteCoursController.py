from flask import jsonify
from UseCases.VisiteCoursUseCase import VisiteCoursUseCase

class VisiteCoursController:
    @staticmethod
    def enregistrer_visite(cours_id, etudiant_id, duree=0):
        try:
            visite = VisiteCoursUseCase.enregistrer_visite(cours_id, etudiant_id, duree)
            return jsonify({'success': True, 'visite': visite.to_dict()}), 201
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @staticmethod
    def get_statistiques_cours(cours_id):
        try:
            stats = VisiteCoursUseCase.statistiques_cours(cours_id)
            return jsonify(stats), 200
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @staticmethod
    def get_statistiques_enseignant(enseignant_id):
        try:
            stats = VisiteCoursUseCase.statistiques_enseignant(enseignant_id)
            return jsonify(stats), 200
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500 
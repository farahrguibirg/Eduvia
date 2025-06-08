from Services.VisiteCoursService import VisiteCoursService

class VisiteCoursUseCase:
    @staticmethod
    def enregistrer_visite(cours_id, etudiant_id, duree=0):
        return VisiteCoursService.enregistrer_visite(cours_id, etudiant_id, duree)

    @staticmethod
    def statistiques_cours(cours_id):
        return VisiteCoursService.statistiques_cours(cours_id)

    @staticmethod
    def statistiques_enseignant(enseignant_id):
        return VisiteCoursService.statistiques_enseignant(enseignant_id) 
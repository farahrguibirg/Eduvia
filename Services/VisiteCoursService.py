from Repository.visite_cours_repository import VisiteCoursRepository

class VisiteCoursService:
    @staticmethod
    def enregistrer_visite(cours_id, etudiant_id, duree=0):
        return VisiteCoursRepository.add_visite(cours_id, etudiant_id, duree)

    @staticmethod
    def statistiques_cours(cours_id):
        return VisiteCoursRepository.get_stats_cours(cours_id)

    @staticmethod
    def statistiques_enseignant(enseignant_id):
        visites = VisiteCoursRepository.get_visites_by_enseignant(enseignant_id)
        # Regrouper par cours
        stats = {}
        for v in visites:
            cid = v.cours_id
            if cid not in stats:
                stats[cid] = {
                    'nombre_visites': 0,
                    'nombre_etudiants_uniques': set(),
                    'duree_totale': 0,
                    'etudiants_visiteurs': []
                }
            stats[cid]['nombre_visites'] += 1
            stats[cid]['nombre_etudiants_uniques'].add(v.etudiant_id)
            stats[cid]['duree_totale'] += v.duree_visite
            stats[cid]['etudiants_visiteurs'].append(v.to_dict())
        # Formater
        for cid in stats:
            stats[cid]['nombre_etudiants_uniques'] = len(stats[cid]['nombre_etudiants_uniques'])
        return stats 
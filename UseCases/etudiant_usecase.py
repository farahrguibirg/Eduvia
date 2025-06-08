from Repository.etudiant_repository import EtudiantRepository
from Models.Etudiant import Etudiant

class EtudiantUseCase:
    def __init__(self):
        self.repo = EtudiantRepository()

    def ajouter_etudiant(self, **data):
        etudiant = Etudiant(**data)
        return self.repo.create(etudiant)

    def afficher_tous(self):
        return self.repo.get_all()

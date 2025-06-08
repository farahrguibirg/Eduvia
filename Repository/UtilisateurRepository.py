from Models.Utilisateur import Utilisateur
from app import db

class UtilisateurRepository:
    # ... autres méthodes ...

    def set_2fa_code(self, user_id, code, exp):
        user = Utilisateur.query.get(user_id)
        user.tfa_code = code
        user.tfa_code_exp = exp
        db.session.commit()
        return user

    def clear_2fa_code(self, user_id):
        user = Utilisateur.query.get(user_id)
        user.tfa_code = None
        user.tfa_code_exp = None
        db.session.commit()
        return user

    def enable_2fa(self, user_id):
        user = Utilisateur.query.get(user_id)
        user.tfa_enabled = True
        db.session.commit()
        return user

    def disable_2fa(self, user_id):
        user = Utilisateur.query.get(user_id)
        user.tfa_enabled = False
        user.tfa_code = None
        user.tfa_code_exp = None
        db.session.commit()
        return user 
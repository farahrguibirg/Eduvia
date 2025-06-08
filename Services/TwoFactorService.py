import random
from datetime import datetime, timedelta
from Repository.UtilisateurRepository import UtilisateurRepository
from Services.EmailUtils import send_2fa_email

class TwoFactorService:
    def __init__(self):
        self.repo = UtilisateurRepository()

    def send_2fa_code(self, user):
        code = str(random.randint(100000, 999999))
        exp = datetime.utcnow() + timedelta(minutes=5)
        self.repo.set_2fa_code(user.id, code, exp)
        send_2fa_email(user.email, code)
        return code

    def verify_2fa_code(self, user, code):
        if (
            user.tfa_code == code and
            user.tfa_code_exp and
            user.tfa_code_exp > datetime.utcnow()
        ):
            self.repo.enable_2fa(user.id)
            self.repo.clear_2fa_code(user.id)
            return True
        return False

    def disable_2fa(self, user):
        self.repo.disable_2fa(user.id) 
        
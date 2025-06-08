from Services.TwoFactorService import TwoFactorService

class TwoFactorUseCase:
    def __init__(self):
        self.service = TwoFactorService()

    def send_code(self, user):
        return self.service.send_2fa_code(user)

    def verify_code(self, user, code):
        return self.service.verify_2fa_code(user, code)

    def disable(self, user):
        self.service.disable_2fa(user) 
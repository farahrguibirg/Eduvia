
from flask import current_app
import re

class AuthUseCase:
    def __init__(self, auth_service):
        self.auth_service = auth_service

    def register(self, nom, prenom, email, mot_de_passe, type, code_secret=None):
        errors = {}

        if not nom or len(nom) < 2:
            errors["nom"] = "Le nom doit contenir au moins 2 caractères"

        if not prenom or len(prenom) < 2:
            errors["prenom"] = "Le prénom doit contenir au moins 2 caractères"

        # Vérifier que l'email se termine par gmail.com ou uca.ac.ma
        if not email or not (email.endswith("@gmail.com") or email.endswith("@uca.ac.ma")):
            errors["email"] = "L'email doit être une adresse gmail.com ou uca.ac.ma"

        # Vérifier que le mot de passe est suffisamment fort
        if not mot_de_passe or len(mot_de_passe) < 8:
            errors["mot_de_passe"] = "Le mot de passe doit contenir au moins 8 caractères"

        # Vérifier le type d'utilisateur
        if not type:
            errors["type"] = "Le type d'utilisateur est requis"
        elif type not in ["enseignant", "etudiant", "admin"]:
            errors["type"] = "Le type d'utilisateur doit être 'enseignant', 'etudiant' ou 'admin'"

        # Vérifier le code secret pour les enseignants
        if type == "enseignant" and not code_secret:
            errors["code_secret"] = "Le code d'enseignant est requis"

        if errors:
            return None, errors

        utilisateur, error = self.auth_service.register_user(nom, prenom, email, mot_de_passe, type, code_secret)

        if error:
            return None, {"general": error}

        return utilisateur, None

    def login(self, email, mot_de_passe):
        errors = {}

        if not email:
            errors["email"] = "L'email est requis"
        elif not (email.endswith("@gmail.com") or email.endswith("@uca.ac.ma")):
            errors["email"] = "L'email doit se terminer par @gmail.com ou @uca.ac.ma"

        if not mot_de_passe:
            errors["mot_de_passe"] = "Le mot de passe est requis"

        if errors:
            return None, None, errors

        result, token, error = self.auth_service.login_user(email, mot_de_passe)

        if error:
            return None, None, {"general": error}

        # Si 2FA est activé, retourner l'ID de l'utilisateur pour attendre le code 2FA
        if isinstance(result, dict) and result.get("need_2fa"):
            return result, None, None

        # Si 2FA n'est pas activé, retourner le token
        return result, token, None

    def verify_2fa(self, user_id, token):
        if not token or not token.isdigit() or len(token) != 6:
            return None, {"token": "Le code doit être composé de 6 chiffres"}

        jwt_token, error = self.auth_service.verify_2fa(user_id, token)

        if error:
            return None, {"general": error}

        return jwt_token, None

    def setup_2fa(self, user_id):
        totp_uri, error = self.auth_service.setup_2fa(user_id)

        if error:
            return None, {"general": error}

        return totp_uri, None

    def activate_2fa(self, user_id, token):
        if not token or not token.isdigit() or len(token) != 6:
            return False, {"token": "Le code doit être composé de 6 chiffres"}

        success, error = self.auth_service.activate_2fa(user_id, token)

        if error:
            return False, {"general": error}

        return success, None

    def request_password_reset(self, email):
        # Validation de l'email
        if not email or not (email.endswith("@gmail.com") or email.endswith("@uca.ac.ma")):
            return False, {"email": "Email invalide"}

        # Appeler le service pour demander la réinitialisation
        success, error = self.auth_service.request_password_reset(email)

        if error:
            return False, {"general": error}

        return success, None

    def reset_password(self, token, nouveau_mot_de_passe):
        # Validation du mot de passe
        if not nouveau_mot_de_passe or len(nouveau_mot_de_passe) < 8:
            return False, {"nouveau_mot_de_passe": "Le mot de passe doit contenir au moins 8 caractères"}

        # Appeler le service pour réinitialiser le mot de passe
        success, error = self.auth_service.reset_password(token, nouveau_mot_de_passe)

        if error:
            return False, {"general": error}

        return success, None
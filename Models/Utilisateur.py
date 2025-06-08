from app import db
from extensions import bcrypt
from datetime import datetime
import pyotp
import logging

class Utilisateur(db.Model):
    __tablename__ = 'utilisateur'
    
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(50), nullable=False)
    prenom = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    mot_de_passe = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), nullable=False)
    tfa_secret = db.Column(db.String(32), nullable=True)
    tfa_enabled = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_exp = db.Column(db.DateTime, nullable=True)
    tfa_method = db.Column(db.String(20), default='email')
    tfa_code = db.Column(db.String(10), nullable=True)
    tfa_code_exp = db.Column(db.DateTime, nullable=True)
    
    __mapper_args__ = {
        'polymorphic_identity': 'utilisateur',
        'polymorphic_on': type
    }
    
    created_quizzes = db.relationship('Quiz', back_populates='createur')
    
    def __init__(self, nom, prenom, email, mot_de_passe, type=None, tfa_enabled=False):
        self.nom = nom
        self.prenom = prenom
        self.email = email
        # Hachage du mot de passe avec Flask-Bcrypt
        logging.info(f"Hachage du mot de passe pour {email}")
        hashed_password = bcrypt.generate_password_hash(mot_de_passe)
        if isinstance(hashed_password, bytes):
            hashed_password = hashed_password.decode('utf-8')
        logging.info(f"Mot de passe haché généré: {hashed_password[:20]}...")
        logging.info(f"Longueur du hachage: {len(hashed_password)}")
        self.mot_de_passe = hashed_password
        self.type = type
        self.tfa_enabled = tfa_enabled
        if tfa_enabled:
            self.tfa_secret = pyotp.random_base32()
    
    def verify_password(self, mot_de_passe):
        """Vérifie si le mot de passe fourni correspond au hachage stocké"""
        try:
            logging.info(f"Tentative de vérification du mot de passe pour {self.email}")
            logging.info(f"Type d'utilisateur: {self.type}")
            
            if not self.mot_de_passe:
                logging.error("Aucun mot de passe haché trouvé dans la base de données")
                return False
            
            logging.info(f"Mot de passe haché stocké: {self.mot_de_passe[:20]}...")
            logging.info(f"Longueur du mot de passe haché: {len(self.mot_de_passe)}")
            
            # Vérification avec Flask-Bcrypt
            result = bcrypt.check_password_hash(self.mot_de_passe, mot_de_passe)
            logging.info(f"Résultat de la vérification: {result}")
            
            return result
        except Exception as e:
            logging.error(f"Erreur lors de la vérification du mot de passe: {str(e)}")
            logging.error(f"Type d'erreur: {type(e)}")
            return False
    
    def verify_totp(self, token):
        if not self.tfa_enabled or not self.tfa_secret:
            return False
        totp = pyotp.TOTP(self.tfa_secret)
        return totp.verify(token)
    
    def get_totp_uri(self):
        if not self.tfa_secret:
            return None
        return pyotp.totp.TOTP(self.tfa_secret).provisioning_uri(
            name=self.email,
            issuer_name="UCA Authentication"
        )
    
    def set_password(self, mot_de_passe):
        """Hache le mot de passe fourni"""
        self.mot_de_passe = bcrypt.generate_password_hash(mot_de_passe).decode('utf-8')
    
    def check_password(self, mot_de_passe):
        """Alias pour verify_password pour la compatibilité"""
        return self.verify_password(mot_de_passe)
    
    def save(self):
        """Sauvegarde l'utilisateur dans la base de données"""
        db.session.add(self)
        db.session.commit()
   

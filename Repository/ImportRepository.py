from app import db
from Models.Utilisateur import Utilisateur
from Models.Enseignant import Enseignant  # Ajoutez cette import
from Models.Etudiant import Etudiant      # Ajoutez cette import
from sqlalchemy.exc import IntegrityError
from typing import List, Optional, Dict, Any
from werkzeug.security import generate_password_hash
import logging

logger = logging.getLogger(__name__)

class UtilisateurRepository:
    """Repository pour les opérations CRUD sur les utilisateurs"""
    
    @staticmethod
    def create_user(user_data: Dict[str, Any]) -> Utilisateur:
        """Crée un nouvel utilisateur avec mot de passe haché selon son type"""
        try:
            # Déterminer le type d'utilisateur
            user_type = user_data.get('type', 'utilisateur').lower()
            
            # Créer l'instance appropriée selon le type
            if user_type == 'enseignant':
                user = Enseignant(
                    nom=user_data['nom'],
                    prenom=user_data['prenom'],
                    email=user_data['email'],
                    mot_de_passe=user_data['mot_de_passe'],  # Le constructeur s'occupe du hachage
                    type='enseignant',  # Définir explicitement le type
                    tfa_enabled=user_data.get('tfa_enabled', False)
                )
            elif user_type == 'etudiant':
                user = Etudiant(
                    nom=user_data['nom'],
                    prenom=user_data['prenom'],
                    email=user_data['email'],
                    mot_de_passe=user_data['mot_de_passe'],  # Le constructeur s'occupe du hachage
                    type='etudiant',  # Définir explicitement le type
                    tfa_enabled=user_data.get('tfa_enabled', False)
                )
            else:
                # Utilisateur de base
                user = Utilisateur(
                    nom=user_data['nom'],
                    prenom=user_data['prenom'],
                    email=user_data['email'],
                    mot_de_passe=user_data['mot_de_passe'],  # Le constructeur s'occupe du hachage
                    type='utilisateur',
                    tfa_enabled=user_data.get('tfa_enabled', False)
                )
            
            db.session.add(user)
            db.session.commit()
            logger.info(f"Utilisateur {user_type} créé avec succès: {user.email}")
            return user
            
        except IntegrityError as e:
            db.session.rollback()
            logger.error(f"Erreur d'intégrité lors de la création de l'utilisateur: {e}")
            raise ValueError(f"Email déjà existant: {user_data['email']}")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erreur lors de la création de l'utilisateur: {e}")
            raise
    
    @staticmethod
    def bulk_create_users(users_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Crée plusieurs utilisateurs en lot avec hachage des mots de passe"""
        created_users = []
        failed_users = []
        
        for user_data in users_data:
            try:
                user = UtilisateurRepository.create_user(user_data)
                created_users.append(user)
            except Exception as e:
                failed_users.append({
                    'data': {
                        'nom': user_data.get('nom', ''),
                        'prenom': user_data.get('prenom', ''),
                        'email': user_data.get('email', ''),
                        'type': user_data.get('type', 'utilisateur')
                        # On n'inclut PAS le mot de passe dans les logs
                    },
                    'error': str(e)
                })
                logger.warning(f"Échec de création pour {user_data.get('email', 'email inconnu')}: {e}")
        
        return {
            'created': created_users,
            'failed': failed_users,
            'total_created': len(created_users),
            'total_failed': len(failed_users)
        }
    
    @staticmethod
    def get_by_email(email: str) -> Optional[Utilisateur]:
        """Récupère un utilisateur par email"""
        return Utilisateur.query.filter_by(email=email).first()
    
    @staticmethod
    def get_by_id(user_id: int) -> Optional[Utilisateur]:
        """Récupère un utilisateur par ID"""
        return Utilisateur.query.get(user_id)
    
    @staticmethod
    def email_exists(email: str) -> bool:
        """Vérifie si un email existe déjà"""
        return Utilisateur.query.filter_by(email=email).first() is not None
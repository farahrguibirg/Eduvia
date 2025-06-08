# Resume repository - à compléter
from app import db
from Models.Resume import Resume

class ResumeRepository:
    def create(self, resume):
        try:
            db.session.add(resume)
            db.session.commit()
            # S'assurer que l'objet est bien attaché à la session
            db.session.refresh(resume)
            return resume.to_dict()
        except Exception as e:
            db.session.rollback()
            raise Exception(f"Erreur lors de la création du résumé: {e}")

    def get_by_id(self, resume_id):
        try:
            resume = Resume.query.get(resume_id)
            return resume.to_dict() if resume else None
        except Exception as e:
            raise Exception(f"Erreur lors de la récupération du résumé: {e}")

    def list_all(self):
        try:
            resumes = Resume.query.all()
            return [resume.to_dict() for resume in resumes]
        except Exception as e:
            raise Exception(f"Erreur lors de la récupération des résumés: {e}")

    def update(self, resume):
        try:
            existing_resume = Resume.query.get(resume.id)
            if existing_resume:
                existing_resume.original_text = resume.original_text
                existing_resume.summary = resume.summary
                existing_resume.length = resume.length
                db.session.commit()
                return existing_resume.to_dict()
            return None
        except Exception as e:
            db.session.rollback()
            raise Exception(f"Erreur lors de la mise à jour du résumé: {e}")

    def delete(self, resume_id):
        try:
            resume = Resume.query.get(resume_id)
            if resume:
                db.session.delete(resume)
                db.session.commit()
                return {'message': 'Resume deleted successfully'}
            return None
        except Exception as e:
            db.session.rollback()
            raise Exception(f"Erreur lors de la suppression du résumé: {e}")

# Fonction de compatibilité mise à jour pour l'ancien code
def save_resume(original_text, summary, length):
    try:
        resume = Resume(
            original_text=original_text,
            summary=summary,
            length=length
        )
        db.session.add(resume)
        db.session.commit()
        return resume
    except Exception as e:
        db.session.rollback()
        raise Exception(f"Erreur lors de la sauvegarde du résumé: {e}")

def get_all_resumes():
    try:
        return Resume.query.order_by(Resume.created_at.desc()).all()
    except Exception as e:
        raise Exception(f"Erreur lors de la récupération des résumés: {e}")

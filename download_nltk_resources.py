import nltk
import os
import sys

def download_nltk_resources():
    # Définir le chemin où NLTK cherchera les ressources
    nltk_data_path = os.path.join(os.path.expanduser('~'), 'nltk_data')
    if not os.path.exists(nltk_data_path):
        os.makedirs(nltk_data_path)
    
    # Ajouter le chemin aux chemins de recherche de NLTK
    nltk.data.path.append(nltk_data_path)
    
    # Ressources essentielles uniquement
    resources = [
        'punkt',  # Pour la tokenization des phrases
        'stopwords'  # Pour les mots vides
    ]
    
    print("Téléchargement des ressources NLTK...")
    for resource in resources:
        try:
            print(f"Téléchargement de {resource}...")
            nltk.download(resource, download_dir=nltk_data_path, quiet=True)
            
            # Vérifier que la ressource a été correctement téléchargée
            try:
                if resource == 'punkt':
                    nltk.data.find('tokenizers/punkt')
                elif resource == 'stopwords':
                    nltk.data.find('corpora/stopwords')
                print(f"✅ {resource} téléchargé et vérifié avec succès")
            except LookupError:
                print(f"❌ Erreur: {resource} n'a pas été correctement téléchargé")
                sys.exit(1)
                
        except Exception as e:
            print(f"❌ Erreur lors du téléchargement de {resource}: {str(e)}")
            sys.exit(1)
    
    print("\nTéléchargement terminé !")
    print(f"Les ressources NLTK sont installées dans : {nltk_data_path}")

if __name__ == "__main__":
    download_nltk_resources() 
import requests
import json
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)

url = "http://192.168.11.103:5000/api/register"
data = {
    "nom": "ElKourchi",
    "prenom": "Asmaa",
    "email": "elkourchiasmaa@gmail.com",
    "mot_de_passe": "Asmaa123!",
    "type": "admin"
}

headers = {
    "Content-Type": "application/json"
}

logging.info("Envoi de la requête de création d'administrateur...")
logging.info(f"Données envoyées: {json.dumps(data, indent=2)}")
response = requests.post(url, json=data, headers=headers)
logging.info(f"Status Code: {response.status_code}")
logging.info(f"Headers: {response.headers}")
logging.info(f"Response: {response.text}") 
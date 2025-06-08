// Configuration de l'API
import { Platform } from 'react-native';

export const API_URL = Platform.OS === 'android' 
  ? 'http://192.168.1.10:5000/api' 
  : 'http://localhost:5000/api';

// Autres configurations globales peuvent être ajoutées ici 
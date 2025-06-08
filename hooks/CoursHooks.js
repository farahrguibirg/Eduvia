{/*import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const API_URL = 'http://192.168.1.7:5000/api'; // Pour Android
// Utiliser http://localhost:5000 pour iOS

export const useCours = () => {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('etudiant'); // Par défaut
  const [userId, setUserId] = useState(1); // Défini à 1 par défaut au lieu de null

  // Récupérer le rôle et l'ID de l'utilisateur au chargement
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        const id = await AsyncStorage.getItem('userId');
        if (role) setUserRole(role);
        if (id) setUserId(parseInt(id));
        // Si aucun id n'est trouvé dans AsyncStorage, on garde la valeur par défaut 1
      } catch (e) {
        console.error('Erreur lors de la récupération des infos utilisateur:', e);
        // En cas d'erreur, on garde également la valeur par défaut 1
      }
    };

    getUserInfo();
  }, []);

  // Le reste du code reste inchangé
  
  // Charger tous les cours
  const fetchCours = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/pdfs`);
      setCours(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des cours');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les cours spécifiques à un enseignant
  const fetchEnseignantCours = async (enseignantId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/enseignants/${enseignantId}/pdfs`);
      setCours(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement de vos cours');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les cours selon le rôle
  useEffect(() => {
    if (userId) {
      if (userRole === 'enseignant') {
        fetchEnseignantCours(userId);
      } else {
        fetchCours();
      }
    }
  }, [userId, userRole]);

  // Télécharger un PDF
  const downloadPdf = async (pdfId, titre) => {
    try {
      const fileUrl = `${API_URL}/pdfs/${pdfId}/download`;
      const fileName = `${titre.replace(/\s+/g, '_')}.pdf`;
      
      // Utiliser différentes méthodes selon la plateforme
      if (Platform.OS === 'web') {
        // Pour le web, ouvrir dans un nouvel onglet
        window.open(fileUrl, '_blank');
      } else {
        // Pour mobile, télécharger avec FileSystem
        const localUri = FileSystem.documentDirectory + fileName;
        const downloadResumable = FileSystem.createDownloadResumable(
          fileUrl,
          localUri
        );
        
        const { uri } = await downloadResumable.downloadAsync();
        alert(`Fichier téléchargé à: ${uri}`);
      }
      return true;
    } catch (e) {
      console.error('Erreur lors du téléchargement:', e);
      alert('Erreur lors du téléchargement du PDF');
      return false;
    }
  };

  // Sélectionner un fichier PDF
  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return null;
      }
      
      return result.assets[0];
    } catch (e) {
      console.error('Erreur lors de la sélection du fichier:', e);
      alert('Erreur lors de la sélection du fichier');
      return null;
    }
  };

  // Ajouter un nouveau PDF
  const ajouterPdf = async (titre, file) => {
    if (!userId) {
      alert('Veuillez vous connecter pour ajouter un cours');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('utilisateur_id', userId);
      
      // Ajouter le fichier
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: 'application/pdf',
      });
      
      const response = await axios.post(`${API_URL}/pdfs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Rafraîchir la liste des cours
      if (userRole === 'enseignant') {
        await fetchEnseignantCours(userId);
      } else {
        await fetchCours();
      }
      
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du PDF:', err);
      setError('Erreur lors de l\'ajout du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un PDF
  const updatePdf = async (pdfId, titre, file = null) => {
    if (!userId) {
      alert('Veuillez vous connecter pour modifier un cours');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('utilisateur_id', userId);
      
      // Ajouter le fichier s'il y en a un nouveau
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: 'application/pdf',
        });
      }
      
      const response = await axios.put(`${API_URL}/pdfs/${pdfId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Rafraîchir la liste des cours
      if (userRole === 'enseignant') {
        await fetchEnseignantCours(userId);
      } else {
        await fetchCours();
      }
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la modification du PDF:', err);
      setError('Erreur lors de la modification du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un PDF
  const deletePdf = async (pdfId) => {
    if (!userId) {
      alert('Veuillez vous connecter pour supprimer un cours');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('utilisateur_id', userId);
      
      const response = await axios.delete(`${API_URL}/pdfs/${pdfId}`, {
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Rafraîchir la liste des cours
      if (userRole === 'enseignant') {
        await fetchEnseignantCours(userId);
      } else {
        await fetchCours();
      }
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du PDF:', err);
      setError('Erreur lors de la suppression du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    cours,
    loading,
    error,
    userRole,
    fetchCours,
    fetchEnseignantCours,
    downloadPdf,
    pickPdf,
    ajouterPdf,
    updatePdf,
    deletePdf,
  };
};*/}
{/*import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';

const API_URL = 'http://192.168.1.7:5000/api'; // Pour Android
// Utiliser http://localhost:5000 pour iOS

export const useCours = () => {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('etudiant'); // Par défaut
  const [userId, setUserId] = useState(1); // Défini à 5 par défaut

  // Récupérer le rôle et l'ID de l'utilisateur au chargement
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        const id = await AsyncStorage.getItem('userId');
        if (role) setUserRole(role);
        if (id) setUserId(parseInt(id));
      } catch (e) {
        console.error('Erreur lors de la récupération des infos utilisateur:', e);
      }
    };

    getUserInfo();
  }, []);
  
  // Charger tous les cours
  const fetchCours = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/pdfs`);
      setCours(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des cours');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les cours spécifiques à un enseignant
  const fetchEnseignantCours = async (enseignantId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/enseignants/${enseignantId}/pdfs`);
      setCours(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement de vos cours');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les cours selon le rôle
  useEffect(() => {
    if (userId) {
      if (userRole === 'enseignant') {
        fetchEnseignantCours(userId);
      } else {
        fetchCours();
      }
    }
  }, [userId, userRole]);

  // Visualiser un PDF directement dans le navigateur ou l'application
  const viewPdf = async (pdfId, titre) => {
    try {
      // URL spécifique pour la visualisation (pas pour le téléchargement)
      const fileUrl = `${API_URL}/pdfs/${pdfId}/view`;
      
      if (Platform.OS === 'web') {
        // Pour le web, ouvrir dans un nouvel onglet avec l'API correcte
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Pour mobile, utiliser WebBrowser avec le paramètre 'presentationStyle'
        // qui aide à l'affichage en mode visualisation
        await WebBrowser.openBrowserAsync(fileUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
          controlsColor: '#007AFF',
          toolbarColor: '#F5F5F5',
          enableBarCollapsing: true,
        });
      }
      return true;
    } catch (e) {
      console.error('Erreur lors de l\'affichage du PDF:', e);
      alert('Erreur lors de l\'affichage du PDF');
      return false;
    }
  };

  // Télécharger un PDF
  const downloadPdf = async (pdfId, titre) => {
    try {
      // URL spécifique pour le téléchargement
      const fileUrl = `${API_URL}/pdfs/${pdfId}/download`;
      const fileName = `${titre.replace(/\s+/g, '_')}.pdf`;
      
      if (Platform.OS === 'web') {
        // Pour le web, créer un lien de téléchargement temporaire
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName; // Force le téléchargement
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Pour mobile, télécharger avec FileSystem
        const localUri = FileSystem.documentDirectory + fileName;
        const downloadResumable = FileSystem.createDownloadResumable(
          fileUrl,
          localUri
        );
        
        const { uri } = await downloadResumable.downloadAsync();
        alert(`Fichier téléchargé à: ${uri}`);
      }
      return true;
    } catch (e) {
      console.error('Erreur lors du téléchargement:', e);
      alert('Erreur lors du téléchargement du PDF');
      return false;
    }
  };

  // Sélectionner un fichier PDF
  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return null;
      }
      
      return result.assets[0];
    } catch (e) {
      console.error('Erreur lors de la sélection du fichier:', e);
      alert('Erreur lors de la sélection du fichier');
      return null;
    }
  };

  // Ajouter un nouveau PDF
  const ajouterPdf = async (titre, file) => {
    if (!userId) {
      alert('Veuillez vous connecter pour ajouter un cours');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('utilisateur_id', userId);
      
      // Ajouter le fichier
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: 'application/pdf',
      });
      
      const response = await axios.post(`${API_URL}/pdfs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Rafraîchir la liste des cours
      if (userRole === 'enseignant') {
        await fetchEnseignantCours(userId);
      } else {
        await fetchCours();
      }
      
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du PDF:', err);
      setError('Erreur lors de l\'ajout du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un PDF
  const updatePdf = async (pdfId, titre, file = null) => {
    if (!userId) {
      alert('Veuillez vous connecter pour modifier un cours');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('utilisateur_id', userId);
      
      // Ajouter le fichier s'il y en a un nouveau
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: 'application/pdf',
        });
      }
      
      const response = await axios.put(`${API_URL}/pdfs/${pdfId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Rafraîchir la liste des cours
      if (userRole === 'enseignant') {
        await fetchEnseignantCours(userId);
      } else {
        await fetchCours();
      }
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la modification du PDF:', err);
      setError('Erreur lors de la modification du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un PDF
  const deletePdf = async (pdfId) => {
    if (!userId) {
      alert('Veuillez vous connecter pour supprimer un cours');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('utilisateur_id', userId);
      
      const response = await axios.delete(`${API_URL}/pdfs/${pdfId}`, {
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Rafraîchir la liste des cours
      if (userRole === 'enseignant') {
        await fetchEnseignantCours(userId);
      } else {
        await fetchCours();
      }
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du PDF:', err);
      setError('Erreur lors de la suppression du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    cours,
    loading,
    error,
    userRole,
    fetchCours,
    fetchEnseignantCours,
    downloadPdf,
    viewPdf,
    pickPdf,
    ajouterPdf,
    updatePdf,
    deletePdf,
  };
};*/}
{/*import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';

const API_URL = Platform.OS === 'android' 
  ? 'http://192.168.1.7:5000/api' 
  : 'http://localhost:5000/api'; // URL dynamique selon la plateforme

export const useCours = () => {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('enseignant'); // Par défaut
  const [userId, setUserId] = useState(5); // Initialiser à null plutôt qu'à une valeur par défaut

  // Récupérer le rôle et l'ID de l'utilisateur au chargement
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        const id = await AsyncStorage.getItem('userId');
        if (role) setUserRole(role);
        if (id) setUserId(parseInt(id));
      } catch (e) {
        console.error('Erreur lors de la récupération des infos utilisateur:', e);
      } finally {
        // Même si l'identification échoue, nous commençons à charger les cours disponibles
        // car certains cours peuvent être publics
        if (userRole === 'enseignant' && userId) {
          fetchEnseignantCours(userId);
        } else {
          fetchCours();
        }
      }
    };

    getUserInfo();
  }, []); // Dépendances vides - exécution uniquement au montage

  // Effet pour recharger les cours lorsque l'utilisateur ou le rôle change
  useEffect(() => {
    if (userId) {
      if (userRole === 'enseignant') {
        fetchEnseignantCours(userId);
      } else {
        fetchCours();
      }
    }
  }, [userId, userRole]);

  // Charger tous les cours
  const fetchCours = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/pdfs`);
      setCours(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des cours');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les cours spécifiques à un enseignant
  const fetchEnseignantCours = async (enseignantId) => {
    if (!enseignantId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/enseignants/${enseignantId}/pdfs`);
      setCours(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement de vos cours');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Visualiser un PDF directement dans le navigateur ou l'application
  const viewPdf = async (pdfId, titre) => {
    try {
      // URL spécifique pour la visualisation (pas pour le téléchargement)
      const fileUrl = `${API_URL}/pdfs/${pdfId}/view`;
      
      if (Platform.OS === 'web') {
        // Pour le web, ouvrir dans un nouvel onglet avec l'API correcte
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Pour mobile, utiliser WebBrowser avec le paramètre 'presentationStyle'
        await WebBrowser.openBrowserAsync(fileUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
          controlsColor: '#007AFF',
          toolbarColor: '#F5F5F5',
          enableBarCollapsing: true,
        });
      }
      return true;
    } catch (e) {
      console.error('Erreur lors de l\'affichage du PDF:', e);
      alert('Erreur lors de l\'affichage du PDF');
      return false;
    }
  };

  // Télécharger un PDF
  const downloadPdf = async (pdfId, titre) => {
    try {
      // URL spécifique pour le téléchargement
      const fileUrl = `${API_URL}/pdfs/${pdfId}/download`;
      const fileName = `${titre.replace(/\s+/g, '_')}.pdf`;
      
      if (Platform.OS === 'web') {
        // Pour le web, créer un lien de téléchargement temporaire
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName; // Force le téléchargement
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Pour mobile, télécharger avec FileSystem
        const localUri = FileSystem.documentDirectory + fileName;
        const downloadResumable = FileSystem.createDownloadResumable(
          fileUrl,
          localUri
        );
        
        const { uri } = await downloadResumable.downloadAsync();
        alert(`Fichier téléchargé à: ${uri}`);
      }
      return true;
    } catch (e) {
      console.error('Erreur lors du téléchargement:', e);
      alert('Erreur lors du téléchargement du PDF');
      return false;
    }
  };

  // Sélectionner un fichier PDF
  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return null;
      }
      
      return result.assets[0];
    } catch (e) {
      console.error('Erreur lors de la sélection du fichier:', e);
      alert('Erreur lors de la sélection du fichier');
      return null;
    }
  };

  // Ajouter un nouveau PDF
  const ajouterPdf = async (titre, file) => {
    if (!userId) {
      alert('Veuillez vous connecter pour ajouter un cours');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('utilisateur_id', userId);
      
      // Ajouter le fichier
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name || 'document.pdf',
          type: 'application/pdf',
        });
      } else {
        throw new Error('Aucun fichier sélectionné');
      }
      
      const response = await axios.post(`${API_URL}/pdfs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Rafraîchir la liste des cours après l'ajout
      if (userRole === 'enseignant') {
        await fetchEnseignantCours(userId);
      } else {
        await fetchCours();
      }
      
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du PDF:', err);
      setError(err.message || 'Erreur lors de l\'ajout du cours');
      alert(err.message || 'Erreur lors de l\'ajout du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un PDF
  const updatePdf = async (pdfId, titre, file = null) => {
    if (!userId) {
      alert('Veuillez vous connecter pour modifier un cours');
      return false;
    }

    if (!pdfId) {
      alert('Identifiant du cours manquant');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('utilisateur_id', userId);
      
      // Ajouter le fichier s'il y en a un nouveau
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name || 'document.pdf',
          type: 'application/pdf',
        });
      }
      
      const response = await axios.put(`${API_URL}/pdfs/${pdfId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Rafraîchir la liste des cours après la modification
      if (userRole === 'enseignant') {
        await fetchEnseignantCours(userId);
      } else {
        await fetchCours();
      }
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la modification du PDF:', err);
      setError(err.message || 'Erreur lors de la modification du cours');
      alert(err.message || 'Erreur lors de la modification du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un PDF
  const deletePdf = async (pdfId) => {
    if (!userId) {
      alert('Veuillez vous connecter pour supprimer un cours');
      return false;
    }

    if (!pdfId) {
      alert('Identifiant du cours manquant');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('utilisateur_id', userId);
      
      await axios.delete(`${API_URL}/pdfs/${pdfId}`, {
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Rafraîchir la liste des cours après la suppression
      if (userRole === 'enseignant') {
        await fetchEnseignantCours(userId);
      } else {
        await fetchCours();
      }
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du PDF:', err);
      setError(err.message || 'Erreur lors de la suppression du cours');
      alert(err.message || 'Erreur lors de la suppression du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Retourner toutes les fonctions et états nécessaires
  return {
    cours,
    loading,
    error,
    userRole,
    userId,
    fetchCours,
    fetchEnseignantCours,
    downloadPdf,
    viewPdf,
    pickPdf,
    ajouterPdf,
    updatePdf,
    deletePdf,
  };
};*/}{/*
import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import { API_URL } from '../config';

// Créer une instance axios avec la configuration par défaut
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token et les informations utilisateur à chaque requête
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userStr = await AsyncStorage.getItem('user');
    
    console.log('Configuration de la requête:');
    console.log('Token présent:', !!token);
    console.log('User présent:', !!userStr);
    
    if (token) {
      // S'assurer que le token est correctement formaté
      const cleanToken = String(token).replace(/^"(.*)"$/, '$1');
      config.headers.Authorization = `Bearer ${cleanToken}`;
      console.log('Header Authorization ajouté:', config.headers.Authorization);
    } else {
      console.log('Aucun token trouvé dans AsyncStorage');
    }
    
    if (userStr) {
      const userData = JSON.parse(userStr);
      config.headers['X-User-Type'] = userData.type;
      config.headers['X-User-ID'] = userData.id;
      console.log('Headers utilisateur ajoutés:', {
        'X-User-Type': userData.type,
        'X-User-ID': userData.id
      });
    }
  } catch (error) {
    console.error('Erreur lors de la configuration des headers:', error);
  }
  return config;
});

// Intercepteur pour logger les réponses
api.interceptors.response.use(
  (response) => {
    console.log('Réponse reçue:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  (error) => {
    console.error('Erreur de réponse:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers
    });
    return Promise.reject(error);
  }
);

export const useCours = () => {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  // Récupérer le rôle et l'ID de l'utilisateur au chargement
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          console.log('Données utilisateur récupérées:', userData);
          setUserRole(userData.type);
          setUserId(userData.id);
        } else {
          console.log('Aucune donnée utilisateur trouvée dans AsyncStorage');
        }
      } catch (e) {
        console.error('Erreur lors de la récupération des infos utilisateur:', e);
      }
    };

    getUserInfo();
  }, []);

  // Effet pour charger les cours lorsque l'utilisateur est défini
  useEffect(() => {
    if (userId) {
      if (userRole === 'enseignant') {
        fetchEnseignantCours(userId);
      } else {
        fetchCours();
      }
    }
  }, [userId, userRole]);

  // Charger tous les cours
  const fetchCours = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pdfs');
      setCours(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des cours:', err);
      if (err.response) {
        console.error('Détails de l\'erreur:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
      setError('Erreur lors du chargement des cours');
    } finally {
      setLoading(false);
    }
  };

  // Charger les cours spécifiques à un enseignant
  const fetchEnseignantCours = async (enseignantId) => {
    if (!enseignantId) {
      console.log('ID enseignant manquant');
      return;
    }
    
    setLoading(true);
    try {
      // Ajouter un paramètre timestamp pour éviter le cache
      const timestamp = new Date().getTime();
      const response = await api.get(`/enseignants/${enseignantId}/pdfs?t=${timestamp}`);
      
      if (response.data) {
        console.log('Cours récupérés:', response.data);
        setCours(response.data);
        setError(null);
      } else {
        console.error('Aucune donnée reçue du serveur');
        setError('Aucune donnée reçue du serveur');
      }
    } catch (err) {
      console.error('Erreur lors du chargement de vos cours:', err);
      if (err.response) {
        console.error('Détails de l\'erreur:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
      setError('Erreur lors du chargement de vos cours');
    } finally {
      setLoading(false);
    }
  };

  // Visualiser un PDF
  const viewPdf = async (pdfId, titre) => {
    try {
      // Ajouter un timestamp pour éviter le cache
      const timestamp = new Date().getTime();
      const fileUrl = `${API_URL}/pdfs/${pdfId}/view?t=${timestamp}`;
      
      if (Platform.OS === 'web') {
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
      } else {
        await WebBrowser.openBrowserAsync(fileUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
          controlsColor: '#007AFF',
          toolbarColor: '#F5F5F5',
          enableBarCollapsing: true,
        });
      }
      return true;
    } catch (e) {
      console.error('Erreur lors de l\'affichage du PDF:', e);
      return false;
    }
  };

  // Télécharger un PDF
  const downloadPdf = async (pdfId, titre) => {
    try {
      const fileUrl = `${API_URL}/pdfs/${pdfId}/download`;
      const fileName = `${titre.replace(/\s+/g, '_')}.pdf`;
      
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const localUri = FileSystem.documentDirectory + fileName;
        const downloadResumable = FileSystem.createDownloadResumable(
          fileUrl,
          localUri
        );
        
        const { uri } = await downloadResumable.downloadAsync();
        alert(`Fichier téléchargé à: ${uri}`);
      }
      return true;
    } catch (e) {
      console.error('Erreur lors du téléchargement:', e);
      return false;
    }
  };

  // Sélectionner un fichier PDF
  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return null;
      }
      
      return result.assets[0];
    } catch (e) {
      console.error('Erreur lors de la sélection du fichier:', e);
      return null;
    }
  };

  // Ajouter un nouveau PDF
  const ajouterPdf = async (titre, file) => {
    if (!userId) {
      console.error('ID utilisateur manquant');
      return false;
    }

    if (userRole !== 'enseignant') {
      console.error('Accès refusé. Rôle enseignant requis');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('utilisateur_id', userId);
      
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name || 'document.pdf',
          type: 'application/pdf',
        });
      } else {
        throw new Error('Aucun fichier sélectionné');
      }
      
      const response = await api.post('/pdfs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (userRole === 'enseignant') {
        await fetchEnseignantCours(userId);
      } else {
        await fetchCours();
      }
      
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du PDF:', err);
      if (err.response) {
        console.error('Détails de l\'erreur:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
      setError(err.message || 'Erreur lors de l\'ajout du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un PDF
  const updatePdf = async (pdfId, titre, file = null) => {
    if (!userId) {
      console.error('ID utilisateur manquant');
      return false;
    }

    if (userRole !== 'enseignant') {
      console.error('Accès refusé. Rôle enseignant requis');
      return false;
    }

    if (!pdfId) {
      console.error('ID PDF manquant');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('utilisateur_id', userId);
      
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name || 'document.pdf',
          type: 'application/pdf',
        });
      }
      
      const response = await api.put(`/pdfs/${pdfId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Attendre un court instant pour s'assurer que le serveur a terminé le traitement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Rafraîchir la liste des cours
      if (userRole === 'enseignant') {
        await fetchEnseignantCours(userId);
      } else {
        await fetchCours();
      }
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la modification du PDF:', err);
      if (err.response) {
        console.error('Détails de l\'erreur:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
      setError(err.message || 'Erreur lors de la modification du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un PDF
  const deletePdf = async (pdfId) => {
    if (!userId) {
      console.error('ID utilisateur manquant');
      return false;
    }

    if (userRole !== 'enseignant') {
      console.error('Accès refusé. Rôle enseignant requis');
      return false;
    }

    if (!pdfId) {
      console.error('ID PDF manquant');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('utilisateur_id', userId);
      
      await api.delete(`/pdfs/${pdfId}`, {
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (userRole === 'enseignant') {
        await fetchEnseignantCours(userId);
      } else {
        await fetchCours();
      }
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du PDF:', err);
      if (err.response) {
        console.error('Détails de l\'erreur:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
      setError(err.message || 'Erreur lors de la suppression du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    cours,
    loading,
    error,
    userRole,
    userId,
    fetchCours,
    fetchEnseignantCours,
    downloadPdf,
    viewPdf,
    pickPdf,
    ajouterPdf,
    updatePdf,
    deletePdf,
  };
};*/}{/*
import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import { API_URL } from '../config';

// Axios instance avec intercepteur pour le token
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    const cleanToken = String(token).replace(/^"(.*)"$/, '$1');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

export const useCours = () => {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  // Récupérer le rôle et l'ID de l'utilisateur connecté
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUserRole(userData.type);
          setUserId(userData.id);
        } else {
          setUserRole(null);
          setUserId(null);
        }
      } catch (e) {
        setUserRole(null);
        setUserId(null);
        console.error('Erreur lors de la récupération des infos utilisateur:', e);
      }
    };
    getUserInfo();
  }, []);

  // Charger les cours selon le rôle
  useEffect(() => {
    if (userRole && userId) {
      if (userRole === 'enseignant') {
        fetchEnseignantCours(userId);
      } else if (userRole === 'etudiant') {
        fetchCours();
      }
    }
  }, [userId, userRole]);

  // Charger tous les cours (pour les étudiants)
  const fetchCours = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pdfs');
      setCours(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des cours');
      setCours([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les cours spécifiques à un enseignant
  const fetchEnseignantCours = async (enseignantId) => {
    if (!enseignantId) return;
    setLoading(true);
    try {
      const response = await api.get(`/enseignants/${enseignantId}/pdfs`);
      setCours(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement de vos cours');
      setCours([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Visualiser un PDF
  
  const viewPdf = async (pdfId, titre) => {
    try {
      let fileUrl = `${API_URL}/pdfs/${pdfId}/view?t=${Date.now()}`;
      if (Platform.OS === 'web') {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          fileUrl += `&token=${encodeURIComponent(token.replace(/^"(.*)"$/, '$1'))}`;
        }
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
      } else {
        await WebBrowser.openBrowserAsync(fileUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
        });
      }
      return true;
    } catch (e) {
      console.error('Erreur lors de l\'affichage du PDF:', e);
      return false;
    }
  };

  // Télécharger un PDF
  const downloadPdf = async (pdfId, titre) => {
    try {
      let fileUrl = `${API_URL}/pdfs/${pdfId}/download`;
      const fileName = `${titre.replace(/\s+/g, '_')}.pdf`;
      if (Platform.OS === 'web') {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          fileUrl += `?token=${encodeURIComponent(token.replace(/^"(.*)"$/, '$1'))}`;
        }
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const localUri = FileSystem.documentDirectory + fileName;
        const downloadResumable = FileSystem.createDownloadResumable(
          fileUrl,
          localUri
        );
        const { uri } = await downloadResumable.downloadAsync();
        alert(`Fichier téléchargé à: ${uri}`);
      }
      return true;
    } catch (e) {
      console.error('Erreur lors du téléchargement:', e);
      return false;
    }
  };

  // Sélectionner un fichier PDF
  const pickPdf = async () => {
    if (userRole !== 'enseignant') {
      console.error('Accès refusé. Rôle enseignant requis');
      return null;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return null;
      return result.assets[0];
    } catch (e) {
      console.error('Erreur lors de la sélection du fichier:', e);
      return null;
    }
  };

  // Ajouter un nouveau PDF
  const ajouterPdf = async (titre, file) => {
    if (!userId || userRole !== 'enseignant') {
      console.error('Accès refusé. Rôle enseignant requis');
      return false;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('utilisateur_id', userId);
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name || 'document.pdf',
          type: 'application/pdf',
        });
      } else {
        throw new Error('Aucun fichier sélectionné');
      }
      await api.post('/pdfs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchEnseignantCours(userId);
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du PDF:', err);
      setError(err.message || 'Erreur lors de l\'ajout du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un PDF
  const updatePdf = async (pdfId, titre, file = null) => {
    if (!userId || userRole !== 'enseignant') {
      console.error('Accès refusé. Rôle enseignant requis');
      return false;
    }
    if (!pdfId) {
      console.error('ID PDF manquant');
      return false;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('utilisateur_id', userId);
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name || 'document.pdf',
          type: 'application/pdf',
        });
      }
      await api.put(`/pdfs/${pdfId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchEnseignantCours(userId);
      return true;
    } catch (err) {
      console.error('Erreur lors de la modification du PDF:', err);
      setError(err.message || 'Erreur lors de la modification du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un PDF
  const deletePdf = async (pdfId) => {
    if (!userId || userRole !== 'enseignant') {
      console.error('Accès refusé. Rôle enseignant requis');
      return false;
    }
    if (!pdfId) {
      console.error('ID PDF manquant');
      return false;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('utilisateur_id', userId);
      await api.delete(`/pdfs/${pdfId}`, {
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchEnseignantCours(userId);
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du PDF:', err);
      setError(err.message || 'Erreur lors de la suppression du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Utilitaires
  const isEnseignant = () => userRole === 'enseignant';
  const isEtudiant = () => userRole === 'etudiant';
  const hasEditRights = (pdfUtilisateurId) =>
    userRole === 'enseignant' && pdfUtilisateurId === userId;

  return {
    cours,
    loading,
    error,
    userRole,
    userId,
    fetchCours,
    fetchEnseignantCours,
    downloadPdf,
    viewPdf,
    pickPdf,
    ajouterPdf,
    updatePdf,
    deletePdf,
    isEnseignant,
    isEtudiant,
    hasEditRights,
  };
};*/}{/*
import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import { API_URL } from '../config';

// Axios instance avec intercepteur pour le token
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    const cleanToken = String(token).replace(/^"(.*)"$/, '$1');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

export const useCours = () => {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  // Récupérer le rôle et l'ID de l'utilisateur connecté
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUserRole(userData.type);
          setUserId(userData.id);
        } else {
          setUserRole(null);
          setUserId(null);
        }
      } catch (e) {
        setUserRole(null);
        setUserId(null);
        console.error('Erreur lors de la récupération des infos utilisateur:', e);
      }
    };
    getUserInfo();
  }, []);

  // Charger les cours selon le rôle
  useEffect(() => {
    if (userRole && userId) {
      if (userRole === 'enseignant') {
        fetchEnseignantCours(userId);
      } else if (userRole === 'etudiant') {
        fetchCours();
      }
    }
  }, [userId, userRole]);

  // Charger tous les cours (pour les étudiants)
  const fetchCours = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pdfs');
      setCours(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des cours');
      setCours([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les cours spécifiques à un enseignant
  const fetchEnseignantCours = async (enseignantId) => {
    if (!enseignantId) return;
    setLoading(true);
    try {
      const response = await api.get(`/enseignants/${enseignantId}/pdfs`);
      setCours(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement de vos cours');
      setCours([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Visualiser un PDF - CORRIGÉ pour affichage sans téléchargement
  const viewPdf = async (pdfId, titre) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const cleanToken = token ? token.replace(/^"(.*)"$/, '$1') : '';
    
    if (Platform.OS === 'web') {
      // CORRECTION: Passer le token en paramètre au lieu de l'en-tête
      const viewUrl = `${API_URL}/pdfs/${pdfId}/view?token=${encodeURIComponent(cleanToken)}&t=${Date.now()}`;
      
      const newWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${titre}</title>
            <style>
              body { margin: 0; padding: 0; overflow: hidden; }
              iframe { width: 100%; height: 100vh; border: none; }
              .error { 
                padding: 20px; 
                text-align: center; 
                font-family: Arial, sans-serif; 
                color: #666; 
              }
            </style>
          </head>
          <body>
            <iframe 
              src="${viewUrl}" 
              type="application/pdf"
              onload="console.log('PDF loaded')"
              onerror="document.body.innerHTML='<div class=error>Erreur lors du chargement du PDF</div>'"
            >
              <div class="error">
                Votre navigateur ne supporte pas l'affichage des PDFs. 
                <a href="${viewUrl}" target="_blank">Cliquez ici pour télécharger</a>
              </div>
            </iframe>
          </body>
          </html>
        `);
        newWindow.document.close();
      }
    } else {
      // CORRECTION: Pour mobile, ajouter le token en paramètre
      const viewUrl = `${API_URL}/pdfs/${pdfId}/view?token=${encodeURIComponent(cleanToken)}&t=${Date.now()}`;
      await WebBrowser.openBrowserAsync(viewUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
      });
    }
    return true;
  } catch (e) {
    console.error('Erreur lors de l\'affichage du PDF:', e);
    return false;
  }
};

// Télécharger un PDF - CORRIGÉ avec token en paramètre
const downloadPdf = async (pdfId, titre) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const cleanToken = token ? token.replace(/^"(.*)"$/, '$1') : '';
    const fileName = `${titre.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;
    
    if (Platform.OS === 'web') {
      // CORRECTION: Utiliser le token en paramètre au lieu de l'en-tête pour le téléchargement direct
      const downloadUrl = `${API_URL}/pdfs/${pdfId}/download?token=${encodeURIComponent(cleanToken)}`;
      
      try {
        // Pour le web, utiliser un lien direct avec le token en paramètre
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.target = '_blank';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } catch (fetchError) {
        console.error('Erreur lors du téléchargement:', fetchError);
        // Méthode alternative
        window.open(downloadUrl, '_blank');
      }
    } else {
      // CORRECTION: Pour mobile, ajouter le token en paramètre
      const downloadUrl = `${API_URL}/pdfs/${pdfId}/download?token=${encodeURIComponent(cleanToken)}`;
      const localUri = FileSystem.documentDirectory + fileName;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        localUri
      );
      
      const { uri } = await downloadResumable.downloadAsync();
      alert(`Fichier téléchargé à: ${uri}`);
    }
    return true;
  } catch (e) {
    console.error('Erreur lors du téléchargement:', e);
    return false;
  }
};

  // Sélectionner un fichier PDF
  const pickPdf = async () => {
    if (userRole !== 'enseignant') {
      console.error('Accès refusé. Rôle enseignant requis');
      return null;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return null;
      return result.assets[0];
    } catch (e) {
      console.error('Erreur lors de la sélection du fichier:', e);
      return null;
    }
  };

  // Ajouter un nouveau PDF
  const ajouterPdf = async (titre, file) => {
    if (!userId || userRole !== 'enseignant') {
      console.error('Accès refusé. Rôle enseignant requis');
      return false;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('utilisateur_id', userId);
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name || 'document.pdf',
          type: 'application/pdf',
        });
      } else {
        throw new Error('Aucun fichier sélectionné');
      }
      await api.post('/pdfs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchEnseignantCours(userId);
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du PDF:', err);
      setError(err.message || 'Erreur lors de l\'ajout du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un PDF
  const updatePdf = async (pdfId, titre, file = null) => {
    if (!userId || userRole !== 'enseignant') {
      console.error('Accès refusé. Rôle enseignant requis');
      return false;
    }
    if (!pdfId) {
      console.error('ID PDF manquant');
      return false;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('utilisateur_id', userId);
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name || 'document.pdf',
          type: 'application/pdf',
        });
      }
      await api.put(`/pdfs/${pdfId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchEnseignantCours(userId);
      return true;
    } catch (err) {
      console.error('Erreur lors de la modification du PDF:', err);
      setError(err.message || 'Erreur lors de la modification du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un PDF
  const deletePdf = async (pdfId) => {
    if (!userId || userRole !== 'enseignant') {
      console.error('Accès refusé. Rôle enseignant requis');
      return false;
    }
    if (!pdfId) {
      console.error('ID PDF manquant');
      return false;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('utilisateur_id', userId);
      await api.delete(`/pdfs/${pdfId}`, {
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchEnseignantCours(userId);
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du PDF:', err);
      setError(err.message || 'Erreur lors de la suppression du cours');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Utilitaires
  const isEnseignant = () => userRole === 'enseignant';
  const isEtudiant = () => userRole === 'etudiant';
  const hasEditRights = (pdfUtilisateurId) =>
    userRole === 'enseignant' && pdfUtilisateurId === userId;

  return {
    cours,
    loading,
    error,
    userRole,
    userId,
    fetchCours,
    fetchEnseignantCours,
    downloadPdf,
    viewPdf,
    pickPdf,
    ajouterPdf,
    updatePdf,
    deletePdf,
    isEnseignant,
    isEtudiant,
    hasEditRights,
  };
};

export { api };*/}
import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

// Axios instance avec intercepteur pour le token
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    const cleanToken = String(token).replace(/^"(.*)"$/, '$1');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

export const useCours = () => {
  const { isLoggedIn, user, logout } = useAuth();
  
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  // Récupérer le rôle et l'ID de l'utilisateur connecté
  useEffect(() => {
    const getUserInfo = async () => {
      // Vérifier d'abord si l'utilisateur est connecté
      if (!isLoggedIn) {
        setUserRole(null);
        setUserId(null);
        setError("Vous devez être connecté pour accéder aux cours");
        setCours([]);
        return;
      }

      try {
        // Priorité au contexte user
        if (user && user.id && user.type) {
          setUserRole(user.type);
          setUserId(user.id);
          return;
        }

        // Fallback vers AsyncStorage
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData.id && userData.type) {
            setUserRole(userData.type);
            setUserId(userData.id);
          } else {
            throw new Error("Données utilisateur incomplètes");
          }
        } else {
          throw new Error("Aucune donnée utilisateur trouvée");
        }
      } catch (e) {
        console.error('Erreur lors de la récupération des infos utilisateur:', e);
        setUserRole(null);
        setUserId(null);
        setError("Session expirée. Veuillez vous reconnecter.");
        setCours([]);
        logout(); // Déconnecter l'utilisateur en cas d'erreur
      }
    };
    
    getUserInfo();
  }, [isLoggedIn, user, logout]);

  // Charger les cours selon le rôle
  useEffect(() => {
    if (isLoggedIn && userRole && userId) {
      if (userRole === 'enseignant') {
        fetchEnseignantCours(userId);
      } else if (userRole === 'etudiant') {
        fetchCours();
      }
    } else if (!isLoggedIn) {
      // Réinitialiser les données si l'utilisateur n'est pas connecté
      setCours([]);
      setError(null);
      setLoading(false);
    }
  }, [userId, userRole, isLoggedIn]);

  // Charger tous les cours (pour les étudiants)
  const fetchCours = async () => {
    if (!isLoggedIn || !userId || userRole !== 'etudiant') {
      setError("Accès refusé. Vous devez être connecté en tant qu'étudiant.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/pdfs');
      setCours(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des cours:', err);
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        logout();
      } else {
        setError('Erreur lors du chargement des cours');
      }
      setCours([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les cours spécifiques à un enseignant
  const fetchEnseignantCours = async (enseignantId) => {
    if (!isLoggedIn || !enseignantId || userRole !== 'enseignant') {
      setError("Accès refusé. Vous devez être connecté en tant qu'enseignant.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/enseignants/${enseignantId}/pdfs`);
      setCours(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des cours de l\'enseignant:', err);
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        logout();
      } else {
        setError('Erreur lors du chargement de vos cours');
      }
      setCours([]);
    } finally {
      setLoading(false);
    }
  };

  // Visualiser un PDF - CORRIGÉ pour affichage sans téléchargement
  const viewPdf = async (pdfId, titre) => {
    if (!isLoggedIn || !userId) {
      setError("Vous devez être connecté pour visualiser un PDF");
      return false;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const cleanToken = token ? token.replace(/^"(.*)"$/, '$1') : '';
      
      if (!cleanToken) {
        setError("Token d'authentification manquant. Veuillez vous reconnecter.");
        logout();
        return false;
      }
      
      if (Platform.OS === 'web') {
        // CORRECTION: Passer le token en paramètre au lieu de l'en-tête
        const viewUrl = `${API_URL}/pdfs/${pdfId}/view?token=${encodeURIComponent(cleanToken)}&t=${Date.now()}`;
        
        const newWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>${titre}</title>
              <style>
                body { margin: 0; padding: 0; overflow: hidden; }
                iframe { width: 100%; height: 100vh; border: none; }
                .error { 
                  padding: 20px; 
                  text-align: center; 
                  font-family: Arial, sans-serif; 
                  color: #666; 
                }
              </style>
            </head>
            <body>
              <iframe 
                src="${viewUrl}" 
                type="application/pdf"
                onload="console.log('PDF loaded')"
                onerror="document.body.innerHTML='<div class=error>Erreur lors du chargement du PDF</div>'"
              >
                <div class="error">
                  Votre navigateur ne supporte pas l'affichage des PDFs. 
                  <a href="${viewUrl}" target="_blank">Cliquez ici pour télécharger</a>
                </div>
              </iframe>
            </body>
            </html>
          `);
          newWindow.document.close();
        }
      } else {
        // CORRECTION: Pour mobile, ajouter le token en paramètre
        const viewUrl = `${API_URL}/pdfs/${pdfId}/view?token=${encodeURIComponent(cleanToken)}&t=${Date.now()}`;
        await WebBrowser.openBrowserAsync(viewUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
        });
      }
      return true;
    } catch (e) {
      console.error('Erreur lors de l\'affichage du PDF:', e);
      setError('Erreur lors de l\'affichage du PDF');
      return false;
    }
  };

  // Télécharger un PDF - CORRIGÉ avec token en paramètre
  const downloadPdf = async (pdfId, titre) => {
    if (!isLoggedIn || !userId) {
      setError("Vous devez être connecté pour télécharger un PDF");
      return false;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const cleanToken = token ? token.replace(/^"(.*)"$/, '$1') : '';
      
      if (!cleanToken) {
        setError("Token d'authentification manquant. Veuillez vous reconnecter.");
        logout();
        return false;
      }

      const fileName = `${titre.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;
      
      if (Platform.OS === 'web') {
        // CORRECTION: Utiliser le token en paramètre au lieu de l'en-tête pour le téléchargement direct
        const downloadUrl = `${API_URL}/pdfs/${pdfId}/download?token=${encodeURIComponent(cleanToken)}`;
        
        try {
          // Pour le web, utiliser un lien direct avec le token en paramètre
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = fileName;
          link.target = '_blank';
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
        } catch (fetchError) {
          console.error('Erreur lors du téléchargement:', fetchError);
          // Méthode alternative
          window.open(downloadUrl, '_blank');
        }
      } else {
        // CORRECTION: Pour mobile, ajouter le token en paramètre
        const downloadUrl = `${API_URL}/pdfs/${pdfId}/download?token=${encodeURIComponent(cleanToken)}`;
        const localUri = FileSystem.documentDirectory + fileName;
        
        const downloadResumable = FileSystem.createDownloadResumable(
          downloadUrl,
          localUri
        );
        
        const { uri } = await downloadResumable.downloadAsync();
        alert(`Fichier téléchargé à: ${uri}`);
      }
      return true;
    } catch (e) {
      console.error('Erreur lors du téléchargement:', e);
      setError('Erreur lors du téléchargement du PDF');
      return false;
    }
  };

  // Sélectionner un fichier PDF
  const pickPdf = async () => {
    if (!isLoggedIn || !userId || userRole !== 'enseignant') {
      setError('Accès refusé. Vous devez être connecté en tant qu\'enseignant.');
      return null;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return null;
      return result.assets[0];
    } catch (e) {
      console.error('Erreur lors de la sélection du fichier:', e);
      setError('Erreur lors de la sélection du fichier');
      return null;
    }
  };

  // Ajouter un nouveau PDF
  const ajouterPdf = async (titre, file) => {
    if (!isLoggedIn || !userId || userRole !== 'enseignant') {
      setError('Accès refusé. Vous devez être connecté en tant qu\'enseignant.');
      return false;
    }

    if (!file) {
      setError('Aucun fichier sélectionné');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('utilisateur_id', userId);
      formData.append('file', {
        uri: file.uri,
        name: file.name || 'document.pdf',
        type: 'application/pdf',
      });

      await api.post('/pdfs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      await fetchEnseignantCours(userId);
      setError(null);
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du PDF:', err);
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        logout();
      } else {
        setError(err.response?.data?.message || 'Erreur lors de l\'ajout du cours');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un PDF
  const updatePdf = async (pdfId, titre, file = null) => {
    if (!isLoggedIn || !userId || userRole !== 'enseignant') {
      setError('Accès refusé. Vous devez être connecté en tant qu\'enseignant.');
      return false;
    }

    if (!pdfId) {
      setError('ID PDF manquant');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('utilisateur_id', userId);
      
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name || 'document.pdf',
          type: 'application/pdf',
        });
      }

      await api.put(`/pdfs/${pdfId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      await fetchEnseignantCours(userId);
      setError(null);
      return true;
    } catch (err) {
      console.error('Erreur lors de la modification du PDF:', err);
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        logout();
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la modification du cours');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un PDF
  const deletePdf = async (pdfId) => {
    if (!isLoggedIn || !userId || userRole !== 'enseignant') {
      setError('Accès refusé. Vous devez être connecté en tant qu\'enseignant.');
      return false;
    }

    if (!pdfId) {
      setError('ID PDF manquant');
      return false;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('utilisateur_id', userId);
      
      await api.delete(`/pdfs/${pdfId}`, {
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      await fetchEnseignantCours(userId);
      setError(null);
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du PDF:', err);
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        logout();
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la suppression du cours');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Utilitaires
  const isEnseignant = () => isLoggedIn && userRole === 'enseignant';
  const isEtudiant = () => isLoggedIn && userRole === 'etudiant';
  const hasEditRights = (pdfUtilisateurId) =>
    isLoggedIn && userRole === 'enseignant' && pdfUtilisateurId === userId;

  // Fonction pour rafraîchir les données
  const refreshData = async () => {
    if (!isLoggedIn || !userId || !userRole) {
      setError("Vous devez être connecté pour rafraîchir les données");
      return;
    }

    if (userRole === 'enseignant') {
      await fetchEnseignantCours(userId);
    } else if (userRole === 'etudiant') {
      await fetchCours();
    }
  };

  return {
    cours,
    loading,
    error,
    userRole,
    userId,
    isLoggedIn,
    fetchCours,
    fetchEnseignantCours,
    downloadPdf,
    viewPdf,
    pickPdf,
    ajouterPdf,
    updatePdf,
    deletePdf,
    isEnseignant,
    isEtudiant,
    hasEditRights,
    refreshData,
    setError,
  };
};

export { api };
import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../app/i18n';

// Configuration de base pour l'API - URL générique à adapter
const API_BASE_URL = 'http://192.168.1.10:5000/api';

/**
 * Hook pour gérer les fonctionnalités de traduction
 */
export const useTraduction = () => {
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [etudiantId, setEtudiantId] = useState(null);
  const [originalText, setOriginalText] = useState(''); // Stocke le texte original pour affichage
  const [fileName, setFileName] = useState(null); // Stocke le nom du fichier sélectionné
  const { isLoggedIn, user, logout } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const getEtudiantId = async () => {
      if (!isLoggedIn) {
        setEtudiantId(null);
        return;
      }

      try {
        // Essayez d'abord de récupérer depuis AsyncStorage
        let id = await AsyncStorage.getItem('etudiantId');
        
        // Si pas trouvé dans AsyncStorage, essayez depuis l'objet user
        if (!id && user) {
          // Vérifiez différentes propriétés possibles
          const userId = user.id || user.etudiant_id || user.userId || user.studentId;
          
          // Assurez-vous que l'ID est une chaîne ou un nombre valide
          if (userId !== null && userId !== undefined) {
            id = String(userId); // Conversion explicite en chaîne
            
            // Si trouvé, sauvegardez-le dans AsyncStorage pour la prochaine fois
            await AsyncStorage.setItem('etudiantId', id);
          }
        }
        
        // Validation finale de l'ID
        if (id && id !== 'null' && id !== 'undefined' && id.trim() !== '') {
          console.log('ID étudiant trouvé:', id);
          setEtudiantId(id);
        } else {
          console.warn('Aucun ID étudiant valide trouvé');
          setEtudiantId(null);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'ID étudiant', err);
        setEtudiantId(null);
      }
    };
    
    getEtudiantId();
  }, [isLoggedIn, user]);

  // Traduire un texte
  const translateText = useCallback(async (text, sourceLanguage, targetLanguage) => {
    if (!isLoggedIn) {
      console.warn('Utilisateur non connecté');
      setError('Vous devez être connecté pour effectuer une traduction');
      Alert.alert('Accès refusé', 'Vous devez être connecté pour effectuer une traduction');
      return null;
    }

    if (!etudiantId) {
      console.warn('Impossible de traduire: aucun ID étudiant');
      setError('Utilisateur non identifié');
      Alert.alert('Erreur', 'Identifiant utilisateur manquant');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setOriginalText(text); // Sauvegarde du texte original
    setFileName(null); // Réinitialisation du nom de fichier
    
    try {
      console.log('Envoi de la requête de traduction:', { text, sourceLanguage, targetLanguage, etudiantId });
      const response = await axios.post(`${API_BASE_URL}/traduction/traduire-texte`, {
        texte: text,
        langue_source: sourceLanguage,
        langue_cible: targetLanguage,
        etudiant_id: etudiantId
      });
      
      if (response.data && response.data.success) {
        console.log('Réponse de traduction reçue:', response.data.traduction);
        setTranslatedText(response.data.traduction.contenu_traduit);
        return response.data.traduction;
      } else {
        throw new Error((response.data && response.data.message) || 'Erreur lors de la traduction');
      }
    } catch (err) {
      console.error('Erreur détaillée lors de la traduction:', err);
      setError(err.message || 'Une erreur est survenue');
      Alert.alert('Erreur', err.message || 'Une erreur est survenue lors de la traduction');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, etudiantId]);

  // Traduire un fichier
  const translateFile = useCallback(async (file, sourceLanguage, targetLanguage) => {
    if (!isLoggedIn) {
      console.warn('Utilisateur non connecté');
      setError('Vous devez être connecté pour effectuer une traduction');
      Alert.alert('Accès refusé', 'Vous devez être connecté pour effectuer une traduction');
      return null;
    }

    if (!etudiantId) {
      console.warn('Impossible de traduire le fichier: aucun ID étudiant');
      setError('Utilisateur non identifié');
      Alert.alert('Erreur', 'Identifiant utilisateur manquant');
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    // Log complet des informations du fichier pour déboguer
    console.log('File object to translate:', JSON.stringify(file, null, 2));
    
    try {
      // Récupérer le nom du fichier de manière fiable
      const fileName = file.name || (file.assets && file.assets[0]?.name) || 'document.pdf';
      setOriginalText(`Fichier: ${fileName}`);
      setFileName(fileName);
      
      // Créer FormData pour l'upload
      const formData = new FormData();
      
      // Récupérer l'URI du fichier selon la structure retournée par DocumentPicker
      let fileUri = '';
      let fileType = '';
      
      // Nouveau format de DocumentPicker (Expo SDK 47+)
      if (file.assets && file.assets.length > 0) {
        fileUri = file.assets[0].uri;
        fileType = file.assets[0].mimeType || 'application/pdf';
      } 
      // Ancien format de DocumentPicker
      else if (file.uri) {
        fileUri = file.uri;
        fileType = file.mimeType || file.type || 'application/pdf';
      }
      else {
        throw new Error('Format de fichier invalide ou non supporté');
      }
      
      if (!fileUri) {
        throw new Error('URI de fichier manquant');
      }
      
      // Créer un objet pour append dans FormData
      const fileObject = {
        uri: fileUri,
        name: fileName,
        type: fileType
      };
      
      console.log('Preparing file upload with:', fileObject);
      
      // Ajouter le fichier et les paramètres à FormData
      formData.append('fichier', fileObject);
      formData.append('langue_source', sourceLanguage);
      formData.append('langue_cible', targetLanguage);
      formData.append('etudiant_id', etudiantId);
      
      console.log('Sending request with formData params:', {
        source: sourceLanguage,
        target: targetLanguage,
        student: etudiantId
      });
      
      // Utiliser fetch plutôt qu'axios pour plus de fiabilité avec FormData sur React Native
      const response = await fetch(`${API_BASE_URL}/traduction/traduire-pdf`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
          // Ne pas définir Content-Type pour permettre au fetch de configurer le bon boundary
        }
      });
      
      if (!response.ok) {
        // Traiter les codes d'erreur HTTP
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur serveur: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('API response received:', responseData);
      
      if (responseData && responseData.success) {
        console.log('Traduction réussie!');
        
        // Assurez-vous d'avoir le contenu traduit complet
        const translatedContent = responseData.traduction.contenu_traduit;
        
        // Log pour debug
        console.log('Longueur du contenu traduit:', translatedContent?.length || 0);
        
        // Définir le contenu traduit
        setTranslatedText(translatedContent || 'Aucun contenu traduit disponible');
        
        return responseData.traduction;
      } else {
        throw new Error((responseData && responseData.message) || 'Erreur lors de la traduction du fichier');
      }
    } catch (err) {
      console.error('Erreur lors de la traduction du fichier:', err);
      
      let errorMessage = 'Une erreur est survenue lors de la traduction du fichier';
      
      // Messages d'erreur plus spécifiques selon le type d'erreur
      if (err.message.includes('Network') || err.message.includes('connexion')) {
        errorMessage = `Erreur de connexion au serveur (${API_BASE_URL}). Vérifiez votre connexion réseau.`;
      } else if (err.message.includes('timed out')) {
        errorMessage = 'Le temps de réponse du serveur a expiré. Le fichier est peut-être trop volumineux.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, etudiantId]);

  // Réinitialiser la traduction
  const resetTranslation = useCallback(() => {
    setTranslatedText('');
    setOriginalText('');
    setFileName(null);
    setError(null);
  }, []);

  return {
    translatedText,
    originalText,
    fileName,
    isLoading,
    error,
    translateText,
    translateFile,
    resetTranslation,
    setTranslatedText,
    setOriginalText,
    setFileName,
    etudiantId,
    isLoggedIn // Ajout pour permettre la vérification externe
  };
};

/**
 * Hook pour gérer la sidebar et l'historique des traductions
 */
export const useSidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [histories, setHistories] = useState([]);
    const [isLoadingHistories, setIsLoadingHistories] = useState(false);
    const [etudiantId, setEtudiantId] = useState(null);
    const { isLoggedIn, user, logout } = useAuth();
    
    // Récupérer l'ID de l'étudiant au chargement
    useEffect(() => {
      const getEtudiantId = async () => {
        // Vérifier d'abord l'authentification
        if (!isLoggedIn) {
          setEtudiantId(null);
          setHistories([]);
          return;
        }

        try {
          const id = await AsyncStorage.getItem('etudiantId');
          if (id) {
            setEtudiantId(id);
            // Charger l'historique une fois l'ID récupéré
            fetchHistories(id);
          } else {
            console.warn('Aucun ID étudiant trouvé dans le stockage');
            setEtudiantId(null);
          }
        } catch (err) {
          console.error('Erreur lors de la récupération de l\'ID étudiant', err);
          setEtudiantId(null);
        }
      };
      
      getEtudiantId();
    }, [isLoggedIn]);
  
    // Récupérer l'historique des traductions
    const fetchHistories = useCallback(async (id = null) => {
      // Vérifier l'authentification avant tout
      if (!isLoggedIn) {
        console.warn('Utilisateur non connecté');
        setHistories([]);
        return;
      }

      const studentId = id || etudiantId;
      
      // Ne pas faire d'appel API si pas d'ID étudiant
      if (!studentId) {
        console.warn('Impossible de charger l\'historique: aucun ID étudiant');
        setHistories([]);
        return;
      }

      setIsLoadingHistories(true);
      
      try {
        console.log(`Récupération de l'historique pour l'étudiant ${studentId}`);
        
        // URL modifiée pour inclure l'ID étudiant
        const response = await axios.get(`${API_BASE_URL}/traduction/traductions/etudiant/${studentId}`);
        
        if (response.data && response.data.success) {
          console.log('Historique récupéré avec succès:', response.data.traductions?.length || 0, 'éléments');
          setHistories(response.data.traductions || []);
        } else {
          console.error('Erreur lors de la récupération de l\'historique:', response.data?.message);
          setHistories([]);
        }
      } catch (err) {
        console.error('Erreur détaillée lors de la récupération de l\'historique:', err);
        setHistories([]);
      } finally {
        setIsLoadingHistories(false);
      }
    }, [isLoggedIn, etudiantId]);

  // Sélectionner une traduction depuis l'historique
  const selectHistory = useCallback(async (translationId) => {
    try {
      console.log(`Récupération de la traduction ${translationId}...`);
      const response = await axios.get(`${API_BASE_URL}/traduction/traductions/${translationId}`);
      
      if (response.data && response.data.success) {
        console.log('Détails de la traduction récupérés:', response.data.traduction);
        return response.data.traduction;
      } else {
        throw new Error((response.data && response.data.message) || 'Impossible de récupérer cette traduction');
      }
    } catch (err) {
      console.error('Erreur détaillée lors de la récupération de la traduction:', err);
      Alert.alert('Erreur', 'Impossible de récupérer cette traduction');
      return null;
    }
  }, []);

  // Basculer l'état de la sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);
  
  const deleteTraduction = useCallback(async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/traduction/traductions/${id}`);
      // Rafraîchir la liste des traductions après suppression
      if (response.data && response.data.success) {
        // Rafraîchir immédiatement l'historique
        fetchHistories();
        return true;
      } else {
        throw new Error((response.data && response.data.message) || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la traduction:', error);
      
      // Version sécurisée pour gérer l'alerte
      if (Platform.OS === 'web') {
        // Pour le web, utilisez window.alert
        if (typeof window !== 'undefined' && window.alert) {
          window.alert('Impossible de supprimer la traduction');
        } else {
          console.error('Impossible de supprimer la traduction');
        }
      } else {
        // Pour les plateformes mobiles, vérifiez si Alert est disponible
        if (typeof Alert !== 'undefined' && Alert.alert) {
          Alert.alert('Erreur', 'Impossible de supprimer la traduction');
        } else {
          console.error('Impossible de supprimer la traduction');
        }
      }
      
      return false;
    }
  }, [fetchHistories]);
  
  return {
    isSidebarOpen,
    histories,
    isLoadingHistories,
    toggleSidebar,
    fetchHistories,
    selectHistory,
    deleteTraduction,
    etudiantId,
    isLoggedIn // Ajout pour permettre la vérification externe
  };
};

/**
 * Hook pour gérer les langues disponibles
 */
export const useLanguages = () => {
  const { t } = useLanguage();
  // Utiliser une liste statique de langues au lieu de faire un appel API
  {/*const [availableLanguages] = useState([
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'Anglais' },
    { code: 'es', name: 'Espagnol' },
    { code: 'de', name: 'Allemand' },
    { code: 'it', name: 'Italien' },
    { code: 'pt', name: 'Portugais' },
    { code: 'nl', name: 'Néerlandais' },
    { code: 'ru', name: 'Russe' },
    { code: 'ar', name: 'Arabe' },
    { code: 'zh', name: 'Chinois' },
    { code: 'ja', name: 'Japonais' }
  ]);*/}
  const [availableLanguages] = useState([
    { code: 'fr', name: t('french') },
    { code: 'en', name: t('english') },
    { code: 'es', name: t('spanish') },
    { code: 'de', name: t('german') },
    { code: 'it', name: t('italian') },
    { code: 'pt', name: t('portuguese') },
    { code: 'nl', name: t('dutch') },
    { code: 'ru', name: t('russian') },
    { code: 'ar', name: t('arabic') },
    { code: 'zh', name: t('chinese') },
    { code: 'ja', name: t('japanese') }
  ]);
  
  return {
    availableLanguages
  };
};
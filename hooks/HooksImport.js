import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.10:5000/api';

export const useImportUsers = () => {
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importError, setImportError] = useState(null);

  // Fonction utilitaire pour récupérer le token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token récupéré:', token ? 'Token présent' : 'Pas de token');
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      return token;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      throw error;
    }
  };

  // Fonction utilitaire pour gérer les erreurs HTTP
  const handleHttpError = (response, result) => {
    console.log('Gestion erreur HTTP:', response.status, result);
    
    switch (response.status) {
      case 401:
        return 'Session expirée. Reconnectez-vous.';
      case 403:
        return 'Accès refusé. Droits administrateur requis.';
      case 413:
        return 'Fichier trop volumineux. Taille maximale: 5MB';
      case 400:
        return result?.message || 'Requête invalide';
      case 500:
        return 'Erreur serveur. Réessayez plus tard.';
      default:
        return result?.message || `Erreur HTTP ${response.status}`;
    }
  };

  // Ouvrir/fermer le modal d'import
  const openImportModal = () => {
    setIsImportModalVisible(true);
    setImportResult(null);
    setImportError(null);
    setSelectedFile(null);
  };

  const closeImportModal = () => {
    setIsImportModalVisible(false);
    setImportResult(null);
    setImportError(null);
    setSelectedFile(null);
  };

  // SÉLECTION DE FICHIER CORRIGÉE
  const selectFile = async () => {
    try {
      console.log('Démarrage de la sélection de fichier...');
      
      // Reset des erreurs
      setImportError(null);
      
      // Configuration corrigée pour DocumentPicker
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel', // .xls
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log('Résultat DocumentPicker:', JSON.stringify(pickerResult, null, 2));

      // Vérification si l'utilisateur a annulé
      if (pickerResult.canceled || pickerResult.type === 'cancel') {
        console.log('Sélection annulée par l\'utilisateur');
        return;
      }

      // Récupération du fichier sélectionné
      let selectedAsset;
      if (pickerResult.assets && pickerResult.assets.length > 0) {
        selectedAsset = pickerResult.assets[0];
      } else if (pickerResult.uri) {
        // Compatibilité avec les anciennes versions
        selectedAsset = pickerResult;
      } else {
        console.log('Aucun fichier trouvé dans la réponse');
        setImportError('Aucun fichier sélectionné');
        return;
      }

      console.log('Asset sélectionné:', JSON.stringify(selectedAsset, null, 2));

      // Validation de l'URI
      if (!selectedAsset.uri) {
        console.log('URI du fichier manquante');
        setImportError('Fichier invalide - URI manquante');
        return;
      }

      // Vérification de l'existence du fichier
      let fileInfo;
      try {
        fileInfo = await FileSystem.getInfoAsync(selectedAsset.uri);
        console.log('Info fichier:', JSON.stringify(fileInfo, null, 2));
        
        if (!fileInfo.exists) {
          setImportError('Le fichier sélectionné n\'existe pas');
          return;
        }
      } catch (fileInfoError) {
        console.log('Erreur lors de la récupération des infos fichier:', fileInfoError);
        // Continuer même si on ne peut pas récupérer les infos
      }

      // Détermination de la taille du fichier
      const fileSize = selectedAsset.size || fileInfo?.size || 0;
      
      // Vérification de la taille (5MB max)
      if (fileSize > 5 * 1024 * 1024) {
        setImportError('Le fichier est trop volumineux. Taille maximale: 5MB');
        return;
      }

      // Validation de l'extension
      const fileName = selectedAsset.name || '';
      const fileExtension = fileName.toLowerCase().split('.').pop();
      
      if (!['xlsx', 'xls'].includes(fileExtension)) {
        setImportError('Format de fichier non supporté. Utilisez .xlsx ou .xls');
        return;
      }

      // Détermination du type MIME
      let mimeType = selectedAsset.mimeType || selectedAsset.type;
      if (!mimeType) {
        mimeType = fileExtension === 'xlsx' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/vnd.ms-excel';
      }

      // Création de l'objet fichier final
      const finalFile = {
        uri: selectedAsset.uri,
        name: fileName || `excel_file.${fileExtension}`,
        size: fileSize,
        type: mimeType,
        mimeType: mimeType, // Ajout pour compatibilité
      };

      console.log('Fichier final configuré:', JSON.stringify(finalFile, null, 2));
      
      // Mise à jour de l'état
      setSelectedFile(finalFile);
      setImportError(null);
      
      console.log('Fichier sélectionné avec succès');

    } catch (error) {
      console.error('Erreur complète lors de la sélection du fichier:', error);
      console.error('Stack trace:', error.stack);
      
      let errorMessage = 'Erreur lors de la sélection du fichier';
      
      if (error.message) {
        if (error.message.includes('Permission')) {
          errorMessage = 'Permission refusée. Vérifiez les permissions de l\'application.';
        } else if (error.message.includes('canceled') || error.message.includes('cancelled')) {
          console.log('Sélection annulée - pas d\'erreur à afficher');
          return; // Ne pas afficher d'erreur si annulé
        } else {
          errorMessage = `Erreur: ${error.message}`;
        }
      }
      
      setImportError(errorMessage);
    }
  };

  // Test des permissions
  const testPermissions = async () => {
    try {
      const token = await getAuthToken();
      
      console.log('Test des permissions avec token présent');
      
      const response = await fetch(`${API_BASE_URL}/import/test-permissions`, {
        method: 'GET',
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Réponse test permissions status:', response.status);

      const result = await response.json();
      console.log('Test permissions result:', result);

      if (!response.ok) {
        throw new Error(handleHttpError(response, result));
      }

      return result.permissions?.allowed || false;
    } catch (error) {
      console.error('Erreur test permissions:', error);
      throw error;
    }
  };

  // Import des utilisateurs - Méthode corrigée
  const importUsers = async () => {
    if (!selectedFile) {
      setImportError('Aucun fichier sélectionné');
      return;
    }

    setImportLoading(true);
    setImportError(null);

    try {
      console.log('Démarrage de l\'import avec le fichier:', selectedFile);

      // Récupération du token
      const token = await getAuthToken();
      console.log('Token récupéré pour import');

      // Test des permissions
      const hasPermission = await testPermissions();
      if (!hasPermission) {
        setImportError('Vous n\'avez pas les droits pour importer des utilisateurs');
        return;
      }

      console.log('Permissions validées, préparation de l\'upload');

      // Création du FormData - Version corrigée
      const formData = new FormData();
      
      // Ajout du fichier avec la structure correcte pour React Native
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      }); // Cast pour éviter les erreurs TypeScript

      console.log('FormData créé, envoi de la requête');

      // Requête d'upload
      const response = await fetch(`${API_BASE_URL}/import/users/excel`, {
        method: 'POST',
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          // Ne pas définir Content-Type pour multipart/form-data avec FormData
          // React Native le fait automatiquement
        },
        body: formData,
      });

      console.log('Réponse serveur status:', response.status);

      let result;
      try {
        result = await response.json();
        console.log('Résultat serveur:', result);
      } catch (jsonError) {
        console.error('Erreur parsing JSON:', jsonError);
        throw new Error('Réponse serveur invalide');
      }

      if (!response.ok) {
        const errorMessage = handleHttpError(response, result);
        setImportError(errorMessage);
        setImportResult({
          success: false,
          message: errorMessage,
        });
        return;
      }

      if (result.success) {
        setImportResult({
          success: true,
          message: result.message,
          totalProcessed: result.total_processed,
          totalCreated: result.total_created,
          totalFailed: result.total_failed,
          createdUsers: result.created_users || [],
          failedUsers: result.failed_users || [],
          warnings: result.warnings || [],
        });
        console.log('Import réussi:', result);
      } else {
        setImportError(result.message);
        setImportResult({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      
      let errorMessage = 'Erreur lors de l\'import des utilisateurs';
      
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Erreur réseau. Vérifiez votre connexion et l\'adresse du serveur.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout - Le serveur met trop de temps à répondre.';
      } else if (error.message.includes('Token')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setImportError(errorMessage);
      setImportResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setImportLoading(false);
    }
  };

  // Télécharger le template Excel
  const downloadTemplate = async () => {
    try {
      console.log('Démarrage du téléchargement du template');
      
      const token = await getAuthToken();

      const response = await fetch(`${API_BASE_URL}/import/users/template/download`, {
        method: 'GET',
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        },
      });

      console.log('Réponse template:', response.status);

      if (!response.ok) {
        const result = await response.json();
        const errorMessage = handleHttpError(response, result);
        setImportError(errorMessage);
        return false;
      }

      console.log('Template téléchargé avec succès');
      return true;
      
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      
      let errorMessage = 'Erreur lors du téléchargement du template';
      if (error.message.includes('Token')) {
        errorMessage = error.message;
      }
      
      setImportError(errorMessage);
      return false;
    }
  };

  // Valider un fichier Excel
  const validateFile = async (file) => {
    try {
      const token = await getAuthToken();
      
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });

      const response = await fetch(`${API_BASE_URL}/import/users/validate`, {
        method: 'POST',
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(handleHttpError(response, result));
      }

      return result;
    } catch (error) {
      console.error('Erreur validation fichier:', error);
      throw error;
    }
  };

  // Récupérer l'historique des imports
  const getImportHistory = async (limit = 10) => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/import/history?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(handleHttpError(response, result));
      }

      return result.history;
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      throw error;
    }
  };

  return {
    // États
    isImportModalVisible,
    importLoading,
    importResult,
    selectedFile,
    importError,
    
    // Actions
    openImportModal,
    closeImportModal,
    selectFile,
    importUsers,
    downloadTemplate,
    validateFile,
    testPermissions,
    getImportHistory,
    
    // Utilitaires
    setImportError,
    setImportResult,
  };
};
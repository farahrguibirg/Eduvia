import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

// Configuration de l'API
const API_BASE_URL = 'http://192.168.1.10:5000'; // Remplacer par votre URL de serveur
const DEFAULT_USER_ID = 1; // ID par défaut de l'utilisateur

/**
 * Hook pour récupérer et gérer les informations utilisateur
 * @param {string|number} [userId=DEFAULT_USER_ID] - ID de l'utilisateur, par défaut 3
 * @returns {Object} - Données utilisateur, état de chargement, erreur et fonctions
 */
export const useUser = (userId = DEFAULT_USER_ID) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState(null);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, [userId]);

  /**
   * Récupère les informations de l'utilisateur
   */
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/info`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Erreur ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setUser(data.data);
      } else {
        throw new Error(data.message || 'Erreur lors de la récupération des données utilisateur');
      }
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la récupération des informations utilisateur:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Met à jour le mot de passe de l'utilisateur
   * @param {string} currentPassword - Mot de passe actuel
   * @param {string} newPassword - Nouveau mot de passe
   * @param {string} confirmPassword - Confirmation du nouveau mot de passe
   * @returns {Promise<boolean>} - Résultat de l'opération
   */
  const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      setPasswordUpdateLoading(true);
      setPasswordUpdateError(null);
      setPasswordUpdateSuccess(false);
  
      // Vérification locale
      if (newPassword !== confirmPassword) {
        setPasswordUpdateError("Les nouveaux mots de passe ne correspondent pas");
        return false;
      }
  
      console.log(`Tentative de mise à jour du mot de passe pour l'utilisateur ${userId}`);
  
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes
  
      // URL corrigée avec l'ID utilisateur
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
        signal: controller.signal
      });
  
      clearTimeout(timeoutId);
  
      const responseText = await response.text();
      console.log('Réponse brute du serveur (mot de passe):', responseText);
      
      let data;
      try {
        // Essayer de parser la réponse comme JSON
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erreur lors du parsing de la réponse (mot de passe):', parseError);
        throw new Error(`Le serveur a renvoyé une réponse invalide: ${responseText.substring(0, 100)}...`);
      }
  
      if (!response.ok) {
        if (response.status === 401 || (data.message && data.message.includes("incorrect"))) {
          throw new Error("Le mot de passe actuel est incorrect");
        }
        throw new Error(data.message || `Erreur ${response.status}: ${data.error || 'Erreur inconnue'}`);
      }
  
      if (data.status === 'success') {
        setPasswordUpdateSuccess(true);
        return true;
      } else {
        throw new Error(data.message || 'Erreur lors de la mise à jour du mot de passe');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setPasswordUpdateError('La requête a expiré. Vérifiez votre connexion et réessayez.');
      } else {
        setPasswordUpdateError(err.message);
        console.error('Erreur lors de la mise à jour du mot de passe:', err);
      }
      return false;
    } finally {
      setPasswordUpdateLoading(false);
    }
  };

  return { 
    user, 
    loading, 
    error, 
    fetchUserInfo,
    updatePassword,
    passwordUpdateLoading,
    passwordUpdateError,
    passwordUpdateSuccess
  };
};

/**
 * Hook pour gérer l'image de profil utilisateur
 * @param {string|number} [userId=DEFAULT_USER_ID] - ID de l'utilisateur, par défaut 3
 * @returns {Object} - URL de l'image, fonctions de gestion et états
 */
export const useProfileImage = (userId = DEFAULT_USER_ID) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour rafraîchir l'URL de l'image (avec anti-cache)
  const refreshImageUrl = () => {
    // Ajout d'un timestamp pour éviter la mise en cache
    setImageUrl(`${API_BASE_URL}/api/users/${userId}/profile-image?t=${new Date().getTime()}`);
  };

  // Chargement initial de l'image
  useEffect(() => {
    const checkImageExists = async () => {
      try {
        setLoading(true);
        // Vérification directe de l'existence de l'image par une requête HEAD
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile-image`, {
          method: 'HEAD'
        });
        
        if (response.ok) {
          refreshImageUrl();
        } else {
          setImageUrl(null);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'image de profil:', err);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkImageExists();
  }, [userId]);

  /**
 * Prépare une image pour l'upload
 * @param {Object} imageAsset - Objet image de la bibliothèque expo-image-picker
 * @returns {FormData} - FormData préparé pour l'envoi
 */
  const prepareImageFormData = (imageAsset) => {
    if (!imageAsset || !imageAsset.uri) {
      throw new Error("Image invalide");
    }

    // Préparation du FormData
    const formData = new FormData();
    
    // Get file extension
    const uriParts = imageAsset.uri.split('.');
    const fileType = uriParts[uriParts.length - 1].toLowerCase();
    
    // Use image type if available or determine based on extension
    const mimeType = imageAsset.mimeType || 
                    (fileType === 'jpg' || fileType === 'jpeg' ? 'image/jpeg' : 
                     fileType === 'png' ? 'image/png' : 'image/jpeg');
    
    // Utiliser la clé 'image' au lieu de 'profile_image'
    formData.append('image', {
      uri: imageAsset.uri,
      name: `image${userId}.${fileType}`,
      type: mimeType,
    });

    // Log the form data for debugging
    console.log('FormData prepared:', JSON.stringify({
      uri: imageAsset.uri,
      name: `image${userId}.${fileType}`,
      type: mimeType
    }));

    return formData;
  };

  /**
   * Télécharger une nouvelle image vers le serveur
   * @param {Object} imageAsset - Objet image de la bibliothèque expo-image-picker
   */
  const uploadImage = async (imageAsset) => {
    setLoading(true);
    setError(null);
  
    try {
      const formData = prepareImageFormData(imageAsset);
  
      console.log('FormData préparé pour l\'envoi:', JSON.stringify({
        uri: imageAsset.uri,
        type: imageAsset.mimeType || 'image/jpeg',
        name: `image${userId}.jpg`
      }));
  
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes
  
      // Envoyer l'image au serveur
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // Ne pas définir manuellement Content-Type pour FormData
        },
        signal: controller.signal
      });
  
      clearTimeout(timeoutId);
  
      const responseText = await response.text();
      console.log('Réponse brute du serveur:', responseText);
      
      let result;
      try {
        // Essayer de parser la réponse comme JSON
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erreur lors du parsing de la réponse:', parseError);
        throw new Error(`Le serveur a renvoyé une réponse invalide: ${responseText.substring(0, 100)}...`);
      }
  
      if (!response.ok) {
        throw new Error(result.message || `Erreur ${response.status}: ${result.error || 'Erreur inconnue'}`);
      }
  
      if (result.status === 'success') {
        refreshImageUrl();
      } else {
        throw new Error(result.message || `Erreur lors de l'upload de l'image`);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('La requête a expiré. Vérifiez votre connexion et réessayez.');
      } else {
        setError(err.message);
        console.error(`Erreur lors de l'upload de l'image de profil:`, err);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mettre à jour une image existante
   * @param {Object} imageAsset - Objet image de la bibliothèque expo-image-picker
   */
  const updateImage = async (imageAsset) => {
    setLoading(true);
    setError(null);
  
    try {
      const formData = prepareImageFormData(imageAsset);
  
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile-image`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // Ne pas définir manuellement Content-Type pour FormData
        },
      });
  
      const responseText = await response.text();
      console.log('Réponse brute du serveur (update):', responseText);
      
      let result;
      try {
        // Essayer de parser la réponse comme JSON
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erreur lors du parsing de la réponse (update):', parseError);
        throw new Error(`Le serveur a renvoyé une réponse invalide: ${responseText.substring(0, 100)}...`);
      }
  
      if (!response.ok) {
        throw new Error(result.message || `Erreur ${response.status}: ${result.error || 'Erreur inconnue'}`);
      }
  
      if (result.status === 'success') {
        refreshImageUrl();
      } else {
        throw new Error(result.message || `Erreur lors de la mise à jour de l'image`);
      }
    } catch (err) {
      setError(err.message);
      console.error(`Erreur lors de la mise à jour de l'image de profil:`, err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Supprimer l'image de profil
   */
  const deleteImage = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile-image`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        setImageUrl(null);
      } else {
        throw new Error(result.message || 'Erreur lors de la suppression de l\'image');
      }
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la suppression de l\'image de profil:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    imageUrl,
    uploadImage,
    updateImage,
    deleteImage,
    loading,
    error,
    refreshImageUrl
  };
};

/**
 * Fonction utilitaire pour sélectionner une image avec expo-image-picker
 */
export const pickImage = async () => {
  try {
    // Demander les permissions nécessaires
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Désolé, nous avons besoin des permissions pour accéder à vos photos!');
      return null;
    }

    // Lancer le sélecteur d'image avec les options correctes
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la sélection de l\'image:', error);
    return null;
  }
};
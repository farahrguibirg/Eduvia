import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

/**
 * Sélectionne un fichier PDF
 * @returns {Promise<Object>} Résultat de la sélection du fichier
 */
export const pickPdfDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    const { name, uri } = result.assets[0];
    
    // Vérifier si le fichier est un PDF
    if (!name.toLowerCase().endsWith('.pdf')) {
      Alert.alert(
        "Format invalide", 
        "Veuillez sélectionner un fichier PDF (.pdf)."
      );
      return { 
        success: false, 
        error: "Le fichier sélectionné n'est pas un PDF" 
      };
    }
    
    // Vérifier la taille du fichier
    const fileInfo = await FileSystem.getInfoAsync(uri);
    const maxSize = 20 * 1024 * 1024; // 20MB max
    
    if (fileInfo.size > maxSize) {
      Alert.alert(
        "Fichier trop volumineux", 
        "La taille du fichier ne doit pas dépasser 20MB."
      );
      return { 
        success: false, 
        error: "Le fichier est trop volumineux (max 20MB)" 
      };
    }
    
    return {
      success: true,
      data: { name, uri, size: fileInfo.size }
    };
  } catch (error) {
    console.error("Error picking document:", error);
    Alert.alert(
      "Erreur", 
      "Une erreur s'est produite lors de la sélection du document."
    );
    return {
      success: false,
      error: error.message || "Une erreur s'est produite lors de la sélection du document"
    };
  }
};

/**
 * Lit le contenu d'un PDF et le convertit en base64
 * @param {string} uri - URI du fichier PDF
 * @returns {Promise<Object>} - Résultat de la lecture
 */
export const readPdfContent = async (uri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64
    });
    
    return {
      success: true,
      data: base64
    };
  } catch (error) {
    console.error("Error reading PDF content:", error);
    return {
      success: false,
      error: error.message || "Une erreur s'est produite lors de la lecture du fichier PDF"
    };
  }
};

/**
 * Vérifie si un fichier existe
 * @param {string} uri - URI du fichier
 * @returns {Promise<boolean>} - True si le fichier existe
 */
export const fileExists = async (uri) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.exists;
  } catch (error) {
    console.error("Error checking if file exists:", error);
    return false;
  }
};

/**
 * Supprime un fichier
 * @param {string} uri - URI du fichier
 * @returns {Promise<Object>} - Résultat de la suppression
 */
export const deleteFile = async (uri) => {
  try {
    if (await fileExists(uri)) {
      await FileSystem.deleteAsync(uri);
      return { success: true };
    }
    return { success: false, error: "Le fichier n'existe pas" };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { 
      success: false, 
      error: error.message || "Une erreur s'est produite lors de la suppression du fichier" 
    };
  }
};
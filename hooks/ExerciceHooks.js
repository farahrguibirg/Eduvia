{/*import { useState, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// URL de base de l'API
const API_BASE_URL = 'http://192.168.1.7:5000/api';

export const useExerciceHooks = () => {
  // États pour le formulaire
  const [titre, setTitre] = useState('');
  const [nbQuestions, setNbQuestions] = useState(5);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exerciceGenere, setExerciceGenere] = useState(null);
  const [etudiantId, setEtudiantId] = useState(4);

  // Récupérer l'ID de l'étudiant au chargement
  useEffect(() => {
    const getEtudiantId = async () => {
      try {
        const id = await AsyncStorage.getItem('etudiantId');
        if (id) {
          setEtudiantId(parseInt(id));
        } else {
          // Pour la démo, on utilise un ID par défaut
          setEtudiantId(1);
          await AsyncStorage.setItem('etudiantId', '4');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'ID étudiant:', error);
        // Pour la démo, on définit un ID par défaut
        setEtudiantId(4);
      }
    };

    getEtudiantId();
  }, []);

  // Fonction pour sélectionner un fichier PDF
  const handleFileSelection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false
      });

      console.log("Document Picker Result:", JSON.stringify(result));

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Vérifier l'extension du fichier
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          Alert.alert('Erreur', 'Veuillez sélectionner un fichier PDF valide.');
          return;
        }

        setSelectedFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
          size: file.size
        });
        
        console.log("Fichier sélectionné:", file.name);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du fichier:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier.');
    }
  };

  // Fonction pour envoyer le formulaire
  
  const handleSubmit = async () => {
    if (!selectedFile) {
      Alert.alert('Erreur', 'Veuillez sélectionner un fichier PDF.');
      return;
    }
  
    if (!etudiantId) {
      Alert.alert('Erreur', 'ID étudiant non disponible.');
      return;
    }
  
    setLoading(true);
  
    try {
      // Créer un objet FormData pour l'envoi multipart
      const formData = new FormData();
      formData.append('fichier', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: 'application/pdf'
      });
      formData.append('etudiant_id', etudiantId.toString());
      formData.append('titre', titre || `QCM sur ${selectedFile.name}`);
      formData.append('nb_questions', nbQuestions.toString());
  
      // Envoi de la requête à l'API
      const response = await fetch(`${API_BASE_URL}/exercices/qcm`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.erreur || 'Erreur lors de la génération du QCM');
      }
  
      // Réussite
      setExerciceGenere(data.exercice);
      
      // Stocker l'exercice localement pour référence future
      try {
        await AsyncStorage.setItem(
          `exercice_${data.exercice.id}`, 
          JSON.stringify(data.exercice)
        );
        
        // Aussi ajouter à l'historique local
        const historiques = await AsyncStorage.getItem('historique_exercices');
        let historiqueArray = [];
        if (historiques) {
          historiqueArray = JSON.parse(historiques);
        }
        
        // Ajouter le nouvel exercice (format sommaire) à l'historique
        historiqueArray.unshift({
          id: data.exercice.id,
          titre: data.exercice.titre,
          date_creation: data.exercice.date_creation,
          nb_questions: data.exercice.questions.length
        });
        
        await AsyncStorage.setItem('historique_exercices', JSON.stringify(historiqueArray));
      } catch (storageError) {
        console.warn('Erreur lors du stockage de l\'exercice:', storageError);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du formulaire:', error);
      Alert.alert('Erreur', error.message || 'Impossible de générer le QCM. Veuillez réessayer.');
      
      // Mode démo - générer un exercice fictif si l'API n'est pas disponible
      if (__DEV__) {
        console.log('Mode développement: Génération d\'un exercice fictif');
        const mockExercice = generateMockExercice();
        setExerciceGenere(mockExercice);
        
        // Même en mode démo, on stocke l'exercice fictif
        try {
          await AsyncStorage.setItem(
            `exercice_${mockExercice.id}`, 
            JSON.stringify(mockExercice)
          );
          
          // Aussi ajouter à l'historique local
          const historiques = await AsyncStorage.getItem('historique_exercices');
          let historiqueArray = [];
          if (historiques) {
            historiqueArray = JSON.parse(historiques);
          }
          
          historiqueArray.unshift({
            id: mockExercice.id,
            titre: mockExercice.titre,
            date_creation: mockExercice.date_creation,
            nb_questions: mockExercice.questions.length
          });
          
          await AsyncStorage.setItem('historique_exercices', JSON.stringify(historiqueArray));
        } catch (storageError) {
          console.warn('Erreur lors du stockage de l\'exercice fictif:', storageError);
        }
      }
    } finally {
      setLoading(false);
    }
  };


  // Réinitialiser le formulaire
  const resetForm = () => {
    setTitre('');
    setNbQuestions(5);
    setSelectedFile(null);
    setExerciceGenere(null);
  };

  // Fonction pour récupérer tous les exercices d'un étudiant
  const fetchExercices = async () => {
    if (!etudiantId) return [];
    
    try {
      const response = await fetch(`${API_BASE_URL}/exercices/etudiant/${etudiantId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.erreur || 'Erreur lors de la récupération des exercices');
      }
      
      return data.exercices;
    } catch (error) {
      console.error('Erreur lors de la récupération des exercices:', error);
      
      // Mode démo - retourner des exercices fictifs
      if (__DEV__) {
        return [
          { id: 1, titre: 'QCM Test 1', date_creation: new Date().toISOString(), nb_questions: 5 },
          { id: 2, titre: 'QCM Test 2', date_creation: new Date().toISOString(), nb_questions: 8 }
        ];
      }
      
      return [];
    }
  };

  // Fonction pour supprimer un exercice
  const deleteExercice = async (exerciceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/exercices/${exerciceId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.erreur || 'Erreur lors de la suppression');
      }
      
      // Supprimer également la copie locale
      try {
        await AsyncStorage.removeItem(`exercice_${exerciceId}`);
      } catch (storageError) {
        console.warn('Erreur lors de la suppression de la copie locale:', storageError);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'exercice:', error);
      return false;
    }
  };

  // Fonction pour récupérer un exercice par son ID
 
const getExercice = async (exerciceId) => {
  try {
    // D'abord essayer de récupérer depuis le stockage local
    const cachedExercice = await AsyncStorage.getItem(`exercice_${exerciceId}`);
    if (cachedExercice) {
      console.log('Exercice récupéré depuis le cache local');
      const parsedExercice = JSON.parse(cachedExercice);
      
      // Vérifier si l'exercice contient des questions et des réponses
      if (parsedExercice && 
          parsedExercice.questions && 
          parsedExercice.questions.length > 0 &&
          parsedExercice.questions[0].reponses &&
          parsedExercice.questions[0].reponses.length > 0) {
        return parsedExercice;
      }
      // Si l'exercice est incomplet dans le cache, on continue pour récupérer depuis l'API
    }

    // Si pas en cache ou incomplet, faire une requête API
    console.log(`Récupération de l'exercice ${exerciceId} depuis l'API`);
    const response = await fetch(`${API_BASE_URL}/exercices/${exerciceId}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok || !data.exercice) {
      if (data && data.erreur) {
        console.error('Erreur API:', data.erreur);
      }
      throw new Error(data.erreur || 'Erreur lors de la récupération de l\'exercice');
    }

    // Vérifier si les données récupérées contiennent des questions et réponses
    if (
      !data.exercice.questions ||
      data.exercice.questions.length === 0 ||
      !data.exercice.questions[0].reponses ||
      data.exercice.questions[0].reponses.length === 0
    ) {
      console.warn("L'API a retourné un exercice sans questions ou réponses");
      return null;
    }

    // Sauvegarder localement l'exercice pour la prochaine fois
    try {
      await AsyncStorage.setItem(`exercice_${exerciceId}`, JSON.stringify(data.exercice));
    } catch (storageError) {
      console.warn('Erreur lors de la sauvegarde locale de l\'exercice:', storageError);
    }

    if (data.exercice) {
      console.log('Exercice récupéré:', data.exercice);
    }
    return data.exercice;
  } catch (error) {
    if (error) {
      console.error('Erreur lors de la récupération de l\'exercice:', error);
    }
    return null;
  }
};
  // Fonction pour générer un exercice fictif (pour le mode démo)
  const generateMockExercice = () => {
    return {
      id: Math.floor(Math.random() * 1000),
      titre: titre || `QCM sur ${selectedFile?.name || 'Document'}`,
      consigne: `Répondez aux questions suivantes basées sur le document '${selectedFile?.name || 'Document'}'`,
      date_creation: new Date().toISOString(),
      questions: Array.from({ length: nbQuestions }, (_, i) => ({
        id: i + 1,
        texte: `Question exemple ${i + 1} générée à partir du document`,
        reponses: [
          { id: i * 3 + 1, texte: 'Option A', est_correcte: i % 3 === 0 },
          { id: i * 3 + 2, texte: 'Option B', est_correcte: i % 3 === 1 },
          { id: i * 3 + 3, texte: 'Option C', est_correcte: i % 3 === 2 }
        ]
      }))
    };
  };

  return {
    // États
    titre,
    setTitre,
    nbQuestions,
    setNbQuestions,
    selectedFile,
    loading,
    exerciceGenere,
    setExerciceGenere,
    // Fonctions
    handleFileSelection,
    handleSubmit,
    resetForm,
    fetchExercices,
    deleteExercice,
    getExercice  // Exposer la fonction getExercice
  };
};
*/}
import { useState, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// URL de base de l'API
const API_BASE_URL = 'http://192.168.1.10:5000/api';

export const useExerciceHooks = () => {
  // États pour le formulaire
  const [titre, setTitre] = useState('');
  const [nbQuestions, setNbQuestions] = useState(5);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exerciceGenere, setExerciceGenere] = useState(null);
  const { user } = useAuth();
  const etudiantId = user?.id;

  // Fonction pour sélectionner un fichier PDF
  const handleFileSelection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false
      });

      console.log("Document Picker Result:", JSON.stringify(result));

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Vérifier l'extension du fichier
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          Alert.alert('Erreur', 'Veuillez sélectionner un fichier PDF valide.');
          return;
        }

        setSelectedFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
          size: file.size
        });
        
        console.log("Fichier sélectionné:", file.name);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du fichier:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier.');
    }
  };

  // Fonction pour envoyer le formulaire
  
  const handleSubmit = async () => {
    if (!selectedFile) {
      Alert.alert('Erreur', 'Veuillez sélectionner un fichier PDF.');
      return;
    }
  
    if (!etudiantId) {
      Alert.alert('Erreur', 'ID étudiant non disponible.');
      return;
    }
  
    setLoading(true);
  
    try {
      // Créer un objet FormData pour l'envoi multipart
      const formData = new FormData();
      formData.append('fichier', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: 'application/pdf'
      });
      formData.append('etudiant_id', etudiantId.toString());
      formData.append('titre', titre || `QCM sur ${selectedFile.name}`);
      formData.append('nb_questions', nbQuestions.toString());
  
      // Envoi de la requête à l'API
      const response = await fetch(`${API_BASE_URL}/exercices/qcm`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.erreur || 'Erreur lors de la génération du QCM');
      }
  
      // Réussite
      setExerciceGenere(data.exercice);
      
      // Stocker l'exercice localement pour référence future
      try {
        await AsyncStorage.setItem(
          `exercice_${data.exercice.id}`, 
          JSON.stringify(data.exercice)
        );
        
        // Aussi ajouter à l'historique local
        const historiques = await AsyncStorage.getItem('historique_exercices');
        let historiqueArray = [];
        if (historiques) {
          historiqueArray = JSON.parse(historiques);
        }
        
        // Ajouter le nouvel exercice (format sommaire) à l'historique
        historiqueArray.unshift({
          id: data.exercice.id,
          titre: data.exercice.titre,
          date_creation: data.exercice.date_creation,
          nb_questions: data.exercice.questions.length
        });
        
        await AsyncStorage.setItem('historique_exercices', JSON.stringify(historiqueArray));
      } catch (storageError) {
        console.warn('Erreur lors du stockage de l\'exercice:', storageError);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du formulaire:', error);
      Alert.alert('Erreur', error.message || 'Impossible de générer le QCM. Veuillez réessayer.');
      
      // Mode démo - générer un exercice fictif si l'API n'est pas disponible
      if (__DEV__) {
        console.log('Mode développement: Génération d\'un exercice fictif');
        const mockExercice = generateMockExercice();
        setExerciceGenere(mockExercice);
        
        // Même en mode démo, on stocke l'exercice fictif
        try {
          await AsyncStorage.setItem(
            `exercice_${mockExercice.id}`, 
            JSON.stringify(mockExercice)
          );
          
          // Aussi ajouter à l'historique local
          const historiques = await AsyncStorage.getItem('historique_exercices');
          let historiqueArray = [];
          if (historiques) {
            historiqueArray = JSON.parse(historiques);
          }
          
          historiqueArray.unshift({
            id: mockExercice.id,
            titre: mockExercice.titre,
            date_creation: mockExercice.date_creation,
            nb_questions: mockExercice.questions.length
          });
          
          await AsyncStorage.setItem('historique_exercices', JSON.stringify(historiqueArray));
        } catch (storageError) {
          console.warn('Erreur lors du stockage de l\'exercice fictif:', storageError);
        }
      }
    } finally {
      setLoading(false);
    }
  };


  // Réinitialiser le formulaire
  const resetForm = () => {
    setTitre('');
    setNbQuestions(5);
    setSelectedFile(null);
    setExerciceGenere(null);
  };

  // Fonction pour récupérer tous les exercices d'un étudiant
  const fetchExercices = async () => {
    if (!etudiantId) return [];
    
    try {
      const response = await fetch(`${API_BASE_URL}/exercices/etudiant/${etudiantId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.erreur || 'Erreur lors de la récupération des exercices');
      }
      
      return data.exercices;
    } catch (error) {
      console.error('Erreur lors de la récupération des exercices:', error);
      
      // Mode démo - retourner des exercices fictifs
      if (__DEV__) {
        return [
          { id: 1, titre: 'QCM Test 1', date_creation: new Date().toISOString(), nb_questions: 5 },
          { id: 2, titre: 'QCM Test 2', date_creation: new Date().toISOString(), nb_questions: 8 }
        ];
      }
      
      return [];
    }
  };

  // Fonction pour supprimer un exercice
  const deleteExercice = async (exerciceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/exercices/${exerciceId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.erreur || 'Erreur lors de la suppression');
      }
      
      // Supprimer également la copie locale
      try {
        await AsyncStorage.removeItem(`exercice_${exerciceId}`);
      } catch (storageError) {
        console.warn('Erreur lors de la suppression de la copie locale:', storageError);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'exercice:', error);
      return false;
    }
  };

  // Fonction pour récupérer un exercice par son ID
 
const getExercice = async (exerciceId) => {
  try {
    // D'abord essayer de récupérer depuis le stockage local
    const cachedExercice = await AsyncStorage.getItem(`exercice_${exerciceId}`);
    if (cachedExercice) {
      console.log('Exercice récupéré depuis le cache local');
      const parsedExercice = JSON.parse(cachedExercice);
      // Vérifier si l'exercice contient des questions et des réponses
      if (
        parsedExercice &&
        parsedExercice.questions &&
        parsedExercice.questions.length > 0 &&
        parsedExercice.questions[0].reponses &&
        parsedExercice.questions[0].reponses.length > 0
      ) {
        console.log('Exercice récupéré:', parsedExercice);
        return parsedExercice;
      }
      // Si l'exercice est incomplet dans le cache, on continue pour récupérer depuis l'API
    }

    // Si pas en cache ou incomplet, faire une requête API
    console.log(`Récupération de l'exercice ${exerciceId} depuis l'API`);
    const response = await fetch(`${API_BASE_URL}/exercices/${exerciceId}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok || !data.exercice) {
      if (data && data.erreur) {
        console.error('Erreur API:', data.erreur);
      }
      throw new Error(data.erreur || 'Erreur lors de la récupération de l\'exercice');
    }

    // Vérifier si les données récupérées contiennent des questions et réponses
    if (
      !data.exercice.questions ||
      data.exercice.questions.length === 0 ||
      !data.exercice.questions[0].reponses ||
      data.exercice.questions[0].reponses.length === 0
    ) {
      console.warn("L'API a retourné un exercice sans questions ou réponses");
      return null;
    }

    // Sauvegarder localement l'exercice pour la prochaine fois
    try {
      await AsyncStorage.setItem(`exercice_${exerciceId}`, JSON.stringify(data.exercice));
    } catch (storageError) {
      console.warn('Erreur lors de la sauvegarde locale de l\'exercice:', storageError);
    }

    if (data.exercice) {
      console.log('Exercice récupéré:', data.exercice);
    }
    return data.exercice;
  } catch (error) {
    if (error) {
      console.error('Erreur lors de la récupération de l\'exercice:', error);
    }
    return null;
  }
};
  // Fonction pour générer un exercice fictif (pour le mode démo)
  const generateMockExercice = () => {
    return {
      id: Math.floor(Math.random() * 1000),
      titre: titre || `QCM sur ${selectedFile?.name || 'Document'}`,
      consigne: `Répondez aux questions suivantes basées sur le document '${selectedFile?.name || 'Document'}'`,
      date_creation: new Date().toISOString(),
      questions: Array.from({ length: nbQuestions }, (_, i) => ({
        id: i + 1,
        texte: `Question exemple ${i + 1} générée à partir du document`,
        reponses: [
          { id: i * 3 + 1, texte: 'Option A', est_correcte: i % 3 === 0 },
          { id: i * 3 + 2, texte: 'Option B', est_correcte: i % 3 === 1 },
          { id: i * 3 + 3, texte: 'Option C', est_correcte: i % 3 === 2 }
        ]
      }))
    };
  };

  return {
    // États
    titre,
    setTitre,
    nbQuestions,
    setNbQuestions,
    selectedFile,
    loading,
    exerciceGenere,
    setExerciceGenere,
    // Fonctions
    handleFileSelection,
    handleSubmit,
    resetForm,
    fetchExercices,
    deleteExercice,
    getExercice  // Exposer la fonction getExercice
  };
};
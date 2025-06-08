// app/hooks/useChatbotHooks.js
{/*import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

// Définir l'URL API de manière plus flexible
// Utilisez .env ou une configuration pour un déploiement réel
const API_URL = 'http://192.168.1.10:5000/api'; // Changez cette adresse IP selon votre configuration

export const useChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [etudiantId, setEtudiantId] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [histories, setHistories] = useState([]);
  const [isLoadingHistories, setIsLoadingHistories] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const scrollViewRef = useRef();
  

  // Récupérer l'ID de l'étudiant lors du chargement
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setEtudiantId(parseInt(id));
        } else {
          // Pour le développement, on peut utiliser un ID par défaut
          setEtudiantId(null);
          console.log("ID utilisateur non trouvé, utilisation de l'ID par défaut: 1");
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'ID utilisateur:', error);
        setApiError("Erreur lors de la récupération de l'ID utilisateur");
      }
    };
    
    fetchUserId();
  }, []);

  // Charger l'historique des conversations quand etudiantId change
  useEffect(() => {
    if (etudiantId) {
      fetchHistories();
    }
  }, [etudiantId]);

  const { isLoggedIn, user, logout } = useAuth();
    // Vérification d'authentification
    if (!isLoggedIn) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
          <View style={styles.notLoggedInContainer}>
            <Ionicons name="lock-closed" size={50} color="#6818a5" />
            <Text style={styles.notLoggedInTitle}>{t('accessDeniedTitle')}</Text>
            <Text style={styles.notLoggedInMessage}>
              {t('accessDeniedMessage')}
            </Text>
          </View>
        </SafeAreaView>
      );
    }

  const fetchHistories = async () => {
    if (!etudiantId) return;
    
    try {
      setIsLoadingHistories(true);
      setApiError(null);
      
      // Test de connectivité avec le backend
      try {
        await axios.get(`${API_URL}/chatbot/history/${etudiantId}`, { timeout: 5000 });
      } catch (error) {
        console.log("Erreur de connexion au backend:", error);
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          setApiError(`Impossible de se connecter au serveur. Vérifiez que le backend est en cours d'exécution à l'adresse ${API_URL}`);
          setIsLoadingHistories(false);
          return;
        }
      }
      
      const response = await axios.get(`${API_URL}/chatbot/history/${etudiantId}`);
      
      if (response.data && response.data.history) {
        setHistories(response.data.history);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      setApiError("Impossible de récupérer l'historique des conversations.");
    } finally {
      setIsLoadingHistories(false);
    }
  };

  const fetchConversationDetails = async (conversationId) => {
    try {
      setIsLoading(true);
      setApiError(null);
      const response = await axios.get(`${API_URL}/chatbot/${conversationId}`);
      if (response.data && response.data.messages) {
        // Adapter le format pour le chat principal
        const conversationMessages = response.data.messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          isUser: msg.role === 'user',
          timestamp: new Date(msg.timestamp),
          pdfName: msg.pdf_filename,
        }));
        setMessages(conversationMessages);
        setCurrentConversationId(conversationId);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la conversation:', error);
      setApiError("Impossible de récupérer les détails de la conversation.");
    } finally {
      setIsLoading(false);
    }
  };

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });
      
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        setSelectedPdf({
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: 'application/pdf',
          size: selectedFile.size
        });
        
        // Notification que le PDF a été sélectionné
        Alert.alert('PDF sélectionné', `Fichier : ${selectedFile.name}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du PDF:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le PDF.');
    }
  };

  const sendMessage = async () => {
    if ((!inputText.trim() && !selectedPdf) || isLoading) return;
    
    const messageText = inputText.trim() || 'Analyse de PDF';
    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
      pdfName: selectedPdf?.name
    };
    
    // Ajouter le message utilisateur à la liste des messages
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Nettoyer l'input avant de commencer le traitement
    setInputText('');
    
    setIsLoading(true);
    setApiError(null);
    
    try {
      // Créer un FormData pour envoyer le fichier PDF
      const formData = new FormData();
      
      if (selectedPdf) {
        formData.append('pdf_file', {
          uri: selectedPdf.uri,
          name: selectedPdf.name,
          type: 'application/pdf'
        });
      }
      
      if (messageText) {
        formData.append('question', messageText);
      }
      
      if (etudiantId) {
        formData.append('etudiant_id', etudiantId.toString());
      }
      
      if (currentConversationId) {
        formData.append('conversation_id', currentConversationId.toString());
      }
      
      console.log("Envoi de la requête au serveur:", `${API_URL}/chatbot/process`);
      
      // Envoyer la requête
      const response = await axios.post(
        `${API_URL}/chatbot/process`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000 // Augmenter le timeout à 60 secondes
        }
      );
      
      console.log("Réponse reçue:", response.data);
      
      if (response.data && response.data.response && response.data.chat_id) {
        // Rafraîchir la conversation complète après envoi
        await fetchConversationDetails(response.data.chat_id);
        fetchHistories();
      } else {
        throw new Error("Format de réponse invalide");
      }
      
      setSelectedPdf(null);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      let errorMessage = "Une erreur s'est produite. Veuillez réessayer plus tard.";
      
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'état hors de la plage 2xx
        console.error("Erreur de réponse:", error.response.data);
        errorMessage = error.response.data.error || errorMessage;
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error("Erreur de requête:", error.request);
        errorMessage = "Le serveur ne répond pas. Vérifiez votre connexion internet et l'état du serveur.";
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error("Erreur:", error.message);
        errorMessage = `Erreur: ${error.message}`;
      }
      
      setApiError(errorMessage);
      
      // Ajouter un message d'erreur
      const errorResponseMessage = {
        id: `error-${Date.now()}`,
        text: errorMessage,
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    inputText,
    setInputText,
    selectedPdf,
    isLoading,
    apiError,
    setApiError,
    scrollViewRef,
    pickPdf,
    sendMessage,
    setSelectedPdf,
    histories,
    fetchHistories,
    isLoadingHistories,
    fetchConversationDetails,
    currentConversationId,
    setCurrentConversationId
  };
};*/}
// app/hooks/useChatbotHooks.js
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Définir l'URL API de manière plus flexible
// Utilisez .env ou une configuration pour un déploiement réel
const API_URL = 'http://192.168.1.10:5000/api'; // Changez cette adresse IP selon votre configuration

export const useChatbot = () => {
  const { isLoggedIn, user, logout } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [etudiantId, setEtudiantId] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [histories, setHistories] = useState([]);
  const [isLoadingHistories, setIsLoadingHistories] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const scrollViewRef = useRef();

  // Récupérer l'ID de l'étudiant lors du chargement
  useEffect(() => {
    const fetchUserId = async () => {
      // Vérifier d'abord si l'utilisateur est connecté
      if (!isLoggedIn) {
        setEtudiantId(null);
        setApiError("Vous devez être connecté pour utiliser le chatbot");
        return;
      }

      try {
        // Essayer de récupérer l'ID depuis le contexte user d'abord
        if (user && user.id) {
          setEtudiantId(user.id);
          return;
        }

        // Si pas disponible dans le contexte, essayer AsyncStorage
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setEtudiantId(parseInt(id));
        } else {
          // Aucun ID trouvé - l'utilisateur doit se reconnecter
          setEtudiantId(null);
          setApiError("Session expirée. Veuillez vous reconnecter.");
          logout(); // Déconnecter l'utilisateur
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'ID utilisateur:', error);
        setApiError("Erreur lors de la récupération de l'ID utilisateur. Veuillez vous reconnecter.");
        setEtudiantId(null);
      }
    };
    
    fetchUserId();
  }, [isLoggedIn, user, logout]);

  // Charger l'historique des conversations quand etudiantId change
  useEffect(() => {
    if (etudiantId && isLoggedIn) {
      fetchHistories();
    } else {
      // Réinitialiser les données si l'utilisateur n'est pas connecté
      setHistories([]);
      setMessages([]);
      setCurrentConversationId(null);
    }
  }, [etudiantId, isLoggedIn]);

  const fetchHistories = async () => {
    if (!etudiantId || !isLoggedIn) {
      setApiError("Vous devez être connecté pour accéder à l'historique");
      return;
    }
    
    try {
      setIsLoadingHistories(true);
      setApiError(null);
      
      // Test de connectivité avec le backend
      try {
        await axios.get(`${API_URL}/chatbot/history/${etudiantId}`, { timeout: 5000 });
      } catch (error) {
        console.log("Erreur de connexion au backend:", error);
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          setApiError(`Impossible de se connecter au serveur. Vérifiez que le backend est en cours d'exécution à l'adresse ${API_URL}`);
          setIsLoadingHistories(false);
          return;
        }
      }
      
      const response = await axios.get(`${API_URL}/chatbot/history/${etudiantId}`);
      
      if (response.data && response.data.history) {
        setHistories(response.data.history);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      setApiError("Impossible de récupérer l'historique des conversations.");
    } finally {
      setIsLoadingHistories(false);
    }
  };

  const fetchConversationDetails = async (conversationId) => {
    if (!isLoggedIn || !etudiantId) {
      setApiError("Vous devez être connecté pour accéder aux conversations");
      return;
    }

    try {
      setIsLoading(true);
      setApiError(null);
      const response = await axios.get(`${API_URL}/chatbot/${conversationId}`);
      if (response.data && response.data.messages) {
        // Adapter le format pour le chat principal
        const conversationMessages = response.data.messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          isUser: msg.role === 'user',
          timestamp: new Date(msg.timestamp),
          pdfName: msg.pdf_filename,
        }));
        setMessages(conversationMessages);
        setCurrentConversationId(conversationId);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la conversation:', error);
      setApiError("Impossible de récupérer les détails de la conversation.");
    } finally {
      setIsLoading(false);
    }
  };

  const pickPdf = async () => {
    if (!isLoggedIn || !etudiantId) {
      Alert.alert('Erreur', 'Vous devez être connecté pour sélectionner un PDF.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });
      
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        setSelectedPdf({
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: 'application/pdf',
          size: selectedFile.size
        });
        
        // Notification que le PDF a été sélectionné
        Alert.alert('PDF sélectionné', `Fichier : ${selectedFile.name}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du PDF:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le PDF.');
    }
  };

  const sendMessage = async () => {
    if (!isLoggedIn || !etudiantId) {
      setApiError("Vous devez être connecté pour envoyer un message");
      return;
    }

    if ((!inputText.trim() && !selectedPdf) || isLoading) return;
    
    const messageText = inputText.trim() || 'Analyse de PDF';
    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
      pdfName: selectedPdf?.name
    };
    
    // Ajouter le message utilisateur à la liste des messages
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Nettoyer l'input avant de commencer le traitement
    setInputText('');
    
    setIsLoading(true);
    setApiError(null);
    
    try {
      // Créer un FormData pour envoyer le fichier PDF
      const formData = new FormData();
      
      if (selectedPdf) {
        formData.append('pdf_file', {
          uri: selectedPdf.uri,
          name: selectedPdf.name,
          type: 'application/pdf'
        });
      }
      
      if (messageText) {
        formData.append('question', messageText);
      }
      
      formData.append('etudiant_id', etudiantId.toString());
      
      if (currentConversationId) {
        formData.append('conversation_id', currentConversationId.toString());
      }
      
      console.log("Envoi de la requête au serveur:", `${API_URL}/chatbot/process`);
      
      // Envoyer la requête
      const response = await axios.post(
        `${API_URL}/chatbot/process`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000 // Augmenter le timeout à 60 secondes
        }
      );
      
      console.log("Réponse reçue:", response.data);
      
      if (response.data && response.data.response && response.data.chat_id) {
        // Rafraîchir la conversation complète après envoi
        await fetchConversationDetails(response.data.chat_id);
        fetchHistories();
      } else {
        throw new Error("Format de réponse invalide");
      }
      
      setSelectedPdf(null);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      let errorMessage = "Une erreur s'est produite. Veuillez réessayer plus tard.";
      
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'état hors de la plage 2xx
        console.error("Erreur de réponse:", error.response.data);
        errorMessage = error.response.data.error || errorMessage;
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error("Erreur de requête:", error.request);
        errorMessage = "Le serveur ne répond pas. Vérifiez votre connexion internet et l'état du serveur.";
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error("Erreur:", error.message);
        errorMessage = `Erreur: ${error.message}`;
      }
      
      setApiError(errorMessage);
      
      // Ajouter un message d'erreur
      const errorResponseMessage = {
        id: `error-${Date.now()}`,
        text: errorMessage,
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour démarrer une nouvelle conversation
  const startNewConversation = () => {
    if (!isLoggedIn || !etudiantId) {
      setApiError("Vous devez être connecté pour démarrer une conversation");
      return;
    }
    
    setMessages([]);
    setCurrentConversationId(null);
    setSelectedPdf(null);
    setInputText('');
    setApiError(null);
  };

  return {
    messages,
    setMessages,
    inputText,
    setInputText,
    selectedPdf,
    isLoading,
    apiError,
    setApiError,
    scrollViewRef,
    pickPdf,
    sendMessage,
    setSelectedPdf,
    histories,
    fetchHistories,
    isLoadingHistories,
    fetchConversationDetails,
    currentConversationId,
    setCurrentConversationId,
    startNewConversation,
    isLoggedIn,
    etudiantId
  };
};
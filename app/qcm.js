import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useExerciceHooks } from '../hooks/ExerciceHooks';
import { SidebarExercice } from '../components/SidebarExercice';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from './i18n'; // Import du contexte de langue

// URL de base de l'API
const API_BASE_URL = 'http://192.168.11.103:5000/api';

// Nouveau composant IntroScreen
const IntroScreen = ({ onComplete }) => {
  const { t } = useLanguage(); // Utilisation du contexte de langue
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleGetStarted = () => {
    // Slide out animation
    Animated.timing(slideAnim, {
      toValue: -Dimensions.get('window').width,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      onComplete();
    });
  };

  return (
    <Animated.View
      style={[
        styles.introContainer,
        { transform: [{ translateX: slideAnim }], opacity: fadeAnim }
      ]}
    >
      <View style={styles.introContent}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/exercice.png')} style={styles.logoImage} />
        </View>
        <Text style={styles.introTitle}>{t('aiAssistantQcmIntro')}</Text>
        <Text style={styles.introSubtitle}>
          {t('aiAssistantQcmSubtitle')}
        </Text>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedArrows}>{'>>'}</Text>
          <Text style={styles.getStartedMainText}>{t('getStarted')}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default function Exercice(props) {
  const { t } = useLanguage(); // Utilisation du contexte de langue
  const { isLoggedIn, user, logout } = useAuth();
  const etudiantId = user?.id;
  
  const {
    titre,
    setTitre,
    nbQuestions,
    setNbQuestions,
    selectedFile,
    loading,
    exerciceGenere,
    setExerciceGenere,
    handleFileSelection,
    handleSubmit,
    resetForm,
    fetchExercices,
    deleteExercice,
    getExercice
  } = useExerciceHooks();

  // États pour la sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [histories, setHistories] = useState([]);
  const [isLoadingHistories, setIsLoadingHistories] = useState(false);
  // État pour l'écran d'intro
  const [showIntro, setShowIntro] = useState(true);
  
  // États pour le modal de durée
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedQcmId, setSelectedQcmId] = useState(null);
  const [duration, setDuration] = useState('15');

  // Vérification d'authentification - CORRIGÉ: placé après la déclaration des états
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

  // Charger l'historique des exercices
  useEffect(() => {
    if (isSidebarOpen) {
      loadHistories();
    }
  }, [isSidebarOpen]);

  // Fonction pour charger l'historique des exercices
  const loadHistories = async () => {
    setIsLoadingHistories(true);
    try {
      const exercices = await fetchExercices();
      setHistories(exercices || []);
    } catch (error) {
      console.error(t('errorLoadingExercises'), error);
    } finally {
      setIsLoadingHistories(false);
    }
  };
const [showAnswers, setShowAnswers] = useState({});
  // Ouvrir/fermer la sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Sélectionner un exercice de l'historique
  const selectHistory = async (id) => {
    try {
      setIsLoadingHistories(true);
      const exerciceDetail = await getExercice(id);
      if (exerciceDetail) {
        console.log('Exercice récupéré:', exerciceDetail);
      }
      if (exerciceDetail && exerciceDetail.questions && exerciceDetail.questions.length > 0) {
        setExerciceGenere(exerciceDetail);
        setIsSidebarOpen(false);
        return exerciceDetail;
      } else {
        if (exerciceDetail === undefined || exerciceDetail === null) {
          console.error(t('exerciseNotFound'));
        } else {
          console.error(t('incompleteExercise'), exerciceDetail);
        }
        Alert.alert(t('error'), t('errorLoadingExerciseDetails'));
        return undefined;
      }
    } catch (error) {
      if (error) {
        console.error(t('errorLoadingExerciseDetails'), error);
      }
      Alert.alert(t('error'), t('errorLoadingExerciseDetails'));
      return undefined;
    } finally {
      setIsLoadingHistories(false);
    }
  };

  // Créer un nouvel exercice depuis la sidebar
  const handleNewExercice = () => {
    resetForm();
  };

  // Supprimer un exercice depuis la sidebar
  /*const handleDeleteExercice = async (id) => {
    await deleteExercice(id);
    await loadHistories();
  };*/
  const handleDeleteExercice = async (id) => {
    try {
      if (Platform.OS === 'web') {
        if (window.confirm(t('confirmDelete'))) {
          await deleteExercice(id);
        }
      } else {
        Alert.alert(
          t('confirmation'),
          t('confirmDelete'),
          [
            {
              text: t('cancel'),
              style: 'cancel'
            },
            {
              text: t('delete'),
              style: 'destructive',
              onPress: async () => {
                await deleteExercice(id);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error(t('deletionError'), error);
    }
  };

  // Gérer la fin de l'intro
  const handleIntroComplete = () => {
    setShowIntro(false);
  };
const toggleAnswer = (questionId) => {
  setShowAnswers(prev => ({
    ...prev,
    [questionId]: !prev[questionId]
  }));
};
  // Fonction pour gérer la génération du quiz
  const handleGenerateQuiz = async () => {
    try {
      const chrono = parseInt(duration);
      if (isNaN(chrono) || chrono < 1 || chrono > 60) {
        Alert.alert(t('error'), t('durationError'));
        return;
      }

      const response = await fetch(`${API_BASE_URL}/quiz/generate-from-qcm/${selectedQcmId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          etudiantId,
          chrono
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t('errorGeneratingQuiz'));
      }
      setShowDurationModal(false);
      Alert.alert(t('success'), t('exerciceGeneratedSuccess'));
    } catch (error) {
      Alert.alert(t('error'), error.message || t('errorGeneratingQuiz'));
    }
  };

  // Fonction pour ouvrir le modal de génération de quiz
  const generateQuizFromQCM = (qcmId) => {
    setSelectedQcmId(qcmId);
    setDuration('15'); // Réinitialiser la durée
    setShowDurationModal(true);
  };

  // Rendu du formulaire de génération de QCM
  const renderForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.subtitle}>{t('generateQCM')}</Text>
      
      {/* Champ pour le titre */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('qcmTitle')}</Text>
        <TextInput
          style={styles.input}
          value={titre}
          onChangeText={setTitre}
          placeholder={t('enterTitleForExercise')}
        />
      </View>
      
      {/* Champ pour le nombre de questions */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('numberOfQuestions')}</Text>
        <TextInput
          style={styles.input}
          value={nbQuestions.toString()}
          onChangeText={(text) => setNbQuestions(parseInt(text) || 0)}
          keyboardType="numeric"
          placeholder="0"
        />
      </View>
      
      {/* Sélection de fichier PDF */}
      <View style={styles.fileContainer}>
        <Text style={styles.label}>{t('pdfFile')}</Text>
        <TouchableOpacity style={styles.fileButton} onPress={handleFileSelection}>
          <Ionicons name="document-attach" size={24} color="#333" />
          <Text style={styles.fileButtonText}>
            {selectedFile ? t('changeFile') : t('selectPDFFile')}
          </Text>
        </TouchableOpacity>
        
        {/* Affichage du nom du fichier sélectionné */}
        {selectedFile && (
          <View style={styles.selectedFileCard}>
            <View style={styles.fileInfoContainer}>
              <Ionicons name="document-text" size={24} color="#3498db" />
              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                  {selectedFile.name}
                </Text>
                <Text style={styles.fileSize}>
                  {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : t('unknownSize')}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => resetForm()} style={styles.removeFileButton}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Bouton de soumission */}
      <TouchableOpacity 
        style={[styles.submitButton, (!selectedFile || loading) && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={!selectedFile || loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="create-outline" size={20} color="#FFF" />
            <Text style={styles.submitButtonText}>{t('generateQCM')}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  // Affichage du QCM généré
  const renderQCM = () => (
  <ScrollView style={styles.qcmContainer} contentContainerStyle={styles.qcmContentContainer}>
    <View style={styles.qcmHeader}>
      <Text style={styles.qcmTitle}>{exerciceGenere.titre}</Text>
      <Text style={styles.qcmConsigne}>{exerciceGenere.consigne}</Text>
      <TouchableOpacity
        style={styles.generateQuizButton}
        onPress={() => {
          generateQuizFromQCM(exerciceGenere.id);
        }}
      >
        <Ionicons name="create-outline" size={20} color="#FFF" />
        <Text style={styles.generateQuizButtonText}>{t('generateQuiz')}</Text>
      </TouchableOpacity>
    </View>
    
    {exerciceGenere.questions.map((question, qIndex) => {
      const correctIndex = question.reponses.findIndex(r => r.est_correcte);
      const isAnswerVisible = showAnswers[question.id];
      
      return (
        <View key={question.id} style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {t('question')} {qIndex + 1}: {question.texte}
          </Text>
          <View style={styles.reponsesList}>
            {question.reponses.map((reponse, rIndex) => (
              <View key={reponse.id} style={styles.reponseItem}>
                <View style={styles.reponseIndicator} />
                <Text style={styles.reponseText}>
                  {String.fromCharCode(65 + rIndex)}) {reponse.texte}
                </Text>
              </View>
            ))}
            
            {/* Bouton pour afficher/cacher la réponse */}
            <TouchableOpacity 
              style={styles.showAnswerButton}
              onPress={() => toggleAnswer(question.id)}
            >
              <Ionicons 
                name={isAnswerVisible ? "eye-off" : "eye"} 
                size={16} 
                color="#8B2FC9" 
              />
              <Text style={styles.showAnswerButtonText}>
                {isAnswerVisible ? t('hideAnswer') : t('showAnswer')}
              </Text>
            </TouchableOpacity>
            
            {/* Affichage conditionnel de la réponse */}
            {isAnswerVisible && (
              <Text style={styles.correctAnswer}>
                {t('answer')} : {String.fromCharCode(65 + correctIndex)}
              </Text>
            )}
          </View>
        </View>
      );
    })}
    
    <TouchableOpacity
      style={styles.backButton}
      onPress={resetForm}
    >
      <Ionicons name="arrow-back" size={20} color="#fff" />
      <Text style={styles.backButtonText}>{t('newQCM')}</Text>
    </TouchableOpacity>
  </ScrollView>
);

  // Ajoute ce log juste avant le rendu de la sidebar
  console.log('QCM dans l\'historique:', histories);

  return (
    <View style={styles.container}>
      {showIntro ? (
        <IntroScreen onComplete={handleIntroComplete} />
      ) : (
        <>
          {/* Header avec bouton menu - CORRIGÉ: menu à gauche */}
          <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
          <Ionicons name="menu" size={24} color="#6818A5" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{t('qcmGenerator')}</Text>
        </View>
          </View>
          {/* Contenu principal */}
          <View style={styles.content}>
            {exerciceGenere ? renderQCM() : renderForm()}
          </View>
          
          {/* Overlay pour la sidebar */}
          {isSidebarOpen && (
            <>
              <TouchableOpacity
                style={styles.overlay}
                onPress={toggleSidebar}
                activeOpacity={1}
              />
              <SidebarExercice
                histories={histories}
                onSelectHistory={selectHistory}
                onNewExercice={handleNewExercice}
                onClose={toggleSidebar}
                isLoadingHistories={isLoadingHistories}
                fetchHistories={loadHistories}
                onDeleteHistory={handleDeleteExercice}
                onGenerateQuiz={generateQuizFromQCM}
              >
                {histories && histories.map((qcm) => (
                  <View key={qcm.id} style={{ marginBottom: 12, backgroundColor: '#fff', borderRadius: 8, padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{qcm.titre}</Text>
                    <Text style={{ color: '#888', fontSize: 13 }}>{t('createdOn')} : {qcm.date_creation}</Text>
                    <TouchableOpacity
                      style={{ backgroundColor: '#0891b2', padding: 10, borderRadius: 6, marginTop: 8, alignItems: 'center' }}
                      onPress={() => {
                        generateQuizFromQCM(qcm.id);
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('generateQuiz')}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </SidebarExercice>
            </>
          )}
          
          {/* Modal pour la durée */}
          {showDurationModal && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t('exerciceDuration')}</Text>
                <Text style={styles.modalSubtitle}>{t('enterDurationMinutes')}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholder="15"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowDurationModal(false)}
                  >
                    <Text style={styles.modalButtonText}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.generateButton]}
                    onPress={handleGenerateQuiz}
                  >
                    <Text style={styles.modalButtonText}>{t('generate')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    
  },
   // Styles pour la page non connectée
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6818a5',
    marginTop: 15,
    marginBottom: 10,
  },
  showAnswerButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f0f0f0',
  borderRadius: 6,
  padding: 8,
  marginTop: 12,
  alignSelf: 'flex-start',
  borderWidth: 1,
  borderColor: '#8B2FC9',
},
showAnswerButtonText: {
  color: '#8B2FC9',
  fontSize: 14,
  fontWeight: '500',
  marginLeft: 6,
},
  notLoggedInMessage: {
    fontSize: 16,
    color: '#4F566B',
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    position: 'relative',
  },
  title: {
  position: 'absolute',
  left: 10,
  right: 0,
  textAlign: 'center',
  fontSize: 24,
  fontWeight: 'bold',
  color: '#6818A5',
},
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#2c3e50',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#2c3e50',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  fileContainer: {
    marginBottom: 24,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  fileButtonText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 16,
  },
  selectedFileCard: {
    marginTop: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileDetails: {
    marginRight: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  removeFileButton: {
    position: 'absolute', // Changé de 'left' à 'absolute'
    right: 5,
    top: 5,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  submitButton: {
    backgroundColor: '#3C0663',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 14,
  },
  disabledButton: {
    backgroundColor: '#DC97FF',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  qcmContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  qcmContentContainer: {
    padding: 16,
    paddingBottom: 30, // Ajouter un padding en bas pour le bouton
  },
  qcmHeader: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  qcmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  qcmConsigne: {
    fontSize: 16,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  questionContainer: {
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  reponsesList: {
    marginLeft: 8,
  },
  reponseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  reponseIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ddd',
    marginRight: 12,
  },
  reponseText: {
    fontSize: 14,
    color: '#34495e',
    flex: 1,
  },
  correctAnswer: {
    fontStyle: 'italic',
    marginTop: 8,
    color: '#27ae60',
    fontWeight: '500',
  },
  
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  overlayTouchable: {
    flex: 1,
  },
  // Styles pour IntroScreen
  introContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  introContent: {
    width: '80%',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoImage: {
    width: 200,
    height: 230,
    resizeMode: 'contain',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 40,
  },
  getStartedButton: {
    backgroundColor: '#8B2FC9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    padding: 14,
    width: '80%',
  },
  getStartedArrows: {
    color: '#fff',
    fontSize: 18,
    marginRight: 8,
  },
  getStartedMainText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  generateQuizButton: {
    backgroundColor: '#8B2FC9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  generateQuizButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: '#8B2FC9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#dc2626',
  },
  generateButton: {
    backgroundColor: '#0891b2',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'absolute',
    left: 20,
    right: 0,
  },
  headerTitle: {
    color: '#6818A5',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

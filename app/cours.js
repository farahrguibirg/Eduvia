import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Modal, 
  TextInput, 
  ActivityIndicator, 
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCours, api } from '../hooks/CoursHooks';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from './i18n';
import { API_URL } from '../config';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');
const cardWidth = width > 600 ? width / 2 - 24 : width - 32;

// Écran d'accueil
const WelcomeScreen = ({ onStartLearning }) => {
  const { t } = useLanguage();
  
  return (
    <SafeAreaView style={styles.welcomeContainer}>
      <View style={styles.welcomeContent}>
        <Text style={styles.courseTitle}>{t('courses')}</Text>
        <Text style={styles.subtitle}>
          {t('learnEverywhere')} <Text style={styles.highlightText}>{t('everywhere')} </Text> 
          {t('and')} <Text style={styles.highlightText}>{t('anytime')}</Text>
        </Text>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/studying.png')} 
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={onStartLearning}
        >
          <Text style={styles.startButtonText}>{t('startLearning')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Carte de cours avec statistiques
const CoursCard = ({ item, userRole, userId, onEdit, onDelete, onView, onSave, onGenerateQCM }) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const isOwner = userRole === 'enseignant' && item.utilisateur_id === userId;

  const getSemesterColor = (titre) => {
    if (titre.includes('S3') || titre.includes('Semestre 3')) return '#3b82f6';
    if (titre.includes('S4') || titre.includes('Semestre 4')) return '#10b981';
    if (titre.includes('S5') || titre.includes('Semestre 5')) return '#f59e0b';
    if (titre.includes('S6') || titre.includes('Semestre 6')) return '#ef4444';
    return '#6818a5';
  };
  
  const extractSemester = (titre) => {
    if (titre.includes('S3')) return t('s3');
    if (titre.includes('S4')) return t('s4');
    if (titre.includes('S5')) return t('s5');
    if (titre.includes('S6')) return t('s6');
    return t('course');
  };
  
  const semesterColor = getSemesterColor(item.titre);
  const semester = extractSemester(item.titre);

  // Récupérer les statistiques du cours (enseignant)
  const fetchStats = async () => {
    if (!isOwner) return;
    setLoadingStats(true);
    try {
      const response = await api.get(`/visites/cours/${item.id}/statistiques`);
      setStats(response.data);
    } catch (error) {
      console.error('Erreur statistiques:', error);
      setStats(null);
      Alert.alert(t('error'), t('errorFetchingStats'));
    } finally {
      setLoadingStats(false);
    }
  };

  // Enregistrer la visite et ouvrir le PDF
  const handleView = async () => {
    try {
      // Enregistrer la visite pour les étudiants
      if (userRole === 'etudiant') {
        try {
          await api.post(`/visites/cours/${item.id}`, { duree: 0 });
        } catch (error) {
          console.log('Erreur enregistrement visite:', error);
          // Continue même si l'enregistrement échoue
        }
      }
      
      // Ouvrir le PDF
      await onView(item.id, item.titre);
    } catch (error) {
      console.error('Erreur lors de l\'ouverture:', error);
      Alert.alert(t('error'), t('errorOpeningPdf'));
    }
  };

  const handleStatsClick = async () => {
    await fetchStats();
    setShowStatsModal(true);
  };

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <View style={[styles.cardHeader, { backgroundColor: semesterColor }]}>
        <Text style={styles.semesterText}>{semester}</Text>
        <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{item.titre}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.iconButton} onPress={handleView}>
          <MaterialIcons name="visibility" size={22} color="#BA68C8" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => onSave(item.id, item.titre)}>
          <MaterialIcons name="file-download" size={22} color="#27AE60" />
        </TouchableOpacity>
        {userRole === 'etudiant' && (
          <TouchableOpacity style={styles.iconButton} onPress={() => onGenerateQCM(item.id, item.titre)}>
            <MaterialIcons name="quiz" size={22} color="#6818A5" />
          </TouchableOpacity>
        )}
        {isOwner && (
          <>
            <TouchableOpacity style={styles.iconButton} onPress={handleStatsClick}>
              <MaterialIcons name="bar-chart" size={22} color="#8b5cf6" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => onEdit(item)}>
              <MaterialIcons name="edit" size={22} color="#3498DB" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => onDelete(item.id)}>
              <MaterialIcons name="delete" size={22} color="#FF3B30" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Modal Statistiques */}
      <Modal
        visible={showStatsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('courseStatistics')}</Text>
              <TouchableOpacity 
                onPress={() => setShowStatsModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            {loadingStats ? (
              <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
            ) : stats ? (
              <View style={{ maxHeight: 350 }}>
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
                    {t('totalVisits')} {stats.nombre_visites ?? 0}
                  </Text>
                </View>
                {Array.isArray(stats.etudiants_visiteurs) && stats.etudiants_visiteurs.length > 0 ? (
                  <View style={{ backgroundColor: '#ecdcf1', borderRadius: 10, marginTop: 14, padding: 12, marginBottom: 8 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 17, marginBottom: 10, color: '#0f172a' }}>
                      {t('visitorDetails')}
                    </Text>
                    {stats.etudiants_visiteurs.map((etudiant, idx) => (
                      <View 
                        key={idx} 
                        style={{ 
                          marginBottom: idx !== stats.etudiants_visiteurs.length - 1 ? 12 : 0, 
                          borderBottomWidth: idx !== stats.etudiants_visiteurs.length - 1 ? 1 : 0, 
                          borderBottomColor: '#bae6fd', 
                          paddingBottom: 8 
                        }}
                      >
                        <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#6818A5' }}>
                          {t('name')} : <Text style={{ color: '#0f172a' }}>{etudiant.nom}</Text>
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#6818A5' }}>
                          {t('firstName')} : <Text style={{ color: '#0f172a' }}>{etudiant.prenom}</Text>
                        </Text>
                        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                          {t('visitDate')} {new Date(etudiant.date_visite).toLocaleString('fr-FR')}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={{ color: 'red', fontWeight: 'bold', marginTop: 20 }}>
                    {t('noVisitorData')}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={{ color: 'red', fontWeight: 'bold' }}>
                {t('noStatisticsAvailable')}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Composant principal
const CourseApp = () => {
  const { user, isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const { 
    cours, 
    loading, 
    error, 
    downloadPdf, 
    viewPdf,  
    pickPdf, 
    ajouterPdf, 
    updatePdf, 
    deletePdf 
  } = useCours();

  const [showWelcome, setShowWelcome] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [titre, setTitre] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingCours, setEditingCours] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredCours, setFilteredCours] = useState([]);
  const [qcmModalVisible, setQcmModalVisible] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState('');
  const [qcmTitle, setQcmTitle] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState('5');
  const [qcmQuestions, setQcmQuestions] = useState(null);
  const [showQcmQuestions, setShowQcmQuestions] = useState(false);
  const [showAnswers, setShowAnswers] = useState({});

  useEffect(() => {
    if (cours) {
      setFilteredCours(
        cours.filter(item => 
          item.titre.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
  }, [searchText, cours]);

  // Ajout d'un cours
  const handleAddCours = async () => {
    if (!titre.trim()) {
      Alert.alert(t('error'), t('enterTitle'));
      return;
    }
    if (!selectedFile) {
      Alert.alert(t('error'), t('selectPdfFile'));
      return;
    }
    
    try {
      const success = await ajouterPdf(titre, selectedFile);
      if (success) {
        setModalVisible(false);
        setTitre('');
        setSelectedFile(null);
        Alert.alert(t('success'), t('courseAddedSuccess'));
      } else {
        Alert.alert(t('error'), t('errorAddingCourse'));
      }
    } catch (error) {
      console.error('Erreur ajout cours:', error);
      Alert.alert(t('error'), t('errorAddingCourse'));
    }
  };

  // Modification d'un cours
  const handleUpdateCours = async () => {
    if (!titre.trim()) {
      Alert.alert(t('error'), t('enterTitle'));
      return;
    }
    
    try {
      const success = await updatePdf(editingCours.id, titre, selectedFile);
      if (success) {
        setEditModalVisible(false);
        setTitre('');
        setSelectedFile(null);
        setEditingCours(null);
        Alert.alert(t('success'), t('courseUpdatedSuccess'));
      } else {
        Alert.alert(t('error'), t('errorUpdatingCourse'));
      }
    } catch (error) {
      console.error('Erreur modification cours:', error);
      Alert.alert(t('error'), t('errorUpdatingCourse'));
    }
  };

  // Ouvrir le modal d'édition
  const openEditModal = (item) => {
    setEditingCours(item);
    setTitre(item.titre);
    setSelectedFile(null);
    setEditModalVisible(true);
  };

  // Sélection d'un fichier
  const handleFilePick = async () => {
    try {
      const file = await pickPdf();
      if (file) {
        setSelectedFile(file);
      }
    } catch (error) {
      console.error('Erreur sélection fichier:', error);
      Alert.alert(t('error'), t('pdfSelectionError'));
    }
  };

  // Suppression d'un cours
  const handleDeleteCours = (id) => {
    Alert.alert(
      t('confirm'),
      t('deleteConfirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deletePdf(id);
              if (success) {
                Alert.alert(t('success'), t('courseDeletedSuccess'));
              } else {
                Alert.alert(t('error'), t('errorDeletingCourse'));
              }
            } catch (error) {
              console.error('Erreur suppression cours:', error);
              Alert.alert(t('error'), t('errorDeletingCourse'));
            }
          }
        }
      ]
    );
  };

  // Visualiser un PDF - Version corrigée
  const handleViewPdf = async (id, titre) => {
    try {
      console.log('Tentative d\'ouverture du PDF:', { id, titre });
      const success = await viewPdf(id, titre);
      
      if (!success) {
        console.error('viewPdf a retourné false');
        Alert.alert(
          t('error'), 
          t('cannotOpenPdf'),
          [
            { text: t('cancel'), style: 'cancel' },
            { 
              text: t('download'), 
              onPress: () => handleSavePdf(id, titre)
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du PDF:', error);
      Alert.alert(
        t('error'), 
        t('tryDownload'),
        [
          { text: t('cancel'), style: 'cancel' },
          { 
            text: t('download'), 
            onPress: () => handleSavePdf(id, titre)
          }
        ]
      );
    }
  };

  // Télécharger un PDF - Version améliorée
  const handleSavePdf = async (id, titre) => {
    try {
      console.log('Tentative de téléchargement du PDF:', { id, titre });
      const success = await downloadPdf(id, titre);
      
      if (success) {
        Alert.alert(t('success'), t('downloadSuccess'));
      } else {
        console.error('downloadPdf a retourné false');
        Alert.alert(t('error'), t('cannotDownloadPdf'));
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      Alert.alert(t('error'), t('errorDownloadingPdf'));
    }
  };

  // Fonction utilitaire pour vérifier/télécharger le PDF du cours
  const getOrDownloadCoursePdf = async (courseId, courseTitle) => {
    const fileUri = FileSystem.documentDirectory + `cours_${courseId}.pdf`;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (fileInfo.exists) {
      // Le fichier est déjà téléchargé
      return fileUri;
    } else {
      // Télécharger le fichier
      const url = `${API_URL}/cours/${courseId}/pdf`;
      const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
      await downloadResumable.downloadAsync();
      return fileUri;
    }
  };

  // Fonction pour gérer la génération d'un QCM
  const handleGenerateQCM = (courseId, courseTitle) => {
    setSelectedCourseId(courseId);
    setSelectedCourseTitle(courseTitle);
    setQcmTitle(`QCM - ${courseTitle}`);
    setQcmModalVisible(true);
  };

  // Fonction pour soumettre la génération du QCM
  const handleSubmitQCM = async () => {
    if (!qcmTitle.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre pour le QCM');
      return;
    }

    const numQuestions = parseInt(numberOfQuestions);
    if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 20) {
      Alert.alert('Erreur', 'Le nombre de questions doit être entre 1 et 20');
      return;
    }

    try {
      // Appel à la nouvelle route pour générer un QCM à partir d'un cours existant
      const response = await api.post('/exercices/qcm-from-cours', {
        cours_id: selectedCourseId,
        etudiant_id: user.id,
        titre: qcmTitle,
        nb_questions: numQuestions
      });

      const data = response.data;
      if (!data.exercice) {
        throw new Error(data.erreur || 'Erreur lors de la génération du QCM');
      }

      // Récupérer les détails de l'exercice généré (si besoin)
      setQcmQuestions(data.exercice);
      setShowQcmQuestions(true);
      Alert.alert('Succès', 'Le QCM a été généré avec succès');
    } catch (error) {
      console.error('Erreur complète:', error);
      Alert.alert('Erreur', error.message || 'Impossible de générer le QCM');
    }
  };

  // Fonction pour afficher/cacher la réponse d'une question
  const toggleAnswer = (questionId) => {
    setShowAnswers((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const numColumns = width > 600 ? 2 : 1;

  if (showWelcome) {
    return <WelcomeScreen onStartLearning={() => setShowWelcome(false)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>{t('yourCourses')}</Text>
        {user?.type === 'enseignant' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>{t('add')}</Text>
            <Ionicons name="add-circle" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchCourses')}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : filteredCours.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="school" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>
            {searchText.length > 0 
              ? t('noCourseFound')
              : t('noCoursesAvailable')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCours}
          renderItem={({ item }) => (
            <CoursCard 
              item={item}
              userRole={user?.type}
              userId={user?.id}
              onEdit={user?.type === 'enseignant' ? openEditModal : undefined}
              onDelete={user?.type === 'enseignant' ? handleDeleteCours : undefined}
              onView={handleViewPdf}
              onSave={handleSavePdf}
              onGenerateQCM={handleGenerateQCM}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
        />
      )}

      {/* Modal pour ajouter un cours */}
      {user?.type === 'enseignant' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('addNewCourse')}</Text>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('courseTitle')}
                value={titre}
                onChangeText={setTitre}
              />
              <TouchableOpacity 
                style={styles.filePickerButton}
                onPress={handleFilePick}
              >
                <Ionicons name="document-attach" size={24} color="#8B2FC9" />
                <Text style={styles.filePickerText}>
                  {selectedFile ? selectedFile.name : t('selectPdf')}
                </Text>
              </TouchableOpacity>
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setTitre('');
                    setSelectedFile(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleAddCours}
                >
                  <Text style={styles.confirmButtonText}>{t('add')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal pour modifier un cours */}
      {user?.type === 'enseignant' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('editCourse')}</Text>
                <TouchableOpacity 
                  onPress={() => setEditModalVisible(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('courseTitle')}
                value={titre}
                onChangeText={setTitre}
              />
              <TouchableOpacity 
                style={styles.filePickerButton}
                onPress={handleFilePick}
              >
                <Ionicons name="document-attach" size={24} color="#8B2FC9" />
                <Text style={styles.filePickerText}>
                  {selectedFile 
                    ? t('newFile') + ' ' + selectedFile.name 
                    : t('selectNewPdf')}
                </Text>
              </TouchableOpacity>
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setEditModalVisible(false);
                    setTitre('');
                    setSelectedFile(null);
                    setEditingCours(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleUpdateCours}
                >
                  <Text style={styles.confirmButtonText}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal pour générer un QCM (étudiant uniquement) */}
      {user?.type === 'etudiant' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={qcmModalVisible}
          onRequestClose={() => {
            setQcmModalVisible(false);
            setShowQcmQuestions(false);
            setQcmQuestions(null);
            setShowAnswers({});
          }}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {showQcmQuestions ? 'Questions du QCM' : 'Générer un QCM'}
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setQcmModalVisible(false);
                    setShowQcmQuestions(false);
                    setQcmQuestions(null);
                    setShowAnswers({});
                  }}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {!showQcmQuestions ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Titre du QCM"
                    value={qcmTitle}
                    onChangeText={setQcmTitle}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre de questions (1-20)"
                    value={numberOfQuestions}
                    onChangeText={setNumberOfQuestions}
                    keyboardType="numeric"
                  />
                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => {
                        setQcmModalVisible(false);
                        setQcmTitle('');
                        setNumberOfQuestions('5');
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.confirmButton]}
                      onPress={handleSubmitQCM}
                    >
                      <Text style={styles.confirmButtonText}>Générer</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <ScrollView style={styles.questionsContainer} contentContainerStyle={{paddingBottom: 24}}>
                  <View style={{marginBottom: 16}}>
                    <Text style={{fontWeight: 'bold', fontSize: 18, marginBottom: 8}}>{qcmQuestions?.titre}</Text>
                    <Text style={{fontStyle: 'italic', color: '#6b7280', marginBottom: 16}}>{qcmQuestions?.consigne}</Text>
                  </View>
                  {qcmQuestions?.questions?.map((question, qIndex) => {
                    const correctIndex = question.reponses.findIndex(r => r.est_correcte);
                    const isAnswerVisible = showAnswers[question.id];
                    return (
                      <View key={question.id} style={styles.questionCard}>
                        <Text style={styles.questionText}>
                          Question {qIndex + 1}: {question.texte}
                        </Text>
                        <View style={styles.answersContainer}>
                          {question.reponses.map((reponse, rIndex) => (
                            <View key={reponse.id} style={styles.answerItem}>
                              <View style={styles.answerIndicator} />
                              <Text style={styles.answerText}>
                                {String.fromCharCode(65 + rIndex)}) {reponse.texte}
                              </Text>
                            </View>
                          ))}
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
                    onPress={() => {
                      setShowQcmQuestions(false);
                      setQcmQuestions(null);
                      setShowAnswers({});
                    }}
                  >
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                    <Text style={styles.backButtonText}>{t('newQCM')}</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // ...styles inchangés...
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
notLoggedInMessage: {
  fontSize: 16,
  color: '#4F566B',
  textAlign: 'center',
  lineHeight: 22,
},
  welcomeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  highlightText: {
    color: '#8B2FC9',
    fontWeight: '700',
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeImage: {
    width: '100%',
    height: '100%',
  },
  startButton: {
    backgroundColor: '#8B2FC9',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6818a5',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B2FC9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#4b5563',
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 140,
    overflow: 'hidden',
  },
  cardHeader: {
    height: 90,
    padding: 12,
  },
  semesterText: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: 'white',
    fontWeight: '600',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
  },
  iconButton: {
    padding: 8,
    marginLeft: 12,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 12,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 20,
  },
  filePickerText: {
    marginLeft: 8,
    color: '#4b5563',
    fontSize: 16,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  confirmButton: {
    backgroundColor: '#8B2FC9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  questionsContainer: {
    maxHeight: 500,
  },
  questionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  answersContainer: {
    marginLeft: 8,
  },
  answerItem: {
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    color: '#4b5563',
  },
  correctAnswer: {
    color: '#059669',
    fontWeight: '600',
  },
  answerIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ddd',
    marginRight: 12,
  },
  showAnswerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  showAnswerButtonText: {
    marginLeft: 6,
    color: '#8B2FC9',
    fontWeight: '600',
    fontSize: 14,
  },
  backButton: {
    backgroundColor: '#8B2FC9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 14,
    marginTop: 20,
    marginBottom: 30,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default CourseApp;
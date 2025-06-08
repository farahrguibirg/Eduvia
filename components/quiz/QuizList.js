import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, ActivityIndicator, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../app/i18n';
import { Svg, Circle } from 'react-native-svg';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

// Fonction pour tronquer le texte
const truncateText = (text, length = 40) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

const QuizList = ({ route, API_URL, onBackToIntro }) => {
  const navigation = useNavigation();
  const router = useRouter();
  const { setShowIntro } = useAuth();
  const { t } = useLanguage();
  const { userType, userId } = route.params;
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    console.log('QuizList fetching data with:', { userType, userId, API_URL });
    
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/quiz${userType === 'enseignant' ? `/enseignant/${userId}` : ''}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Quizzes data received:', data);
        setQuizzes(data);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [userType, userId, API_URL]);

  const handleQuizPress = (quiz) => {
    console.log('Quiz pressed:', quiz);
    if (userType === 'enseignant') {
      console.log('Navigating to QuizResults with quizId:', quiz.id);
      navigation.navigate('QuizResults', { quizId: quiz.id });
    } else {
      console.log('Navigating to TakeQuiz with quizId:', quiz.id, 'and etudiantId:', userId);
      navigation.navigate('TakeQuiz', { quizId: quiz.id, etudiantId: userId });
    }
  };

  const handleGenerateFromQuiz = async (quizId) => {
    try {
      setGeneratingQuiz(true);
      const quizResponse = await fetch(`${API_URL}/quiz/${quizId}`);
      if (!quizResponse.ok) {
        throw new Error(t('quizNotFound'));
      }
      
      const quizData = await quizResponse.json();
      if (!quizData.questions || quizData.questions.length === 0) {
        throw new Error(t('noQuestionsInQuiz'));
      }

      console.log('Génération d\'un nouveau quiz à partir de:', quizId);
      const response = await fetch(`${API_URL}/quiz-generator/generate-from-existing/${quizId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          [userType === 'enseignant' ? 'enseignantId' : 'etudiantId']: userId,
          variations: true,
          options: {
            shuffleQuestions: true,
            shuffleAnswers: true,
            varyQuestionText: true,
            varyAnswerText: true,
            keepCorrectAnswer: true
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`${t('serverErrorGeneration')}: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Quiz généré avec succès:', data);

      if (!data || !data.id) {
        throw new Error(t('invalidQuizData'));
      }

      setQuizzes(prevQuizzes => [...prevQuizzes, data]);
      Alert.alert(t('success'), t('quizGeneratedSuccess'));
    } catch (error) {
      console.error('Error generating quiz:', error);
      Alert.alert(
        t('error'),
        `${t('cannotGenerateQuiz')}: ${error.message}`
      );
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/quiz/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur backend suppression:', errorText);
        throw new Error(t('errorDeletingQuiz'));
      }

      setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizId));
      Alert.alert(t('success'), t('quizDeletedSuccess'));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      Alert.alert(t('error'), t('cannotDeleteQuiz'));
    }
  };

  const handleEditQuiz = async (quiz) => {
    console.log('EDIT QUIZ NAVIGATION:', {
      enseignantId: userId,
      editMode: true,
      quizData: quiz
    });
    const response = await fetch(`${API_URL}/quiz/${quiz.id}`);
    const quizData = await response.json();
    navigation.push('CreateQuiz', { 
      enseignantId: userId,
      editMode: true,
      quizData
    });
  };

  const handleCloseSidebar = () => setShowSidebar(false);

  const renderQuizItem = ({ item }) => (
    <View style={styles.quizItem}>
      <Svg
        height="100%"
        width="100%"
        style={{ position: 'absolute', top: 0, left: 0, opacity: 0.08, zIndex: 0 }}
        pointerEvents="none"
      >
        <Circle cx="40" cy="40" r="18" fill="#6818A5" />
        <Circle cx="80" cy="80" r="10" fill="#6818A5" />
        <Circle cx="60" cy="120" r="6" fill="#6818A5" />
        <Circle cx="120" cy="40" r="8" fill="#6818A5" />
      </Svg>
      <TouchableOpacity
        onPress={() => handleQuizPress(item)}
        style={styles.quizContent}
      >
        <Text style={styles.quizTitle}>{item.titre}</Text>
        <View style={[
          styles.quizDurationBadge,
          item.type === 'etudiant' && styles.quizDurationBadgeStudent,
          item.type === 'prof' && styles.quizDurationBadgeTeacher
        ]}>
          <Ionicons 
            name="time-outline" 
            size={16} 
            color={item.type === 'etudiant' ? '#fff' : '#fff'} 
            style={{ marginRight: 4 }} 
          />
          <Text style={[
            styles.quizDurationText,
            item.type === 'etudiant' && styles.quizDurationTextStudent,
            item.type === 'prof' && styles.quizDurationTextTeacher
          ]}>
            {item.chrono} {t('minutes')}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.quizActions}>
        {userType === 'enseignant' ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditQuiz(item)}
            >
              <Ionicons name="pencil" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                Alert.alert(
                  t('confirmation'),
                  t('deleteConfirmation'),
                  [
                    { text: t('cancel'), style: 'cancel' },
                    { text: t('delete'), onPress: () => handleDeleteQuiz(item.id), style: 'destructive' }
                  ]
                );
              }}
            >
              <Ionicons name="trash" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.generateButton]}
              onPress={() => handleGenerateFromQuiz(item.id)}
              disabled={generatingQuiz}
            >
              <MaterialCommunityIcons name="auto-fix" size={22} color="#fff" />
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('error')}: {error}</Text>
        <Text>{t('serverError')} {API_URL}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('index')}
        >
          <Ionicons name="arrow-back" size={24} color="#6818A5" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{t('quiz')}</Text>
        </View>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowSidebar(true)}
        >
          <Ionicons name="menu" size={24} color="#6818A5" />
        </TouchableOpacity>
      </View>

      {/* Menu latéral (sidebar) */}
      {showSidebar && (
        <View style={styles.sidebarOverlay}>
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>{t('menuQuiz')}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleCloseSidebar}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.newQuizButton}
              onPress={() => {
                handleCloseSidebar();
                if (userType === 'etudiant') {
                  navigation.navigate('qcm');
                } else {
                  navigation.navigate('CreateQuiz', { enseignantId: userId });
                }
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" />
              <Text style={styles.newQuizText}>{t('createQuiz')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => {
                handleCloseSidebar();
                onBackToIntro();
              }}
            >
              <Text style={styles.refreshButtonText}>{t('quizHome')}</Text>
              <Ionicons name="home-outline" size={18} color="#3C0663" />
            </TouchableOpacity>
            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>{t('quizColors')}</Text>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#6818A5' }]} />
                <Text style={styles.legendText}>{t('studentQuiz')}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#9B6BDF' }]} />
                <Text style={styles.legendText}>{t('teacherQuiz')}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.sidebarOverlayTouchable}
            onPress={handleCloseSidebar}
            activeOpacity={1}
          />
        </View>
      )}

      {quizzes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('noQuizAvailable')}</Text>
        </View>
      ) : (
        <FlatList
          key="grid"
          data={quizzes}
          keyExtractor={item => item.id.toString()}
          renderItem={renderQuizItem}
          numColumns={2}
          columnWrapperStyle={{ 
            justifyContent: 'space-between',
            paddingHorizontal: 16,
          }}
          contentContainerStyle={{ 
            paddingVertical: 16,
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6818A5',
  },
  backButton: {
    position: 'absolute',
    top: 15,
    right: 10,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6818A5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 10,
    fontSize: 16,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: '#6818A5',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6818A5',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6818A5',
    textAlign: 'center',
    opacity: 0.7,
  },
  quizItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(104, 24, 165, 0.1)',
    aspectRatio: 1,
    width: '48%',
  },
  quizContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizTitle: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 12,
    color: '#1a1a1a',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  quizDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#6818A5',
  },
  quizDurationBadgeStudent: {
    backgroundColor: '#6818A5',
    borderWidth: 1,
    borderColor: '#6818A5',
  },
  quizDurationBadgeTeacher: {
    backgroundColor: '#9B6BDF',
    borderWidth: 1,
    borderColor: '#9B6BDF',
  },
  quizDurationText: {
    color: '#6818A5',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  quizDurationTextStudent: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  quizDurationTextTeacher: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  quizActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
    backgroundColor: 'transparent',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  editButton: {
    backgroundColor: '#3498DB',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
  generateButton: {
    backgroundColor: '#6818A5',
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    elevation: 1000,
    flexDirection: 'row',
  },
  sidebarOverlayTouchable: {
    flex: 1,
  },
  sidebar: {
    width: 320,
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 5,
  },
  newQuizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3C0663',
    margin: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newQuizText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3C0663',
    borderRadius: 8,
    backgroundColor: '#DC97FF',
  },
  refreshButtonText: {
    color: '#3C0663',
    marginRight: 8,
  },
  legendContainer: {
    margin: 12,
    padding: 12,
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 0,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333333',
  },
});

export default QuizList;
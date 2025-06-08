{/*import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { API_URL } from '../../config';

const TakeQuiz = ({ navigation, route }) => {
  const { quizId, etudiantId } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Ajouter la fonction isAllQuestionsAnswered
  const isAllQuestionsAnswered = () => {
    if (!quiz || !quiz.questions) return false;
    return quiz.questions.every(question => answers[question.id] !== undefined);
  };

  useEffect(() => {
    fetch(`${API_URL}/quiz/${quizId}`)
      .then(res => {
        console.log('Status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Quiz data:', data);
        setQuiz(data);
        if (data.chrono) {
          setTimeLeft(data.chrono * 60); // Convertir les minutes en secondes
        }
      })
      .catch(err => {
        console.error('Erreur fetch quiz:', err);
        setQuiz({ error: true });
      });
  }, []);

  // Gestion du chronomètre
  useEffect(() => {
    if (!timeLeft || isTimeUp) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          handleSubmit(true); // On force temps_ecoule à true
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimeUp]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (forceTimeUp = false) => {
    // Si forceTimeUp est un objet (événement), on le force à false
    if (typeof forceTimeUp === 'object') forceTimeUp = false;
    try {
      // Vérifier si le temps est vraiment écoulé
      const tempsEcouleFinal = forceTimeUp || (timeLeft === 0);
      
      // Créer un tableau simple pour les réponses
      const answersArray = [];
      for (const [question_id, reponse_id] of Object.entries(answers)) {
        answersArray.push({
          question_id: Number(question_id),
          reponse_id: Number(reponse_id)
        });
      }

      // Créer un objet simple pour la requête
      const requestData = {
        etudiant_id: Number(etudiantId),
        answers: answersArray,
        temps_ecoule: tempsEcouleFinal
      };

      // Logs de débogage avec des valeurs simples
      console.log('DEBUG: Temps restant =', timeLeft);
      console.log('DEBUG: Temps écoulé =', tempsEcouleFinal);
      console.log('DEBUG: Nombre de réponses =', answersArray.length);

      // Envoyer la requête
      fetch(`${API_URL}/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(result => {
        Alert.alert(
          'Quiz terminé',
          `Score: ${result.score}%\n\n` +
          `${result.temps_ecoule ? '⚠️ Le temps est écoulé\n' : ''}` +
          `${!result.reponses_completes ? "⚠️ Toutes les questions n'ont pas été répondues\n" : ''}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      })
      .catch(error => {
        console.error('Erreur soumission quiz:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors de la soumission du quiz.');
      });
    } catch (error) {
      console.error('Erreur lors de la préparation de la soumission:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la préparation de la soumission du quiz.');
    }
  };

  if (!quiz) return <Text>Chargement...</Text>;
  if (quiz.error) return <Text style={{ color: 'red' }}>Erreur lors du chargement du quiz.</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{quiz.titre}</Text>
        <Text style={styles.timer}>Temps restant: {formatTime(timeLeft)}</Text>
      </View>

      <ScrollView 
        style={styles.questionsContainer}
        contentContainerStyle={styles.questionsContent}
        showsVerticalScrollIndicator={true}
      >
        {quiz.questions.map((question, index) => (
          <View key={question.id} style={styles.questionCard}>
            <Text style={styles.questionNumber}>Question {index + 1}</Text>
            <Text style={styles.questionText}>{question.texte}</Text>
            
            <View style={styles.answersContainer}>
              {question.reponses.map((reponse, repIndex) => (
                <TouchableOpacity
                  key={reponse.id}
                  style={[
                    styles.answerButton,
                    answers[question.id] === reponse.id && styles.selectedAnswer
                  ]}
                  onPress={() => !isTimeUp && setAnswers({ ...answers, [question.id]: reponse.id })}
                >
                  <Text style={[
                    styles.answerText,
                    answers[question.id] === reponse.id && styles.selectedAnswerText
                  ]}>
                    {String.fromCharCode(65 + repIndex)}) {reponse.texte}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, !isAllQuestionsAnswered() && styles.disabledButton]}
          onPress={() => handleSubmit(false)}
          disabled={!isAllQuestionsAnswered()}
        >
          <Text style={styles.submitButtonText}>
            {isAllQuestionsAnswered() ? 'Soumettre' : 'Répondez à toutes les questions'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Modifier les styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  timer: {
    fontSize: 16,
    color: '#666',
  },
  questionsContainer: {
    flex: 1,
  },
  questionsContent: {
    padding: 16,
    paddingBottom: 100, // Espace pour le bouton de soumission
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  answersContainer: {
    marginTop: 8,
  },
  answerButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedAnswer: {
    backgroundColor: '#0891b2',
    borderColor: '#0891b2',
  },
  answerText: {
    fontSize: 15,
    color: '#2c3e50',
  },
  selectedAnswerText: {
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#0891b2',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#a0c4de',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TakeQuiz; */}{/*
import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { API_URL } from '../../config';

const TakeQuiz = ({ navigation, route }) => {
  const { quizId, etudiantId } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Fonction pour vérifier si toutes les questions sont répondues
  const isAllQuestionsAnswered = () => {
    if (!quiz || !quiz.questions) return false;
    
    for (let question of quiz.questions) {
      const answer = answers[question.id];
      if (answer === undefined || answer === null) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    fetch(`${API_URL}/quiz/${quizId}`)
      .then(res => {
        console.log('Status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Quiz data:', JSON.stringify(data, null, 2));
        setQuiz(data);
        
        // Initialiser answers avec undefined pour chaque question
        const initialAnswers = {};
        if (data.questions) {
          data.questions.forEach(question => {
            initialAnswers[question.id] = undefined;
          });
        }
        setAnswers(initialAnswers);
        console.log('Initial answers state:', initialAnswers);
        
        if (data.chrono) {
          setTimeLeft(data.chrono * 60);
        }
      })
      .catch(err => {
        console.error('Erreur fetch quiz:', err);
        setQuiz({ error: true });
      });
  }, [quizId]);

  // Gestion du chronomètre
  useEffect(() => {
    if (!timeLeft || isTimeUp || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimeUp]);

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Fonction pour gérer la sélection de réponse
  const handleAnswerSelect = (questionId, reponseId) => {
    if (isTimeUp) return;
    
    console.log(`=== SÉLECTION RÉPONSE ===`);
    console.log(`Question ID: ${questionId} (type: ${typeof questionId})`);
    console.log(`Réponse ID: ${reponseId} (type: ${typeof reponseId})`);
    
    setAnswers(prevAnswers => {
      const newAnswers = {
        ...prevAnswers,
        [questionId]: reponseId
      };
      
      console.log('Ancien état:', prevAnswers);
      console.log('Nouvel état:', newAnswers);
      console.log(`Réponse pour question ${questionId}:`, newAnswers[questionId]);
      
      return newAnswers;
    });
  };

  const handleSubmit = (forceTimeUp = false) => {
    if (typeof forceTimeUp === 'object') forceTimeUp = false;
    
    try {
      const tempsEcouleFinal = forceTimeUp || (timeLeft === 0);
      
      console.log('=== PRÉPARATION SOUMISSION ===');
      console.log('État final des réponses:', answers);
      console.log('Quiz questions:', quiz?.questions?.map(q => ({ id: q.id, texte: q.texte })));
      
      // Créer le tableau de réponses
      const answersArray = [];
      
      if (quiz && quiz.questions) {
        quiz.questions.forEach(question => {
          const selectedAnswerId = answers[question.id];
          
          console.log(`Question ${question.id}: réponse sélectionnée = ${selectedAnswerId}`);
          
          answersArray.push({
            question_id: parseInt(question.id),
            reponse_id: selectedAnswerId !== undefined ? parseInt(selectedAnswerId) : null
          });
        });
      }

      const requestData = {
        etudiant_id: parseInt(etudiantId),
        answers: answersArray,
        temps_ecoule: tempsEcouleFinal
      };

      console.log('=== DONNÉES ENVOYÉES ===');
      console.log(JSON.stringify(requestData, null, 2));

      fetch(`${API_URL}/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      .then(res => {
        console.log('Response status:', res.status);
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(result => {
        console.log('Résultat reçu:', result);
        Alert.alert(
          'Quiz terminé',
          `Score: ${result.score}%\n\n` +
          `${result.temps_ecoule ? '⚠️ Le temps est écoulé\n' : ''}` +
          `${!result.reponses_completes ? "⚠️ Toutes les questions n'ont pas été répondues\n" : ''}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      })
      .catch(error => {
        console.error('Erreur soumission quiz:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors de la soumission du quiz.');
      });
    } catch (error) {
      console.error('Erreur lors de la préparation de la soumission:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la préparation de la soumission du quiz.');
    }
  };

  if (!quiz) return <Text>Chargement...</Text>;
  if (quiz.error) return <Text style={{ color: 'red' }}>Erreur lors du chargement du quiz.</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{quiz.titre}</Text>
        {timeLeft && (
          <Text style={[styles.timer, timeLeft < 60 && styles.timerUrgent]}>
            Temps restant: {formatTime(timeLeft)}
          </Text>
        )}
      </View>

      <ScrollView 
        style={styles.questionsContainer}
        contentContainerStyle={styles.questionsContent}
        showsVerticalScrollIndicator={true}
      >
        {quiz.questions && quiz.questions.map((question, index) => (
          <View key={question.id} style={styles.questionCard}>
            <Text style={styles.questionNumber}>Question {index + 1}</Text>
            <Text style={styles.questionText}>{question.texte}</Text>
            
            <View style={styles.answersContainer}>
              {question.reponses && question.reponses.map((reponse, repIndex) => {
                const isSelected = answers[question.id] === reponse.id;
                
                return (
                  <TouchableOpacity
                    key={reponse.id}
                    style={[
                      styles.answerButton,
                      isSelected && styles.selectedAnswer
                    ]}
                    onPress={() => handleAnswerSelect(question.id, reponse.id)}
                    disabled={isTimeUp}
                  >
                    <Text style={[
                      styles.answerText,
                      isSelected && styles.selectedAnswerText
                    ]}>
                      {String.fromCharCode(65 + repIndex)}) {reponse.texte}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Indicateur de sélection pour debug 
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>
                Sélectionné: {answers[question.id] ? `ID ${answers[question.id]}` : 'Aucune réponse'}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {Object.values(answers).filter(a => a !== undefined).length} / {quiz.questions?.length || 0} réponses
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.submitButton, 
            !isAllQuestionsAnswered() && !isTimeUp && styles.disabledButton
          ]}
          onPress={() => handleSubmit(false)}
          disabled={!isAllQuestionsAnswered() && !isTimeUp}
        >
          <Text style={styles.submitButtonText}>
            {isTimeUp 
              ? 'Temps écoulé - Soumettre' 
              : isAllQuestionsAnswered() 
                ? 'Soumettre le quiz' 
                : `Répondez à toutes les questions (${Object.values(answers).filter(a => a !== undefined).length}/${quiz.questions?.length || 0})`
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  timer: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  timerUrgent: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  questionsContainer: {
    flex: 1,
  },
  questionsContent: {
    padding: 16,
    paddingBottom: 120, // Plus d'espace pour le footer étendu
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    lineHeight: 22,
  },
  answersContainer: {
    marginTop: 8,
  },
  answerButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedAnswer: {
    backgroundColor: '#0891b2',
    borderColor: '#0891b2',
  },
  answerText: {
    fontSize: 15,
    color: '#2c3e50',
    lineHeight: 20,
  },
  selectedAnswerText: {
    color: '#fff',
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: 8,
    padding: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  progressContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#0891b2',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#a0c4de',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TakeQuiz;*/}
import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { API_URL } from '../../config';
import { useLanguage } from '../../app/i18n';

const TakeQuiz = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { quizId, etudiantId } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Fonction pour vérifier si toutes les questions sont répondues
  const isAllQuestionsAnswered = () => {
    if (!quiz || !quiz.questions) return false;
    
    for (let question of quiz.questions) {
      const answer = answers[question.id];
      if (answer === undefined || answer === null) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    fetch(`${API_URL}/quiz/${quizId}`)
      .then(res => {
        console.log('Status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Quiz data:', JSON.stringify(data, null, 2));
        setQuiz(data);
        
        // Initialiser answers avec undefined pour chaque question
        const initialAnswers = {};
        if (data.questions) {
          data.questions.forEach(question => {
            initialAnswers[question.id] = undefined;
          });
        }
        setAnswers(initialAnswers);
        console.log('Initial answers state:', initialAnswers);
        
        if (data.chrono) {
          setTimeLeft(data.chrono * 60);
        }
      })
      .catch(err => {
        console.error('Erreur fetch quiz:', err);
        setQuiz({ error: true });
      });
  }, [quizId]);

  // Gestion du chronomètre
  useEffect(() => {
    if (!timeLeft || isTimeUp || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimeUp]);

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Fonction pour gérer la sélection de réponse
  const handleAnswerSelect = (questionId, reponseId) => {
    if (isTimeUp) return;
    
    console.log(`=== SÉLECTION RÉPONSE ===`);
    console.log(`Question ID: ${questionId} (type: ${typeof questionId})`);
    console.log(`Réponse ID: ${reponseId} (type: ${typeof reponseId})`);
    
    setAnswers(prevAnswers => {
      const newAnswers = {
        ...prevAnswers,
        [questionId]: reponseId
      };
      
      console.log('Ancien état:', prevAnswers);
      console.log('Nouvel état:', newAnswers);
      console.log(`Réponse pour question ${questionId}:`, newAnswers[questionId]);
      
      return newAnswers;
    });
  };

  const handleSubmit = (forceTimeUp = false) => {
    if (typeof forceTimeUp === 'object') forceTimeUp = false;
    
    try {
      const tempsEcouleFinal = forceTimeUp || (timeLeft === 0);
      
      console.log('=== PRÉPARATION SOUMISSION ===');
      console.log('État final des réponses:', answers);
      console.log('Quiz questions:', quiz?.questions?.map(q => ({ id: q.id, texte: q.texte })));
      
      // Créer le tableau de réponses
      const answersArray = [];
      
      if (quiz && quiz.questions) {
        quiz.questions.forEach(question => {
          const selectedAnswerId = answers[question.id];
          
          console.log(`Question ${question.id}: réponse sélectionnée = ${selectedAnswerId}`);
          
          answersArray.push({
            question_id: parseInt(question.id),
            reponse_id: selectedAnswerId !== undefined ? parseInt(selectedAnswerId) : null
          });
        });
      }

      const requestData = {
        etudiant_id: parseInt(etudiantId),
        answers: answersArray,
        temps_ecoule: tempsEcouleFinal
      };

      console.log('=== DONNÉES ENVOYÉES ===');
      console.log(JSON.stringify(requestData, null, 2));

      fetch(`${API_URL}/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      .then(res => {
        console.log('Response status:', res.status);
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(result => {
        console.log('Résultat reçu:', result);
        Alert.alert(
          t('quizCompleted'),
          `${t('score')}: ${result.score}%\n\n` +
          `${result.temps_ecoule ? `⚠️ ${t('timeExpired')}\n` : ''}` +
          `${!result.reponses_completes ? `⚠️ ${t('notAllQuestionsAnswered')}\n` : ''}`,
          [{ text: t('ok'), onPress: () => navigation.goBack() }]
        );
      })
      .catch(error => {
        console.error('Erreur soumission quiz:', error);
        Alert.alert(t('error'), t('quizSubmissionError'));
      });
    } catch (error) {
      console.error('Erreur lors de la préparation de la soumission:', error);
      Alert.alert(t('error'), t('quizPreparationError'));
    }
  };

  if (!quiz) return <Text>{t('loading')}</Text>;
  if (quiz.error) return <Text style={{ color: 'red' }}>{t('errorLoadingQuiz')}</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{quiz.titre}</Text>
        {timeLeft && (
          <Text style={[styles.timer, timeLeft < 60 && styles.timerUrgent]}>
            {t('timeRemaining')}: {formatTime(timeLeft)}
          </Text>
        )}
      </View>

      <ScrollView 
        style={styles.questionsContainer}
        contentContainerStyle={styles.questionsContent}
        showsVerticalScrollIndicator={true}
      >
        {quiz.questions && quiz.questions.map((question, index) => (
          <View key={question.id} style={styles.questionCard}>
            <Text style={styles.questionNumber}>{t('question')} {index + 1}</Text>
            <Text style={styles.questionText}>{question.texte}</Text>
            
            <View style={styles.answersContainer}>
              {question.reponses && question.reponses.map((reponse, repIndex) => {
                const isSelected = answers[question.id] === reponse.id;
                
                return (
                  <TouchableOpacity
                    key={reponse.id}
                    style={[
                      styles.answerButton,
                      isSelected && styles.selectedAnswer
                    ]}
                    onPress={() => handleAnswerSelect(question.id, reponse.id)}
                    disabled={isTimeUp}
                  >
                    <Text style={[
                      styles.answerText,
                      isSelected && styles.selectedAnswerText
                    ]}>
                      {String.fromCharCode(65 + repIndex)}) {reponse.texte}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Indicateur de sélection pour debug */}
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>
                {t('selected')}: {answers[question.id] ? `ID ${answers[question.id]}` : t('noAnswer')}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {Object.values(answers).filter(a => a !== undefined).length} / {quiz.questions?.length || 0} {t('answers')}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.submitButton, 
            !isAllQuestionsAnswered() && !isTimeUp && styles.disabledButton
          ]}
          onPress={() => handleSubmit(false)}
          disabled={!isAllQuestionsAnswered() && !isTimeUp}
        >
          <Text style={styles.submitButtonText}>
            {isTimeUp 
              ? t('timeExpiredSubmit')
              : isAllQuestionsAnswered() 
                ? t('submitQuiz')
                : `${t('answerAllQuestions')} (${Object.values(answers).filter(a => a !== undefined).length}/${quiz.questions?.length || 0})`
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  timer: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  timerUrgent: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  questionsContainer: {
    flex: 1,
  },
  questionsContent: {
    padding: 16,
    paddingBottom: 120, // Plus d'espace pour le footer étendu
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    lineHeight: 22,
  },
  answersContainer: {
    marginTop: 8,
  },
  answerButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedAnswer: {
    backgroundColor: '#8B2FC9',
    borderColor: '#8B2FC9',
  },
  answerText: {
    fontSize: 15,
    color: '#2c3e50',
    lineHeight: 20,
  },
  selectedAnswerText: {
    color: '#fff',
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: 8,
    padding: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  progressContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6818A5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ebdbed',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TakeQuiz;
{/*import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { API_URL } from '../../config';

const QuizGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.type === 'success') {
        await uploadPDF(result);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection du fichier');
    }
  };

  const uploadPDF = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: 'application/pdf',
      });

      const response = await fetch(`${API_URL}/generate-quiz`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setQuiz(data);
      setSelectedAnswers({});
      setScore(null);
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la génération du quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const calculateScore = () => {
    if (!quiz) return;
    
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++;
      }
    });
    
    setScore({
      correct,
      total: quiz.questions.length,
      percentage: (correct / quiz.questions.length) * 100
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Générateur de Quiz</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
          <Text style={styles.uploadButtonText}>Sélectionner un PDF</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Génération du quiz en cours...</Text>
        </View>
      )}

      {quiz && (
        <View style={styles.quizContainer}>
          {quiz.questions.map((question, index) => (
            <View key={index} style={styles.questionContainer}>
              <Text style={styles.questionText}>
                {index + 1}. {question.question}
              </Text>
              {question.choices.map((choice, choiceIndex) => (
                <TouchableOpacity
                  key={choiceIndex}
                  style={[
                    styles.choiceButton,
                    selectedAnswers[index] === choice && styles.selectedChoice
                  ]}
                  onPress={() => handleAnswerSelect(index, choice)}
                >
                  <Text style={styles.choiceText}>{choice}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {Object.keys(selectedAnswers).length === quiz.questions.length && !score && (
            <TouchableOpacity style={styles.submitButton} onPress={calculateScore}>
              <Text style={styles.submitButtonText}>Vérifier les réponses</Text>
            </TouchableOpacity>
          )}

          {score && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                Score: {score.correct}/{score.total} ({score.percentage.toFixed(1)}%)
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  quizContainer: {
    padding: 20,
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  choiceButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedChoice: {
    backgroundColor: '#007AFF',
  },
  choiceText: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});

export default QuizGenerator; */}
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { API_URL } from '../../config';
import { useLanguage } from '../../app/i18n';

const QuizGenerator = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.type === 'success') {
        await uploadPDF(result);
      }
    } catch (err) {
      Alert.alert(t('error'), t('fileSelectionError'));
    }
  };

  const uploadPDF = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: 'application/pdf',
      });

      const response = await fetch(`${API_URL}/generate-quiz`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setQuiz(data);
      setSelectedAnswers({});
      setScore(null);
    } catch (error) {
      Alert.alert(t('error'), error.message || t('quizGenerationError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const calculateScore = () => {
    if (!quiz) return;
    
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++;
      }
    });
    
    setScore({
      correct,
      total: quiz.questions.length,
      percentage: (correct / quiz.questions.length) * 100
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('quizGenerator')}</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
          <Text style={styles.uploadButtonText}>{t('selectPDF')}</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>{t('generatingQuiz')}</Text>
        </View>
      )}

      {quiz && (
        <View style={styles.quizContainer}>
          {quiz.questions.map((question, index) => (
            <View key={index} style={styles.questionContainer}>
              <Text style={styles.questionText}>
                {index + 1}. {question.question}
              </Text>
              {question.choices.map((choice, choiceIndex) => (
                <TouchableOpacity
                  key={choiceIndex}
                  style={[
                    styles.choiceButton,
                    selectedAnswers[index] === choice && styles.selectedChoice
                  ]}
                  onPress={() => handleAnswerSelect(index, choice)}
                >
                  <Text style={styles.choiceText}>{choice}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {Object.keys(selectedAnswers).length === quiz.questions.length && !score && (
            <TouchableOpacity style={styles.submitButton} onPress={calculateScore}>
              <Text style={styles.submitButtonText}>{t('checkAnswers')}</Text>
            </TouchableOpacity>
          )}

          {score && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                {t('score')}: {score.correct}/{score.total} ({score.percentage.toFixed(1)}%)
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  quizContainer: {
    padding: 20,
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  choiceButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedChoice: {
    backgroundColor: '#007AFF',
  },
  choiceText: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});

export default QuizGenerator;
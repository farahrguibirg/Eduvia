{/*import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';

const EditQuiz = ({ route, navigation, API_URL }) => {
  const { quizId, enseignantId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState({
    titre: '',
    chrono: '',
    questions: []
  });

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`${API_URL}/quiz/${quizId}`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du quiz');
      }
      const data = await response.json();
      setQuiz(data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      Alert.alert('Erreur', 'Impossible de charger le quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/quiz/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titre: quiz.titre,
          chrono: parseInt(quiz.chrono),
          questions: quiz.questions,
          enseignantId: enseignantId
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde du quiz');
      }

      Alert.alert('Succès', 'Quiz modifié avec succès');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving quiz:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={styles.loadingText}>Chargement du quiz...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Titre du quiz</Text>
        <TextInput
          style={styles.input}
          value={quiz.titre}
          onChangeText={(text) => setQuiz({ ...quiz, titre: text })}
          placeholder="Entrez le titre du quiz"
        />

        <Text style={styles.label}>Durée (en minutes)</Text>
        <TextInput
          style={styles.input}
          value={quiz.chrono.toString()}
          onChangeText={(text) => setQuiz({ ...quiz, chrono: text })}
          keyboardType="numeric"
          placeholder="Entrez la durée"
        />

        <Text style={styles.sectionTitle}>Questions</Text>
        {quiz.questions.map((question, questionIndex) => (
          <View key={questionIndex} style={styles.questionContainer}>
            <Text style={styles.questionNumber}>Question {questionIndex + 1}</Text>
            <TextInput
              style={styles.input}
              value={question.text}
              onChangeText={(text) => handleQuestionChange(questionIndex, 'text', text)}
              placeholder="Entrez la question"
            />

            <Text style={styles.label}>Options</Text>
            {question.options.map((option, optionIndex) => (
              <TextInput
                key={optionIndex}
                style={styles.input}
                value={option}
                onChangeText={(text) => handleOptionChange(questionIndex, optionIndex, text)}
                placeholder={`Option ${optionIndex + 1}`}
              />
            ))}

            <Text style={styles.label}>Réponse correcte</Text>
            <TextInput
              style={styles.input}
              value={question.correctAnswer.toString()}
              onChangeText={(text) => handleQuestionChange(questionIndex, 'correctAnswer', parseInt(text))}
              keyboardType="numeric"
              placeholder="Entrez le numéro de la réponse correcte"
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    color: '#111827',
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0891b2',
  },
  button: {
    backgroundColor: '#0891b2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditQuiz; */}
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLanguage } from '../../app/i18n';

const EditQuiz = ({ route, navigation, API_URL }) => {
  const { quizId, enseignantId } = route.params;
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState({
    titre: '',
    chrono: '',
    questions: []
  });

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`${API_URL}/quiz/${quizId}`);
      if (!response.ok) {
        throw new Error(t('errorLoadingQuiz'));
      }
      const data = await response.json();
      setQuiz(data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      Alert.alert(t('error'), t('cannotLoadQuiz'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/quiz/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titre: quiz.titre,
          chrono: parseInt(quiz.chrono),
          questions: quiz.questions,
          enseignantId: enseignantId
        }),
      });

      if (!response.ok) {
        throw new Error(t('errorSavingQuiz'));
      }

      Alert.alert(t('success'), t('quizModifiedSuccess'));
      navigation.goBack();
    } catch (error) {
      console.error('Error saving quiz:', error);
      Alert.alert(t('error'), t('cannotSaveQuiz'));
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={styles.loadingText}>{t('loadingQuiz')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>{t('quizTitle')}</Text>
        <TextInput
          style={styles.input}
          value={quiz.titre}
          onChangeText={(text) => setQuiz({ ...quiz, titre: text })}
          placeholder={t('enterQuizTitle')}
        />

        <Text style={styles.label}>{t('duration')}</Text>
        <TextInput
          style={styles.input}
          value={quiz.chrono.toString()}
          onChangeText={(text) => setQuiz({ ...quiz, chrono: text })}
          keyboardType="numeric"
          placeholder={t('enterDuration')}
        />

        <Text style={styles.sectionTitle}>{t('questions')}</Text>
        {quiz.questions.map((question, questionIndex) => (
          <View key={questionIndex} style={styles.questionContainer}>
            <Text style={styles.questionNumber}>{t('questionNumber')} {questionIndex + 1}</Text>
            <TextInput
              style={styles.input}
              value={question.text}
              onChangeText={(text) => handleQuestionChange(questionIndex, 'text', text)}
              placeholder={t('enterQuestion')}
            />

            <Text style={styles.label}>{t('options')}</Text>
            {question.options.map((option, optionIndex) => (
              <TextInput
                key={optionIndex}
                style={styles.input}
                value={option}
                onChangeText={(text) => handleOptionChange(questionIndex, optionIndex, text)}
                placeholder={`${t('option')} ${optionIndex + 1}`}
              />
            ))}

            <Text style={styles.label}>{t('correctAnswer')}</Text>
            <TextInput
              style={styles.input}
              value={question.correctAnswer.toString()}
              onChangeText={(text) => handleQuestionChange(questionIndex, 'correctAnswer', parseInt(text))}
              keyboardType="numeric"
              placeholder={t('enterCorrectAnswerNumber')}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? t('saving') : t('saveChanges')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    color: '#111827',
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0891b2',
  },
  button: {
    backgroundColor: '#0891b2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditQuiz;
{/*import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../config';

const CreateQuiz = ({ route, navigation }) => {
  console.log('PARAMS:', route.params);
  const { enseignantId, editMode, quizData } = route.params || {};
  const [quiz, setQuiz] = useState({
    titre: editMode ? quizData.titre : '',
    chrono: editMode ? quizData.chrono?.toString() : '',
    questions: editMode ? (quizData.questions || []) : []
  });
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        { texte: '', reponses: [{ texte: '', est_correcte: false }] }
      ]
    });
  };

  const deleteQuestion = (questionIndex) => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer cette question ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const newQuestions = [...quiz.questions];
            newQuestions.splice(questionIndex, 1);
            setQuiz({ ...quiz, questions: newQuestions });
          }
        }
      ]
    );
  };

  const addReponse = (qIdx) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIdx].reponses.push({ texte: '', est_correcte: false });
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const deleteReponse = (qIdx, rIdx) => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer cette option ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const newQuestions = [...quiz.questions];
            newQuestions[qIdx].reponses.splice(rIdx, 1);
            setQuiz({ ...quiz, questions: newQuestions });
          }
        }
      ]
    );
  };

  const handleQuestionChange = (qIdx, field, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIdx][field] = value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleOptionChange = (qIdx, oIdx, text) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIdx].reponses[oIdx].texte = text;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleSelectCorrect = (qIdx, oIdx) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIdx].reponses = newQuestions[qIdx].reponses.map((r, idx) => ({
      ...r,
      est_correcte: idx === oIdx
    }));
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const url = editMode 
        ? `${API_URL}/quiz/${quizData.id}`
        : `${API_URL}/quiz`;
      
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titre: quiz.titre,
          chrono: parseInt(quiz.chrono),
          questions: quiz.questions.map(q => ({
            ...(q.id ? { id: q.id } : {}),
            texte: q.texte,
            reponses: q.reponses.map(r => ({
              ...(r.id ? { id: r.id } : {}),
              texte: r.texte,
              est_correcte: r.est_correcte
            }))
          })),
          enseignantId: enseignantId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur backend:', errorText);
        throw new Error(editMode ? 'Erreur lors de la modification du quiz' : 'Erreur lors de la création du quiz');
      }

      Alert.alert('Succès', editMode ? 'Quiz modifié avec succès' : 'Quiz créé avec succès');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving quiz:', error);
      Alert.alert('Erreur', editMode ? 'Impossible de modifier le quiz' : 'Impossible de créer le quiz');
    } finally {
      setSaving(false);
    }
  };

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
          value={quiz.chrono}
          onChangeText={(text) => setQuiz({ ...quiz, chrono: text })}
          keyboardType="numeric"
          placeholder="Entrez la durée"
        />

        <Text style={styles.sectionTitle}>Questions</Text>
        {quiz.questions.map((question, questionIndex) => (
          <View key={questionIndex} style={styles.questionContainer}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>Question {questionIndex + 1}</Text>
              <TouchableOpacity
                onPress={() => deleteQuestion(questionIndex)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={24} color="#dc2626" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              value={question.texte}
              onChangeText={(text) => handleQuestionChange(questionIndex, 'texte', text)}
              placeholder="Entrez la question"
            />

            <Text style={styles.label}>Options</Text>
            {question.reponses.map((option, optionIndex) => (
              <View key={optionIndex} style={styles.optionContainer}>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => handleSelectCorrect(questionIndex, optionIndex)}
                >
                  <Ionicons
                    name={option.est_correcte ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={option.est_correcte ? '#6818A5' : '#888'}
                  />
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, styles.optionInput]}
                  value={option.texte}
                  onChangeText={(text) => handleOptionChange(questionIndex, optionIndex, text)}
                  placeholder={`Option ${optionIndex + 1}`}
                />
                <TouchableOpacity
                  onPress={() => deleteReponse(questionIndex, optionIndex)}
                  style={styles.deleteOptionButton}
                >
                  <Ionicons name="close-circle" size={24} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addReponse(questionIndex)}
            >
              <Text style={styles.addButtonText}>Ajouter une option</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={addQuestion}
        >
          <Text style={styles.addButtonText}>Ajouter une question</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Sauvegarde...' : (editMode ? 'Enregistrer les modifications' : 'Créer le quiz')}
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
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6818A5',
  },
  deleteButton: {
    padding: 4,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  deleteOptionButton: {
    padding: 4,
  },
  addButton: {
    backgroundColor: '#ebdbed',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#6818A5',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6818A5',
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
  radioButton: {
    marginRight: 8,
    marginLeft: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CreateQuiz; */}
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../config';
import { useLanguage } from '../../app/i18n';

const CreateQuiz = ({ route, navigation }) => {
  console.log('PARAMS:', route.params);
  const { enseignantId, editMode, quizData } = route.params || {};
  const { t } = useLanguage();
  
  const [quiz, setQuiz] = useState({
    titre: editMode ? quizData.titre : '',
    chrono: editMode ? quizData.chrono?.toString() : '',
    questions: editMode ? (quizData.questions || []) : []
  });
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        { texte: '', reponses: [{ texte: '', est_correcte: false }] }
      ]
    });
  };

  const deleteQuestion = (questionIndex) => {
    Alert.alert(
      t('confirmation'),
      t('deleteQuestionConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            const newQuestions = [...quiz.questions];
            newQuestions.splice(questionIndex, 1);
            setQuiz({ ...quiz, questions: newQuestions });
          }
        }
      ]
    );
  };

  const addReponse = (qIdx) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIdx].reponses.push({ texte: '', est_correcte: false });
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const deleteReponse = (qIdx, rIdx) => {
    Alert.alert(
      t('confirmation'),
      t('deleteOptionConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            const newQuestions = [...quiz.questions];
            newQuestions[qIdx].reponses.splice(rIdx, 1);
            setQuiz({ ...quiz, questions: newQuestions });
          }
        }
      ]
    );
  };

  const handleQuestionChange = (qIdx, field, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIdx][field] = value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleOptionChange = (qIdx, oIdx, text) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIdx].reponses[oIdx].texte = text;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleSelectCorrect = (qIdx, oIdx) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIdx].reponses = newQuestions[qIdx].reponses.map((r, idx) => ({
      ...r,
      est_correcte: idx === oIdx
    }));
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const url = editMode 
        ? `${API_URL}/quiz/${quizData.id}`
        : `${API_URL}/quiz`;
      
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titre: quiz.titre,
          chrono: parseInt(quiz.chrono),
          questions: quiz.questions.map(q => ({
            ...(q.id ? { id: q.id } : {}),
            texte: q.texte,
            reponses: q.reponses.map(r => ({
              ...(r.id ? { id: r.id } : {}),
              texte: r.texte,
              est_correcte: r.est_correcte
            }))
          })),
          enseignantId: enseignantId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur backend:', errorText);
        throw new Error(editMode ? t('cannotModifyQuiz') : t('cannotCreateQuiz'));
      }

      Alert.alert(t('success'), editMode ? t('quizModifiedSuccess') : t('quizCreatedSuccess'));
      navigation.goBack();
    } catch (error) {
      console.error('Error saving quiz:', error);
      Alert.alert(t('error'), editMode ? t('cannotModifyQuiz') : t('cannotCreateQuiz'));
    } finally {
      setSaving(false);
    }
  };

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
          value={quiz.chrono}
          onChangeText={(text) => setQuiz({ ...quiz, chrono: text })}
          keyboardType="numeric"
          placeholder={t('enterDuration')}
        />

        <Text style={styles.sectionTitle}>{t('questions')}</Text>
        {quiz.questions.map((question, questionIndex) => (
          <View key={questionIndex} style={styles.questionContainer}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>{t('questionNumber')} {questionIndex + 1}</Text>
              <TouchableOpacity
                onPress={() => deleteQuestion(questionIndex)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={24} color="#dc2626" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              value={question.texte}
              onChangeText={(text) => handleQuestionChange(questionIndex, 'texte', text)}
              placeholder={t('enterQuestion')}
            />

            <Text style={styles.label}>{t('options')}</Text>
            {question.reponses.map((option, optionIndex) => (
              <View key={optionIndex} style={styles.optionContainer}>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => handleSelectCorrect(questionIndex, optionIndex)}
                >
                  <Ionicons
                    name={option.est_correcte ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={option.est_correcte ? '#6818A5' : '#888'}
                  />
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, styles.optionInput]}
                  value={option.texte}
                  onChangeText={(text) => handleOptionChange(questionIndex, optionIndex, text)}
                  placeholder={`${t('option')} ${optionIndex + 1}`}
                />
                <TouchableOpacity
                  onPress={() => deleteReponse(questionIndex, optionIndex)}
                  style={styles.deleteOptionButton}
                >
                  <Ionicons name="close-circle" size={24} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addReponse(questionIndex)}
            >
              <Text style={styles.addButtonText}>{t('addOption')}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={addQuestion}
        >
          <Text style={styles.addButtonText}>{t('addQuestion')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? t('saving') : (editMode ? t('saveChanges') : t('createQuizButton'))}
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
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6818A5',
  },
  deleteButton: {
    padding: 4,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  deleteOptionButton: {
    padding: 4,
  },
  addButton: {
    backgroundColor: '#ebdbed',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#6818A5',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6818A5',
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
  radioButton: {
    marginRight: 8,
    marginLeft: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CreateQuiz;
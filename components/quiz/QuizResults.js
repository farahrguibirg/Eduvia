{/*import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { API_URL } from '../../config';

const QuizResults = ({ route }) => {
  console.log('QuizResults mounted with route params:', route.params);
  const { quizId } = route.params;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!quizId) {
        console.error('No quizId provided in route params');
        setError('ID du quiz manquant');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching results for quiz:', quizId);
        const url = `${API_URL}/quiz/${quizId}/results`;
        console.log('API URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Results data received:', data);
        
        if (!Array.isArray(data)) {
          console.error('Invalid data format received:', data);
          throw new Error('Format de données invalide reçu du serveur');
        }
        
        setResults(data);
        setError(null);
      } catch (err) {
        console.error('Erreur détaillée lors de la récupération des résultats:', err);
        setError(err.message);
        Alert.alert(
          'Erreur',
          `Impossible de charger les résultats du quiz: ${err.message}\n\nVérifiez que le serveur est bien démarré sur ${API_URL}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  const renderResultDetails = (result) => (
    <View style={{ padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8, marginTop: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontWeight: 'bold', marginRight: 8 }}>Détails des réponses :</Text>
        {result.temps_ecoule ? (
          <Text style={{ color: '#dc3545', fontWeight: 'bold' }}>⏰ Temps écoulé</Text>
        ) : (
          <Text style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Dans le temps</Text>
        )}
      </View>
      {(!result.reponses_detail || result.reponses_detail.length === 0) ? (
        result.temps_ecoule ? (
          <Text style={{ color: '#dc3545', fontWeight: 'bold', fontStyle: 'italic' }}>⏰ Temps écoulé — Aucune réponse n'a été soumise</Text>
        ) : (
          <Text style={{ color: '#666', fontStyle: 'italic' }}>Aucun détail des réponses disponible</Text>
        )
      ) : (
        result.reponses_detail.map((reponse, index) => (
          <View key={index} style={{ marginBottom: 12, padding: 8, backgroundColor: '#fff', borderRadius: 4, borderLeftWidth: 5, borderLeftColor: reponse.est_correcte ? '#28a745' : '#dc3545' }}>
            <Text style={{ fontWeight: '500', marginBottom: 4 }}>Question {index + 1} :</Text>
            <Text style={{ marginBottom: 4 }}>{reponse.question_texte}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: reponse.est_correcte ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                {reponse.est_correcte ? '✅' : '❌'} Réponse : {reponse.reponse_texte}
              </Text>
              <Text style={{ marginLeft: 8, color: reponse.est_correcte ? '#28a745' : '#dc3545', fontSize: 12 }}>
                {reponse.est_correcte ? 'Bonne réponse' : 'Mauvaise réponse'}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderStatus = (result) => (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
      <View style={{ 
        backgroundColor: result.reponses_completes ? '#28a745' : '#ffc107',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
      }}>
        <Text style={{ color: 'white', fontSize: 12 }}>
          {result.reponses_completes ? '✓ Réponses complètes' : '⚠️ Réponses incomplètes'}
        </Text>
      </View>
      <View style={{ 
        backgroundColor: result.temps_ecoule ? '#dc3545' : '#28a745',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
      }}>
        <Text style={{ color: 'white', fontSize: 12 }}>
          {result.temps_ecoule ? '⏰ Temps écoulé' : '✓ Dans le temps'}
        </Text>
      </View>
      {result.questions_ids && (
        <View style={{ marginTop: 4 }}>
          <Text style={{ fontSize: 10, color: '#666' }}>
            Questions: {result.questions_ids.join(', ')}
          </Text>
          <Text style={{ fontSize: 10, color: '#666' }}>
            Répondues: {result.questions_repondues?.join(', ')}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={{ marginTop: 10 }}>Chargement des résultats...</Text>
        <Text style={{ marginTop: 5, color: '#666' }}>Quiz ID: {quizId}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>Erreur: {error}</Text>
        <Text style={{ textAlign: 'center' }}>Vérifiez que le serveur est bien démarré sur {API_URL}</Text>
        <Text style={{ marginTop: 10, color: '#666' }}>Quiz ID: {quizId}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Résultats du quiz</Text>
      {results.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Aucun résultat disponible</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 16, marginVertical: 8, backgroundColor: '#fff', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
              <TouchableOpacity onPress={() => setSelectedResult(selectedResult?.etudiant_id === item.etudiant_id ? null : item)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {item.etudiant_prenom} {item.etudiant_nom}
                  </Text>
                  <Text style={{ 
                    color: item.score === 100 ? '#28a745' : '#0891b2',
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}>
                    Score: {item.score}%
                  </Text>
                </View>
                <Text style={{ color: '#666', marginTop: 4 }}>Date: {item.date_passage}</Text>
                {renderStatus(item)}
              </TouchableOpacity>
              
              {selectedResult?.etudiant_id === item.etudiant_id && renderResultDetails(item)}
            </View>
          )}
        />
      )}
    </View>
  );
};

export default QuizResults; */}
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { API_URL } from '../../config';
import { useLanguage } from '../../app/i18n';

const QuizResults = ({ route }) => {
  const { t } = useLanguage();
  console.log('QuizResults mounted with route params:', route.params);
  const { quizId } = route.params;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!quizId) {
        console.error('No quizId provided in route params');
        setError(t('missingQuizId'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching results for quiz:', quizId);
        const url = `${API_URL}/quiz/${quizId}/results`;
        console.log('API URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Results data received:', data);
        
        if (!Array.isArray(data)) {
          console.error('Invalid data format received:', data);
          throw new Error('Format de données invalide reçu du serveur');
        }
        
        setResults(data);
        setError(null);
      } catch (err) {
        console.error('Erreur détaillée lors de la récupération des résultats:', err);
        setError(err.message);
        Alert.alert(
          t('error'),
          `${t('cannotLoadResults')}: ${err.message}\n\n${t('checkServerRunning')} ${API_URL}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId, t]);

  const renderResultDetails = (result) => (
    <View style={{ padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8, marginTop: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontWeight: 'bold', marginRight: 8 }}>{t('answerDetails')}</Text>
        {result.temps_ecoule ? (
          <Text style={{ color: '#dc3545', fontWeight: 'bold' }}>⏰ {t('timeExpired')}</Text>
        ) : (
          <Text style={{ color: '#28a745', fontWeight: 'bold' }}>✓ {t('withinTime')}</Text>
        )}
      </View>
      {(!result.reponses_detail || result.reponses_detail.length === 0) ? (
        result.temps_ecoule ? (
          <Text style={{ color: '#dc3545', fontWeight: 'bold', fontStyle: 'italic' }}>⏰ {t('noAnswerSubmitted')}</Text>
        ) : (
          <Text style={{ color: '#666', fontStyle: 'italic' }}>{t('noAnswerDetailsAvailable')}</Text>
        )
      ) : (
        result.reponses_detail.map((reponse, index) => (
          <View key={index} style={{ marginBottom: 12, padding: 8, backgroundColor: '#fff', borderRadius: 4, borderLeftWidth: 5, borderLeftColor: reponse.est_correcte ? '#28a745' : '#dc3545' }}>
            <Text style={{ fontWeight: '500', marginBottom: 4 }}>{t('question')} {index + 1} :</Text>
            <Text style={{ marginBottom: 4 }}>{reponse.question_texte}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: reponse.est_correcte ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                {reponse.est_correcte ? '✅' : '❌'} {t('answer')} : {reponse.reponse_texte}
              </Text>
              <Text style={{ marginLeft: 8, color: reponse.est_correcte ? '#28a745' : '#dc3545', fontSize: 12 }}>
                {reponse.est_correcte ? t('correctAnswer') : t('wrongAnswer')}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderStatus = (result) => (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
      <View style={{ 
        backgroundColor: result.reponses_completes ? '#28a745' : '#ffc107',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
      }}>
        <Text style={{ color: 'white', fontSize: 12 }}>
          {result.reponses_completes ? `✓ ${t('completeAnswers')}` : `⚠️ ${t('incompleteAnswers')}`}
        </Text>
      </View>
      <View style={{ 
        backgroundColor: result.temps_ecoule ? '#dc3545' : '#28a745',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
      }}>
        <Text style={{ color: 'white', fontSize: 12 }}>
          {result.temps_ecoule ? `⏰ ${t('timeExpired')}` : `✓ ${t('withinTime')}`}
        </Text>
      </View>
      {result.questions_ids && (
        <View style={{ marginTop: 4 }}>
          <Text style={{ fontSize: 10, color: '#666' }}>
            {t('questions')}: {result.questions_ids.join(', ')}
          </Text>
          <Text style={{ fontSize: 10, color: '#666' }}>
            {t('answered')}: {result.questions_repondues?.join(', ')}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={{ marginTop: 10 }}>{t('loadingResults')}</Text>
        <Text style={{ marginTop: 5, color: '#666' }}>Quiz ID: {quizId}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{t('error')}: {error}</Text>
        <Text style={{ textAlign: 'center' }}>{t('checkServerRunning')} {API_URL}</Text>
        <Text style={{ marginTop: 10, color: '#666' }}>Quiz ID: {quizId}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>{t('quizResults')}</Text>
      {results.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{t('noResultsAvailable')}</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 16, marginVertical: 8, backgroundColor: '#fff', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
              <TouchableOpacity onPress={() => setSelectedResult(selectedResult?.etudiant_id === item.etudiant_id ? null : item)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {item.etudiant_prenom} {item.etudiant_nom}
                  </Text>
                  <Text style={{ 
                    color: item.score === 100 ? '#28a745' : '#0891b2',
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}>
                    {t('score')}: {item.score}%
                  </Text>
                </View>
                <Text style={{ color: '#666', marginTop: 4 }}>{t('date')}: {item.date_passage}</Text>
                {renderStatus(item)}
              </TouchableOpacity>
              
              {selectedResult?.etudiant_id === item.etudiant_id && renderResultDetails(item)}
            </View>
          )}
        />
      )}
    </View>
  );
};

export default QuizResults;
{/*import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Composant DetailExercice à importer dans la sidebar
export default function DetailExercice({ exercice, exerciceId, getExercice, onClose }) {
  const [loading, setLoading] = useState(false);
  const [detailExercice, setDetailExercice] = useState(exercice);
  
  // Charger les détails de l'exercice si l'ID est fourni mais pas l'objet complet
  useEffect(() => {
    const loadExercice = async () => {
      if (exerciceId && !detailExercice && getExercice) {
        setLoading(true);
        try {
          const data = await getExercice(exerciceId);
          if (data) {
            setDetailExercice(data);
          }
        } catch (error) {
          console.error('Erreur lors du chargement de l\'exercice:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadExercice();
  }, [exerciceId, detailExercice, getExercice]);

  // Afficher un indicateur de chargement si nécessaire
  if (loading) {
    return (
      <View style={[styles.detailContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement de l'exercice...</Text>
      </View>
    );
  }
  
  // Si aucun exercice n'est disponible, afficher un message
  if (!detailExercice) {
    return (
      <View style={[styles.detailContainer, styles.noDataContainer]}>
        <Text style={styles.noDataText}>Exercice non disponible</Text>
        <TouchableOpacity 
          style={styles.returnButton}
          onPress={onClose}
          accessible={true}
          accessibilityLabel="Retour"
        >
          <Ionicons name="arrow-back" size={20} color="#FFF" />
          <Text style={styles.returnButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Formatage de la date
  const formattedDate = detailExercice.date_creation ? format(
    new Date(detailExercice.date_creation), 
    'dd MMMM yyyy à HH:mm', 
    { locale: fr }
  ) : 'Date inconnue';

  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>{detailExercice.titre || 'Sans titre'}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} accessible={true} accessibilityLabel="Fermer">
          <AntDesign name="close" size={24} color="#555" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.detailContent}>
        <Text style={styles.dateText}>Créé le {formattedDate}</Text>
        <Text style={styles.consigne}>{detailExercice.consigne || 'Aucune consigne disponible'}</Text>
        
        {detailExercice.questions && detailExercice.questions.length > 0 ? (
          <>
            <Text style={styles.questionsCountText}>
              {detailExercice.questions.length} questions
            </Text>
            
            {detailExercice.questions.map((question, index) => (
              <View key={question.id || `q_${index}`} style={styles.questionItem}>
                <Text style={styles.questionText}>
                  Question {index + 1}: {question.texte || 'Sans texte'}
                </Text>
                
                <View style={styles.responsesList}>
                  {question.reponses && question.reponses.map((reponse, rIndex) => (
                    <View key={reponse.id || `r_${index}_${rIndex}`} style={[
                      styles.responseItem,
                      reponse.est_correcte ? styles.correctResponseItem : {}
                    ]}>
                      <View style={[
                        styles.responseIndicator,
                        reponse.est_correcte ? styles.correctResponse : {}
                      ]} />
                      <Text style={[
                        styles.responseText,
                        reponse.est_correcte ? styles.correctResponseText : {}
                      ]}>
                        {reponse.texte || 'Sans texte'}
                        {reponse.est_correcte && " ✓"}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.noQuestionsContainer}>
            <Text style={styles.noQuestionsText}>Aucune question disponible</Text>
          </View>
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.returnButton}
        onPress={onClose}
        accessible={true}
        accessibilityLabel="Retour"
      >
        <Ionicons name="arrow-back" size={20} color="#FFF" />
        <Text style={styles.returnButtonText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  detailContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#555555',
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 30,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  detailContent: {
    flex: 1,
    padding: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
  },
  consigne: {
    fontSize: 14,
    color: '#555555',
    fontStyle: 'italic',
    marginVertical: 12,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  questionsCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
    marginBottom: 8,
  },
  questionItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  responsesList: {
    marginLeft: 8,
  },
  responseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  correctResponseItem: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderColor: '#2ecc71',
  },
  responseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DDDDDD',
    marginRight: 10,
  },
  correctResponse: {
    backgroundColor: '#2ecc71',
  },
  responseText: {
    fontSize: 13,
    color: '#555555',
  },
  correctResponseText: {
    fontWeight: '600',
    color: '#2ecc71',
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    margin: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  noQuestionsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  noQuestionsText: {
    fontSize: 14,
    color: '#888888',
    fontStyle: 'italic',
  },
});*/}{/*
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Composant DetailExercice à importer dans la sidebar
export default function DetailExercice({ exercice, exerciceId, getExercice, onClose }) {
  const [loading, setLoading] = useState(false);
  const [detailExercice, setDetailExercice] = useState(exercice);
  
  // Charger les détails de l'exercice si l'ID est fourni mais pas l'objet complet
  useEffect(() => {
    const loadExercice = async () => {
      if (exerciceId && !detailExercice && getExercice) {
        setLoading(true);
        try {
          const data = await getExercice(exerciceId);
          if (data) {
            setDetailExercice(data);
          }
        } catch (error) {
          console.error('Erreur lors du chargement de l\'exercice:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadExercice();
  }, [exerciceId, detailExercice, getExercice]);

  // Afficher un indicateur de chargement si nécessaire
  if (loading) {
    return (
      <View style={[styles.detailContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement de l'exercice...</Text>
      </View>
    );
  }
  
  // Si aucun exercice n'est disponible, afficher un message
  if (!detailExercice) {
    return (
      <View style={[styles.detailContainer, styles.noDataContainer]}>
        <Text style={styles.noDataText}>Exercice non disponible</Text>
        <TouchableOpacity 
          style={styles.returnButton}
          onPress={onClose}
          accessible={true}
          accessibilityLabel="Retour"
        >
          <Ionicons name="arrow-back" size={20} color="#FFF" />
          <Text style={styles.returnButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Formatage de la date
  const formattedDate = detailExercice.date_creation ? format(
    new Date(detailExercice.date_creation), 
    'dd MMMM yyyy à HH:mm', 
    { locale: fr }
  ) : 'Date inconnue';

  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>{detailExercice.titre || 'Sans titre'}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} accessible={true} accessibilityLabel="Fermer">
          <AntDesign name="close" size={24} color="#555" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.detailContent}>
        <Text style={styles.dateText}>Créé le {formattedDate}</Text>
        <Text style={styles.consigne}>{detailExercice.consigne || 'Aucune consigne disponible'}</Text>
        
        {detailExercice.questions && detailExercice.questions.length > 0 ? (
          <>
            <Text style={styles.questionsCountText}>
              {detailExercice.questions.length} questions
            </Text>
            
            {detailExercice.questions.map((question, index) => (
              <View key={question.id || `q_${index}`} style={styles.questionItem}>
                <Text style={styles.questionText}>
                  Question {index + 1}: {question.texte || 'Sans texte'}
                </Text>
                
                <View style={styles.responsesList}>
                  {question.reponses && question.reponses.map((reponse, rIndex) => (
                    <View key={reponse.id || `r_${index}_${rIndex}`} style={[
                      styles.responseItem,
                      reponse.est_correcte ? styles.correctResponseItem : {}
                    ]}>
                      <View style={[
                        styles.responseIndicator,
                        reponse.est_correcte ? styles.correctResponse : {}
                      ]} />
                      <Text style={[
                        styles.responseText,
                        reponse.est_correcte ? styles.correctResponseText : {}
                      ]}>
                        {reponse.texte || 'Sans texte'}
                        {reponse.est_correcte && " ✓"}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.noQuestionsContainer}>
            <Text style={styles.noQuestionsText}>Aucune question disponible</Text>
          </View>
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.returnButton}
        onPress={onClose}
        accessible={true}
        accessibilityLabel="Retour"
      >
        <Ionicons name="arrow-back" size={20} color="#FFF" />
        <Text style={styles.returnButtonText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}*/}
// Composant DetailExercice corrigé avec gestion des traductions
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLanguage } from '../app/i18n';

export default function DetailExercice({ 
  exercice, 
  exerciceId, 
  getExercice, 
  onClose
}) {
  const [loading, setLoading] = useState(false);
  const [detailExercice, setDetailExercice] = useState(exercice);
  
  // Utilisation du hook useLanguage
  const { t, language } = useLanguage();
  const dateLocale = language === 'fr' ? fr : enUS;
  
  // Charger les détails de l'exercice si l'ID est fourni mais pas l'objet complet
  useEffect(() => {
    const loadExercice = async () => {
      if (exerciceId && !detailExercice && getExercice) {
        setLoading(true);
        try {
          const data = await getExercice(exerciceId);
          if (data) {
            setDetailExercice(data);
          }
        } catch (error) {
          console.error('Erreur lors du chargement de l\'exercice:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadExercice();
  }, [exerciceId, detailExercice, getExercice]);

  // Afficher un indicateur de chargement si nécessaire
  if (loading) {
    return (
      <View style={[styles.detailContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>{t.loadingExercise}</Text>
      </View>
    );
  }
  
  // Si aucun exercice n'est disponible, afficher un message
  if (!detailExercice) {
    return (
      <View style={[styles.detailContainer, styles.noDataContainer]}>
        <Text style={styles.noDataText}>{t.exerciseNotAvailable}</Text>
        <TouchableOpacity 
          style={styles.returnButton}
          onPress={onClose}
          accessible={true}
          accessibilityLabel={t.return}
        >
          <Ionicons name="arrow-back" size={20} color="#FFF" />
          <Text style={styles.returnButtonText}>{t.return}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Formatage de la date
  const formattedDate = detailExercice.date_creation ? format(
    new Date(detailExercice.date_creation), 
    'dd MMMM yyyy à HH:mm', 
    { locale: dateLocale }
  ) : t.unknownDate;

  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>
          {detailExercice.titre || t.noTitle}
        </Text>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose} 
          accessible={true} 
          accessibilityLabel={t.close}
        >
          <AntDesign name="close" size={24} color="#555" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.detailContent}>
        <Text style={styles.dateText}>
          {t.createdOn} {formattedDate}
        </Text>
        <Text style={styles.consigne}>
          {detailExercice.consigne || t.noInstructionAvailable}
        </Text>
        
        {detailExercice.questions && detailExercice.questions.length > 0 ? (
          <>
            <Text style={styles.questionsCountText}>
              {detailExercice.questions.length} {t.questions}
            </Text>
            
            {detailExercice.questions.map((question, index) => (
              <View key={question.id || `q_${index}`} style={styles.questionItem}>
                <Text style={styles.questionText}>
                  {t.question} {index + 1}: {question.texte || t.noText}
                </Text>
                
                <View style={styles.responsesList}>
                  {question.reponses && question.reponses.map((reponse, rIndex) => (
                    <View key={reponse.id || `r_${index}_${rIndex}`} style={[
                      styles.responseItem,
                      reponse.est_correcte ? styles.correctResponseItem : {}
                    ]}>
                      <View style={[
                        styles.responseIndicator,
                        reponse.est_correcte ? styles.correctResponse : {}
                      ]} />
                      <Text style={[
                        styles.responseText,
                        reponse.est_correcte ? styles.correctResponseText : {}
                      ]}>
                        {reponse.texte || t.noText}
                        {reponse.est_correcte && ` ${t.correct}`}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.noQuestionsContainer}>
            <Text style={styles.noQuestionsText}>{t.noQuestionsAvailable}</Text>
          </View>
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.returnButton}
        onPress={onClose}
        accessible={true}
        accessibilityLabel={t.return}
      >
        <Ionicons name="arrow-back" size={20} color="#FFF" />
        <Text style={styles.returnButtonText}>{t.return}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  detailContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#555555',
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 30,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  detailContent: {
    flex: 1,
    padding: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
  },
  consigne: {
    fontSize: 14,
    color: '#555555',
    fontStyle: 'italic',
    marginVertical: 12,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  questionsCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
    marginBottom: 8,
  },
  questionItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  responsesList: {
    marginLeft: 8,
  },
  responseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  correctResponseItem: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderColor: '#2ecc71',
  },
  responseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DDDDDD',
    marginRight: 10,
  },
  correctResponse: {
    backgroundColor: '#2ecc71',
  },
  responseText: {
    fontSize: 13,
    color: '#555555',
  },
  correctResponseText: {
    fontWeight: '600',
    color: '#2ecc71',
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    margin: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  noQuestionsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  noQuestionsText: {
    fontSize: 14,
    color: '#888888',
    fontStyle: 'italic',
  },
});
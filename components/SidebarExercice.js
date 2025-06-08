{/*import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons, AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DetailExercice from './DetailExercice';

// Fonction pour tronquer le texte
const truncateText = (text, length = 40) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Composant principal SidebarExercice
export function SidebarExercice({ 
  histories = [], 
  onSelectHistory, 
  onNewExercice, 
  onClose,
  isLoadingHistories = false,
  fetchHistories = () => {}, 
  onDeleteHistory = () => {}
}) {
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedExercice, setSelectedExercice] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Gérer la sélection d'un exercice depuis l'historique
  
  const handleSelectHistory = async (id) => {
    try {
      setLoadingDetail(true);
      // S'assurer que onSelectHistory retourne bien l'exercice complet
      const fullExercice = await onSelectHistory(id);
      if (fullExercice) {
        console.log("Exercice récupéré:", fullExercice); // Débogage
      }
      if (fullExercice && fullExercice.questions) {
        setSelectedExercice(fullExercice);
        setShowDetailView(true);
      } else {
        if (fullExercice === undefined || fullExercice === null) {
          console.error("Exercice non trouvé");
        } else {
          console.error("Exercice incomplet:", fullExercice);
        }
        Alert.alert("Erreur", "Les détails de l'exercice sont incomplets");
      }
    } catch (error) {
      if (error) {
        console.error('Erreur lors de la sélection depuis l\'historique:', error);
      }
      Alert.alert("Erreur", "Une erreur est survenue lors du chargement des détails");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Fermer la vue détaillée
  const handleCloseDetailView = () => {
    setShowDetailView(false);
    setSelectedExercice(null);
  };

  // Utiliser un exercice sélectionné
  const handleSelectForReuse = (exercice) => {
    // Réutiliser l'exercice sélectionné
    // TODO: Implémenter selon vos besoins spécifiques
    
    // Fermer la sidebar et la vue détaillée
    onClose();
  };

  // Si la vue détaillée est active, afficher DetailExerciceView
  if (showDetailView && selectedExercice) {
    return (
      <View style={styles.sidebar}>
        <DetailExercice 
          exercice={selectedExercice}
          onClose={handleCloseDetailView}
          onSelectForReuse={handleSelectForReuse}
        />
      </View>
    );
  }

  // Afficher l'indicateur de chargement pendant le chargement des détails
  if (loadingDetail) {
    return (
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Chargement</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AntDesign name="close" size={24} color="#555" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sidebar}>
      //En-tête de la sidebar 
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>Mes Exercices</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} accessible={true} accessibilityLabel="Fermer">
          <AntDesign name="close" size={24} color="#555" />
        </TouchableOpacity>
      </View>

     // Bouton Nouvel exercice 
      <TouchableOpacity 
        style={styles.newExerciceButton}
        onPress={() => {
          onNewExercice();
          onClose();
        }}
        accessible={true}
        accessibilityLabel="Nouvel exercice"
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFF" />
        <Text style={styles.newExerciceText}>Nouvel exercice</Text>
      </TouchableOpacity>

     // Bouton pour rafraîchir l'historique 
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={fetchHistories}
        disabled={isLoadingHistories}
        accessible={true}
        accessibilityLabel="Rafraîchir l'historique"
      >
        <Text style={styles.refreshButtonText}>
          Rafraîchir l'historique
        </Text>
        {isLoadingHistories ? 
          <ActivityIndicator size="small" color="#007BFF" /> : 
          <Ionicons name="refresh" size={18} color="#007BFF" />
        }
      </TouchableOpacity>

     //Liste des exercices 
      <Text style={styles.historyTitle}>Historique</Text>
      
      {isLoadingHistories ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Chargement de l'historique...</Text>
        </View>
      ) : Array.isArray(histories) && histories.length > 0 ? (
        <ScrollView style={styles.historyList}>
          {histories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyItem}
              onPress={() => handleSelectHistory(item.id)}
              accessible={true}
              accessibilityLabel={`Exercice: ${item.titre}`}
            >
              <View style={styles.historyItemContent}>
               // Icône du QCM
                <View style={styles.exerciceType}>
                  <MaterialIcons name="quiz" size={16} color="#007BFF" />
                </View>
                
                 //Contenu de l'exercice 
                <View style={styles.exerciceContent}>
                  <Text style={styles.exerciceText} numberOfLines={1}>
                    {truncateText(item.titre || 'Exercice')}
                  </Text>
                  
                  <View style={styles.exerciceDetails}>
                    // Nombre de questions 
                    <View style={styles.questionInfo}>
                      <MaterialIcons name="question-answer" size={14} color="#888" />
                      <Text style={styles.questionCount}>{item.nb_questions || 0} questions</Text>
                    </View>
                    
                    //Date de création
                    <Text style={styles.dateText}>
                      {item.date_creation ? format(new Date(item.date_creation), 'dd/MM/yyyy', { locale: fr }) : 'Date inconnue'}
                    </Text>
                  </View>
                </View>
                 // Bouton suppression
                  <TouchableOpacity onPress={() => onDeleteHistory(item.id)} style={styles.deleteButton} accessibilityLabel="Supprimer l'exercice">
                  <AntDesign name="delete" size={18} color="#d32f2f" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyHistoryContainer}>
          <MaterialCommunityIcons name="history" size={60} color="#ccc" />
          <Text style={styles.emptyHistoryText}>
            Aucun exercice dans l'historique
          </Text>
          <Text style={styles.emptyHistorySubText}>
            Vos exercices apparaîtront ici
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  newExerciceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    margin: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newExerciceText: {
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
    borderColor: '#007BFF',
    borderRadius: 8,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  refreshButtonText: {
    color: '#007BFF',
    marginRight: 8,
  },
  historyTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#555555',
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666666',
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciceType: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciceContent: {
    flex: 1,
  },
  exerciceText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  exerciceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionCount: {
    fontSize: 12,
    color: '#888888',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#888888',
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyHistoryText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#555555',
  },
  emptyHistorySubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#888888',
  },
  deleteButton: {
    padding: 5,
  },
});*/}
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons, AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DetailExercice from './DetailExercice';
import { useLanguage } from '../app/i18n';

// Fonction pour tronquer le texte
const truncateText = (text, length = 40) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Composant principal SidebarExercice
export function SidebarExercice({ 
  histories = [], 
  onSelectHistory, 
  onNewExercice, 
  onClose,
  isLoadingHistories = false,
  fetchHistories = () => {},
  onDeleteHistory = () => {},
  onGenerateQuiz = () => {}
}) {
  const { t } = useLanguage();
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedExercice, setSelectedExercice] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Gérer la sélection d'un exercice depuis l'historique
  const handleSelectHistory = async (id) => {
    try {
      setLoadingDetail(true);
      const fullExercice = await onSelectHistory(id);
      if (fullExercice) {
        console.log("Exercice récupéré:", fullExercice);
      }
      if (fullExercice && fullExercice.questions) {
        setSelectedExercice(fullExercice);
        setShowDetailView(true);
      } else {
        if (fullExercice === undefined || fullExercice === null) {
          console.error("Exercice non trouvé");
        } else {
          console.error("Exercice incomplet:", fullExercice);
        }
        Alert.alert(t('error'), t('incompleteExercise'));
      }
    } catch (error) {
      if (error) {
        console.error('Erreur lors de la sélection depuis l\'historique:', error);
      }
      Alert.alert(t('error'), t('errorLoadingDetails'));
    } finally {
      setLoadingDetail(false);
    }
  };

  // Fermer la vue détaillée
  const handleCloseDetailView = () => {
    setShowDetailView(false);
    setSelectedExercice(null);
  };

  // Utiliser un exercice sélectionné
  const handleSelectForReuse = (exercice) => {
    // Réutiliser l'exercice sélectionné
    // TODO: Implémenter selon vos besoins spécifiques
    
    // Fermer la sidebar et la vue détaillée
    onClose();
  };

  // Si la vue détaillée est active, afficher DetailExerciceView
  if (showDetailView && selectedExercice) {
    return (
      <View style={styles.sidebar}>
        <DetailExercice 
          exercice={selectedExercice}
          onClose={handleCloseDetailView}
          onSelectForReuse={handleSelectForReuse}
        />
      </View>
    );
  }

  // Afficher l'indicateur de chargement pendant le chargement des détails
  if (loadingDetail) {
    return (
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>{t('loading')}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AntDesign name="close" size={24} color="#555" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3C0663" />
          <Text style={styles.loadingText}>{t('loadingDetails')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sidebar}>
      {/* En-tête de la sidebar */}
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>{t('myExercises')}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} accessible={true} accessibilityLabel={t('closeAccessibility')}>
          <AntDesign name="close" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Bouton Nouvel exercice */}
      <TouchableOpacity 
        style={styles.newExerciceButton}
        onPress={() => {
          onNewExercice();
          onClose();
        }}
        accessible={true}
        accessibilityLabel={t('newExerciseAccessibility')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFF" />
        <Text style={styles.newExerciceText}>{t('newExercise')}</Text>
      </TouchableOpacity>

      {/* Bouton pour rafraîchir l'historique */}
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={fetchHistories}
        disabled={isLoadingHistories}
        accessible={true}
        accessibilityLabel={t('refreshHistoryAccessibility')}
      >
        <Text style={styles.refreshButtonText}>
           {t('refreshHistory')}
        </Text>
        {isLoadingHistories ? 
          <ActivityIndicator size="small" color="#3C0663" /> : 
          <Ionicons name="refresh" size={18} color="#3C0663" />
        }
      </TouchableOpacity>

      {/* Liste des exercices */}
      <Text style={styles.historyTitle}>{t('history')}</Text>
      
      {isLoadingHistories ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3C0663" />
          <Text style={styles.loadingText}>{t('loadingHistory')}</Text>
        </View>
      ) : Array.isArray(histories) && histories.length > 0 ? (
        <ScrollView style={styles.historyList}>
          {histories.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <TouchableOpacity
                style={styles.historyItemContent}
                onPress={() => handleSelectHistory(item.id)}
                accessible={true}
                accessibilityLabel={`${t('exerciseAccessibility')}: ${item.titre}`}
              >
                <View style={styles.exerciceType}>
                  <MaterialIcons name="quiz" size={16} color="#3C0663" />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.exerciceText} numberOfLines={1}>
                    {truncateText(item.titre || t('exercise'))}
                  </Text>
                  <View style={styles.exerciceDetails}>
                    <View style={styles.questionInfo}>
                      <MaterialIcons name="question-answer" size={14} color="#888" />
                      <Text style={styles.questionCount}>{item.nb_questions || 0} {t('questions')}</Text>
                    </View>
                    <Text style={styles.dateText}>
                      {item.date_creation ? format(new Date(item.date_creation), 'dd/MM/yyyy', { locale: fr }) : t('unknownDate')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              {/* Boutons d'action */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.generateQuizButton}
                  onPress={() => onGenerateQuiz(item.id)}
                  accessible={true}
                  accessibilityLabel={t('generateQuizAccessibility')}
                >
                  <Ionicons name="create-outline" size={18} color="#FFF" />
                  <Text style={styles.generateQuizButtonText}>{t('test')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeleteHistory(item.id)}
                  accessible={true}
                  accessibilityLabel={t('deleteExerciseAccessibility')}
                >
                  <AntDesign name="delete" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyHistoryContainer}>
          <MaterialCommunityIcons name="history" size={60} color="#ccc" />
          <Text style={styles.emptyHistoryText}>
             {t('noExerciseInHistory')}
          </Text>
          <Text style={styles.emptyHistorySubText}>
            {t('exerciseWillAppear')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  newExerciceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3C0663',
    margin: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newExerciceText: {
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
  historyTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#555555',
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666666',
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciceType: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciceContent: {
    flex: 1,
  },
  exerciceText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  exerciceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionCount: {
    fontSize: 12,
    color: '#888888',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#888888',
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyHistoryText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#555555',
  },
  emptyHistorySubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#888888',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateQuizButton: {
    backgroundColor: '#8B2FC9',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 6,
    gap: 4,
  },
  generateQuizButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
});

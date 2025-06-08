
{/*import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Platform 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useSidebar, useTraduction } from '../hooks/TraductionHooks';

const SidebarTraduction = ({ histories, onSelectHistory, onNewTranslation, onClose }) => {
  // État indiquant si des données sont en cours de chargement
  const { isLoadingHistories, fetchHistories } = useSidebar();
  const { setTranslatedText, setOriginalText, setFileName } = useTraduction();

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return dateString || 'Date inconnue';
    }
  };

  // Récupérer l'icône de langue appropriée
  const getLanguageIcon = (langCode) => {
    switch (langCode) {
      case 'fr':
        return '🇫🇷';
      case 'en':
        return '🇬🇧';
      case 'es':
        return '🇪🇸';
      case 'de':
        return '🇩🇪';
      case 'it':
        return '🇮🇹';
      case 'pt':
        return '🇵🇹';
      case 'nl':
        return '🇳🇱';
      case 'ru':
        return '🇷🇺';
      case 'ar':
        return '🇸🇦';
      case 'zh':
        return '🇨🇳';
      case 'ja':
        return '🇯🇵';
      default:
        return '🌐';
    }
  };

  // Récupérer le nom de langue complet
  const getLanguageName = (langCode) => {
    const langMap = {
      'fr': 'Français',
      'en': 'Anglais',
      'es': 'Espagnol',
      'de': 'Allemand',
      'it': 'Italien',
      'pt': 'Portugais',
      'nl': 'Néerlandais',
      'ru': 'Russe',
      'ar': 'Arabe',
      'zh': 'Chinois',
      'ja': 'Japonais'
    };
    return langMap[langCode] || langCode;
  };

  // Tronquer le texte s'il est trop long
  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Gérer la sélection d'une traduction depuis l'historique
  const handleSelectHistory = async (id) => {
    try {
      const fullTranslation = await onSelectHistory(id);
      if (fullTranslation) {
        console.log('Traduction récupérée:', fullTranslation);
        
        // Mise à jour du texte original et traduit
        setOriginalText(fullTranslation.contenu_original || '');
        setTranslatedText(fullTranslation.contenu_traduit || '');
        
        // Si c'est un fichier, mettre à jour le nom du fichier
        if (fullTranslation.fichier_source) {
          setFileName(fullTranslation.fichier_source);
        } else {
          setFileName(null);
        }
        
        // Fermer la sidebar
        onClose();
        
        return fullTranslation;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la sélection depuis l\'historique:', error);
      return null;
    }
  };

  return (
    <View style={styles.sidebar}>
      {/* En-tête de la sidebar 
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>Traductions</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} accessible={true} accessibilityLabel="Fermer">
          <AntDesign name="close" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Bouton Nouvelle traduction 
      <TouchableOpacity 
        style={styles.newTranslationButton}
        onPress={() => {
          onNewTranslation();
          onClose();
        }}
        accessible={true}
        accessibilityLabel="Nouvelle traduction"
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFF" />
        <Text style={styles.newTranslationText}>Nouvelle traduction</Text>
      </TouchableOpacity>

      {/* Bouton pour rafraîchir l'historique 
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

      {/* Liste des traductions passées 
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
              accessibilityLabel={`Traduction de ${getLanguageName(item.langue_source)} vers ${getLanguageName(item.langue_cible)}`}
            >
              <View style={styles.historyItemContent}>
                {/* Indicateur de type de traduction 
                <View style={styles.translationType}>
                  {item.fichier_source ? (
                    <MaterialCommunityIcons name="file-document-outline" size={16} color="#007BFF" />
                  ) : (
                    <MaterialIcons name="text-fields" size={16} color="#007BFF" />
                  )}
                </View>
                
                {/* Contenu de la traduction 
                <View style={styles.translationContent}>
                  <Text style={styles.translationText} numberOfLines={1}>
                    {truncateText(item.contenu_original || 'Traduction')}
                  </Text>
                  
                  <View style={styles.translationDetails}>
                    {/* Indicateurs de langues 
                    <View style={styles.languageInfo}>
                      <Text>{getLanguageIcon(item.langue_source)} {getLanguageName(item.langue_source)}</Text>
                      <MaterialIcons name="arrow-right-alt" size={16} color="#888" style={styles.arrowIcon} />
                      <Text>{getLanguageIcon(item.langue_cible)} {getLanguageName(item.langue_cible)}</Text>
                    </View>
                    
                    {/* Date de traduction 
                    <Text style={styles.dateText}>
                      {formatDate(item.date_creation)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyHistoryContainer}>
          <MaterialCommunityIcons name="history" size={60} color="#ccc" />
          <Text style={styles.emptyHistoryText}>
            Aucune traduction dans l'historique
          </Text>
          <Text style={styles.emptyHistorySubText}>
            Vos traductions apparaîtront ici
          </Text>
        </View>
      )}
    </View>
  );
};

// Styles pour le composant Sidebar
const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '80%',
    maxWidth: 350,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  newTranslationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  newTranslationText: {
    marginLeft: 8,
    color: '#fff',
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 8,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  refreshButtonText: {
    color: '#007BFF',
    marginRight: 8,
    fontWeight: '500',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  translationType: {
    marginRight: 12,
  },
  translationContent: {
    flex: 1,
  },
  translationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  translationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowIcon: {
    marginHorizontal: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyHistoryContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 15,
  },
  emptyHistorySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
});

export default SidebarTraduction;*/}{/*
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useSidebar, useTraduction } from '../hooks/TraductionHooks';

const SidebarTraduction = ({ histories, onSelectHistory, onNewTranslation, onClose, onDeleteHistory }) => {
  // État indiquant si des données sont en cours de chargement
  const { isLoadingHistories, fetchHistories } = useSidebar();
  const { setTranslatedText, setOriginalText, setFileName } = useTraduction();
  
  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return dateString || 'Date inconnue';
    }
  };

  // Récupérer l'icône de langue appropriée
  const getLanguageIcon = (langCode) => {
    switch (langCode) {
      case 'fr':
        return '🇫🇷';
      case 'en':
        return '🇬🇧';
      case 'es':
        return '🇪🇸';
      case 'de':
        return '🇩🇪';
      case 'it':
        return '🇮🇹';
      case 'pt':
        return '🇵🇹';
      case 'nl':
        return '🇳🇱';
      case 'ru':
        return '🇷🇺';
      case 'ar':
        return '🇸🇦';
      case 'zh':
        return '🇨🇳';
      case 'ja':
        return '🇯🇵';
      default:
        return '🌐';
    }
  };

  // Récupérer le nom de langue complet
  const getLanguageName = (langCode) => {
    const langMap = {
      'fr': 'Français',
      'en': 'Anglais',
      'es': 'Espagnol',
      'de': 'Allemand',
      'it': 'Italien',
      'pt': 'Portugais',
      'nl': 'Néerlandais',
      'ru': 'Russe',
      'ar': 'Arabe',
      'zh': 'Chinois',
      'ja': 'Japonais'
    };
    return langMap[langCode] || langCode;
  };

  // Tronquer le texte s'il est trop long
  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };
 
// With this improved implementation
{/*const handleSelectItem = async (id) => {
  try {
    await onSelectHistory(id);
    onClose(); // Fermer la sidebar après sélection
  } catch (error) {
    console.error('Erreur lors de la sélection:', error);
  }
};*/}{/*
// Dans SidebarTraduction.js, modifiez la fonction handleSelectItem:
const handleSelectItem = async (id) => {
  try {
    // Appeler la fonction du parent et attendre qu'elle se termine
    const result = await onSelectHistory(id);
    // Seulement fermer la sidebar si la sélection a réussi
    if (result) {
      onClose();
    }
  } catch (error) {
    console.error('Erreur lors de la sélection:', error);
  }
};
  // Gérer la sélection d'une traduction depuis l'historique
  const handleDeleteHistory = async (id) => {
    try {
      // Vérifier si nous sommes sur le web
      if (Platform.OS === 'web') {
        // Sur web, utiliser la confirmation standard du navigateur
        if (window.confirm('Voulez-vous vraiment supprimer cette traduction ?')) {
          await onDeleteHistory(id);
        }
      } else {
        // Sur mobile, utiliser Alert de React Native
        Alert.alert(
          'Confirmation',
          'Voulez-vous vraiment supprimer cette traduction ?',
          [
            {
              text: 'Annuler',
              style: 'cancel'
            },
            {
              text: 'Supprimer',
              style: 'destructive',
              onPress: async () => {
                await onDeleteHistory(id);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <View style={styles.sidebar}>
      {/* En-tête de la sidebar 
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>Traductions</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} accessible={true} accessibilityLabel="Fermer">
          <AntDesign name="close" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Bouton Nouvelle traduction 
      <TouchableOpacity 
        style={styles.newTranslationButton}
        onPress={() => {
          onNewTranslation();
          onClose();
        }}
        accessible={true}
        accessibilityLabel="Nouvelle traduction"
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFF" />
        <Text style={styles.newTranslationText}>Nouvelle traduction</Text>
      </TouchableOpacity>

      {/* Bouton pour rafraîchir l'historique 
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
          <ActivityIndicator size="small" color="#3C0663" /> : 
          <Ionicons name="refresh" size={18} color="#3C0663" />
        }
      </TouchableOpacity>

      {/* Liste des traductions passées 
      <Text style={styles.historyTitle}>Historique</Text>
      
      {isLoadingHistories ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3C0663" />
          <Text style={styles.loadingText}>Chargement de l'historique...</Text>
        </View>
      ) : Array.isArray(histories) && histories.length > 0 ? (
        <ScrollView style={styles.historyList}>
          {histories.map((item) => (
           
// To use the new function name
<TouchableOpacity
  key={item.id}
  style={styles.historyItem}
  onPress={() => handleSelectItem(item.id)}
  accessible={true}
  accessibilityLabel={`Traduction de ${getLanguageName(item.langue_source)} vers ${getLanguageName(item.langue_cible)}`}
>
              <View style={styles.historyItemContent}>
                {/* Indicateur de type de traduction 
                <View style={styles.translationType}>
                  {item.fichier_source ? (
                    <MaterialCommunityIcons name="file-document-outline" size={16} color="#8B2FC9" />
                  ) : (
                    <MaterialIcons name="text-fields" size={16} color="#8B2FC9" />
                  )}
                </View>
                {/* Contenu de la traduction 
                <View style={{flex: 1}}>
                  <Text style={styles.translationText} numberOfLines={1}>
                    {truncateText(item.contenu_original || 'Traduction')}
                  </Text>
                  <View style={styles.translationDetails}>
                    <View style={styles.languageInfo}>
                      <Text>{getLanguageIcon(item.langue_source)} {getLanguageName(item.langue_source)}</Text>
                      <MaterialIcons name="arrow-right-alt" size={16} color="#888" style={styles.arrowIcon} />
                      <Text>{getLanguageIcon(item.langue_cible)} {getLanguageName(item.langue_cible)}</Text>
                    </View>
                    <Text style={styles.dateText}>
                      {formatDate(item.date_creation)}
                    </Text>
                  </View>
                </View>
                {/* Bouton suppression 
                <TouchableOpacity 
  onPress={() => handleDeleteHistory(item.id)} 
  style={styles.deleteButton} 
  accessibilityLabel="Supprimer la traduction"
>
  <AntDesign name="delete" size={18} color="#8B2FC9" />
</TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyHistoryContainer}>
          <MaterialCommunityIcons name="history" size={60} color="#ccc" />
          <Text style={styles.emptyHistoryText}>
            Aucune traduction dans l'historique
          </Text>
          <Text style={styles.emptyHistorySubText}>
            Vos traductions apparaîtront ici
          </Text>
        </View>
      )}
    </View>
  );
};*/}
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useSidebar, useTraduction } from '../hooks/TraductionHooks';
import { useLanguage } from '../app/i18n';

// Composant Sidebar de Traduction
const SidebarTraduction = ({ histories, onSelectHistory, onNewTranslation, onClose, onDeleteHistory }) => {
  const { t } = useLanguage();
  const { isLoadingHistories, fetchHistories } = useSidebar();
  const { setTranslatedText, setOriginalText, setFileName } = useTraduction();
  
  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return dateString || t('unknownDate');
    }
  };

  // Récupérer l'icône de langue appropriée
  const getLanguageIcon = (langCode) => {
    const languageIcons = {
      'fr': '🇫🇷',
      'en': '🇬🇧',
      'es': '🇪🇸',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'nl': '🇳🇱',
      'ru': '🇷🇺',
      'ar': '🇸🇦',
      'zh': '🇨🇳',
      'ja': '🇯🇵'
    };
    return languageIcons[langCode] || '🌐';
  };

  // Récupérer le nom de langue complet
  const getLanguageName = (langCode) => {
    const langMap = {
      'fr': t('french'),
      'en': t('english'),
      'es': t('spanish'),
      'de': t('german'),
      'it': t('italian'),
      'pt': t('portuguese'),
      'nl': t('dutch'),
      'ru': t('russian'),
      'ar': t('arabic'),
      'zh': t('chinese'),
      'ja': t('japanese')
    };
    return langMap[langCode] || langCode;
  };

  // Tronquer le texte s'il est trop long
  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const handleSelectItem = async (id) => {
    try {
      const result = await onSelectHistory(id);
      if (result) {
        onClose();
      }
    } catch (error) {
      console.error(t('selectionError'), error);
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      if (Platform.OS === 'web') {
        if (window.confirm(t('confirmDelete'))) {
          await onDeleteHistory(id);
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
                await onDeleteHistory(id);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error(t('deletionError'), error);
    }
  };

  return (
    <View style={styles.sidebar}>
      {/* En-tête de la sidebar */}
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>{t('translations')}</Text>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose} 
          accessible={true} 
          accessibilityLabel={t('closeAccessibility')}
        >
          <AntDesign name="close" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Bouton Nouvelle traduction */}
      <TouchableOpacity 
        style={styles.newTranslationButton}
        onPress={() => {
          onNewTranslation();
          onClose();
        }}
        accessible={true}
        accessibilityLabel={t('newTranslationAccessibility')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFF" />
        <Text style={styles.newTranslationText}>{t('newTranslation')}</Text>
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

      {/* Liste des traductions passées */}
      <Text style={styles.historyTitle}>{t('history')}</Text>
      
      {isLoadingHistories ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3C0663" />
          <Text style={styles.loadingText}>{t('loadingHistory')}</Text>
        </View>
      ) : Array.isArray(histories) && histories.length > 0 ? (
        <ScrollView style={styles.historyList}>
          {histories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyItem}
              onPress={() => handleSelectItem(item.id)}
              accessible={true}
              accessibilityLabel={`${t('translationAccessibility')} ${getLanguageName(item.langue_source)} ${t('vers')} ${getLanguageName(item.langue_cible)}`}
            >
              <View style={styles.historyItemContent}>
                {/* Indicateur de type de traduction */}
                <View style={styles.translationType}>
                  {item.fichier_source ? (
                    <MaterialCommunityIcons name="file-document-outline" size={16} color="#8B2FC9" />
                  ) : (
                    <MaterialIcons name="text-fields" size={16} color="#8B2FC9" />
                  )}
                </View>
                {/* Contenu de la traduction */}
                <View style={{flex: 1}}>
                  <Text style={styles.translationText} numberOfLines={1}>
                    {truncateText(item.contenu_original || t('translation'))}
                  </Text>
                  <View style={styles.translationDetails}>
                    <View style={styles.languageInfo}>
                      <Text>{getLanguageIcon(item.langue_source)} {getLanguageName(item.langue_source)}</Text>
                      <MaterialIcons name="arrow-right-alt" size={16} color="#888" style={styles.arrowIcon} />
                      <Text>{getLanguageIcon(item.langue_cible)} {getLanguageName(item.langue_cible)}</Text>
                    </View>
                    <Text style={styles.dateText}>
                      {formatDate(item.date_creation)}
                    </Text>
                  </View>
                </View>
                {/* Bouton suppression */}
                <TouchableOpacity 
                  onPress={() => handleDeleteHistory(item.id)} 
                  style={styles.deleteButton} 
                  accessibilityLabel={t('deleteTranslationAccessibility')}
                >
                  <AntDesign name="delete" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyHistoryContainer}>
          <MaterialCommunityIcons name="history" size={60} color="#ccc" />
          <Text style={styles.emptyHistoryText}>
            {t('noTranslationInHistory')}
          </Text>
          <Text style={styles.emptyHistorySubText}>
            {t('translationsWillAppear')}
          </Text>
        </View>
      )}
    </View>
  );
};

// Composant Sélecteur de Langue
const LanguageSelector = ({ selectedLanguage, onLanguageChange, languages, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const getLanguageIcon = (langCode) => {
    const languageIcons = {
      'fr': '🇫🇷',
      'en': '🇬🇧',
      'es': '🇪🇸',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'nl': '🇳🇱',
      'ru': '🇷🇺',
      'ar': '🇸🇦',
      'zh': '🇨🇳',
      'ja': '🇯🇵'
    };
    return languageIcons[langCode] || '🌐';
  };

  return (
    <View style={styles.languageSelectorContainer}>
      <TouchableOpacity
        style={styles.languageSelector}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.languageSelectorText}>
          {selectedLanguage ? 
            `${getLanguageIcon(selectedLanguage.code)} ${selectedLanguage.name}` : 
            placeholder
          }
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.languageModal}>
            <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
            <ScrollView style={styles.languageList}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    selectedLanguage?.code === language.code && styles.selectedLanguageOption
                  ]}
                  onPress={() => {
                    onLanguageChange(language);
                    setIsOpen(false);
                  }}
                >
                  <Text style={styles.languageOptionText}>
                    {getLanguageIcon(language.code)} {language.name}
                  </Text>
                  {selectedLanguage?.code === language.code && (
                    <Ionicons name="checkmark" size={20} color="#8B2FC9" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Composant Principal de Traduction
const TranslationPage = () => {
  const { t } = useLanguage();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [histories, setHistories] = useState([]);

  // Liste des langues disponibles
  const languages = [
    { code: 'fr', name: t('french') },
    { code: 'en', name: t('english') },
    { code: 'es', name: t('spanish') },
    { code: 'de', name: t('german') },
    { code: 'it', name: t('italian') },
    { code: 'pt', name: t('portuguese') },
    { code: 'nl', name: t('dutch') },
    { code: 'ru', name: t('russian') },
    { code: 'ar', name: t('arabic') },
    { code: 'zh', name: t('chinese') },
    { code: 'ja', name: t('japanese') }
  ];

  // Fonction pour échanger les langues
  const swapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    
    const tempText = originalText;
    setOriginalText(translatedText);
    setTranslatedText(tempText);
  };

  // Fonction pour effectuer la traduction
  const handleTranslate = async () => {
    if (!originalText.trim() || !sourceLanguage || !targetLanguage) {
      Alert.alert(t('error'), 'Veuillez remplir tous les champs');
      return;
    }

    setIsTranslating(true);
    try {
      // Simuler l'appel API de traduction
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTranslatedText(`[Traduction de "${originalText}" de ${sourceLanguage.name} vers ${targetLanguage.name}]`);
      
      // Sauvegarder dans l'historique (simulation)
      const newTranslation = {
        id: Date.now(),
        contenu_original: originalText,
        contenu_traduit: translatedText,
        langue_source: sourceLanguage.code,
        langue_cible: targetLanguage.code,
        date_creation: new Date().toISOString(),
        fichier_source: null
      };
      setHistories(prev => [newTranslation, ...prev]);
      
    } catch (error) {
      Alert.alert(t('error'), 'Erreur lors de la traduction');
    } finally {
      setIsTranslating(false);
    }
  };

  // Fonction pour nouvelle traduction
  const handleNewTranslation = () => {
    setOriginalText('');
    setTranslatedText('');
    setSourceLanguage(null);
    setTargetLanguage(null);
  };

  // Fonction pour sélectionner depuis l'historique
  const handleSelectHistory = async (id) => {
    try {
      const selectedTranslation = histories.find(item => item.id === id);
      if (selectedTranslation) {
        setOriginalText(selectedTranslation.contenu_original);
        setTranslatedText(selectedTranslation.contenu_traduit);
        setSourceLanguage(languages.find(lang => lang.code === selectedTranslation.langue_source));
        setTargetLanguage(languages.find(lang => lang.code === selectedTranslation.langue_cible));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur sélection historique:', error);
      return false;
    }
  };

  // Fonction pour supprimer de l'historique
  const handleDeleteHistory = async (id) => {
    try {
      setHistories(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setSidebarVisible(true)}
        >
          <Ionicons name="menu" size={24} color="#8B2FC9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('translation')}</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={handleNewTranslation}
        >
          <Ionicons name="add" size={24} color="#8B2FC9" />
        </TouchableOpacity>
      </View>

      {/* Contenu principal */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sélecteurs de langue */}
        <View style={styles.languageContainer}>
          <LanguageSelector
            selectedLanguage={sourceLanguage}
            onLanguageChange={setSourceLanguage}
            languages={languages}
            placeholder="Langue source"
          />
          
          <TouchableOpacity style={styles.swapButton} onPress={swapLanguages}>
            <MaterialIcons name="swap-horiz" size={24} color="#8B2FC9" />
          </TouchableOpacity>
          
          <LanguageSelector
            selectedLanguage={targetLanguage}
            onLanguageChange={setTargetLanguage}
            languages={languages}
            placeholder="Langue cible"
          />
        </View>

        {/* Zone de texte original */}
        <View style={styles.textContainer}>
          <Text style={styles.textLabel}>Texte à traduire</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Saisissez votre texte ici..."
            value={originalText}
            onChangeText={setOriginalText}
            maxLength={5000}
          />
          <Text style={styles.characterCount}>
            {originalText.length}/5000
          </Text>
        </View>

        {/* Bouton de traduction */}
        <TouchableOpacity
          style={[styles.translateButton, isTranslating && styles.translateButtonDisabled]}
          onPress={handleTranslate}
          disabled={isTranslating}
        >
          {isTranslating ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <MaterialIcons name="translate" size={20} color="#FFF" />
          )}
          <Text style={styles.translateButtonText}>
            {isTranslating ? 'Traduction en cours...' : 'Traduire'}
          </Text>
        </TouchableOpacity>

        {/* Zone de traduction */}
        {(translatedText || isTranslating) && (
          <View style={styles.textContainer}>
            <Text style={styles.textLabel}>Traduction</Text>
            <View style={styles.translationResult}>
              {isTranslating ? (
                <View style={styles.loadingTranslation}>
                  <ActivityIndicator size="large" color="#8B2FC9" />
                  <Text style={styles.loadingText}>Traduction en cours...</Text>
                </View>
              ) : (
                <Text style={styles.translatedText}>{translatedText}</Text>
              )}
            </View>
            {translatedText && !isTranslating && (
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => {
                  // Copier dans le presse-papiers
                  Alert.alert('Copié', 'Traduction copiée dans le presse-papiers');
                }}
              >
                <Ionicons name="copy-outline" size={16} color="#8B2FC9" />
                <Text style={styles.copyButtonText}>Copier</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Sidebar */}
      {sidebarVisible && (
        <Modal
          visible={sidebarVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSidebarVisible(false)}
        >
          <View style={styles.sidebarOverlay}>
            <SidebarTraduction
              histories={histories}
              onSelectHistory={handleSelectHistory}
              onNewTranslation={handleNewTranslation}
              onClose={() => setSidebarVisible(false)}
              onDeleteHistory={handleDeleteHistory}
            />
          </View>
        </Modal>
      )}
    </View>
  );
};

// Styles pour le composant Sidebar
const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '80%',
    maxWidth: 350,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  newTranslationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3C0663',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  newTranslationText: {
    marginLeft: 8,
    color: '#fff',
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3C0663',
    borderRadius: 8,
    backgroundColor: '#DC97FF',
  },
  refreshButtonText: {
    color: '#3C0663',
    marginRight: 8,
    fontWeight: '500',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  translationType: {
    marginRight: 12,
  },
  translationContent: {
    flex: 1,
  },
  translationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  translationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowIcon: {
    marginHorizontal: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyHistoryContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 15,
  },
  emptyHistorySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  deleteButton: {
    padding: 5,
  },
});

export default SidebarTraduction;
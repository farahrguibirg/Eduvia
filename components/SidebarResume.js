import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { useLanguage } from '../app/i18n';

const SidebarResume = ({ 
  savedResumes = [], 
  isLoadingResumes = false, 
  onSelectResume, 
  onDeleteResume, 
  isVisible,
  onClose,
  onNewResume,
  fetchResumes
}) => {
  const { t } = useLanguage();

  console.log('SidebarResume - savedResumes:', savedResumes);

  // Tronquer le texte si trop long
  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Formater la date
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
      return dateString || t('unknownDate');
    }
  };

  return (
    <View style={styles.sidebar}>
      {/* Header */}
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>{t('summaries')}</Text>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose} 
          accessible 
          accessibilityLabel={t('closeAccessibility')}
        >
          <AntDesign name="close" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Bouton Nouveau résumé */}
      <TouchableOpacity 
        style={styles.newResumeButton}
        onPress={() => {
          onNewResume();
          onClose();
        }}
        accessible
        accessibilityLabel={t('newSummaryAccessibility')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFF" />
        <Text style={styles.newResumeText}>{t('newSummary')}</Text>
      </TouchableOpacity>

      {/* Bouton Rafraîchir */}
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={fetchResumes}
        disabled={isLoadingResumes}
        accessible
        accessibilityLabel={t('refreshHistoryAccessibility')}
      >
        <Text style={styles.refreshButtonText}>{t('refreshHistory')}</Text>
        {isLoadingResumes ? 
          <ActivityIndicator size="small" color="#3C0663" /> : 
          <Ionicons name="refresh" size={18} color="#3C0663" />
        }
      </TouchableOpacity>

      {/* Liste des résumés */}
      <Text style={styles.historyTitle}>{t('history')}</Text>
      {isLoadingResumes ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>{t('loadingHistory')}</Text>
        </View>
      ) : Array.isArray(savedResumes) && savedResumes.length > 0 ? (
        <ScrollView style={styles.historyList}>
          {savedResumes.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyItem}
              onPress={() => onSelectResume(item.id)}
              accessible
              accessibilityLabel={`${t('summaryAccessibility')} ${formatDate(item.created_at)}`}
            >
              <View style={styles.historyItemContent}>
                <MaterialCommunityIcons name="file-document-outline" size={16} color="#8B2FC9" style={{marginRight: 12}} />
                <View style={{flex: 1}}>
                  <Text style={styles.resumeText} numberOfLines={1}>
                    {truncateText(item.original_text || t('summary'))}
                  </Text>
                  <View style={styles.resumeDetails}>
                    <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => onDeleteResume(item.id)} 
                  style={styles.deleteButton} 
                  accessibilityLabel={t('deleteSummaryAccessibility')}
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
          <Text style={styles.emptyHistoryText}>{t('noSummaryInHistory')}</Text>
          <Text style={styles.emptyHistorySubText}>{t('summariesWillAppear')}</Text>
        </View>
      )}
    </View>
  );
};

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
    shadowOffset: { width: 2, height: 0 },
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
  newResumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3C0663',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  newResumeText: {
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
    backgroundColor:'#DC97FF',
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
  resumeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  resumeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 4,
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
    color: '#555',
  },
  emptyHistorySubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#555',
  },
});

export default SidebarResume;
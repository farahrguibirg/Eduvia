import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

/**
 * Composant pour afficher les détails d'une traduction sélectionnée
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.traduction - L'objet contenant les détails de la traduction
 * @param {Function} props.onClose - Fonction à appeler pour fermer les détails
 * @param {Function} props.onSelectForReuse - Fonction à appeler pour réutiliser cette traduction
 */
const DetailTraduction = ({ traduction, onClose, onSelectForReuse }) => {
  // Vérifier si l'objet traduction est valide
  if (!traduction) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Détails de la traduction</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <Divider />
        <View style={styles.content}>
          <Text style={styles.errorText}>Aucune traduction sélectionnée</Text>
        </View>
      </View>
    );
  }

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
      return dateString || 'Date inconnue';
    }
  };

  // Déterminer le type de traduction
  const isFileTranslation = !!traduction.fichier_source;

  // Obtenir le nom complet d'une langue à partir de son code
  const getLanguageName = (code) => {
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
    
    return langMap[code] || code;
  };
  
  // Récupérer l'icône de langue
  const getLanguageIcon = (langCode) => {
    switch (langCode) {
      case 'fr': return '🇫🇷';
      case 'en': return '🇬🇧';
      case 'es': return '🇪🇸';
      case 'de': return '🇩🇪';
      case 'it': return '🇮🇹';
      case 'pt': return '🇵🇹';
      case 'nl': return '🇳🇱';
      case 'ru': return '🇷🇺';
      case 'ar': return '🇸🇦';
      case 'zh': return '🇨🇳';
      case 'ja': return '🇯🇵';
      default: return '🌐';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Détails de la traduction</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton} accessible={true} accessibilityLabel="Fermer">
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <Divider />
      
      <ScrollView style={styles.content}>
        {/* Bannière avec le type de traduction */}
        <View style={[styles.typeBanner, isFileTranslation ? styles.typeBannerFile : styles.typeBannerText]}>
          <Ionicons
            name={isFileTranslation ? "document-text" : "text"}
            size={20}
            color="#fff"
            style={styles.typeIcon}
          />
          <Text style={styles.typeText}>
            {isFileTranslation ? "Traduction de fichier" : "Traduction de texte"}
          </Text>
        </View>
        
        {/* Informations de base */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{formatDate(traduction.date_creation)}</Text>
              </View>
              
              <View style={styles.languagesContainer}>
                <View style={styles.languageBox}>
                  <Text style={styles.languageIcon}>{getLanguageIcon(traduction.langue_source)}</Text>
                  <Text style={styles.languageName}>{getLanguageName(traduction.langue_source)}</Text>
                </View>
                
                <MaterialIcons name="arrow-forward" size={24} color="#666" style={styles.arrowIcon} />
                
                <View style={styles.languageBox}>
                  <Text style={styles.languageIcon}>{getLanguageIcon(traduction.langue_cible)}</Text>
                  <Text style={styles.languageName}>{getLanguageName(traduction.langue_cible)}</Text>
                </View>
              </View>
              
              {isFileTranslation && (
                <View style={styles.fileInfoContainer}>
                  <Ionicons name="document-attach" size={18} color="#007BFF" style={styles.fileIcon} />
                  <Text style={styles.fileName}>{traduction.fichier_source}</Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
        
        {/* Contenu original */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Texte original:</Text>
          <Card style={styles.contentCard}>
            <Card.Content>
              <ScrollView style={styles.textScrollView} nestedScrollEnabled={true}>
                <Text selectable={true} style={styles.contentText}>{traduction.contenu_original || "Aucun contenu original disponible"}</Text>
              </ScrollView>
            </Card.Content>
          </Card>
        </View>
        
        {/* Contenu traduit */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Traduction:</Text>
          <Card style={styles.contentCard}>
            <Card.Content>
              <ScrollView style={styles.textScrollView} nestedScrollEnabled={true}>
                <Text selectable={true} style={styles.contentText}>{traduction.contenu_traduit || "Aucune traduction disponible"}</Text>
              </ScrollView>
            </Card.Content>
          </Card>
        </View>
        
        {/* Actions */}
        <View style={styles.actionsContainer}>
          {/* Bouton pour réutiliser cette traduction 
          <TouchableOpacity 
            style={styles.reuseButton}
            onPress={() => onSelectForReuse(traduction)}
            accessible={true}
            accessibilityLabel="Réutiliser cette traduction"
          >
            <Ionicons name="repeat" size={18} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Réutiliser cette traduction</Text>
          </TouchableOpacity>
          
          {/* Bouton pour retourner à la liste */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onClose}
            accessible={true}
            accessibilityLabel="Retour à l'historique"
          >
            <Ionicons name="chevron-back" size={18} color="#555" style={styles.buttonIcon} />
            <Text style={styles.backButtonText}>Retour à l'historique</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  typeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  typeBannerText: {
    backgroundColor: '#3498db',
  },
  typeBannerFile: {
    backgroundColor: '#2ecc71',
  },
  typeIcon: {
    marginRight: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoCard: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  infoSection: {
    padding: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 80,
    color: '#555',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  languagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  languageBox: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  languageIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  languageName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    borderRadius: 6,
    marginTop: 8,
  },
  fileIcon: {
    marginRight: 10,
  },
  fileName: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  contentSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  contentCard: {
    borderRadius: 8,
    elevation: 2,
  },
  textScrollView: {
    maxHeight: 150,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  reuseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default DetailTraduction;
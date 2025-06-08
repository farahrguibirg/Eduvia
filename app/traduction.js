{/*import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Share
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { AntDesign, MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import SidebarTraduction from '../components/SidebarTraduction';
import { 
  useTraduction, 
  useSidebar, 
  useLanguages 
} from '../hooks/TraductionHooks';
const Traduction = () => {
  // État local
  const [text, setText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('fr');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showResultPanel, setShowResultPanel] = useState(false);
  
  // Custom hooks
  const { 
    translatedText, 
    originalText,
    fileName,
    isLoading, 
    translateText,
    translateFile,
    resetTranslation,
    setTranslatedText,
    setOriginalText,
    setFileName
  } = useTraduction();
  
  const { 
    isSidebarOpen, 
    toggleSidebar,
    histories,
    fetchHistories,
    selectHistory,
    isLoadingHistories
  } = useSidebar();
  
  const { availableLanguages } = useLanguages();

  // Charger l'historique au montage du composant
  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  // Afficher le panneau de résultat quand une traduction est disponible
  useEffect(() => {
    if (translatedText || originalText) {
      setShowResultPanel(true);
    }
  }, [translatedText, originalText]);

  // Sélectionner un fichier
  
// Mise à jour de la fonction pickDocument
const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword', 
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true
      });
      
      // Vérifier que le document a été sélectionné avec succès
      if (result.type === 'success' || (result.assets && result.assets.length > 0)) {
        // Adapter pour gérer à la fois l'ancien format et le nouveau format de DocumentPicker
        const fileData = result.assets ? result.assets[0] : result;
        
        // Mettre à jour l'état avec le fichier sélectionné
        setSelectedFile(fileData);
        
        // Stocker explicitement le nom du fichier
        const fileName = fileData.name || fileData.fileName || 'document.pdf';
        setFileName(fileName);
        
        // Réinitialiser le texte si un fichier est sélectionné
        setText('');
        
        // Afficher un message de confirmation
        Alert.alert(
          'Fichier sélectionné',
          `${fileName} a été sélectionné avec succès. Appuyez sur "Traduire" pour continuer.`,
          [{ text: 'OK' }]
        );
        
        // Afficher les détails du fichier dans la console pour le débogage
        console.log('Fichier sélectionné:', fileData);
      } else if (result.canceled) {
        console.log('Sélection de fichier annulée');
      }
    } catch (err) {
      console.error('Erreur lors de la sélection du fichier:', err);
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
    }
  };
  
  // Mise à jour de la fonction handleSubmit
  {/*const handleSubmit = async () => {
    if (selectedFile) {
      console.log('Tentative de traduction du fichier:', selectedFile);
      await translateFile(selectedFile, sourceLanguage, targetLanguage);
    } else if (text.trim()) {
      await translateText(text, sourceLanguage, targetLanguage);
    } else {
      Alert.alert('Attention', 'Veuillez entrer du texte ou sélectionner un fichier');
      return;
    }
    
    // Recharger l'historique après la traduction
    fetchHistories();
  };*/}
{/*}
const handleSubmit = async () => {
  if (selectedFile) {
    console.log('Tentative de traduction du fichier:', selectedFile);
    await translateFile(selectedFile, sourceLanguage, targetLanguage);
  } else if (text.trim()) {
    console.log('Tentative de traduction du texte:', text.trim());
    await translateText(text.trim(), sourceLanguage, targetLanguage);
  } else {
    Alert.alert('Attention', 'Veuillez entrer du texte ou sélectionner un fichier');
    return;
  }
  
  // Recharger l'historique après la traduction
  fetchHistories();
};
  // Nouvelle traduction
  const handleNewTranslation = () => {
    setText('');
    setSelectedFile(null);
    setFileName(null);
    resetTranslation();
    setShowResultPanel(false);
  };

  // Partager la traduction
  const shareTranslation = async () => {
    try {
      await Share.share({
        message: translatedText,
        title: 'Traduction'
      });
    } catch (error) {
      Alert.alert('Erreur', 'Le partage a échoué');
    }
  };

  // Copier la traduction dans le presse-papier
  const copyToClipboard = () => {
    // Utiliser Clipboard API ici
    // Cette fonctionnalité nécessite d'importer Clipboard depuis react-native
    // On simule pour l'instant avec une alerte
    Alert.alert('Copié', 'Texte copié dans le presse-papier');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.mainContainer}>
        {/* Bouton menu sidebar 
        <TouchableOpacity 
          style={styles.menuButton} 
        
          onPress={toggleSidebar}
        >
          <Ionicons name="menu" size={24} color="#007BFF" />
        </TouchableOpacity>

        {/* Sidebar (visible conditionnellement) 
        {isSidebarOpen && (
          <View style={styles.overlay}>
            <TouchableOpacity 
              style={styles.overlayTouchable} 
              onPress={toggleSidebar}
            />
            <SidebarTraduction 
              histories={histories}
              onSelectHistory={selectHistory}
              onNewTranslation={handleNewTranslation}
              onClose={toggleSidebar}
            />
          </View>
        )}

        {/* Contenu principal 
        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.title}>Service de Traduction</Text>
          
          {/* Sélection de langues 
          <View style={styles.languageContainer}>
            <View style={styles.languageSelector}>
              <Text style={styles.labelText}>Langue source</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={sourceLanguage}
                  onValueChange={(value) => setSourceLanguage(value)}
                  style={styles.picker}
                >
                  {availableLanguages.map((lang) => (
                    <Picker.Item key={lang.code} label={lang.name} value={lang.code} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => {
                const temp = sourceLanguage;
                setSourceLanguage(targetLanguage);
                setTargetLanguage(temp);
              }}
            >
              <MaterialIcons name="swap-horiz" size={24} color="#007BFF" />
            </TouchableOpacity>
            
            <View style={styles.languageSelector}>
              <Text style={styles.labelText}>Langue cible</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={targetLanguage}
                  onValueChange={(value) => setTargetLanguage(value)}
                  style={styles.picker}
                >
                  {availableLanguages.map((lang) => (
                    <Picker.Item key={lang.code} label={lang.name} value={lang.code} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
          
          {/* Section d'entrée (texte ou fichier) 
          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>Texte à traduire</Text>
            
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Entrez votre texte à traduire..."
              value={text}
              onChangeText={setText}
              editable={!selectedFile}
            />
            
            {/* Bouton pour sélectionner un fichier 
            <TouchableOpacity 
              style={styles.fileButton} 
              onPress={pickDocument}
            >
              <AntDesign name="file1" size={20} color="#FFF" />
              <Text style={styles.fileButtonText}>
                {selectedFile ? 'Changer de fichier' : 'Sélectionner un fichier'}
              </Text>
            </TouchableOpacity>
            
            {/* Affichage du nom du fichier sélectionné 
            {selectedFile && (
              <View style={styles.selectedFileContainer}>
                <View style={styles.fileInfoBox}>
                  <AntDesign name="pdffile1" size={24} color="#FF3B30" style={styles.fileIcon} />
                  <View style={styles.fileDetails}>
                    <Text style={styles.selectedFileText} numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                    <Text style={styles.fileTypeText}>
                      {selectedFile.mimeType || 'Document PDF'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.removeFileButton} 
                  onPress={() => {
                    setSelectedFile(null);
                    setFileName(null);
                  }}
                >
                  <AntDesign name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Bouton de traduction 
          <TouchableOpacity 
            style={[
              styles.translateButton,
              (!text.trim() && !selectedFile) ? styles.disabledButton : {}
            ]} 
            onPress={handleSubmit}
            disabled={isLoading || (!text.trim() && !selectedFile)}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.translateButtonText}>Traduire</Text>
                <MaterialIcons name="translate" size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
          
          {/* Résultat de la traduction 
          {showResultPanel && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Résultat de la traduction</Text>
                <View style={styles.resultActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={copyToClipboard}
                  >
                    <Feather name="copy" size={18} color="#007BFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={shareTranslation}
                  >
                    <Feather name="share-2" size={18} color="#007BFF" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Texte original ou Nom du fichier 
              <View style={styles.originalTextContainer}>
                {fileName ? (
                  <>
                    <Text style={styles.originalTextLabel}>Fichier traduit:</Text>
                    <View style={styles.fileIndicator}>
                      <AntDesign name="file1" size={16} color="#555" style={styles.smallFileIcon} />
                      <Text style={styles.originalTextContent}>{fileName}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.originalTextLabel}>Texte original:</Text>
                    <Text style={styles.originalTextContent}>{originalText}</Text>
                  </>
                )}
              </View>
              
              {/* Texte traduit 
              <View style={styles.translatedTextContainer}>
  <Text style={styles.translatedTextLabel}>Traduction:</Text>
  <ScrollView style={styles.translatedTextScrollView}>
    <Text 
      style={styles.translatedTextContent}
      selectable={true}
    >
      {translatedText}
    </Text>
  </ScrollView>
</View>*/}
{/* Texte traduit */}{/*
<View style={styles.translatedTextContainer}>
                <Text style={styles.translatedTextLabel}>Traduction:</Text>
                <ScrollView 
                  style={styles.translatedTextScrollView}
                  contentContainerStyle={styles.translatedTextScrollViewContent}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  <Text 
                    style={styles.translatedTextContent}
                    selectable={true}
                  >
                    {translatedText}
                  </Text>
                </ScrollView>
              </View>
     {/* Informations de traduction 
              <View style={styles.translationInfoContainer}>
                <Text style={styles.translationInfoText}>
                  De {availableLanguages.find(l => l.code === sourceLanguage)?.name || sourceLanguage}
                  {' '} à {' '}
                  {availableLanguages.find(l => l.code === targetLanguage)?.name || targetLanguage}
                </Text>
              </View>
              
              {/* Bouton nouvelle traduction 
              <TouchableOpacity 
                style={styles.newTranslationButtonSmall}
                onPress={handleNewTranslation}
              >
                <AntDesign name="plus" size={18} color="#FFF" />
                <Text style={styles.newTranslationTextSmall}>Nouvelle traduction</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Espace en bas pour le scroll 
          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};
// Styles pour le composant Traduction
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 50,
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  menuButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 15,
    zIndex: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  translatedTextScrollViewContent: {
    padding: 0,
    flexGrow: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 70 : 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 16,
  },
  // Ajouter ce style au style existant
translatedTextBox: {
  backgroundColor: '#f0f8ff',
  borderRadius: 6,
  padding: 8,
  maxHeight: 300,
},
translatedTextContent: {
  fontSize: 15,
  color: '#333',
  lineHeight: 22,
},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  languageSelector: {
    flex: 1,
  },
  labelText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  switchButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#f0f8ff',
    marginHorizontal: 8,
    alignSelf: 'flex-end',
    marginBottom: 6,
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    height: 120,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  fileButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  fileInfoBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    marginRight: 10,
  },
  fileDetails: {
    flex: 1,
  },
  selectedFileText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  fileTypeText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  removeFileButton: {
    padding: 5,
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#b3d7ff',
  },
  translateButtonText: {
    color: '#fff',
    marginRight: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
  },
  originalTextContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  originalTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  originalTextContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  translatedTextContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007BFF',
  },
  translatedTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007BFF',
    marginBottom: 6,
  },
  translatedTextInput: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    padding: 0,
    textAlignVertical: 'top',
  },
  translationInfoContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  translationInfoText: {
    fontSize: 13,
    color: '#888',
  },
  newTranslationButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  newTranslationTextSmall: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
  },
  bottomSpace: {
    height: 40,
  },
  translatedTextScrollView: {
    maxHeight: 300, // Hauteur maximale pour permettre le défilement
  },
  translatedTextContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    padding: 8,
  },
});

export default Traduction;*/}{/*
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Share,
  Modal,
  Image
} from 'react-native';
import { AntDesign, MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import SidebarTraduction from '../components/SidebarTraduction';
import { 
  useTraduction, 
  useSidebar, 
  useLanguages 
} from '../hooks/TraductionHooks';
import * as DocumentPicker from 'expo-document-picker';

// Page d'accueil avec les options comme dans l'image
const StartPage = ({ onSelectOption, onContinue }) => {
  // Ajout d'un état pour suivre l'option sélectionnée
  const [selectedStartOption, setSelectedStartOption] = useState(null);

  // Fonction pour gérer la sélection d'option
  const handleOptionSelect = (option) => {
    setSelectedStartOption(option);
    onSelectOption(option);
  };

  return (
    <View style={styles.startContainer}>
      <View style={styles.startContent}>
        {/* Illustration supérieure 
        <View style={styles.illustrationContainer}>
          <Image 
            source={require('../assets/translation-illustration.png')} 
            style={styles.illustration} 
            resizeMode="contain"
          />
        </View>
        
        {/* Boutons d'options 
        <TouchableOpacity 
          style={[
            styles.optionButton,
            selectedStartOption === 'text' ? styles.selectedOptionButton : {}
          ]} 
          onPress={() => handleOptionSelect('text')}
        >
          <Text style={styles.optionButtonText}>Traduction du texte</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.optionButton,
            selectedStartOption === 'file' ? styles.selectedOptionButton : {}
          ]} 
          onPress={() => handleOptionSelect('file')}
        >
          <Text style={styles.optionButtonText}>Traduction du fichier</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedStartOption ? styles.disabledContinueButton : {}
          ]} 
          onPress={onContinue}
          disabled={!selectedStartOption}
        >
          <Text style={styles.continueButtonText}>continuer</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Traduction = () => {
  // État local
  const [text, setText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('fr');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectingSourceLang, setSelectingSourceLang] = useState(true);
  const [showStartPage, setShowStartPage] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom hooks
  const { 
    translatedText, 
    originalText,
    fileName,
    isLoading, 
    translateText,
    translateFile,
    resetTranslation,
    setTranslatedText,
    setOriginalText,
    setFileName
  } = useTraduction();
  
  const { 
    isSidebarOpen, 
    toggleSidebar,
    histories,
    fetchHistories,
    selectHistory,
    isLoadingHistories,
    deleteTraduction
  } = useSidebar();
  
  
  const { availableLanguages } = useLanguages();

  // Charger l'historique au montage du composant
  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  // Afficher le panneau de résultat quand une traduction est disponible
  useEffect(() => {
    if (translatedText || originalText) {
      setShowResultPanel(true);
    }
  }, [translatedText, originalText]);

  // Gestion de la sélection d'option sur la page d'accueil
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  // Continuer directement vers la page principale
  const handleContinue = () => {
    // Vérifier si une option a été sélectionnée
    if (selectedOption) {
      setShowStartPage(false);
    } else {
      // Si aucune option n'est sélectionnée, ne rien faire
      Alert.alert("Attention", "Veuillez sélectionner une option avant de continuer.");
    }
  };
  
// Keep only this implementation of selectHistory directly
const handleSelectHistory = async (id) => {
  try {
    const historyItem = await selectHistory(id);
    
    if (historyItem) {
      // Mettre à jour les états avec les informations récupérées
      setOriginalText(historyItem.contenu_original);
      setTranslatedText(historyItem.contenu_traduit);
      setFileName(historyItem.fichier_source || null);
      
      // Mettre à jour les langues sélectionnées
      setSourceLanguage(historyItem.langue_source);
      setTargetLanguage(historyItem.langue_cible);
      
      // Afficher le panneau de résultat
      setShowResultPanel(true);
      
      // Réinitialiser le texte saisi et le fichier sélectionné
      setText('');
      setSelectedFile(null);
      
      // Quitter la page d'accueil si on y est
      setShowStartPage(false);
    }
    
    return historyItem;
  } catch (error) {
    console.error('Erreur lors de la sélection de l\'historique:', error);
    Alert.alert('Erreur', 'Impossible de charger cette traduction');
    return null;
  }
};
  
  // 3. Dans le composant Traduction.js, assurez-vous que la logique d'affichage est correcte
  // Modifier useEffect pour s'assurer que le panneau de résultat s'affiche correctement
  useEffect(() => {
    if (translatedText || originalText) {
      setShowResultPanel(true);
      // Assurez-vous de quitter la page d'accueil si nécessaire
      setShowStartPage(false);
    }
  }, [translatedText, originalText]);
  const handleDeleteTraduction = async (id) => {
    if (typeof deleteTraduction === 'function') {
      await deleteTraduction(id);
      await fetchHistories();
    } else {
      // Si deleteTraduction n'est pas défini, ignorer
      await fetchHistories();
    }
  };

  // Retourner à la page d'accueil
  const handleBackToStart = () => {
    setShowStartPage(true);
    setSelectedOption(null);
  };

  // Sélectionner un fichier
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword', 
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true
      });
      
      // Vérifier que le document a été sélectionné avec succès
      if (result.type === 'success' || (result.assets && result.assets.length > 0)) {
        // Adapter pour gérer à la fois l'ancien format et le nouveau format de DocumentPicker
        const fileData = result.assets ? result.assets[0] : result;
        
        // Mettre à jour l'état avec le fichier sélectionné
        setSelectedFile(fileData);
        
        // Stocker explicitement le nom du fichier
        const fileName = fileData.name || fileData.fileName || 'document.pdf';
        setFileName(fileName);
        
        // Réinitialiser le texte si un fichier est sélectionné
        setText('');
        
        // Afficher un message de confirmation
        Alert.alert(
          'Fichier sélectionné',
          `${fileName} a été sélectionné avec succès. Appuyez sur "Traduire" pour continuer.`,
          [{ text: 'OK' }]
        );
        
        console.log('Fichier sélectionné:', fileData);
      } else if (result.canceled) {
        console.log('Sélection de fichier annulée');
      }
    } catch (err) {
      console.error('Erreur lors de la sélection du fichier:', err);
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
    }
  };

  // Modifiez la fonction handleSubmit pour s'assurer que le résultat s'affiche
const handleSubmit = async () => {
  try {
    if (selectedFile) {
      console.log('Tentative de traduction du fichier:', selectedFile);
      const result = await translateFile(selectedFile, sourceLanguage, targetLanguage);
      
      // Vérifiez si la traduction a réussi
      if (result) {
        console.log('Traduction réussie:', result);
        setShowResultPanel(true); // Forcer l'affichage du panneau de résultat
      }
    } else if (text.trim()) {
      console.log('Tentative de traduction du texte:', text.trim());
      const result = await translateText(text.trim(), sourceLanguage, targetLanguage);
      
      // Vérifiez si la traduction a réussi
      if (result) {
        console.log('Traduction réussie:', result);
        setShowResultPanel(true); // Forcer l'affichage du panneau de résultat
      }
    } else {
      Alert.alert('Attention', 'Veuillez entrer du texte ou sélectionner un fichier');
      return;
    }
    
    // Recharger l'historique après la traduction
    fetchHistories();
  } catch (error) {
    console.error('Erreur lors de la traduction:', error);
    Alert.alert('Erreur', 'Une erreur est survenue lors de la traduction.');
  }
};
  // Nouvelle traduction
  const handleNewTranslation = () => {
    setText('');
    setSelectedFile(null);
    setFileName(null);
    resetTranslation();
    setShowResultPanel(false);
    setShowStartPage(true); // Retour à la page d'accueil
    setSelectedOption(null); // Réinitialiser l'option sélectionnée
  };

  // Partager la traduction
  const shareTranslation = async () => {
    try {
      await Share.share({
        message: translatedText,
        title: 'Traduction'
      });
    } catch (error) {
      Alert.alert('Erreur', 'Le partage a échoué');
    }
  };

  // Copier la traduction dans le presse-papier
  const copyToClipboard = () => {
    Alert.alert('Copié', 'Texte copié dans le presse-papier');
  };

  // Sélectionner une langue
  const selectLanguage = (langCode) => {
    if (selectingSourceLang) {
      setSourceLanguage(langCode);
      setSelectingSourceLang(false);
    } else {
      setTargetLanguage(langCode);
      setShowLanguageSelector(false);
    }
  };

  // Obtenir le nom et le drapeau d'une langue
  const getLanguageInfo = (langCode) => {
    const lang = availableLanguages.find(l => l.code === langCode);
    let flag = '';
    
    // Ajout des drapeaux manquants
    switch(langCode) {
      case 'en': flag = '🇬🇧'; break;
      case 'fr': flag = '🇫🇷'; break;
      case 'de': flag = '🇩🇪'; break;
      case 'es': flag = '🇪🇸'; break;
      case 'it': flag = '🇮🇹'; break;
      case 'ja': flag = '🇯🇵'; break;
      case 'ar': flag = '🇸🇦'; break; // Arabe (Arabie Saoudite)
      case 'zh': flag = '🇨🇳'; break; // Chinois (Chine)
      case 'pt': flag = '🇵🇹'; break; // Portugais (Portugal)
      case 'nl': flag = '🇳🇱'; break; // Néerlandais (Pays-Bas)
      case 'ru': flag = '🇷🇺'; break; // Russe (Russie)
      default: flag = '🌐';
    }
    
    return { name: lang?.name || langCode, flag };
  };

  // Filtrer les langues selon le terme de recherche
  const filteredLanguages = availableLanguages.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Si la page d'accueil est affichée
  if (showStartPage) {
    return (
      <StartPage 
        onSelectOption={handleOptionSelect}
        onContinue={handleContinue} 
      />
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.mainContainer}>
        {/* Bouton menu sidebar 
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={toggleSidebar}
        >
          <Ionicons name="menu" size={24} color="#DC97FF" />
        </TouchableOpacity>

        {/* Bouton retour 
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackToStart}
        >
          <Ionicons name="arrow-back" size={24} color="#5A108F" />
        </TouchableOpacity>

        {/* Sidebar (visible conditionnellement) 
        {isSidebarOpen && (
          <View style={styles.overlay}>
            <TouchableOpacity 
              style={styles.overlayTouchable} 
              onPress={toggleSidebar}
            />
<SidebarTraduction 
  histories={histories}
  onSelectHistory={handleSelectHistory}  // Utilisez votre fonction handleSelectHistory au lieu de selectHistory
  onNewTranslation={handleNewTranslation}
  onClose={toggleSidebar}
  onDeleteHistory={handleDeleteTraduction}
/>
          </View>
        )}

        {/* Modal pour la sélection de langue 
        <Modal
          visible={showLanguageSelector}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowLanguageSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.languageModal}>
              <View style={styles.modalHeader}>
                {!selectingSourceLang && (
                  <TouchableOpacity 
                    onPress={() => setSelectingSourceLang(true)}
                    style={styles.modalBackButton}
                  >
                    <Ionicons name="arrow-back" size={24} color="#310055" />
                  </TouchableOpacity>
                )}
                <Text style={styles.modalTitle}>
                  {selectingSourceLang ? 'Langue source' : 'Langue cible'}
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowLanguageSelector(false)}
                  style={styles.closeButton}
                >
                  <AntDesign name="close" size={24} color="#310055" />
                </TouchableOpacity>
              </View>
              
              {/* Barre de recherche - corrigée pour fonctionner 
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher une langue..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
                <AntDesign name="search1" size={20} color="#310055" style={styles.searchIcon} />
              </View>
              
              {/* Liste des langues - maintenant filtrée selon la recherche 
              <ScrollView style={styles.languageList}>
                {filteredLanguages.map((lang) => {
                  const langInfo = getLanguageInfo(lang.code);
                  return (
                    <TouchableOpacity 
                      key={lang.code}
                      style={styles.languageItem}
                      onPress={() => selectLanguage(lang.code)}
                    >
                      <View style={styles.languageItemContent}>
                        <Text style={styles.languageFlag}>{langInfo.flag}</Text>
                        <Text style={styles.languageName}>{lang.name}</Text>
                      </View>
                      {/*<Ionicons name="volume-medium" size={22} color="#007BFF" />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Contenu principal 
        <ScrollView style={styles.scrollContainer}>
          {/* Sélection de langues (nouvelle interface) 
          <View style={styles.newLanguageContainer}>
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => {
                setSelectingSourceLang(true);
                setShowLanguageSelector(true);
              }}
            >
              <View style={styles.languageButtonContent}>
                <Text style={styles.languageFlag}>{getLanguageInfo(sourceLanguage).flag}</Text>
                <Text style={styles.languageButtonText}>{getLanguageInfo(sourceLanguage).name}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#310055" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.switchLanguageButton}
              onPress={() => {
                const temp = sourceLanguage;
                setSourceLanguage(targetLanguage);
                setTargetLanguage(temp);
              }}
            >
              <MaterialIcons name="swap-horiz" size={24} color="#8B2FC9" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => {
                setSelectingSourceLang(false);
                setShowLanguageSelector(true);
              }}
            >
              <View style={styles.languageButtonContent}>
                <Text style={styles.languageFlag}>{getLanguageInfo(targetLanguage).flag}</Text>
                <Text style={styles.languageButtonText}>{getLanguageInfo(targetLanguage).name}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#310055" />
            </TouchableOpacity>
          </View>
          
          {/* Zone de saisie de texte (affichée seulement si l'option "texte" est sélectionnée) 
          {selectedOption === 'text' && (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.modernTextInput}
                multiline
                placeholder={`Entrez votre texte en ${getLanguageInfo(sourceLanguage).name}...`}
                value={text}
                onChangeText={setText}
                editable={!selectedFile}
              />
            </View>
          )}
          
          {/* Boutons d'actions 
          <View style={styles.actionButtonsContainer}>
            {/* Afficher le bouton de fichier uniquement si l'option de fichier est sélectionnée 
            {selectedOption === 'file' && (
              <TouchableOpacity 
                style={styles.filePickButton} 
                onPress={pickDocument}
              >
                <AntDesign name="file1" size={20} color="#6818A5" />
                <Text style={styles.filePickButtonText}>
                  {selectedFile ? 'Changer' : 'Fichier'}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.translateActionButton,
                (selectedOption === 'text' && !text.trim()) || 
                (selectedOption === 'file' && !selectedFile) ? 
                styles.disabledActionButton : {}
              ]} 
              onPress={handleSubmit}
              disabled={isLoading || 
                (selectedOption === 'text' && !text.trim()) || 
                (selectedOption === 'file' && !selectedFile)}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialIcons name="translate" size={20} color="#FFF" />
                  <Text style={styles.translateActionButtonText}>Traduire</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Affichage du nom du fichier sélectionné 
          {selectedFile && (
            <View style={styles.selectedFileContainer}>
              <View style={styles.fileInfoBox}>
                <AntDesign name="pdffile1" size={24} color="#FF3B30" style={styles.fileIcon} />
                <View style={styles.fileDetails}>
                  <Text style={styles.selectedFileText} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.fileTypeText}>
                    {selectedFile.mimeType || 'Document PDF'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.removeFileButton} 
                onPress={() => {
                  setSelectedFile(null);
                  setFileName(null);
                }}
              >
                <AntDesign name="close" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Résultat de la traduction 
          {showResultPanel && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Résultat de la traduction</Text>
                <View style={styles.resultActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={copyToClipboard}
                  >
                    <Feather name="copy" size={18} color="#AB51E3" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={shareTranslation}
                  >
                    <Feather name="share-2" size={18} color="#AB51E3" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Texte original ou Nom du fichier 
              <View style={styles.originalTextContainer}>
                {fileName ? (
                  <>
                    <Text style={styles.originalTextLabel}>Fichier traduit:</Text>
                    <View style={styles.fileIndicator}>
                      <AntDesign name="file1" size={16} color="#555" style={styles.smallFileIcon} />
                      <Text style={styles.originalTextContent}>{fileName}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.originalTextLabel}>Texte original:</Text>
                    <Text style={styles.originalTextContent}>{originalText}</Text>
                  </>
                )}
              </View>
              
              {/* Texte traduit 
              <View style={styles.translatedTextContainer}>
                <Text style={styles.translatedTextLabel}>Traduction:</Text>
                <ScrollView 
                  style={styles.translatedTextScrollView}
                  contentContainerStyle={styles.translatedTextScrollViewContent}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  <Text 
                    style={styles.translatedTextContent}
                    selectable={true}
                  >
                    {translatedText}
                  </Text>
                </ScrollView>
              </View>*/}
              {/* Texte traduit 
    <View style={styles.translatedTextContainer}>
      <Text style={styles.translatedTextLabel}>Traduction:</Text>
      <ScrollView 
        style={styles.translatedTextScrollView}
        contentContainerStyle={styles.translatedTextScrollViewContent}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        <Text 
          style={styles.translatedTextContent}
          selectable={true}
        >
          {translatedText || "Aucune traduction disponible"}
        </Text>
      </ScrollView>
    </View>
              {/* Informations de traduction 
              <View style={styles.translationInfoContainer}>
                <Text style={styles.translationInfoText}>
                  De {getLanguageInfo(sourceLanguage).name}
                  {' '} à {' '}
                  {getLanguageInfo(targetLanguage).name}
                </Text>
              </View>
              
              {/* Bouton nouvelle traduction 
              <TouchableOpacity 
                style={styles.newTranslationButtonSmall}
                onPress={handleNewTranslation}
              >
                <AntDesign name="plus" size={18} color="#FFF" />
                <Text style={styles.newTranslationTextSmall}>Nouvelle traduction</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Espace en bas pour le scroll 
          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};*/}
{/*}
// Styles pour le composant Traduction
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 50,
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  menuButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 15,
    zIndex: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#5A108F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 15,
    zIndex: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  scrollContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 70 : 40,
    paddingHorizontal: 16,
  },
  // Styles pour la page d'accueil
  startContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  illustrationContainer: {
    width: '100%',
    height: 250,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  optionButton: {
    backgroundColor: '#8B2FC9', // Bleu comme dans l'image
    width: '100%',
    padding: 15,
    borderRadius: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedOptionButton: {
    backgroundColor: '#AB51E3', // Bleu plus foncé pour l'option sélectionnée
    borderWidth: 2,
    borderColor: '#310055',
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#AB51E3', // Bleu comme dans l'image
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
    width: '100%',
  },
  disabledContinueButton: {
    backgroundColor: '#310055', // Bleu clair pour le bouton désactivé
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
  // Nouveau style pour la sélection de langue
  newLanguageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 5,
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageButtonText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  switchLanguageButton: {
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  // Style pour le modal de sélection de langue
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageModal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalBackButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 35,
    fontSize: 16,
  },
  searchIcon: {
    position: 'absolute',
    top: 19,
    left: 25,
  },
  languageList: {
    padding: 10,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  // Zone de saisie de texte modernisée
  textInputContainer: {
    marginBottom: 16,
  },
  modernTextInput: {
    height: 150,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  // Nouveaux boutons d'action
  actionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filePickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    flex: 1,
  },
  filePickButtonText: {
    color: '#007BFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  translateActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3C0663',
    padding: 12,
    borderRadius: 12,
    flex: 2,
  },
  disabledActionButton: {
    backgroundColor: '#DC97FF',
  },
  translateActionButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  // Styles existants
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  fileInfoBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    marginRight: 10,
  },
  fileDetails: {
    flex: 1,
  },
  selectedFileText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  fileTypeText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  removeFileButton: {
    padding: 5,
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
  },
  originalTextContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  originalTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  originalTextContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  translatedTextContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007BFF',
  },
  translatedTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007BFF',
    marginBottom: 6,
  },
  translatedTextScrollView: {
    maxHeight: 300,
  },
  translatedTextScrollViewContent: {
    padding: 0,
    flexGrow: 1,
  },
  translatedTextContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    padding: 8,
  },
  translationInfoContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  translationInfoText: {
    fontSize: 13,
    color: '#888',
  },
  newTranslationButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  newTranslationTextSmall: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
  },
  bottomSpace: {
    height: 40,
  },
  smallFileIcon: {
    marginRight: 5,
  },
  fileIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Traduction;*/}
{/*import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Share,
  Modal,
  Image
} from 'react-native';
import { AntDesign, MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import SidebarTraduction from '../components/SidebarTraduction';
import { 
  useTraduction, 
  useSidebar, 
  useLanguages 
} from '../hooks/TraductionHooks';
import * as DocumentPicker from 'expo-document-picker';
import { useLanguage } from './i18n';
import { useAuth } from '../contexts/AuthContext'; 


// Page d'accueil avec les options comme dans l'image
const StartPage = ({ onSelectOption, onContinue }) => {
  const { t } = useLanguage();
  const { isLoggedIn, user, logout } = useAuth(); // ✅ AJOUTER ICI
  // Ajout d'un état pour suivre l'option sélectionnée
  const [selectedStartOption, setSelectedStartOption] = useState(null);
  // Vérification d'authentification
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <View style={styles.notLoggedInContainer}>
          <Ionicons name="lock-closed" size={50} color="#6818a5" />
          <Text style={styles.notLoggedInTitle}>{t('accessDeniedTitle')}</Text>
          <Text style={styles.notLoggedInMessage}>
            {t('accessDeniedMessage')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Fonction pour gérer la sélection d'option
  const handleOptionSelect = (option) => {
    setSelectedStartOption(option);
    onSelectOption(option);
  };

  return (
    <View style={styles.startContainer}>
      <View style={styles.startContent}>
        {/* Illustration supérieure 
        <View style={styles.illustrationContainer}>
          <Image 
            source={require('../assets/translation-illustration.png')} 
            style={styles.illustration} 
            resizeMode="contain"
          />
        </View>
        
        {/* Boutons d'options 
        <TouchableOpacity 
          style={[
            styles.optionButton,
            selectedStartOption === 'text' ? styles.selectedOptionButton : {}
          ]} 
          onPress={() => handleOptionSelect('text')}
        >
          <Text style={styles.optionButtonText}>{t('textTranslation')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.optionButton,
            selectedStartOption === 'file' ? styles.selectedOptionButton : {}
          ]} 
          onPress={() => handleOptionSelect('file')}
        >
          <Text style={styles.optionButtonText}>{t('fileTranslation')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedStartOption ? styles.disabledContinueButton : {}
          ]} 
          onPress={onContinue}
          disabled={!selectedStartOption}
        >
          <Text style={styles.continueButtonText}>{t('continueButton')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Traduction = () => {
  const { t } = useLanguage();
  
  // État local
  const [text, setText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('fr');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectingSourceLang, setSelectingSourceLang] = useState(true);
  const [showStartPage, setShowStartPage] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom hooks
  const { 
    translatedText, 
    originalText,
    fileName,
    isLoading, 
    translateText,
    translateFile,
    resetTranslation,
    setTranslatedText,
    setOriginalText,
    setFileName
  } = useTraduction();
  
  const { 
    isSidebarOpen, 
    toggleSidebar,
    histories,
    fetchHistories,
    selectHistory,
    isLoadingHistories,
    deleteTraduction
  } = useSidebar();
  
  const { availableLanguages } = useLanguages();

  // Charger l'historique au montage du composant
  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  // Afficher le panneau de résultat quand une traduction est disponible
  useEffect(() => {
    if (translatedText || originalText) {
      setShowResultPanel(true);
    }
  }, [translatedText, originalText]);

  // Gestion de la sélection d'option sur la page d'accueil
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  // Continuer directement vers la page principale
  const handleContinue = () => {
    // Vérifier si une option a été sélectionnée
    if (selectedOption) {
      setShowStartPage(false);
    } else {
      // Si aucune option n'est sélectionnée, ne rien faire
      Alert.alert(t('attention'), t('selectOption'));
    }
  };
  
  // Keep only this implementation of selectHistory directly
  const handleSelectHistory = async (id) => {
    try {
      const historyItem = await selectHistory(id);
      
      if (historyItem) {
        // Mettre à jour les états avec les informations récupérées
        setOriginalText(historyItem.contenu_original);
        setTranslatedText(historyItem.contenu_traduit);
        setFileName(historyItem.fichier_source || null);
        
        // Mettre à jour les langues sélectionnées
        setSourceLanguage(historyItem.langue_source);
        setTargetLanguage(historyItem.langue_cible);
        
        // Afficher le panneau de résultat
        setShowResultPanel(true);
        
        // Réinitialiser le texte saisi et le fichier sélectionné
        setText('');
        setSelectedFile(null);
        
        // Quitter la page d'accueil si on y est
        setShowStartPage(false);
      }
      
      return historyItem;
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'historique:', error);
      Alert.alert(t('error'), t('cannotLoadTranslation'));
      return null;
    }
  };
  
  // 3. Dans le composant Traduction.js, assurez-vous que la logique d'affichage est correcte
  // Modifier useEffect pour s'assurer que le panneau de résultat s'affiche correctement
  useEffect(() => {
    if (translatedText || originalText) {
      setShowResultPanel(true);
      // Assurez-vous de quitter la page d'accueil si nécessaire
      setShowStartPage(false);
    }
  }, [translatedText, originalText]);

  const handleDeleteTraduction = async (id) => {
    if (typeof deleteTraduction === 'function') {
      await deleteTraduction(id);
      await fetchHistories();
    } else {
      // Si deleteTraduction n'est pas défini, ignorer
      await fetchHistories();
    }
  };

  // Retourner à la page d'accueil
  const handleBackToStart = () => {
    setShowStartPage(true);
    setSelectedOption(null);
  };

  // Sélectionner un fichier
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword', 
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true
      });
      
      // Vérifier que le document a été sélectionné avec succès
      if (result.type === 'success' || (result.assets && result.assets.length > 0)) {
        // Adapter pour gérer à la fois l'ancien format et le nouveau format de DocumentPicker
        const fileData = result.assets ? result.assets[0] : result;
        
        // Mettre à jour l'état avec le fichier sélectionné
        setSelectedFile(fileData);
        
        // Stocker explicitement le nom du fichier
        const fileName = fileData.name || fileData.fileName || 'document.pdf';
        setFileName(fileName);
        
        // Réinitialiser le texte si un fichier est sélectionné
        setText('');
        
        // Afficher un message de confirmation
        Alert.alert(
          t('fileSelected'),
          `${fileName} ${t('fileSelectedSuccess')}`,
          [{ text: 'OK' }]
        );
        
        console.log('Fichier sélectionné:', fileData);
      } else if (result.canceled) {
        console.log('Sélection de fichier annulée');
      }
    } catch (err) {
      console.error('Erreur lors de la sélection du fichier:', err);
      Alert.alert(t('error'), t('cannotSelectFile'));
    }
  };

  // Modifiez la fonction handleSubmit pour s'assurer que le résultat s'affiche
  const handleSubmit = async () => {
    try {
      if (selectedFile) {
        console.log('Tentative de traduction du fichier:', selectedFile);
        const result = await translateFile(selectedFile, sourceLanguage, targetLanguage);
        
        // Vérifiez si la traduction a réussi
        if (result) {
          console.log('Traduction réussie:', result);
          setShowResultPanel(true); // Forcer l'affichage du panneau de résultat
        }
      } else if (text.trim()) {
        console.log('Tentative de traduction du texte:', text.trim());
        const result = await translateText(text.trim(), sourceLanguage, targetLanguage);
        
        // Vérifiez si la traduction a réussi
        if (result) {
          console.log('Traduction réussie:', result);
          setShowResultPanel(true); // Forcer l'affichage du panneau de résultat
        }
      } else {
        Alert.alert(t('attention'), t('enterText'));
        return;
      }
      
      // Recharger l'historique après la traduction
      fetchHistories();
    } catch (error) {
      console.error('Erreur lors de la traduction:', error);
      Alert.alert(t('error'), t('translationError'));
    }
  };

  // Nouvelle traduction
  const handleNewTranslation = () => {
    setText('');
    setSelectedFile(null);
    setFileName(null);
    resetTranslation();
    setShowResultPanel(false);
    setShowStartPage(true); // Retour à la page d'accueil
    setSelectedOption(null); // Réinitialiser l'option sélectionnée
  };

  // Partager la traduction
  const shareTranslation = async () => {
    try {
      await Share.share({
        message: translatedText,
        title: t('translationSharing')
      });
    } catch (error) {
      Alert.alert(t('error'), t('shareFailed'));
    }
  };

  // Copier la traduction dans le presse-papier
  const copyToClipboard = () => {
    Alert.alert(t('copied'), t('copyTranslation'));
  };

  // Sélectionner une langue
  const selectLanguage = (langCode) => {
    if (selectingSourceLang) {
      setSourceLanguage(langCode);
      setSelectingSourceLang(false);
    } else {
      setTargetLanguage(langCode);
      setShowLanguageSelector(false);
    }
  };

  // Obtenir le nom et le drapeau d'une langue
  const getLanguageInfo = (langCode) => {
    const lang = availableLanguages.find(l => l.code === langCode);
    let flag = '';
    
    // Ajout des drapeaux manquants
    switch(langCode) {
      case 'en': flag = '🇬🇧'; break;
      case 'fr': flag = '🇫🇷'; break;
      case 'de': flag = '🇩🇪'; break;
      case 'es': flag = '🇪🇸'; break;
      case 'it': flag = '🇮🇹'; break;
      case 'ja': flag = '🇯🇵'; break;
      case 'ar': flag = '🇸🇦'; break; // Arabe (Arabie Saoudite)
      case 'zh': flag = '🇨🇳'; break; // Chinois (Chine)
      case 'pt': flag = '🇵🇹'; break; // Portugais (Portugal)
      case 'nl': flag = '🇳🇱'; break; // Néerlandais (Pays-Bas)
      case 'ru': flag = '🇷🇺'; break; // Russe (Russie)
      default: flag = '🌐';
    }
    
    return { name: lang?.name || langCode, flag };
  };

  // Filtrer les langues selon le terme de recherche
  const filteredLanguages = availableLanguages.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Si la page d'accueil est affichée
  if (showStartPage) {
    return (
      <StartPage 
        onSelectOption={handleOptionSelect}
        onContinue={handleContinue} 
      />
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/*<View style={styles.mainContainer}>
        {/* Bouton menu sidebar 
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={toggleSidebar}
        >
          <Ionicons name="menu" size={24} color="#DC97FF" />
        </TouchableOpacity>
         <View style={styles.headerTitleContainer}>
                  <Text style={styles.headerTitle}>Traduction</Text>
                </View>

        {/* Bouton retour 
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackToStart}
        >
          <Ionicons name="arrow-back" size={24} color="#5A108F" />
        </TouchableOpacity>
        {/* Header bar 
              <View style={styles.header}>
                <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
                  <Ionicons name="menu" size={24} color="#6818A5" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                  <Text style={styles.headerTitle}>Traduction</Text>
                </View>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={handleBackToStart}
                >
                  <Ionicons name="arrow-back" size={24} color="#5A108F" />
                </TouchableOpacity>
              </View>
              <View style={styles.mainContainer}>

        {/* Sidebar (visible conditionnellement) 
        {isSidebarOpen && (
          <View style={styles.overlay}>
            <TouchableOpacity 
              style={styles.overlayTouchable} 
              onPress={toggleSidebar}
            />
            <SidebarTraduction 
              histories={histories}
              onSelectHistory={handleSelectHistory}  // Utilisez votre fonction handleSelectHistory au lieu de selectHistory
              onNewTranslation={handleNewTranslation}
              onClose={toggleSidebar}
              onDeleteHistory={handleDeleteTraduction}
            />
          </View>
        )}

        {/* Modal pour la sélection de langue 
        <Modal
          visible={showLanguageSelector}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowLanguageSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.languageModal}>
              <View style={styles.modalHeader}>
                {!selectingSourceLang && (
                  <TouchableOpacity 
                    onPress={() => setSelectingSourceLang(true)}
                    style={styles.modalBackButton}
                  >
                    <Ionicons name="arrow-back" size={24} color="#310055" />
                  </TouchableOpacity>
                )}
                <Text style={styles.modalTitle}>
                  {selectingSourceLang ? t('sourceLanguage') : t('targetLanguage')}
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowLanguageSelector(false)}
                  style={styles.closeButton}
                >
                  <AntDesign name="close" size={24} color="#310055" />
                </TouchableOpacity>
              </View>
              
              {/* Barre de recherche - corrigée pour fonctionner 
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('searchLanguage')}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
                <AntDesign name="search1" size={20} color="#310055" style={styles.searchIcon} />
              </View>
              
              {/* Liste des langues - maintenant filtrée selon la recherche 
              <ScrollView style={styles.languageList}>
                {filteredLanguages.map((lang) => {
                  const langInfo = getLanguageInfo(lang.code);
                  return (
                    <TouchableOpacity 
                      key={lang.code}
                      style={styles.languageItem}
                      onPress={() => selectLanguage(lang.code)}
                    >
                      <View style={styles.languageItemContent}>
                        <Text style={styles.languageFlag}>{langInfo.flag}</Text>
                        <Text style={styles.languageName}>{lang.name}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Contenu principal 
        <ScrollView style={styles.scrollContainer}>
          {/* Sélection de langues (nouvelle interface) 
          <View style={styles.newLanguageContainer}>
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => {
                setSelectingSourceLang(true);
                setShowLanguageSelector(true);
              }}
            >
              <View style={styles.languageButtonContent}>
                <Text style={styles.languageFlag}>{getLanguageInfo(sourceLanguage).flag}</Text>
                <Text style={styles.languageButtonText}>{getLanguageInfo(sourceLanguage).name}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#310055" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.switchLanguageButton}
              onPress={() => {
                const temp = sourceLanguage;
                setSourceLanguage(targetLanguage);
                setTargetLanguage(temp);
              }}
            >
              <MaterialIcons name="swap-horiz" size={24} color="#8B2FC9" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => {
                setSelectingSourceLang(false);
                setShowLanguageSelector(true);
              }}
            >
              <View style={styles.languageButtonContent}>
                <Text style={styles.languageFlag}>{getLanguageInfo(targetLanguage).flag}</Text>
                <Text style={styles.languageButtonText}>{getLanguageInfo(targetLanguage).name}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#310055" />
            </TouchableOpacity>
          </View>
          
          {/* Zone de saisie de texte (affichée seulement si l'option "texte" est sélectionnée) 
          {selectedOption === 'text' && (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.modernTextInput}
                multiline
                placeholder={`${t('enterTextPlaceholder')} ${getLanguageInfo(sourceLanguage).name}...`}
                value={text}
                onChangeText={setText}
                editable={!selectedFile}
              />
            </View>
          )}
          
          {/* Boutons d'actions 
          <View style={styles.actionButtonsContainer}>
            {/* Afficher le bouton de fichier uniquement si l'option de fichier est sélectionnée 
            {selectedOption === 'file' && (
              <TouchableOpacity 
                style={styles.filePickButton} 
                onPress={pickDocument}
              >
                <AntDesign name="file1" size={20} color="#6818A5" />
                <Text style={styles.filePickButtonText}>
                  {selectedFile ? t('changeFile') : t('file')}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.translateActionButton,
                (selectedOption === 'text' && !text.trim()) || 
                (selectedOption === 'file' && !selectedFile) ? 
                styles.disabledActionButton : {}
              ]} 
              onPress={handleSubmit}
              disabled={isLoading || 
                (selectedOption === 'text' && !text.trim()) || 
                (selectedOption === 'file' && !selectedFile)}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialIcons name="translate" size={20} color="#FFF" />
                  <Text style={styles.translateActionButtonText}>{t('translate')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Affichage du nom du fichier sélectionné 
          {selectedFile && (
            <View style={styles.selectedFileContainer}>
              <View style={styles.fileInfoBox}>
                <AntDesign name="pdffile1" size={24} color="#FF3B30" style={styles.fileIcon} />
                <View style={styles.fileDetails}>
                  <Text style={styles.selectedFileText} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.fileTypeText}>
                    {selectedFile.mimeType || 'Document PDF'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.removeFileButton} 
                onPress={() => {
                  setSelectedFile(null);
                  setFileName(null);
                }}
              >
                <AntDesign name="close" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Résultat de la traduction 
          {showResultPanel && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>{t('translationResult')}</Text>
                <View style={styles.resultActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={copyToClipboard}
                  >
                    <Feather name="copy" size={18} color="#AB51E3" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={shareTranslation}
                  >
                    <Feather name="share-2" size={18} color="#AB51E3" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Texte original ou Nom du fichier 
              <View style={styles.originalTextContainer}>
                {fileName ? (
                  <>
                    <Text style={styles.originalTextLabel}>{t('translatedFile')}</Text>
                    <View style={styles.fileIndicator}>
                      <AntDesign name="file1" size={16} color="#555" style={styles.smallFileIcon} />
                      <Text style={styles.originalTextContent}>{fileName}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.originalTextLabel}>{t('originalText')}</Text>
                    <Text style={styles.originalTextContent}>{originalText}</Text>
                  </>
                )}
              </View>
              
              {/* Texte traduit 
              <View style={styles.translatedTextContainer}>
                <Text style={styles.translatedTextLabel}>{t('translationLabel')}</Text>
                <ScrollView 
                  style={styles.translatedTextScrollView}
                  contentContainerStyle={styles.translatedTextScrollViewContent}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  <Text 
                    style={styles.translatedTextContent}
                    selectable={true}
                  >
                    {translatedText || t('noTranslationAvailable')}
                  </Text>
                </ScrollView>
              </View>
              
              {/* Informations de traduction 
              <View style={styles.translationInfoContainer}>
                <Text style={styles.translationInfoText}>
                  {t('from')} {getLanguageInfo(sourceLanguage).name}
                  {' '} {t('to')} {' '}
                  {getLanguageInfo(targetLanguage).name}
                </Text>
              </View>
              
              {/* Bouton nouvelle traduction 
              <TouchableOpacity 
                style={styles.newTranslationButtonSmall}
                onPress={handleNewTranslation}
              >
                <AntDesign name="plus" size={18} color="#FFF" />
                <Text style={styles.newTranslationTextSmall}>{t('newTranslation')}</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Espace en bas pour le scroll 
          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};
// Styles pour le composant Traduction
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
   // Styles pour la page non connectée
notLoggedInContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
notLoggedInTitle: {
  fontSize: 24,
  fontWeight: '700',
  color: '#6818a5',
  marginTop: 15,
  marginBottom: 10,
},
notLoggedInMessage: {
  fontSize: 16,
  color: '#4F566B',
  textAlign: 'center',
  lineHeight: 22,
},
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 50,
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // Ajustement du bouton de menu - position plus haute
  menuButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 15,
    zIndex: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#5A108F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  // Ajustement du bouton retour - aligné avec le bouton de menu
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 15,
    zIndex: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  // Augmentation du padding top pour pousser le contenu plus bas
  scrollContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 100 : 80, // Augmenté de 70/40 à 100/80
    paddingHorizontal: 16,
  },
  // Styles pour la page d'accueil
  startContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  illustrationContainer: {
    width: '100%',
    height: 250,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  optionButton: {
    backgroundColor: '#8B2FC9', // Bleu comme dans l'image
    width: '100%',
    padding: 15,
    borderRadius: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedOptionButton: {
    backgroundColor: '#AB51E3', // Bleu plus foncé pour l'option sélectionnée
    borderWidth: 2,
    borderColor: '#310055',
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#AB51E3', // Bleu comme dans l'image
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
    width: '100%',
  },
  disabledContinueButton: {
    backgroundColor: '#310055', // Bleu clair pour le bouton désactivé
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
  // Nouveau style pour la sélection de langue
  newLanguageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 5,
    marginTop: 20, // Ajouté pour créer plus d'espace en haut
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageButtonText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  switchLanguageButton: {
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  // Style pour le modal de sélection de langue
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageModal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalBackButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 35,
    fontSize: 16,
  },
  searchIcon: {
    position: 'absolute',
    top: 19,
    left: 25,
  },
  languageList: {
    padding: 10,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  // Zone de saisie de texte modernisée - ajout d'une marge en haut
  textInputContainer: {
    marginBottom: 16,
    marginTop: 10, // Ajouté pour créer plus d'espace en haut
  },
  modernTextInput: {
    height: 150,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#AB51E3',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  // Nouveaux boutons d'action
  actionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filePickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    flex: 1,
  },
  filePickButtonText: {
    color: '#AB51E3',
    marginLeft: 8,
    fontWeight: '500',
  },
  translateActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3C0663',
    padding: 12,
    borderRadius: 12,
    flex: 2,
  },
  disabledActionButton: {
    backgroundColor: '#DC97FF',
  },
  translateActionButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  // Styles existants
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  fileInfoBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    marginRight: 10,
  },
  fileDetails: {
    flex: 1,
  },
  selectedFileText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  fileTypeText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  removeFileButton: {
    padding: 5,
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
    marginTop: 10, // Ajouté pour créer plus d'espace en haut
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
  },
  originalTextContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  originalTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  originalTextContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  translatedTextContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#AB51E3',
  },
  translatedTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AB51E3',
    marginBottom: 6,
  },
  translatedTextScrollView: {
    maxHeight: 300,
  },
  translatedTextScrollViewContent: {
    padding: 0,
    flexGrow: 1,
  },
  translatedTextContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    padding: 8,
  },
  translationInfoContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  translationInfoText: {
    fontSize: 13,
    color: '#888',
  },
  newTranslationButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6818A5',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  newTranslationTextSmall: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
  },
  bottomSpace: {
    height: 40,
  },
  smallFileIcon: {
    marginRight: 5,
  },
  fileIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Ajout d'une marge en haut pour le titre de la page de traduction (si nécessaire)
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',},
    header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    position: 'relative',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  headerTitle: {
    color: '#6818A5',
    fontSize: 22,
    fontWeight: 'bold'
  },
});

export default Traduction;*/}{/*
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Share,
  Modal,
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { AntDesign, MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import SidebarTraduction from '../components/SidebarTraduction';
import {
  useTraduction,
  useSidebar,
  useLanguages
} from '../hooks/TraductionHooks';
import * as DocumentPicker from 'expo-document-picker';
import { useLanguage } from './i18n';

// Page d'accueil avec les options
const StartPage = ({ onSelectOption, onContinue }) => {
  const { t } = useLanguage();
  const [selectedStartOption, setSelectedStartOption] = useState(null);

  const handleOptionSelect = (option) => {
    setSelectedStartOption(option);
    onSelectOption(option);
  };

  return (
    <View style={styles.startContainer}>
      <View style={styles.startContent}>
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../assets/translation-illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedStartOption === 'text' ? styles.selectedOptionButton : {}
          ]}
          onPress={() => handleOptionSelect('text')}
        >
          <Text style={styles.optionButtonText}>{t('textTranslation') || 'Traduction du texte'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedStartOption === 'file' ? styles.selectedOptionButton : {}
          ]}
          onPress={() => handleOptionSelect('file')}
        >
          <Text style={styles.optionButtonText}>{t('fileTranslation') || 'Traduction du fichier'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedStartOption ? styles.disabledContinueButton : {}
          ]}
          onPress={onContinue}
          disabled={!selectedStartOption}
        >
          <Text style={styles.continueButtonText}>{t('continueButton') || 'Continuer'}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Traduction = () => {
  const { t } = useLanguage();

  // État local
  const [text, setText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('fr');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectingSourceLang, setSelectingSourceLang] = useState(true);
  const [showStartPage, setShowStartPage] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Custom hooks
  const {
    translatedText,
    originalText,
    fileName,
    isLoading,
    translateText,
    translateFile,
    resetTranslation,
    setTranslatedText,
    setOriginalText,
    setFileName
  } = useTraduction();

  const {
    isSidebarOpen,
    toggleSidebar,
    histories,
    fetchHistories,
    selectHistory,
    isLoadingHistories,
    deleteTraduction
  } = useSidebar();

  const { availableLanguages } = useLanguages();

  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  useEffect(() => {
    if (translatedText || originalText) {
      setShowResultPanel(true);
      setShowStartPage(false);
    }
  }, [translatedText, originalText]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption) {
      setShowStartPage(false);
    } else {
      Alert.alert(t('attention') || 'Attention', t('selectOption') || 'Veuillez sélectionner une option');
    }
  };

  const handleSelectHistory = async (id) => {
    try {
      const historyItem = await selectHistory(id);
      if (historyItem) {
        setOriginalText(historyItem.contenu_original);
        setTranslatedText(historyItem.contenu_traduit);
        setFileName(historyItem.fichier_source || null);
        setSourceLanguage(historyItem.langue_source);
        setTargetLanguage(historyItem.langue_cible);
        setShowResultPanel(true);
        setText('');
        setSelectedFile(null);
        setShowStartPage(false);
      }
      return historyItem;
    } catch (error) {
      Alert.alert(t('error') || 'Erreur', t('cannotLoadTranslation') || 'Impossible de charger la traduction');
      return null;
    }
  };

  const handleDeleteTraduction = async (id) => {
    if (typeof deleteTraduction === 'function') {
      await deleteTraduction(id);
      await fetchHistories();
    } else {
      await fetchHistories();
    }
  };

  const handleBackToStart = () => {
    setShowStartPage(true);
    setSelectedOption(null);
    setShowResultPanel(false);
    resetTranslation();
    setText('');
    setSelectedFile(null);
    setFileName(null);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        copyToCacheDirectory: true
      });
      if (result.type === 'success' || (result.assets && result.assets.length > 0)) {
        const fileData = result.assets ? result.assets[0] : result;
        setSelectedFile(fileData);
        const fileName = fileData.name || fileData.fileName || 'document.pdf';
        setFileName(fileName);
        setText('');
        Alert.alert(
          t('fileSelected') || 'Fichier sélectionné',
          `${fileName} ${t('fileSelectedSuccess') || 'sélectionné avec succès'}`,
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      Alert.alert(t('error') || 'Erreur', t('cannotSelectFile') || 'Impossible de sélectionner le fichier');
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedFile) {
        const result = await translateFile(selectedFile, sourceLanguage, targetLanguage);
        if (result) setShowResultPanel(true);
      } else if (text.trim()) {
        const result = await translateText(text.trim(), sourceLanguage, targetLanguage);
        if (result) setShowResultPanel(true);
      } else {
        Alert.alert(t('attention') || 'Attention', t('enterText') || 'Veuillez saisir du texte');
        return;
      }
      fetchHistories();
    } catch (error) {
      Alert.alert(t('error') || 'Erreur', t('translationError') || 'Erreur lors de la traduction');
    }
  };

  const handleNewTranslation = () => {
    setText('');
    setSelectedFile(null);
    setFileName(null);
    resetTranslation();
    setShowResultPanel(false);
    setShowStartPage(true);
    setSelectedOption(null);
  };

  const shareTranslation = async () => {
    try {
      await Share.share({
        message: translatedText,
        title: t('translationSharing') || 'Partager la traduction'
      });
    } catch (error) {
      Alert.alert(t('error') || 'Erreur', t('shareFailed') || 'Impossible de partager');
    }
  };

  const copyToClipboard = () => {
    Alert.alert(t('copied') || 'Copié', t('copyTranslation') || 'Traduction copiée');
  };

  const selectLanguage = (langCode) => {
    if (selectingSourceLang) {
      setSourceLanguage(langCode);
      setSelectingSourceLang(false);
    } else {
      setTargetLanguage(langCode);
      setShowLanguageSelector(false);
    }
  };

  const getLanguageInfo = (langCode) => {
    const lang = availableLanguages.find(l => l.code === langCode);
    let flag = '';
    switch (langCode) {
      case 'en': flag = '🇬🇧'; break;
      case 'fr': flag = '🇫🇷'; break;
      case 'de': flag = '🇩🇪'; break;
      case 'es': flag = '🇪🇸'; break;
      case 'it': flag = '🇮🇹'; break;
      case 'ja': flag = '🇯🇵'; break;
      case 'ar': flag = '🇸🇦'; break;
      case 'zh': flag = '🇨🇳'; break;
      case 'pt': flag = '🇵🇹'; break;
      case 'nl': flag = '🇳🇱'; break;
      case 'ru': flag = '🇷🇺'; break;
      default: flag = '🌐';
    }
    return { name: lang?.name || langCode, flag };
  };

  const filteredLanguages = availableLanguages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showStartPage) {
    return (
      <StartPage
        onSelectOption={handleOptionSelect}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      {/* Header 
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={toggleSidebar}>
          <Ionicons name="menu" size={24} color="#DC97FF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{t('translation') || 'Traduction'}</Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToStart}>
          <Ionicons name="arrow-back" size={24} color="#6818A5" />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.mainContainer}>
          {/* Sidebar 
          {isSidebarOpen && (
            <View style={styles.overlay}>
              <TouchableOpacity
                style={styles.overlayTouchable}
                onPress={toggleSidebar}
              />
              <SidebarTraduction
                histories={histories}
                onSelectHistory={handleSelectHistory}
                onNewTranslation={handleNewTranslation}
                onClose={toggleSidebar}
                onDeleteHistory={handleDeleteTraduction}
              />
            </View>
          )}
          {/* Modal sélection langue 
          <Modal
            visible={showLanguageSelector}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowLanguageSelector(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.languageModal}>
                <View style={styles.modalHeader}>
                  {!selectingSourceLang && (
                    <TouchableOpacity
                      onPress={() => setSelectingSourceLang(true)}
                      style={styles.modalBackButton}
                    >
                      <Ionicons name="arrow-back" size={24} color="#310055" />
                    </TouchableOpacity>
                  )}
                  <Text style={styles.modalTitle}>
                    {selectingSourceLang ? (t('sourceLanguage') || 'Langue source') : (t('targetLanguage') || 'Langue cible')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowLanguageSelector(false)}
                    style={styles.closeButton}
                  >
                    <AntDesign name="close" size={24} color="#310055" />
                  </TouchableOpacity>
                </View>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder={t('searchLanguage') || 'Rechercher une langue'}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                  />
                  <AntDesign name="search1" size={20} color="#310055" style={styles.searchIcon} />
                </View>
                <ScrollView style={styles.languageList}>
                  {filteredLanguages.map((lang) => {
                    const langInfo = getLanguageInfo(lang.code);
                    return (
                      <TouchableOpacity
                        key={lang.code}
                        style={styles.languageItem}
                        onPress={() => selectLanguage(lang.code)}
                      >
                        <View style={styles.languageItemContent}>
                          <Text style={styles.languageFlag}>{langInfo.flag}</Text>
                          <Text style={styles.languageName}>{lang.name}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </Modal>
          {/* Contenu principal 
          <ScrollView style={styles.scrollContainer}>
            {/* Sélection de langues 
            <View style={styles.newLanguageContainer}>
              <TouchableOpacity
                style={styles.languageButton}
                onPress={() => {
                  setSelectingSourceLang(true);
                  setShowLanguageSelector(true);
                }}
              >
                <View style={styles.languageButtonContent}>
                  <Text style={styles.languageFlag}>{getLanguageInfo(sourceLanguage).flag}</Text>
                  <Text style={styles.languageButtonText}>{getLanguageInfo(sourceLanguage).name}</Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#310055" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.switchLanguageButton}
                onPress={() => {
                  const temp = sourceLanguage;
                  setSourceLanguage(targetLanguage);
                  setTargetLanguage(temp);
                }}
              >
                <MaterialIcons name="swap-horiz" size={24} color="#8B2FC9" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.languageButton}
                onPress={() => {
                  setSelectingSourceLang(false);
                  setShowLanguageSelector(true);
                }}
              >
                <View style={styles.languageButtonContent}>
                  <Text style={styles.languageFlag}>{getLanguageInfo(targetLanguage).flag}</Text>
                  <Text style={styles.languageButtonText}>{getLanguageInfo(targetLanguage).name}</Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#310055" />
              </TouchableOpacity>
            </View>
            {/* Zone de saisie de texte 
            {selectedOption === 'text' && (
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.modernTextInput}
                  multiline
                  placeholder={`${t('enterTextPlaceholder') || 'Saisissez votre texte en'} ${getLanguageInfo(sourceLanguage).name}...`}
                  value={text}
                  onChangeText={setText}
                  editable={!selectedFile}
                />
              </View>
            )}
            {/* Boutons d'actions 
            <View style={styles.actionButtonsContainer}>
              {selectedOption === 'file' && (
                <TouchableOpacity
                  style={styles.filePickButton}
                  onPress={pickDocument}
                >
                  <AntDesign name="file1" size={20} color="#6818A5" />
                  <Text style={styles.filePickButtonText}>
                    {selectedFile ? (t('changeFile') || 'Changer de fichier') : (t('file') || 'Fichier')}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.translateActionButton,
                  (selectedOption === 'text' && !text.trim()) ||
                  (selectedOption === 'file' && !selectedFile)
                    ? styles.disabledActionButton
                    : {}
                ]}
                onPress={handleSubmit}
                disabled={
                  isLoading ||
                  (selectedOption === 'text' && !text.trim()) ||
                  (selectedOption === 'file' && !selectedFile)
                }
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="translate" size={20} color="#FFF" />
                    <Text style={styles.translateActionButtonText}>{t('translate') || 'Traduire'}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            {/* Affichage du fichier sélectionné 
            {selectedFile && (
              <View style={styles.selectedFileContainer}>
                <View style={styles.fileInfoBox}>
                  <AntDesign name="pdffile1" size={24} color="#FF3B30" style={styles.fileIcon} />
                  <View style={styles.fileDetails}>
                    <Text style={styles.selectedFileText} numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                    <Text style={styles.fileTypeText}>
                      {selectedFile.mimeType || 'Document PDF'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeFileButton}
                  onPress={() => {
                    setSelectedFile(null);
                    setFileName(null);
                  }}
                >
                  <AntDesign name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            )}
            {/* Résultat de la traduction 
            {showResultPanel && (
              <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>{t('translationResult') || 'Résultat de la traduction'}</Text>
                  <View style={styles.resultActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={copyToClipboard}
                    >
                      <Feather name="copy" size={18} color="#AB51E3" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={shareTranslation}
                    >
                      <Feather name="share-2" size={18} color="#AB51E3" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.originalTextContainer}>
                  {fileName ? (
                    <>
                      <Text style={styles.originalTextLabel}>{t('translatedFile') || 'Fichier traduit'}</Text>
                      <View style={styles.fileIndicator}>
                        <AntDesign name="file1" size={16} color="#555" style={styles.smallFileIcon} />
                        <Text style={styles.originalTextContent}>{fileName}</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.originalTextLabel}>{t('originalText') || 'Texte original'}</Text>
                      <Text style={styles.originalTextContent}>{originalText}</Text>
                    </>
                  )}
                </View>
                <View style={styles.translatedTextContainer}>
                  <Text style={styles.translatedTextLabel}>{t('translationLabel') || 'Traduction'}</Text>
                  <ScrollView
                    style={styles.translatedTextScrollView}
                    contentContainerStyle={styles.translatedTextScrollViewContent}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    <Text
                      style={styles.translatedTextContent}
                      selectable={true}
                    >
                      {translatedText || (t('noTranslationAvailable') || 'Aucune traduction disponible')}
                    </Text>
                  </ScrollView>
                </View>
                <View style={styles.translationInfoContainer}>
                  <Text style={styles.translationInfoText}>
                    {t('from') || 'De'} {getLanguageInfo(sourceLanguage).name}
                    {' '} {t('to') || 'vers'} {' '}
                    {getLanguageInfo(targetLanguage).name}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.newTranslationButtonSmall}
                  onPress={handleNewTranslation}
                >
                  <AntDesign name="plus" size={18} color="#FFF" />
                  <Text style={styles.newTranslationTextSmall}>{t('newTranslation') || 'Nouvelle traduction'}</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.bottomSpace} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
// Styles pour le composant Traduction
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
   // Styles pour la page non connectée
notLoggedInContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
notLoggedInTitle: {
  fontSize: 24,
  fontWeight: '700',
  color: '#6818a5',
  marginTop: 15,
  marginBottom: 10,
},
notLoggedInMessage: {
  fontSize: 16,
  color: '#4F566B',
  textAlign: 'center',
  lineHeight: 22,
},
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 50,
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // Ajustement du bouton de menu - position plus haute
  menuButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 15,
    zIndex: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#5A108F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  // Ajustement du bouton retour - aligné avec le bouton de menu
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 15,
    zIndex: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  // Augmentation du padding top pour pousser le contenu plus bas
  scrollContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 100 : 80, // Augmenté de 70/40 à 100/80
    paddingHorizontal: 16,
  },
  // Styles pour la page d'accueil
  startContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  illustrationContainer: {
    width: '100%',
    height: 250,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  optionButton: {
    backgroundColor: '#8B2FC9', // Bleu comme dans l'image
    width: '100%',
    padding: 15,
    borderRadius: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedOptionButton: {
    backgroundColor: '#AB51E3', // Bleu plus foncé pour l'option sélectionnée
    borderWidth: 2,
    borderColor: '#310055',
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#AB51E3', // Bleu comme dans l'image
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
    width: '100%',
  },
  disabledContinueButton: {
    backgroundColor: '#310055', // Bleu clair pour le bouton désactivé
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
  // Nouveau style pour la sélection de langue
  newLanguageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 5,
    marginTop: 20, // Ajouté pour créer plus d'espace en haut
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageButtonText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  switchLanguageButton: {
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  // Style pour le modal de sélection de langue
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageModal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalBackButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 35,
    fontSize: 16,
  },
  searchIcon: {
    position: 'absolute',
    top: 19,
    left: 25,
  },
  languageList: {
    padding: 10,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  // Zone de saisie de texte modernisée - ajout d'une marge en haut
  textInputContainer: {
    marginBottom: 16,
    marginTop: 10, // Ajouté pour créer plus d'espace en haut
  },
  modernTextInput: {
    height: 150,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#AB51E3',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  // Nouveaux boutons d'action
  actionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filePickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    flex: 1,
  },
  filePickButtonText: {
    color: '#AB51E3',
    marginLeft: 8,
    fontWeight: '500',
  },
  translateActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3C0663',
    padding: 12,
    borderRadius: 12,
    flex: 2,
  },
  disabledActionButton: {
    backgroundColor: '#DC97FF',
  },
  translateActionButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  // Styles existants
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  fileInfoBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    marginRight: 10,
  },
  fileDetails: {
    flex: 1,
  },
  selectedFileText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  fileTypeText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  removeFileButton: {
    padding: 5,
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
    marginTop: 10, // Ajouté pour créer plus d'espace en haut
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
  },
  originalTextContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  originalTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  originalTextContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  translatedTextContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#AB51E3',
  },
  translatedTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AB51E3',
    marginBottom: 6,
  },
  translatedTextScrollView: {
    maxHeight: 300,
  },
  translatedTextScrollViewContent: {
    padding: 0,
    flexGrow: 1,
  },
  translatedTextContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    padding: 8,
  },
  translationInfoContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  translationInfoText: {
    fontSize: 13,
    color: '#888',
  },
  newTranslationButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6818A5',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  newTranslationTextSmall: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
  },
  bottomSpace: {
    height: 40,
  },
  smallFileIcon: {
    marginRight: 5,
  },
  fileIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Ajout d'une marge en haut pour le titre de la page de traduction (si nécessaire)
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',},
    // Header styles - Updated
   header: {
  backgroundColor: 'white', // Changé de 'white' à '#6818A5'
  paddingVertical: 15,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between', // Changé de 'center' à 'space-between'
  paddingHorizontal: 15,
  paddingTop: Platform.OS === 'ios' ? 60 : 20,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
  elevation: 5,
},

headerTitle: {
  color: '#6818A5', // Changé de '#6818A5' à '#FFFFFF'
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center'
},

headerButton: {
  padding: 8,
  borderRadius: 8,
  backgroundColor: '#5A108F',
   // Changé pour plus de visibilité
},

headerTitleContainer: {
  position: 'absolute',
  left: 60, // Position pour centrer entre les boutons
  right: 60,
  alignItems: 'center',
},
});

export default Traduction;*/}
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Share,
  Modal,
  Image
} from 'react-native';
import { AntDesign, MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import SidebarTraduction from '../components/SidebarTraduction';
import { 
  useTraduction, 
  useSidebar, 
  useLanguages 
} from '../hooks/TraductionHooks';
import * as DocumentPicker from 'expo-document-picker';
import { useLanguage } from './i18n';
import { useAuth } from '../contexts/AuthContext'; 

// Page d'accueil avec les options comme dans l'image
const StartPage = ({ onSelectOption, onContinue }) => {
  const { t } = useLanguage();
  const { isLoggedIn, user, logout } = useAuth(); // ✅ AJOUTER ICI

  // Ajout d'un état pour suivre l'option sélectionnée
  const [selectedStartOption, setSelectedStartOption] = useState(null);
 // Vérification d'authentification
 if (!isLoggedIn) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.notLoggedInContainer}>
        <Ionicons name="lock-closed" size={50} color="#6818a5" />
        <Text style={styles.notLoggedInTitle}>{t('accessDeniedTitle')}</Text>
        <Text style={styles.notLoggedInMessage}>
          {t('accessDeniedMessage')}
        </Text>
      </View>
    </SafeAreaView>
  );
}
  // Fonction pour gérer la sélection d'option
  const handleOptionSelect = (option) => {
    setSelectedStartOption(option);
    onSelectOption(option);
  };

  return (
    <View style={styles.startContainer}>
      <View style={styles.startContent}>
        {/* Illustration supérieure */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={require('../assets/translation-illustration.png')} 
            style={styles.illustration} 
            resizeMode="contain"
          />
        </View>
        
        {/* Boutons d'options */}
        <TouchableOpacity 
          style={[
            styles.optionButton,
            selectedStartOption === 'text' ? styles.selectedOptionButton : {}
          ]} 
          onPress={() => handleOptionSelect('text')}
        >
          <Text style={styles.optionButtonText}>{t('textTranslation')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.optionButton,
            selectedStartOption === 'file' ? styles.selectedOptionButton : {}
          ]} 
          onPress={() => handleOptionSelect('file')}
        >
          <Text style={styles.optionButtonText}>{t('fileTranslation')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedStartOption ? styles.disabledContinueButton : {}
          ]} 
          onPress={() => onContinue(selectedStartOption)}
          disabled={!selectedStartOption}
        >
          <Text style={styles.continueButtonText}>{t('continueButton')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Traduction = () => {
  
  const { t } = useLanguage();
  
  // État local
  const [text, setText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('fr');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectingSourceLang, setSelectingSourceLang] = useState(true);
  const [showStartPage, setShowStartPage] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom hooks
  const { 
    translatedText, 
    originalText,
    fileName,
    isLoading, 
    translateText,
    translateFile,
    resetTranslation,
    setTranslatedText,
    setOriginalText,
    setFileName
  } = useTraduction();
  
  const { 
    isSidebarOpen, 
    toggleSidebar,
    histories,
    fetchHistories,
    selectHistory,
    isLoadingHistories,
    deleteTraduction
  } = useSidebar();
  
  
  const { availableLanguages } = useLanguages();
  const { user } = useAuth();

  

  // Charger l'historique au montage du composant
  useEffect(() => {
  // Ne pas utiliser user.id directement
  const getStudentId = async () => {
    try {
      let studentId = await AsyncStorage.getItem('etudiantId');
      
      if (!studentId && user) {
        studentId = user.id || user.etudiant_id || user.userId || user.studentId;
        if (studentId) {
          await AsyncStorage.setItem('etudiantId', studentId.toString());
        }
      }
      
      if (studentId) {
        console.log('Chargement de l\'historique pour l\'étudiant:', studentId);
        fetchHistories(studentId.toString());
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ID étudiant:', error);
    }
  };
  
  getStudentId();
}, [fetchHistories, user]);

  // Afficher le panneau de résultat quand une traduction est disponible
  useEffect(() => {
    if (translatedText || originalText) {
      setShowResultPanel(true);
    }
  }, [translatedText, originalText]);

  // Gestion de la sélection d'option sur la page d'accueil
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  // Continuer directement vers la page principale
  const handleContinue = () => {
    // Vérifier si une option a été sélectionnée
    if (selectedOption) {
      setShowStartPage(false);
    } else {
      // Si aucune option n'est sélectionnée, ne rien faire
      Alert.alert(t('attention'), t('selectOption'));
    }
  };
  
// Keep only this implementation of selectHistory directly
const handleSelectHistory = async (id) => {
  if (!user?.id) {
    Alert.alert('Erreur', 'Aucun ID étudiant trouvé');
    return null;
  }
  try {
    const historyItem = await selectHistory(id, user.id);
    
    if (historyItem) {
      // Mettre à jour les états avec les informations récupérées
      setOriginalText(historyItem.contenu_original);
      setTranslatedText(historyItem.contenu_traduit);
      setFileName(historyItem.fichier_source || null);
      
      // Mettre à jour les langues sélectionnées
      setSourceLanguage(historyItem.langue_source);
      setTargetLanguage(historyItem.langue_cible);
      
      // Afficher le panneau de résultat
      setShowResultPanel(true);
      
      // Réinitialiser le texte saisi et le fichier sélectionné
      setText('');
      setSelectedFile(null);
      
      // Quitter la page d'accueil si on y est
      setShowStartPage(false);
    }
    
    return historyItem;
  } catch (error) {
    console.error('Erreur lors de la sélection de l\'historique:', error);
    Alert.alert(t('error'), t('cannotLoadTranslation'));
    return null;
  }
};
  
  // 3. Dans le composant Traduction.js, assurez-vous que la logique d'affichage est correcte
  // Modifier useEffect pour s'assurer que le panneau de résultat s'affiche correctement
  useEffect(() => {
    if (translatedText || originalText) {
      setShowResultPanel(true);
      // Assurez-vous de quitter la page d'accueil si nécessaire
      setShowStartPage(false);
    }
  }, [translatedText, originalText]);
  const handleDeleteTraduction = async (id) => {
    if (typeof deleteTraduction === 'function') {
      await deleteTraduction(id);
      await fetchHistories();
    } else {
      // Si deleteTraduction n'est pas défini, ignorer
      await fetchHistories();
    }
  };

  // Retourner à la page d'accueil
  const handleBackToStart = () => {
    setShowStartPage(true);
    setSelectedOption(null);
  };

  // Sélectionner un fichier
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword', 
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true
      });
      
      // Vérifier que le document a été sélectionné avec succès
      if (result.type === 'success' || (result.assets && result.assets.length > 0)) {
        // Adapter pour gérer à la fois l'ancien format et le nouveau format de DocumentPicker
        const fileData = result.assets ? result.assets[0] : result;
        
        // Mettre à jour l'état avec le fichier sélectionné
        setSelectedFile(fileData);
        
        // Stocker explicitement le nom du fichier
        const fileName = fileData.name || fileData.fileName || 'document.pdf';
        setFileName(fileName);
        
        // Réinitialiser le texte si un fichier est sélectionné
        setText('');
        
        // Afficher un message de confirmation
        Alert.alert(
          t('fileSelected'),
          `${fileName} ${t('fileSelectedSuccess')}`,
          [{ text: t('ok') }]
        );
        
        console.log('Fichier sélectionné:', fileData);
      } else if (result.canceled) {
        console.log('Sélection de fichier annulée');
      }
    } catch (err) {
      console.error('Erreur lors de la sélection du fichier:', err);
      Alert.alert(t('error'), t('cannotSelectFile'));
    }
  };

  // Modifiez la fonction handleSubmit pour s'assurer que le résultat s'affiche
const handleSubmit = async () => {
  if (!user?.id) {
    Alert.alert('Erreur', 'Aucun ID étudiant trouvé');
    return;
  }
  try {
    if (selectedFile) {
      console.log('Tentative de traduction du fichier:', selectedFile);
      const result = await translateFile(selectedFile, sourceLanguage, targetLanguage, user.id);
      
      if (result) {
        console.log('Traduction réussie:', result);
        setShowResultPanel(true);
      }
    } else if (text.trim()) {
      console.log('Tentative de traduction du texte:', text.trim());
      const result = await translateText(text.trim(), sourceLanguage, targetLanguage, user.id);
      
      if (result) {
        console.log('Traduction réussie:', result);
        setShowResultPanel(true);
      }
    } else {
      Alert.alert(t('attention'), t('enterText'));
      return;
    }
    
    fetchHistories(user.id);
  } catch (error) {
    console.error('Erreur détaillée lors de la traduction:', error);
    
    // Gestion spécifique des erreurs
    if (error.response) {
      // Erreur avec réponse du serveur
      switch (error.response.status) {
        case 500:
          Alert.alert(
            t('error'),
            t('serverError') || 'Une erreur est survenue sur le serveur. Veuillez réessayer plus tard.'
          );
          break;
        case 401:
          Alert.alert(
            t('error'),
            t('unauthorized') || 'Votre session a expiré. Veuillez vous reconnecter.'
          );
          break;
        default:
          Alert.alert(
            t('error'),
            t('translationError') || 'Une erreur est survenue lors de la traduction.'
          );
      }
    } else if (error.request) {
      // Erreur de connexion
      Alert.alert(
        t('error'),
        t('connectionError') || 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
      );
    } else {
      // Autre type d'erreur
      Alert.alert(
        t('error'),
        t('translationError') || 'Une erreur est survenue lors de la traduction.'
      );
    }
  }
};
  // Nouvelle traduction
  const handleNewTranslation = () => {
    setText('');
    setSelectedFile(null);
    setFileName(null);
    resetTranslation();
    setShowResultPanel(false);
    setShowStartPage(true); // Retour à la page d'accueil
    setSelectedOption(null); // Réinitialiser l'option sélectionnée
  };

  // Partager la traduction
  const shareTranslation = async () => {
    try {
      await Share.share({
        message: translatedText,
        title: t('translationSharing')
      });
    } catch (error) {
      Alert.alert(t('error'), t('shareFailed'));
    }
  };

  // Copier la traduction dans le presse-papier
  const copyToClipboard = () => {
    Alert.alert(t('copied'), t('copyTranslation'));
  };

  // Sélectionner une langue
  const selectLanguage = (langCode) => {
    if (selectingSourceLang) {
      setSourceLanguage(langCode);
      setSelectingSourceLang(false);
    } else {
      setTargetLanguage(langCode);
      setShowLanguageSelector(false);
    }
  };

  // Obtenir le nom et le drapeau d'une langue
  const getLanguageInfo = (langCode) => {
    const lang = availableLanguages.find(l => l.code === langCode);
    let flag = '';
    
    // Ajout des drapeaux manquants
    switch(langCode) {
      case 'en': flag = '🇬🇧'; break;
      case 'fr': flag = '🇫🇷'; break;
      case 'de': flag = '🇩🇪'; break;
      case 'es': flag = '🇪🇸'; break;
      case 'it': flag = '🇮🇹'; break;
      case 'ja': flag = '🇯🇵'; break;
      case 'ar': flag = '🇸🇦'; break; // Arabe (Arabie Saoudite)
      case 'zh': flag = '🇨🇳'; break; // Chinois (Chine)
      case 'pt': flag = '🇵🇹'; break; // Portugais (Portugal)
      case 'nl': flag = '🇳🇱'; break; // Néerlandais (Pays-Bas)
      case 'ru': flag = '🇷🇺'; break; // Russe (Russie)
      default: flag = '🌐';
    }
    
    return { name: lang?.name || langCode, flag };
  };

  // Filtrer les langues selon le terme de recherche
  const filteredLanguages = availableLanguages.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Si la page d'accueil est affichée
  if (showStartPage) {
    return (
      <StartPage 
        onSelectOption={handleOptionSelect}
        onContinue={handleContinue} 
      />
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
          <Ionicons name="menu" size={24} color="#6818A5" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{t('translation')}</Text>
        </View>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackToStart}
        >
          <Ionicons name="arrow-back" size={24} color="#5A108F" />
        </TouchableOpacity>
      </View>
      <View style={styles.mainContainer}>
        {/* Sidebar (visible conditionnellement) */}
        {isSidebarOpen && (
          <View style={styles.overlay}>
            <TouchableOpacity 
              style={styles.overlayTouchable} 
              onPress={toggleSidebar}
            />
            <SidebarTraduction 
              histories={histories}
              onSelectHistory={handleSelectHistory}  // Utilisez votre fonction handleSelectHistory au lieu de selectHistory
              onNewTranslation={handleNewTranslation}
              onClose={toggleSidebar}
              onDeleteHistory={handleDeleteTraduction}
            />
          </View>
        )}

        {/* Modal pour la sélection de langue */}
        <Modal
          visible={showLanguageSelector}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowLanguageSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.languageModal}>
              <View style={styles.modalHeader}>
                {!selectingSourceLang && (
                  <TouchableOpacity 
                    onPress={() => setSelectingSourceLang(true)}
                    style={styles.modalBackButton}
                  >
                    <Ionicons name="arrow-back" size={24} color="#310055" />
                  </TouchableOpacity>
                )}
                <Text style={styles.modalTitle}>
                   {selectingSourceLang ? t('sourceLanguage') : t('targetLanguage')}
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowLanguageSelector(false)}
                  style={styles.closeButton}
                >
                  <AntDesign name="close" size={24} color="#310055" />
                </TouchableOpacity>
              </View>
              
              {/* Barre de recherche - corrigée pour fonctionner */}
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('searchLanguage')}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
                <AntDesign name="search1" size={20} color="#310055" style={styles.searchIcon} />
              </View>
              
              {/* Liste des langues - maintenant filtrée selon la recherche */}
              <ScrollView style={styles.languageList}>
                {filteredLanguages.map((lang) => {
                  const langInfo = getLanguageInfo(lang.code);
                  return (
                    <TouchableOpacity 
                      key={lang.code}
                      style={styles.languageItem}
                      onPress={() => selectLanguage(lang.code)}
                    >
                      <View style={styles.languageItemContent}>
                        <Text style={styles.languageFlag}>{langInfo.flag}</Text>
                        <Text style={styles.languageName}>{lang.name}</Text>
                      </View>
                      {/*<Ionicons name="volume-medium" size={22} color="#007BFF" />*/}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Contenu principal */}
        <ScrollView style={styles.scrollContainer}>
          {/* Sélection de langues (nouvelle interface) */}
          <View style={styles.newLanguageContainer}>
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => {
                setSelectingSourceLang(true);
                setShowLanguageSelector(true);
              }}
            >
              <View style={styles.languageButtonContent}>
                <Text style={styles.languageFlag}>{getLanguageInfo(sourceLanguage).flag}</Text>
                <Text style={styles.languageButtonText}>{getLanguageInfo(sourceLanguage).name}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#310055" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.switchLanguageButton}
              onPress={() => {
                const temp = sourceLanguage;
                setSourceLanguage(targetLanguage);
                setTargetLanguage(temp);
              }}
            >
              <MaterialIcons name="swap-horiz" size={24} color="#8B2FC9" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => {
                setSelectingSourceLang(false);
                setShowLanguageSelector(true);
              }}
            >
              <View style={styles.languageButtonContent}>
                <Text style={styles.languageFlag}>{getLanguageInfo(targetLanguage).flag}</Text>
                <Text style={styles.languageButtonText}>{getLanguageInfo(targetLanguage).name}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#310055" />
            </TouchableOpacity>
          </View>
          
          {/* Zone de saisie de texte (affichée seulement si l'option "texte" est sélectionnée) */}
          {selectedOption === 'text' && (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.modernTextInput}
                multiline
                placeholder={`${t('enterTextPlaceholder')} ${getLanguageInfo(sourceLanguage).name}...`}
                value={text}
                onChangeText={setText}
                editable={!selectedFile}
              />
            </View>
          )}
          
          {/* Boutons d'actions */}
          <View style={styles.actionButtonsContainer}>
            {/* Afficher le bouton de fichier uniquement si l'option de fichier est sélectionnée */}
            {selectedOption === 'file' && (
              <TouchableOpacity 
                style={styles.filePickButton} 
                onPress={pickDocument}
              >
                <AntDesign name="file1" size={20} color="#6818A5" />
                <Text style={styles.filePickButtonText}>
                  {selectedFile ? t('change') : t('file')}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.translateActionButton,
                (selectedOption === 'text' && !text.trim()) || 
                (selectedOption === 'file' && !selectedFile) ? 
                styles.disabledActionButton : {}
              ]} 
              onPress={handleSubmit}
              disabled={isLoading || 
                (selectedOption === 'text' && !text.trim()) || 
                (selectedOption === 'file' && !selectedFile)}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialIcons name="translate" size={20} color="#FFF" />
                  <Text style={styles.translateActionButtonText}>{t('translate')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Affichage du nom du fichier sélectionné */}
          {selectedFile && (
            <View style={styles.selectedFileContainer}>
              <View style={styles.fileInfoBox}>
                <AntDesign name="pdffile1" size={24} color="#FF3B30" style={styles.fileIcon} />
                <View style={styles.fileDetails}>
                  <Text style={styles.selectedFileText} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.fileTypeText}>
                    {selectedFile.mimeType || 'Document PDF'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.removeFileButton} 
                onPress={() => {
                  setSelectedFile(null);
                  setFileName(null);
                }}
              >
                <AntDesign name="close" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Résultat de la traduction */}
          {showResultPanel && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>{t('translationResult')}</Text>
                <View style={styles.resultActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={copyToClipboard}
                  >
                    <Feather name="copy" size={18} color="#AB51E3" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={shareTranslation}
                  >
                    <Feather name="share-2" size={18} color="#AB51E3" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Texte original ou Nom du fichier */}
              <View style={styles.originalTextContainer}>
                {fileName ? (
                  <>
                    <Text style={styles.originalTextLabel}>{t('translatedFile')}:</Text>
                    <View style={styles.fileIndicator}>
                      <AntDesign name="file1" size={16} color="#555" style={styles.smallFileIcon} />
                      <Text style={styles.originalTextContent}>{fileName}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.originalTextLabel}>{t('originalText')}:</Text>
                    <Text style={styles.originalTextContent}>{originalText}</Text>
                  </>
                )}
              </View>
              
              {/* Texte traduit */}
              <View style={styles.translatedTextContainer}>
                <Text style={styles.translatedTextLabel}>{t('translation')}:</Text>
                <ScrollView 
                  style={styles.translatedTextScrollView}
                  contentContainerStyle={styles.translatedTextScrollViewContent}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  <Text 
                    style={styles.translatedTextContent}
                    selectable={true}
                  >
                    {translatedText || t('noTranslationAvailable')}
                  </Text>
                </ScrollView>
              </View>
              {/* Informations de traduction */}
              <View style={styles.translationInfoContainer}>
                <Text style={styles.translationInfoText}>
                  De {getLanguageInfo(sourceLanguage).name}
                  {' '} à {' '}
                  {getLanguageInfo(targetLanguage).name}
                </Text>
              </View>
              
              {/* Bouton nouvelle traduction */}
              <TouchableOpacity 
                style={styles.newTranslationButtonSmall}
                onPress={handleNewTranslation}
              >
                <AntDesign name="plus" size={18} color="#FFF" />
                <Text style={styles.newTranslationTextSmall}>{t('newTranslation')}</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Espace en bas pour le scroll */}
          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

// Styles pour le composant Traduction
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 50,
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  menuButton: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
    zIndex: 1,
    top: 5,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    right: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
  },
  startContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  illustrationContainer: {
    width: '100%',
    height: 250,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  optionButton: {
    backgroundColor: '#8B2FC9',
    width: '100%',
    padding: 15,
    borderRadius: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedOptionButton: {
    backgroundColor: '#AB51E3',
    borderWidth: 2,
    borderColor: '#310055',
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#AB51E3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
    width: '100%',
  },
  disabledContinueButton: {
    backgroundColor: '#310055',
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
  newLanguageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 5,
    marginTop: 20,
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageButtonText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  switchLanguageButton: {
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageModal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalBackButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 35,
    fontSize: 16,
  },
  searchIcon: {
    position: 'absolute',
    top: 19,
    left: 25,
  },
  languageList: {
    padding: 10,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  textInputContainer: {
    marginBottom: 16,
    marginTop: 10,
  },
  modernTextInput: {
    height: 150,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#AB51E3',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filePickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    flex: 1,
  },
  filePickButtonText: {
    color: '#AB51E3',
    marginLeft: 8,
    fontWeight: '500',
  },
  translateActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3C0663',
    padding: 12,
    borderRadius: 12,
    flex: 2,
  },
  disabledActionButton: {
    backgroundColor: '#DC97FF',
  },
  translateActionButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  fileInfoBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    marginRight: 10,
  },
  fileDetails: {
    flex: 1,
  },
  selectedFileText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  fileTypeText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  removeFileButton: {
    padding: 5,
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
    marginTop: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
  },
  originalTextContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  originalTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  originalTextContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  translatedTextContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#AB51E3',
  },
  translatedTextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AB51E3',
    marginBottom: 6,
  },
  translatedTextScrollView: {
    maxHeight: 300,
  },
  translatedTextScrollViewContent: {
    padding: 0,
    flexGrow: 1,
  },
  translatedTextContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    padding: 8,
  },
  translationInfoContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  translationInfoText: {
    fontSize: 13,
    color: '#888',
  },
  newTranslationButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6818A5',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  newTranslationTextSmall: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
  },
  bottomSpace: {
    height: 40,
  },
  smallFileIcon: {
    marginRight: 5,
  },
  fileIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    position: 'relative',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  headerTitle: {
    color: '#6818A5',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Traduction;

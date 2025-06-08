{/*import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import SidebarResume from '../components/SidebarResume';
import { useSidebarResume } from '../hooks/useSidebarResume';

const Resume = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [length, setLength] = useState('medium');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Hook d'historique API
  const {
    savedResumes,
    isLoadingResumes,
    fetchResumes,
    addResumeToHistory,
    deleteResumeFromHistory,
    selectResume,
    etudiantId
  } = useSidebarResume();

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Le texte ne peut pas être vide');
      return;
    }
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const response = await axios.post(
        'http://192.168.1.7:5000/api/resume',
        {
          text: text.trim(),
          length: length,
          etudiant_id: etudiantId
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.summary) {
        setSummary(response.data.summary);
        // Ajouter à l'historique via l'API
        await addResumeToHistory({
          id: Date.now() + Math.floor(Math.random() * 10000),
          original_text: text.trim(),
          summary: response.data.summary,
          created_at: new Date().toISOString(),
          length
        });
      } else {
        setError('La réponse du serveur ne contient pas de résumé');
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Erreur lors de la requête';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPdf = async () => {
    setError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) {
        setError('Sélection du fichier annulée.');
        setSelectedFile(null);
        return;
      }
      if (!result.assets || !result.assets[0]) {
        setError('Le fichier sélectionné est invalide.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(result.assets[0]);
      setError('');
    } catch (err) {
      setError("Erreur lors de la sélection du fichier PDF.");
      setSelectedFile(null);
    }
  };

  const handlePdfSummary = async () => {
    if (!selectedFile) {
      setError('Veuillez d\'abord sélectionner un fichier PDF.');
      return;
    }
    setError('');
    setSummary('');
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: 'application/pdf',
        name: selectedFile.name
      });
      formData.append('length', length);
      formData.append('etudiant_id', etudiantId.toString());
      console.log('Sending etudiant_id:', etudiantId.toString());
      setLoading(true);
      const serverResponse = await axios.post('http://192.168.1.7:5000/api/resume/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        transformRequest: (data, headers) => {
          console.log('Sending data:', data);
          return data;
        },
      });
      if (serverResponse.data && serverResponse.data.summary) {
        setSummary(serverResponse.data.summary);
        // Ajouter à l'historique via l'API
        await addResumeToHistory({
          id: Date.now() + Math.floor(Math.random() * 10000),
          original_text: `PDF: ${selectedFile.name}`,
          summary: serverResponse.data.summary,
          created_at: new Date().toISOString(),
          length
        });
      } else {
        setError("La réponse du serveur ne contient pas de résumé");
      }
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.response?.data?.error || "Erreur lors du résumé PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = (id) => {
    const resume = selectResume(id);
    if (resume) {
      setText(resume.original_text.startsWith('PDF: ') ? '' : resume.original_text);
      setSummary(resume.summary);
      setError('');
    }
    setIsSidebarOpen(false);
  };

  const handleDeleteResume = async (id) => {
    await deleteResumeFromHistory(id);
    fetchResumes();
  };

  // Fonction pour réinitialiser le formulaire de résumé
  const handleNewResume = () => {
    setText('');
    setSummary('');
    setSelectedFile(null);
    setError('');
  };

  return (
    <View style={styles.container}>
      {/* Bouton pour ouvrir la sidebar 
      <TouchableOpacity 
        style={styles.historyButton} 
        onPress={() => setIsSidebarOpen(true)}
      >
        <Ionicons name="menu" size={24} color="#0891b2" />
      </TouchableOpacity>

      {/* Sidebar 
      {isSidebarOpen && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.overlayTouchable} 
            onPress={() => setIsSidebarOpen(false)}
          />
          <SidebarResume
            savedResumes={savedResumes}
            isLoadingResumes={isLoadingResumes}
            onSelectResume={handleSelectResume}
            onDeleteResume={handleDeleteResume}
            isVisible={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onNewResume={handleNewResume}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.mainTitle}>Générateur de Résumés</Text>
        
        <View style={styles.lengthSelector}>
          <Text style={styles.lengthLabel}>Longueur du résumé:</Text>
          <View style={styles.radioGroup}>
            {['short', 'medium', 'long'].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.radioButton, length === val && styles.radioButtonSelected]}
                onPress={() => setLength(val)}
              >
                <Text style={[styles.radioText, length === val && styles.radioTextSelected]}>
                  {val === 'short' ? 'Court' : val === 'medium' ? 'Moyen' : 'Long'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bloc Résumer un texte 
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumer un texte</Text>
          <Text style={styles.label}>Texte à résumer:</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre texte ici..."
            multiline
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Générer le résumé</Text>
          </TouchableOpacity>
        </View>

        {/* Bloc Résumer un PDF 
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumer un PDF</Text>
          <Text style={styles.label}>Sélectionner un fichier PDF:</Text>
          <TouchableOpacity style={styles.fileButton} onPress={handleSelectPdf}>
            <Text style={styles.fileButtonText}>
              {selectedFile ? selectedFile.name : "Choisir un fichier"}
            </Text>
          </TouchableOpacity>
          {selectedFile && (
            <TouchableOpacity 
              style={styles.btnPrimary} 
              onPress={handlePdfSummary}
            >
              <Text style={styles.buttonText}>Générer le résumé du PDF</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && <ActivityIndicator size="large" color="#2a5da8" style={styles.loadingIndicator} />}
        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        {summary ? (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Résumé généré :</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  mainTitle: {
    textAlign: 'center',
    color: '#0891b2',
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 18,
  },
  lengthSelector: {
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    width: '100%',
    alignItems: 'center',
  },
  lengthLabel: {
    fontWeight: '500',
    color: '#0891b2',
    marginBottom: 6,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  radioButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0891b2',
    marginHorizontal: 6,
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    backgroundColor: '#0891b2',
  },
  radioText: {
    color: '#0891b2',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#fff',
  },
  section: {
    marginBottom: 24,
    width: '100%',
  },
  sectionTitle: {
    color: '#0891b2',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    minHeight: 90,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#b0b0b0',
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#0891b2',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fileButton: {
    width: '100%',
    backgroundColor: '#e0f7fa',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#0891b2',
  },
  fileButtonText: {
    color: '#0891b2',
    fontWeight: 'bold',
  },
  errorMessage: {
    backgroundColor: '#ffeaea',
    color: '#d32f2f',
    borderRadius: 6,
    padding: 10,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  summaryBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginTop: 18,
    width: '100%',
  },
  summaryTitle: {
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 8,
    fontSize: 16,
  },
  summaryText: {
    color: '#333',
    fontSize: 15,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  historyButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
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
});

export default Resume;*/}{/*
import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import SidebarResume from '../components/SidebarResume';
import { useSidebarResume } from '../hooks/useSidebarResume';

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
            source={require('../assets/resume.png')} 
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
          <Text style={styles.optionButtonText}>Résumé du texte</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.optionButton,
            selectedStartOption === 'file' ? styles.selectedOptionButton : {}
          ]} 
          onPress={() => handleOptionSelect('file')}
        >
          <Text style={styles.optionButtonText}> Résumé du fichier </Text>
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

const Resume = () => {
  const [showStartPage, setShowStartPage] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [length, setLength] = useState('medium');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Hook d'historique API
  const {
    savedResumes,
    isLoadingResumes,
    fetchResumes,
    addResumeToHistory,
    deleteResumeFromHistory,
    selectResume,
    etudiantId
  } = useSidebarResume();

  // Gérer la sélection d'option sur la page d'accueil
  const handleSelectStartOption = (option) => {
    setSelectedOption(option);
  };

  // Continuer vers la page principale
  const handleContinue = () => {
    if (selectedOption) {
      setShowStartPage(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Le texte ne peut pas être vide');
      return;
    }
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const response = await axios.post(
        'http://192.168.1.10:5000/api/resume',
        {
          text: text.trim(),
          length: length,
          etudiant_id: etudiantId
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.summary) {
        setSummary(response.data.summary);
        // Ajouter à l'historique via l'API
        await addResumeToHistory({
          id: Date.now() + Math.floor(Math.random() * 10000),
          original_text: text.trim(),
          summary: response.data.summary,
          created_at: new Date().toISOString(),
          length
        });
      } else {
        setError('La réponse du serveur ne contient pas de résumé');
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Erreur lors de la requête';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPdf = async () => {
    setError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) {
        setError('Sélection du fichier annulée.');
        setSelectedFile(null);
        return;
      }
      if (!result.assets || !result.assets[0]) {
        setError('Le fichier sélectionné est invalide.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(result.assets[0]);
      setError('');
    } catch (err) {
      setError("Erreur lors de la sélection du fichier PDF.");
      setSelectedFile(null);
    }
  };

  const handlePdfSummary = async () => {
    if (!selectedFile) {
      setError('Veuillez d\'abord sélectionner un fichier PDF.');
      return;
    }
    setError('');
    setSummary('');
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: 'application/pdf',
        name: selectedFile.name
      });
      formData.append('length', length);
      formData.append('etudiant_id', etudiantId.toString());
      console.log('Sending etudiant_id:', etudiantId.toString());
      setLoading(true);
      const serverResponse = await axios.post('http://192.168.1.7:5000/api/resume/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        transformRequest: (data, headers) => {
          console.log('Sending data:', data);
          return data;
        },
      });
      if (serverResponse.data && serverResponse.data.summary) {
        setSummary(serverResponse.data.summary);
        // Ajouter à l'historique via l'API
        await addResumeToHistory({
          id: Date.now() + Math.floor(Math.random() * 10000),
          original_text: `PDF: ${selectedFile.name}`,
          summary: serverResponse.data.summary,
          created_at: new Date().toISOString(),
          length
        });
      } else {
        setError("La réponse du serveur ne contient pas de résumé");
      }
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.response?.data?.error || "Erreur lors du résumé PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = (id) => {
    const resume = selectResume(id);
    if (resume) {
      setText(resume.original_text.startsWith('PDF: ') ? '' : resume.original_text);
      setSummary(resume.summary);
      setError('');
    }
    setIsSidebarOpen(false);
  };

  const handleDeleteResume = async (id) => {
    await deleteResumeFromHistory(id);
    fetchResumes();
  };

  // Fonction pour réinitialiser le formulaire de résumé
  const handleNewResume = () => {
    setText('');
    setSummary('');
    setSelectedFile(null);
    setError('');
  };

  // Si on est sur la page d'accueil, afficher StartPage
  if (showStartPage) {
    return (
      <StartPage 
        onSelectOption={handleSelectStartOption} 
        onContinue={handleContinue} 
      />
    );
  }

  // Sinon, afficher la page principale de résumé
  return (
    <View style={styles.container}>
      {/* Bouton pour ouvrir la sidebar 
      <TouchableOpacity 
        style={styles.historyButton} 
        onPress={() => setIsSidebarOpen(true)}
      >
        <Ionicons name="menu" size={24} color="#DC97FF" />
      </TouchableOpacity>

      {/* Sidebar 
      {isSidebarOpen && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.overlayTouchable} 
            onPress={() => setIsSidebarOpen(false)}
          />
          <SidebarResume
            savedResumes={savedResumes}
            isLoadingResumes={isLoadingResumes}
            onSelectResume={handleSelectResume}
            onDeleteResume={handleDeleteResume}
            isVisible={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onNewResume={handleNewResume}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.mainTitle}>Générateur de Résumés</Text>
        
        <View style={styles.lengthSelector}>
          <Text style={styles.lengthLabel}>Longueur du résumé:</Text>
          <View style={styles.radioGroup}>
            {['short', 'medium', 'long'].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.radioButton, length === val && styles.radioButtonSelected]}
                onPress={() => setLength(val)}
              >
                <Text style={[styles.radioText, length === val && styles.radioTextSelected]}>
                  {val === 'short' ? 'Court' : val === 'medium' ? 'Moyen' : 'Long'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Afficher conditionnellement en fonction de l'option sélectionnée 
        {selectedOption === 'text' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résumer un texte</Text>
            <Text style={styles.label}>Texte à résumer:</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez votre texte ici..."
              multiline
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Générer le résumé</Text>
            </TouchableOpacity>
          </View>
        ) : selectedOption === 'file' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résumer un PDF</Text>
            <Text style={styles.label}>Sélectionner un fichier PDF:</Text>
            <TouchableOpacity style={styles.fileButton} onPress={handleSelectPdf}>
              <Text style={styles.fileButtonText}>
                {selectedFile ? selectedFile.name : "Choisir un fichier"}
              </Text>
            </TouchableOpacity>
            {selectedFile && (
              <TouchableOpacity 
                style={styles.btnPrimary} 
                onPress={handlePdfSummary}
              >
                <Text style={styles.buttonText}>Générer le résumé du PDF</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Si on arrive ici, c'est une sécurité, normalement on ne devrait pas arriver ici
          <View style={styles.section}>
            <Text style={styles.errorMessage}>Veuillez sélectionner une option de résumé</Text>
            <TouchableOpacity 
              style={styles.btnSecondary} 
              onPress={() => setShowStartPage(true)}
            >
              <Text style={styles.buttonTextSecondary}>Retour aux options</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && <ActivityIndicator size="large" color="#2a5da8" style={styles.loadingIndicator} />}
        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        {summary ? (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Résumé généré :</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}

        {/* Bouton pour revenir à la page d'accueil 
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            setShowStartPage(true);
            handleNewResume();
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#0891b2" style={styles.backIcon} />
          <Text style={styles.backButtonText}>Retour aux options</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  mainTitle: {
    textAlign: 'center',
    color: '#0891b2',
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 18,
  },
  lengthSelector: {
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    width: '100%',
    alignItems: 'center',
  },
  lengthLabel: {
    fontWeight: '500',
    color: '#0891b2',
    marginBottom: 6,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  radioButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0891b2',
    marginHorizontal: 6,
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    backgroundColor: '#0891b2',
  },
  radioText: {
    color: '#0891b2',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#fff',
  },
  section: {
    marginBottom: 24,
    width: '100%',
  },
  sectionTitle: {
    color: '#0891b2',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    minHeight: 90,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#b0b0b0',
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#0891b2',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderColor: '#0891b2',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextSecondary: {
    color: '#0891b2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fileButton: {
    width: '100%',
    backgroundColor: '#e0f7fa',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#0891b2',
  },
  fileButtonText: {
    color: '#0891b2',
    fontWeight: 'bold',
  },
  errorMessage: {
    backgroundColor: '#ffeaea',
    color: '#d32f2f',
    borderRadius: 6,
    padding: 10,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  summaryBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginTop: 18,
    width: '100%',
  },
  summaryTitle: {
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 8,
    fontSize: 16,
  },
  summaryText: {
    color: '#333',
    fontSize: 15,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  historyButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#0891b2',
    borderRadius: 6,
    backgroundColor: '#e0f7fa',
  },
  backIcon: {
    marginRight: 8,
  },
  backButtonText: {
    color: '#0891b2',
    fontWeight: '500',
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
    height: 270,
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
});

export default Resume;*/}{/*
import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import SidebarResume from '../components/SidebarResume';
import { useSidebarResume } from '../hooks/useSidebarResume';

// Page d'accueil avec les options comme dans l'image
const StartPage = ({ onSelectOption, onContinue }) => {
  const [selectedStartOption, setSelectedStartOption] = useState(null);

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
            source={require('../assets/resume.png')} 
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
          <Text style={styles.optionButtonText}>Résumé du texte</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.optionButton,
            selectedStartOption === 'file' ? styles.selectedOptionButton : {}
          ]} 
          onPress={() => handleOptionSelect('file')}
        >
          <Text style={styles.optionButtonText}> Résumé du fichier </Text>
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

const Resume = () => {
  const [showStartPage, setShowStartPage] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [length, setLength] = useState('medium');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Hook d'historique API
  const {
    savedResumes,
    isLoadingResumes,
    fetchResumes,
    addResumeToHistory,
    deleteResumeFromHistory,
    selectResume,
    etudiantId
  } = useSidebarResume();

  const handleSelectStartOption = (option) => {
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption) {
      setShowStartPage(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Le texte ne peut pas être vide');
      return;
    }
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const response = await axios.post(
        'http://192.168.1.10:5000/api/resume',
        {
          text: text.trim(),
          length: length,
          etudiant_id: etudiantId
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.summary) {
        setSummary(response.data.summary);
        await addResumeToHistory({
          id: Date.now() + Math.floor(Math.random() * 10000),
          original_text: text.trim(),
          summary: response.data.summary,
          created_at: new Date().toISOString(),
          length
        });
      } else {
        setError('La réponse du serveur ne contient pas de résumé');
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Erreur lors de la requête';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPdf = async () => {
    setError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) {
        setError('Sélection du fichier annulée.');
        setSelectedFile(null);
        return;
      }
      if (!result.assets || !result.assets[0]) {
        setError('Le fichier sélectionné est invalide.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(result.assets[0]);
      setError('');
    } catch (err) {
      setError("Erreur lors de la sélection du fichier PDF.");
      setSelectedFile(null);
    }
  };

  const handlePdfSummary = async () => {
    if (!selectedFile) {
      setError('Veuillez d\'abord sélectionner un fichier PDF.');
      return;
    }
    setError('');
    setSummary('');
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: 'application/pdf',
        name: selectedFile.name
      });
      formData.append('length', length);
      formData.append('etudiant_id', etudiantId.toString());
      setLoading(true);
      const serverResponse = await axios.post('http://192.168.1.10:5000/api/resume/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });
      if (serverResponse.data && serverResponse.data.summary) {
        setSummary(serverResponse.data.summary);
        await addResumeToHistory({
          id: Date.now() + Math.floor(Math.random() * 10000),
          original_text: `PDF: ${selectedFile.name}`,
          summary: serverResponse.data.summary,
          created_at: new Date().toISOString(),
          length
        });
      } else {
        setError("La réponse du serveur ne contient pas de résumé");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors du résumé PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = (id) => {
    const resume = selectResume(id);
    if (resume) {
      setText(resume.original_text.startsWith('PDF: ') ? '' : resume.original_text);
      setSummary(resume.summary);
      setError('');
    }
    setIsSidebarOpen(false);
  };

  const handleDeleteResume = async (id) => {
    await deleteResumeFromHistory(id);
    fetchResumes();
  };

  const handleNewResume = () => {
    setText('');
    setSummary('');
    setSelectedFile(null);
    setError('');
  };

  // Bouton retour en haut à droite
  const handleBackToStart = () => {
    setShowStartPage(true);
    setSelectedOption(null);
    setText('');
    setSummary('');
    setSelectedFile(null);
    setError('');
  };

  if (showStartPage) {
    return (
      <StartPage 
        onSelectOption={handleSelectStartOption} 
        onContinue={handleContinue} 
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Bouton pour ouvrir la sidebar 
      <TouchableOpacity 
        style={styles.historyButton} 
        onPress={() => setIsSidebarOpen(true)}
      >
        <Ionicons name="menu" size={24} color="#DC97FF" />
      </TouchableOpacity>

      {/* Bouton retour en haut à droite 
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBackToStart}
      >
        <Ionicons name="arrow-back" size={24} color="#5A108F" />
      </TouchableOpacity>

      {/* Sidebar 
      {isSidebarOpen && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.overlayTouchable} 
            onPress={() => setIsSidebarOpen(false)}
          />
          <SidebarResume
            savedResumes={savedResumes}
            isLoadingResumes={isLoadingResumes}
            onSelectResume={handleSelectResume}
            onDeleteResume={handleDeleteResume}
            isVisible={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onNewResume={handleNewResume}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.mainTitle}>Générateur de Résumés</Text>
        
        <View style={styles.lengthSelector}>
          <Text style={styles.lengthLabel}>Longueur du résumé:</Text>
          <View style={styles.radioGroup}>
            {['short', 'medium', 'long'].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.radioButton, length === val && styles.radioButtonSelected]}
                onPress={() => setLength(val)}
              >
                <Text style={[styles.radioText, length === val && styles.radioTextSelected]}>
                  {val === 'short' ? 'Court' : val === 'medium' ? 'Moyen' : 'Long'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedOption === 'text' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résumer un texte</Text>
            <Text style={styles.label}>Texte à résumer:</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez votre texte ici..."
              multiline
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Générer le résumé</Text>
            </TouchableOpacity>
          </View>
        ) : selectedOption === 'file' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résumer un PDF</Text>
            <Text style={styles.label}>Sélectionner un fichier PDF:</Text>
            <TouchableOpacity style={styles.fileButton} onPress={handleSelectPdf}>
              <Text style={styles.fileButtonText}>
                {selectedFile ? selectedFile.name : "Choisir un fichier"}
              </Text>
            </TouchableOpacity>
            {selectedFile && (
              <TouchableOpacity 
                style={styles.btnPrimary} 
                onPress={handlePdfSummary}
              >
                <Text style={styles.buttonText}>Générer le résumé du PDF</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.errorMessage}>Veuillez sélectionner une option de résumé</Text>
          </View>
        )}

        {loading && <ActivityIndicator size="large" color="#AB51E3" style={styles.loadingIndicator} />}
        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        {summary ? (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Résumé généré :</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};*/}{/*
import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import SidebarResume from '../components/SidebarResume';
import { useSidebarResume } from '../hooks/useSidebarResume';
import { useLanguage } from '../app/i18n';
import { useAuth } from '../contexts/AuthContext';




// Page d'accueil avec les options comme dans l'image
const StartPage = ({ onSelectOption, onContinue }) => {
  const [selectedStartOption, setSelectedStartOption] = useState(null);
  const { t } = useLanguage();
  const { isLoggedIn, user, logout } = useAuth();
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
            source={require('../assets/resume.png')} 
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
          <Text style={styles.optionButtonText}>{t('summarizeText')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.optionButton,
            selectedStartOption === 'file' ? styles.selectedOptionButton : {}
          ]} 
          onPress={() => handleOptionSelect('file')}
        >
          <Text style={styles.optionButtonText}>{t('summarizePDF')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedStartOption ? styles.disabledContinueButton : {}
          ]} 
          onPress={onContinue}
          disabled={!selectedStartOption}
        >
          <Text style={styles.continueButtonText}>{t('continue')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Resume = () => {
  const { t } = useLanguage();
  const [showStartPage, setShowStartPage] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [length, setLength] = useState('medium');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Hook d'historique API
  const {
    savedResumes,
    isLoadingResumes,
    fetchResumes,
    addResumeToHistory,
    deleteResumeFromHistory,
    selectResume,
    etudiantId
  } = useSidebarResume();

  const handleSelectStartOption = (option) => {
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption) {
      setShowStartPage(false);
    } else {
      setError(t('selectSummaryOption'));
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError(t('textCannotBeEmpty'));
      return;
    }
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const response = await axios.post(
        'http://192.168.1.10:5000/api/resume',
        {
          text: text.trim(),
          length: length,
          etudiant_id: etudiantId
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.summary) {
        setSummary(response.data.summary);
        await addResumeToHistory({
          id: Date.now() + Math.floor(Math.random() * 10000),
          original_text: text.trim(),
          summary: response.data.summary,
          created_at: new Date().toISOString(),
          length
        });
      } else {
        setError(t('serverResponseError'));
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        t('networkError');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPdf = async () => {
    setError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) {
        setError(t('fileSelectionCancelled'));
        setSelectedFile(null);
        return;
      }
      if (!result.assets || !result.assets[0]) {
        setError(t('invalidFile'));
        setSelectedFile(null);
        return;
      }
      setSelectedFile(result.assets[0]);
      setError('');
    } catch (err) {
      setError(t('pdfSelectionError'));
      setSelectedFile(null);
    }
  };

  const handlePdfSummary = async () => {
    if (!selectedFile) {
      setError(t('selectPDFFirst'));
      return;
    }
    setError('');
    setSummary('');
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: 'application/pdf',
        name: selectedFile.name
      });
      formData.append('length', length);
      formData.append('etudiant_id', etudiantId.toString());
      setLoading(true);
      const serverResponse = await axios.post('http://192.168.1.10:5000/api/resume/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });
      if (serverResponse.data && serverResponse.data.summary) {
        setSummary(serverResponse.data.summary);
        await addResumeToHistory({
          id: Date.now() + Math.floor(Math.random() * 10000),
          original_text: `PDF: ${selectedFile.name}`,
          summary: serverResponse.data.summary,
          created_at: new Date().toISOString(),
          length
        });
      } else {
        setError(t('serverResponseError'));
      }
    } catch (err) {
      setError(err.response?.data?.error || t('pdfSummaryError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = (id) => {
    const resume = selectResume(id);
    if (resume) {
      setText(resume.original_text.startsWith('PDF: ') ? '' : resume.original_text);
      setSummary(resume.summary);
      setError('');
    }
    setIsSidebarOpen(false);
  };

  const handleDeleteResume = async (id) => {
    await deleteResumeFromHistory(id);
    fetchResumes();
  };

  const handleNewResume = () => {
    setText('');
    setSummary('');
    setSelectedFile(null);
    setError('');
  };

  // Bouton retour en haut à droite
  const handleBackToStart = () => {
    setShowStartPage(true);
    setSelectedOption(null);
    setText('');
    setSummary('');
    setSelectedFile(null);
    setError('');
  };

  if (showStartPage) {
    return (
      <StartPage 
        onSelectOption={handleSelectStartOption} 
        onContinue={handleContinue} 
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Bouton pour ouvrir la sidebar 
      <TouchableOpacity 
        style={styles.historyButton} 
        onPress={() => setIsSidebarOpen(true)}
      >
        <Ionicons name="menu" size={24} color="#DC97FF" />
      </TouchableOpacity>

      {/* Bouton retour en haut à droite 
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBackToStart}
      >
        <Ionicons name="arrow-back" size={24} color="#5A108F" />
      </TouchableOpacity>

      {/* Sidebar 
      {isSidebarOpen && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.overlayTouchable} 
            onPress={() => setIsSidebarOpen(false)}
          />
          <SidebarResume
            savedResumes={savedResumes}
            isLoadingResumes={isLoadingResumes}
            onSelectResume={handleSelectResume}
            onDeleteResume={handleDeleteResume}
            isVisible={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onNewResume={handleNewResume}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.mainTitle}>{t('summaryGenerator')}</Text>
        
        <View style={styles.lengthSelector}>
          <Text style={styles.lengthLabel}>{t('summaryLength')}</Text>
          <View style={styles.radioGroup}>
            {['short', 'medium', 'long'].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.radioButton, length === val && styles.radioButtonSelected]}
                onPress={() => setLength(val)}
              >
                <Text style={[styles.radioText, length === val && styles.radioTextSelected]}>
                  {t(val)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedOption === 'text' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('summarizeText')}</Text>
            <Text style={styles.label}>{t('textToSummarize')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enterTextHere')}
              multiline
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
              <Text style={styles.buttonText}>{t('generateSummary')}</Text>
            </TouchableOpacity>
          </View>
        ) : selectedOption === 'file' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('summarizePDF')}</Text>
            <Text style={styles.label}>{t('selectPDFFile')}</Text>
            <TouchableOpacity style={styles.fileButton} onPress={handleSelectPdf}>
              <Text style={styles.fileButtonText}>
                {selectedFile ? selectedFile.name : t('chooseFile')}
              </Text>
            </TouchableOpacity>
            {selectedFile && (
              <TouchableOpacity 
                style={styles.btnPrimary} 
                onPress={handlePdfSummary}
              >
                <Text style={styles.buttonText}>{t('generatePDFSummary')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.errorMessage}>{t('selectSummaryOption')}</Text>
          </View>
        )}

        {loading && <ActivityIndicator size="large" color="#AB51E3" style={styles.loadingIndicator} />}
        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        {summary ? (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>{t('summaryGenerated')}</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  mainTitle: {
    textAlign: 'center',
    color: '#6818A5', // purple
    fontWeight: 'bold',
    fontSize: 23,
    marginBottom: 15,
    marginTop: 40, // Ajout d'un espace en haut pour descendre le titre
  },
  lengthSelector: {
    backgroundColor: '#f3e6fa', // light purple
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    width: '100%',
    alignItems: 'center',
  },
  lengthLabel: {
    fontWeight: '500',
    color: '#6818A5', // purple
    marginBottom: 6,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  radioButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#AB51E3', // purple
    marginHorizontal: 6,
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    backgroundColor: '#AB51E3', // purple
  },
  radioText: {
    color: '#AB51E3', // purple
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#fff',
  },
  section: {
    marginBottom: 24,
    width: '100%',
  },
  sectionTitle: {
    color: '#6818A5', // purple
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    minHeight: 90,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#AB51E3', // purple
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#8B2FC9', // purple
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: '#f3e6fa', // light purple
    borderColor: '#AB51E3', // purple
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextSecondary: {
    color: '#AB51E3', // purple
    fontWeight: 'bold',
    fontSize: 16,
  },
  fileButton: {
    width: '100%',
    backgroundColor: '#f3e6fa', // light purple
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#AB51E3', // purple
  },
  fileButtonText: {
    color: '#AB51E3', // purple
    fontWeight: 'bold',
  },
  errorMessage: {
    backgroundColor: '#ffeaea',
    color: '#d32f2f',
    borderRadius: 6,
    padding: 10,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  summaryBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginTop: 18,
    width: '100%',
  },
  summaryTitle: {
    fontWeight: 'bold',
    color: '#6818A5', // purple
    marginBottom: 8,
    fontSize: 16,
  },
  summaryText: {
    color: '#333',
    fontSize: 15,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  historyButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#5A108F', // purple
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
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
  backIcon: {
    marginRight: 8,
  },
  backButtonText: {
    color: '#5A108F', // purple
    fontWeight: '500',
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
    height: 270,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  optionButton: {
    backgroundColor: '#8B2FC9', // purple
    width: '100%',
    padding: 15,
    borderRadius: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedOptionButton: {
    backgroundColor: '#AB51E3', // purple
    borderWidth: 2,
    borderColor: '#5A108F', // purple
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#AB51E3', // purple
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
    width: '100%',
  },
  disabledContinueButton: {
    backgroundColor: '#5A108F', // purple
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
});

export default Resume;*/}{/*
import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image, SafeAreaView, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import SidebarResume from '../components/SidebarResume';
import { useSidebarResume } from '../hooks/useSidebarResume';
import { useLanguage } from '../app/i18n';
import { useAuth } from '../contexts/AuthContext';

// Page d'accueil avec les options comme dans l'image
const StartPage = ({ onSelectOption, onContinue }) => {
  const [selectedStartOption, setSelectedStartOption] = useState(null);
  const { t } = useLanguage();
  const { isLoggedIn, user, logout } = useAuth();
  
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
            source={require('../assets/resume.png')} 
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
          <Text style={styles.optionButtonText}>{t('summarizeText')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.optionButton,
            selectedStartOption === 'file' ? styles.selectedOptionButton : {}
          ]} 
          onPress={() => handleOptionSelect('file')}
        >
          <Text style={styles.optionButtonText}>{t('summarizePDF')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedStartOption ? styles.disabledContinueButton : {}
          ]} 
          onPress={onContinue}
          disabled={!selectedStartOption}
        >
          <Text style={styles.continueButtonText}>{t('continue')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Resume = () => {
  const { t } = useLanguage();
  const [showStartPage, setShowStartPage] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [length, setLength] = useState('medium');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Hook d'historique API
  const {
    savedResumes,
    isLoadingResumes,
    fetchResumes,
    addResumeToHistory,
    deleteResumeFromHistory,
    selectResume,
    etudiantId
  } = useSidebarResume();

  const handleSelectStartOption = (option) => {
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption) {
      setShowStartPage(false);
    } else {
      setError(t('selectSummaryOption'));
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError(t('textCannotBeEmpty'));
      return;
    }
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const response = await axios.post(
        'http://192.168.1.10:5000/api/resume',
        {
          text: text.trim(),
          length: length,
          etudiant_id: etudiantId
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.summary) {
        setSummary(response.data.summary);
        await addResumeToHistory({
          id: Date.now() + Math.floor(Math.random() * 10000),
          original_text: text.trim(),
          summary: response.data.summary,
          created_at: new Date().toISOString(),
          length
        });
      } else {
        setError(t('serverResponseError'));
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        t('networkError');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPdf = async () => {
    setError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) {
        setError(t('fileSelectionCancelled'));
        setSelectedFile(null);
        return;
      }
      if (!result.assets || !result.assets[0]) {
        setError(t('invalidFile'));
        setSelectedFile(null);
        return;
      }
      setSelectedFile(result.assets[0]);
      setError('');
    } catch (err) {
      setError(t('pdfSelectionError'));
      setSelectedFile(null);
    }
  };

  const handlePdfSummary = async () => {
    if (!selectedFile) {
      setError(t('selectPDFFirst'));
      return;
    }
    setError('');
    setSummary('');
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: 'application/pdf',
        name: selectedFile.name
      });
      formData.append('length', length);
      formData.append('etudiant_id', etudiantId.toString());
      setLoading(true);
      const serverResponse = await axios.post('http://192.168.1.10:5000/api/resume/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });
      if (serverResponse.data && serverResponse.data.summary) {
        setSummary(serverResponse.data.summary);
        await addResumeToHistory({
          id: Date.now() + Math.floor(Math.random() * 10000),
          original_text: `PDF: ${selectedFile.name}`,
          summary: serverResponse.data.summary,
          created_at: new Date().toISOString(),
          length
        });
      } else {
        setError(t('serverResponseError'));
      }
    } catch (err) {
      setError(err.response?.data?.error || t('pdfSummaryError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = (id) => {
    const resume = selectResume(id);
    if (resume) {
      setText(resume.original_text.startsWith('PDF: ') ? '' : resume.original_text);
      setSummary(resume.summary);
      setError('');
    }
    setIsSidebarOpen(false);
  };

  {/*const handleDeleteResume = async (id) => {
    await deleteResumeFromHistory(id);
    fetchResumes();
  };
  const handleDeleteResume = async (id) => {
    try {
      if (Platform.OS === 'web') {
        if (window.confirm(t('confirmDelete'))) {
          await deleteResumeFromHistory(id);
          fetchResumes();
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
                await deleteResumeFromHistory(id);
                fetchResumes();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error(t('deletionError'), error);
    }
  };

  const handleNewResume = () => {
    setText('');
    setSummary('');
    setSelectedFile(null);
    setError('');
  };

  // Bouton retour en haut à droite
  const handleBackToStart = () => {
    setShowStartPage(true);
    setSelectedOption(null);
    setText('');
    setSummary('');
    setSelectedFile(null);
    setError('');
  };

  if (showStartPage) {
    return (
      <StartPage 
        onSelectOption={handleSelectStartOption} 
        onContinue={handleContinue} 
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec menu et retour 
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => setIsSidebarOpen(true)}
        >
          <Ionicons name="menu" size={24} color="#DC97FF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{t('summaryGenerator')}</Text>
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackToStart}
        >
          <Ionicons name="arrow-back" size={24} color="#5A108F" />
        </TouchableOpacity>
      </View>

      {/* Sidebar 
      {isSidebarOpen && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.overlayTouchable} 
            onPress={() => setIsSidebarOpen(false)}
          />
          <SidebarResume
            savedResumes={savedResumes}
            isLoadingResumes={isLoadingResumes}
            onSelectResume={handleSelectResume}
            onDeleteResume={handleDeleteResume}
            isVisible={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onNewResume={handleNewResume}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.lengthSelector}>
          <Text style={styles.lengthLabel}>{t('summaryLength')}</Text>
          <View style={styles.radioGroup}>
            {['short', 'medium', 'long'].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.radioButton, length === val && styles.radioButtonSelected]}
                onPress={() => setLength(val)}
              >
                <Text style={[styles.radioText, length === val && styles.radioTextSelected]}>
                  {t(val)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedOption === 'text' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('summarizeText')}</Text>
            <Text style={styles.label}>{t('textToSummarize')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enterTextHere')}
              multiline
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
              <Text style={styles.buttonText}>{t('generateSummary')}</Text>
            </TouchableOpacity>
          </View>
        ) : selectedOption === 'file' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('summarizePDF')}</Text>
            <Text style={styles.label}>{t('selectPDFFile')}</Text>
            <TouchableOpacity style={styles.fileButton} onPress={handleSelectPdf}>
              <Text style={styles.fileButtonText}>
                {selectedFile ? selectedFile.name : t('chooseFile')}
              </Text>
            </TouchableOpacity>
            {selectedFile && (
              <TouchableOpacity 
                style={styles.btnPrimary} 
                onPress={handlePdfSummary}
              >
                <Text style={styles.buttonText}>{t('generatePDFSummary')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.errorMessage}>{t('selectSummaryOption')}</Text>
          </View>
        )}

        {loading && <ActivityIndicator size="large" color="#AB51E3" style={styles.loadingIndicator} />}
        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        {summary ? (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>{t('summaryGenerated')}</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Header styles
  header: {
    backgroundColor: 'white',
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#6818A5',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center'
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
     backgroundColor: '#5A108F',
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
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
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
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  lengthSelector: {
    backgroundColor: '#f3e6fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    width: '100%',
    alignItems: 'center',
  },
  lengthLabel: {
    fontWeight: '500',
    color: '#6818A5',
    marginBottom: 6,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  radioButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#AB51E3',
    marginHorizontal: 6,
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    backgroundColor: '#AB51E3',
  },
  radioText: {
    color: '#AB51E3',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#fff',
  },
  section: {
    marginBottom: 24,
    width: '100%',
  },
  sectionTitle: {
    color: '#6818A5',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    minHeight: 90,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#AB51E3',
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#8B2FC9',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: '#f3e6fa',
    borderColor: '#AB51E3',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextSecondary: {
    color: '#AB51E3',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fileButton: {
    width: '100%',
    backgroundColor: '#f3e6fa',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#AB51E3',
  },
  fileButtonText: {
    color: '#AB51E3',
    fontWeight: 'bold',
  },
  errorMessage: {
    backgroundColor: '#ffeaea',
    color: '#d32f2f',
    borderRadius: 6,
    padding: 10,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  summaryBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginTop: 18,
    width: '100%',
  },
  summaryTitle: {
    fontWeight: 'bold',
    color: '#6818A5',
    marginBottom: 8,
    fontSize: 16,
  },
  summaryText: {
    color: '#333',
    fontSize: 15,
  },
  loadingIndicator: {
    marginTop: 20,
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
    height: 270,
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
    borderColor: '#5A108F',
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
    backgroundColor: '#5A108F',
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
});

export default Resume;*/}{/*
import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, TextInput, Share,TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import SidebarResume from '../components/SidebarResume';
import { useSidebarResume } from '../hooks/useSidebarResume';
import { useLanguage } from '../app/i18n';
import { useAuth } from '../contexts/AuthContext';
import * as Clipboard from 'expo-clipboard';


// Page d'accueil avec les options comme dans l'image
const StartPage = ({ onSelectOption, onContinue }) => {
  const [selectedStartOption, setSelectedStartOption] = useState(null);
  const { t } = useLanguage();
  const { isLoggedIn, user, logout } = useAuth();
  
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
            source={require('../assets/resume.png')} 
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
          <Text style={styles.optionButtonText}>{t('summarizeText')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.optionButton,
            selectedStartOption === 'file' ? styles.selectedOptionButton : {}
          ]} 
          onPress={() => handleOptionSelect('file')}
        >
          <Text style={styles.optionButtonText}>{t('summarizePDF')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedStartOption ? styles.disabledContinueButton : {}
          ]} 
          onPress={onContinue}
          disabled={!selectedStartOption}
        >
          <Text style={styles.continueButtonText}>{t('continue')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Resume = () => {
  const { t } = useLanguage();
  const [showStartPage, setShowStartPage] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [length, setLength] = useState('medium');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
 
  // Hook d'historique API
  const {
    savedResumes,
    isLoadingResumes,
    fetchResumes,
    addResumeToHistory,
    deleteResumeFromHistory,
    selectResume,
    etudiantId
  } = useSidebarResume();

  const handleSelectStartOption = (option) => {
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption) {
      setShowStartPage(false);
    } else {
      setError(t('selectSummaryOption'));
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError(t('textCannotBeEmpty'));
      return;
    }
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const response = await axios.post(
          'http://192.168.1.10:5000/api/resume',
        {
          text: text.trim(),
          length: length,
          etudiant_id: etudiantId
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.summary) {
        setSummary(response.data.summary);
        await addResumeToHistory({
          id: Date.now() + Math.floor(Math.random() * 10000),
          original_text: text.trim(),
          summary: response.data.summary,
          created_at: new Date().toISOString(),
          length
        });
      } else {
        setError(t('serverResponseError'));
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        t('networkError');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPdf = async () => {
    setError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) {
        setError(t('fileSelectionCancelled'));
        setSelectedFile(null);
        return;
      }
      if (!result.assets || !result.assets[0]) {
        setError(t('invalidFile'));
        setSelectedFile(null);
        return;
      }
      setSelectedFile(result.assets[0]);
      setError('');
    } catch (err) {
      setError(t('pdfSelectionError'));
      setSelectedFile(null);
    }
  };

  const handlePdfSummary = async () => {
    if (!selectedFile) {
      setError(t('selectPDFFirst'));
      return;
    }
    setError('');
    setSummary('');
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: 'application/pdf',
        name: selectedFile.name
      });
      formData.append('length', length);
      formData.append('etudiant_id', etudiantId.toString());
      setLoading(true);
      const serverResponse = await axios.post('http://192.168.1.10:5000/api/resume/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });
      if (serverResponse.data && serverResponse.data.summary) {
        setSummary(serverResponse.data.summary);
        await addResumeToHistory({
          id: Date.now() + Math.floor(Math.random() * 10000),
          original_text: `PDF: ${selectedFile.name}`,
          summary: serverResponse.data.summary,
          created_at: new Date().toISOString(),
          length
        });
      } else {
        setError(t('serverResponseError'));
      }
    } catch (err) {
      setError(err.response?.data?.error || t('pdfSummaryError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = (id) => {
    const resume = selectResume(id);
    if (resume) {
      setText(resume.original_text.startsWith('PDF: ') ? '' : resume.original_text);
      setSummary(resume.summary);
      setError('');
    }
    setIsSidebarOpen(false);
  };

  const handleDeleteResume = async (id) => {
    try {
      if (Platform.OS === 'web') {
        if (window.confirm(t('confirmDelete'))) {
          await deleteResumeFromHistory(id);
          fetchResumes();
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
                await deleteResumeFromHistory(id);
                fetchResumes();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error(t('deletionError'), error);
    }
  };

  const handleNewResume = () => {
    setText('');
    setSummary('');
    setSelectedFile(null);
    setError('');
  };
 // Partager le résumé
  const shareResume = async () => {
    try {
      await Share.share({
        message: summary,
        title: t('resumeSharing') // Vous devrez ajouter cette traduction
      });
    } catch (error) {
      Alert.alert(t('error'), t('shareFailed')); // Vous devrez ajouter cette traduction
    }
  };

  // Copier le résumé dans le presse-papier
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(summary);
      Alert.alert(t('copied'), t('copyResume')); // Vous devrez ajouter cette traduction
    } catch (error) {
      Alert.alert(t('error'), t('copyFailed')); // Vous devrez ajouter cette traduction
    }
  };
  // Bouton retour en haut à droite
  const handleBackToStart = () => {
    setShowStartPage(true);
    setSelectedOption(null);
    setText('');
    setSummary('');
    setSelectedFile(null);
    setError('');
  };

  if (showStartPage) {
    return (
      <StartPage 
        onSelectOption={handleSelectStartOption} 
        onContinue={handleContinue} 
      />
    );
  }
  

  return (
    <View style={styles.container}>
      {/* Header avec menu et retour 
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => setIsSidebarOpen(true)}
        >
          <Ionicons name="menu" size={24} color="#5A108F" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{t('summaryGenerator')}</Text>
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackToStart}
        >
          <Ionicons name="arrow-back" size={24} color="#5A108F" />
        </TouchableOpacity>
      </View>

      {/* Sidebar 
      {isSidebarOpen && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.overlayTouchable} 
            onPress={() => setIsSidebarOpen(false)}
          />
          <SidebarResume
            savedResumes={savedResumes}
            isLoadingResumes={isLoadingResumes}
            onSelectResume={handleSelectResume}
            onDeleteResume={handleDeleteResume}
            isVisible={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onNewResume={handleNewResume}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.lengthSelector}>
          <Text style={styles.lengthLabel}>{t('summaryLength')}</Text>
          <View style={styles.radioGroup}>
            {['short', 'medium', 'long'].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.radioButton, length === val && styles.radioButtonSelected]}
                onPress={() => setLength(val)}
              >
                <Text style={[styles.radioText, length === val && styles.radioTextSelected]}>
                  {t(val)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedOption === 'text' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('summarizeText')}</Text>
            <Text style={styles.label}>{t('textToSummarize')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enterTextHere')}
              multiline
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
              <Text style={styles.buttonText}>{t('generateSummary')}</Text>
            </TouchableOpacity>
          </View>
        ) : selectedOption === 'file' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('summarizePDF')}</Text>
            <Text style={styles.label}>{t('selectPDFFile')}</Text>
            <TouchableOpacity style={styles.fileButton} onPress={handleSelectPdf}>
              <Text style={styles.fileButtonText}>
                {selectedFile ? selectedFile.name : t('chooseFile')}
              </Text>
            </TouchableOpacity>
            {selectedFile && (
              <TouchableOpacity 
                style={styles.btnPrimary} 
                onPress={handlePdfSummary}
              >
                <Text style={styles.buttonText}>{t('generatePDFSummary')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.errorMessage}>{t('selectSummaryOption')}</Text>
          </View>
        )}

        {loading && <ActivityIndicator size="large" color="#AB51E3" style={styles.loadingIndicator} />}
        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        {summary ? (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>{t('summaryGenerated')}</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Header styles
  header: {
    backgroundColor: 'white',
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#6818A5',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    right: 15,
    bottom: 10,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
     bottom: 10,
  },
  backButton: {
    position: 'absolute',
    right: 5,
    zIndex: 10,
    padding: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
    bottom: 10,
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
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  lengthSelector: {
    backgroundColor: '#f3e6fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    width: '100%',
    alignItems: 'center',
  },
  lengthLabel: {
    fontWeight: '500',
    color: '#6818A5',
    marginBottom: 6,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  radioButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#AB51E3',
    marginHorizontal: 6,
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    backgroundColor: '#AB51E3',
  },
  radioText: {
    color: '#AB51E3',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#fff',
  },
  section: {
    marginBottom: 24,
    width: '100%',
  },
  sectionTitle: {
    color: '#6818A5',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    minHeight: 90,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#AB51E3',
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#8B2FC9',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: '#f3e6fa',
    borderColor: '#AB51E3',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextSecondary: {
    color: '#AB51E3',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fileButton: {
    width: '100%',
    backgroundColor: '#f3e6fa',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#AB51E3',
  },
  fileButtonText: {
    color: '#AB51E3',
    fontWeight: 'bold',
  },
  errorMessage: {
    backgroundColor: '#ffeaea',
    color: '#d32f2f',
    borderRadius: 6,
    padding: 10,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  summaryBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginTop: 18,
    width: '100%',
  },
  summaryTitle: {
    fontWeight: 'bold',
    color: '#6818A5',
    marginBottom: 8,
    fontSize: 16,
  },
  summaryText: {
    color: '#333',
    fontSize: 15,
  },
  loadingIndicator: {
    marginTop: 20,
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
    height: 270,
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
    borderColor: '#5A108F',
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
    backgroundColor: '#5A108F',
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
});

export default Resume;*/}
import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, TextInput, Share,TouchableOpacity, ScrollView, ActivityIndicator, Platform, Image, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons,Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import SidebarResume from '../components/SidebarResume';
import { useSidebarResume } from '../hooks/useSidebarResume';
import { useLanguage } from '../app/i18n';
import { useAuth } from '../contexts/AuthContext';
import * as Clipboard from 'expo-clipboard';


// Page d'accueil avec les options comme dans l'image
const StartPage = ({ onSelectOption, onContinue }) => {
  const [selectedStartOption, setSelectedStartOption] = useState(null);
  const { t } = useLanguage();
  const { isLoggedIn, user, logout } = useAuth();
  
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
            source={require('../assets/resume.png')} 
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
          <Text style={styles.optionButtonText}>{t('summarizeText')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.optionButton,
            selectedStartOption === 'file' ? styles.selectedOptionButton : {}
          ]} 
          onPress={() => handleOptionSelect('file')}
        >
          <Text style={styles.optionButtonText}>{t('summarizePDF')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedStartOption ? styles.disabledContinueButton : {}
          ]} 
          onPress={onContinue}
          disabled={!selectedStartOption}
        >
          <Text style={styles.continueButtonText}>{t('continue')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Resume = () => {
  const { t } = useLanguage();
  const [showStartPage, setShowStartPage] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [length, setLength] = useState('medium');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
 
  // Hook d'historique API
  const {
    savedResumes,
    isLoadingResumes,
    fetchResumes,
    addResumeToHistory,
    deleteResumeFromHistory,
    selectResume,
    etudiantId
  } = useSidebarResume();

  const handleSelectStartOption = (option) => {
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption) {
      setShowStartPage(false);
    } else {
      setError(t('selectSummaryOption'));
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError(t('textCannotBeEmpty'));
      return;
    }
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const response = await axios.post(
          'http://192.168.1.10:5000/api/resume',
        {
          text: text.trim(),
          length: length,
          etudiant_id: etudiantId
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.summary) {
        setSummary(response.data.summary);
        await addResumeToHistory({
          id: Date.now() + Math.floor(Math.random() * 10000),
          original_text: text.trim(),
          summary: response.data.summary,
          created_at: new Date().toISOString(),
          length
        });
      } else {
        setError(t('serverResponseError'));
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        t('networkError');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPdf = async () => {
    setError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) {
        setError(t('fileSelectionCancelled'));
        setSelectedFile(null);
        return;
      }
      if (!result.assets || !result.assets[0]) {
        setError(t('invalidFile'));
        setSelectedFile(null);
        return;
      }
      setSelectedFile(result.assets[0]);
      setError('');
    } catch (err) {
      setError(t('pdfSelectionError'));
      setSelectedFile(null);
    }
  };

  const handlePdfSummary = async () => {
    if (!selectedFile) {
      setError(t('selectPDFFirst'));
      return;
    }
    setError('');
    setSummary('');
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: 'application/pdf',
        name: selectedFile.name
      });
      formData.append('length', length);
      formData.append('etudiant_id', etudiantId.toString());
      setLoading(true);
      const serverResponse = await axios.post('http://192.168.1.10:5000/api/resume/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });
      if (serverResponse.data && serverResponse.data.summary) {
        setSummary(serverResponse.data.summary);
        await addResumeToHistory({
          id: Date.now() + Math.floor(Math.random() * 10000),
          original_text: `PDF: ${selectedFile.name}`,
          summary: serverResponse.data.summary,
          created_at: new Date().toISOString(),
          length
        });
      } else {
        setError(t('serverResponseError'));
      }
    } catch (err) {
      setError(err.response?.data?.error || t('pdfSummaryError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = (id) => {
    const resume = selectResume(id);
    if (resume) {
      setText(resume.original_text.startsWith('PDF: ') ? '' : resume.original_text);
      setSummary(resume.summary);
      setError('');
    }
    setIsSidebarOpen(false);
  };

  const handleDeleteResume = async (id) => {
    try {
      if (Platform.OS === 'web') {
        if (window.confirm(t('confirmDelete'))) {
          await deleteResumeFromHistory(id);
          fetchResumes();
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
                await deleteResumeFromHistory(id);
                fetchResumes();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error(t('deletionError'), error);
    }
  };

  const handleNewResume = () => {
    setText('');
    setSummary('');
    setSelectedFile(null);
    setError('');
  };

  // Partager le résumé
  const shareResume = async () => {
    if (!summary.trim()) {
      Alert.alert(t('error'), t('noSummaryToShare'));
      return;
    }
    try {
      await Share.share({
        message: summary,
        title: t('resumeSharing')
      });
    } catch (error) {
      Alert.alert(t('error'), t('shareFailed'));
    }
  };

  // Copier le résumé dans le presse-papier
  const copyToClipboard = async () => {
    if (!summary.trim()) {
      Alert.alert(t('error'), t('noSummaryToCopy'));
      return;
    }
    try {
      await Clipboard.setStringAsync(summary);
      Alert.alert(t('success'), t('copyResume'));
    } catch (error) {
      Alert.alert(t('error'), t('copyFailed'));
    }
  };

  // Bouton retour en haut à droite
  const handleBackToStart = () => {
    setShowStartPage(true);
    setSelectedOption(null);
    setText('');
    setSummary('');
    setSelectedFile(null);
    setError('');
  };

  if (showStartPage) {
    return (
      <StartPage 
        onSelectOption={handleSelectStartOption} 
        onContinue={handleContinue} 
      />
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header avec menu et retour */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => setIsSidebarOpen(true)}
        >
          <Ionicons name="menu" size={24} color="#5A108F" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{t('summaryGenerator')}</Text>
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackToStart}
        >
          <Ionicons name="arrow-back" size={24} color="#5A108F" />
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      {isSidebarOpen && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.overlayTouchable} 
            onPress={() => setIsSidebarOpen(false)}
          />
          <SidebarResume
            savedResumes={savedResumes}
            isLoadingResumes={isLoadingResumes}
            onSelectResume={handleSelectResume}
            onDeleteResume={handleDeleteResume}
            isVisible={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onNewResume={handleNewResume}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.lengthSelector}>
          <Text style={styles.lengthLabel}>{t('summaryLength')}</Text>
          <View style={styles.radioGroup}>
            {['short', 'medium', 'long'].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.radioButton, length === val && styles.radioButtonSelected]}
                onPress={() => setLength(val)}
              >
                <Text style={[styles.radioText, length === val && styles.radioTextSelected]}>
                  {t(val)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedOption === 'text' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('summarizeText')}</Text>
            <Text style={styles.label}>{t('textToSummarize')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enterTextHere')}
              multiline
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
              <Text style={styles.buttonText}>{t('generateSummary')}</Text>
            </TouchableOpacity>
          </View>
        ) : selectedOption === 'file' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('summarizePDF')}</Text>
            <Text style={styles.label}>{t('selectPDFFile')}</Text>
            <TouchableOpacity style={styles.fileButton} onPress={handleSelectPdf}>
              <Text style={styles.fileButtonText}>
                {selectedFile ? selectedFile.name : t('chooseFile')}
              </Text>
            </TouchableOpacity>
            {selectedFile && (
              <TouchableOpacity 
                style={styles.btnPrimary} 
                onPress={handlePdfSummary}
              >
                <Text style={styles.buttonText}>{t('generatePDFSummary')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.errorMessage}>{t('selectSummaryOption')}</Text>
          </View>
        )}

        {loading && <ActivityIndicator size="large" color="#AB51E3" style={styles.loadingIndicator} />}
        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        
        {/* Boîte de résumé avec boutons d'action intégrés */}
        {summary ? (
          <View style={styles.summaryBox}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>{t('summaryGenerated')}</Text>
              <View style={styles.summaryActions}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={copyToClipboard}
                >
                 <Feather name="copy" size={18} color="#AB51E3" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={shareResume}
                >
                 <Feather name="share-2" size={18} color="#AB51E3" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Header styles
  header: {
    backgroundColor: 'white',
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#6818A5',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    right: 15,
    bottom: 10,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    bottom: 10,
  },
  backButton: {
    position: 'absolute',
    right: 5,
    zIndex: 10,
    padding: 8,
    borderRadius: 8,
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
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  lengthSelector: {
    backgroundColor: '#f3e6fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    width: '100%',
    alignItems: 'center',
  },
  lengthLabel: {
    fontWeight: '500',
    color: '#6818A5',
    marginBottom: 6,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  radioButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#AB51E3',
    marginHorizontal: 6,
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    backgroundColor: '#AB51E3',
  },
  radioText: {
    color: '#AB51E3',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#fff',
  },
  section: {
    marginBottom: 24,
    width: '100%',
  },
  sectionTitle: {
    color: '#6818A5',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    minHeight: 90,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#AB51E3',
    padding: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#8B2FC9',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fileButton: {
    width: '100%',
    backgroundColor: '#f3e6fa',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#AB51E3',
  },
  fileButtonText: {
    color: '#AB51E3',
    fontWeight: 'bold',
  },
  errorMessage: {
    backgroundColor: '#ffeaea',
    color: '#d32f2f',
    borderRadius: 6,
    padding: 10,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  // Styles de la boîte de résumé avec actions
  summaryBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginTop: 18,
    width: '100%',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontWeight: 'bold',
    color: '#6818A5',
    fontSize: 16,
  },
  summaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#AB51E3',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryText: {
    color: '#333',
    fontSize: 15,
    lineHeight: 22,
  },
  loadingIndicator: {
    marginTop: 20,
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
    height: 270,
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
    borderColor: '#5A108F',
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
    backgroundColor: '#5A108F',
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
});

export default Resume;


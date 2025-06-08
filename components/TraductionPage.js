import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import SidebarTraduction from './SidebarTraduction';
import DetailTraduction from './DetailTraduction';
import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * Page principale de traduction qui gère l'intégration entre la sidebar et 
 * la page de détails
 */
const TraductionPage = ({ navigation }) => {
  // État pour stocker les traductions de l'historique
  const [histories, setHistories] = useState([]);
  // État pour stocker la traduction sélectionnée
  const [selectedTraduction, setSelectedTraduction] = useState(null);
  // État pour gérer l'affichage de la sidebar ou de la page de détail
  const [showSidebar, setShowSidebar] = useState(false);
  // État pour gérer l'affichage de la page de détail
  const [showDetail, setShowDetail] = useState(false);
  // État pour indiquer le chargement
  const [isLoading, setIsLoading] = useState(false);

  // Charger les traductions au chargement initial
  useEffect(() => {
    fetchHistories();
  }, []);

  // Simuler une récupération de l'historique depuis l'API
  const fetchHistories = async () => {
    try {
      setIsLoading(true);
      // Simule un appel API - remplacer par votre vrai appel API
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: [
              /* Données de test - à remplacer par vos vraies données */
              {
                id: 1,
                langue_source: 'fr',
                langue_cible: 'en',
                contenu_original: 'Bonjour, comment allez-vous ?',
                contenu_traduit: 'Hello, how are you?',
                date_creation: new Date().toISOString(),
                fichier_source: null
              },
              {
                id: 2,
                langue_source: 'en',
                langue_cible: 'fr',
                contenu_original: 'The weather is nice today.',
                contenu_traduit: 'Le temps est beau aujourd\'hui.',
                date_creation: new Date().toISOString(),
                fichier_source: null
              },
              {
                id: 3,
                langue_source: 'fr',
                langue_cible: 'es',
                contenu_original: 'J\'aimerais réserver une chambre d\'hôtel.',
                contenu_traduit: 'Me gustaría reservar una habitación de hotel.',
                date_creation: new Date().toISOString(),
                fichier_source: null
              },
              {
                id: 4,
                langue_source: 'en',
                langue_cible: 'fr',
                contenu_original: 'Annual Report 2024.docx',
                contenu_traduit: 'Rapport Annuel 2024.docx',
                date_creation: new Date().toISOString(),
                fichier_source: 'Annual Report 2024.docx'
              }
            ]
          });
        }, 1000);
      });
      
      setHistories(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      setIsLoading(false);
    }
  };

  // Simuler la récupération d'une traduction spécifique
  const handleSelectHistory = async (id) => {
    try {
      setIsLoading(true);
      // Simule un appel API - remplacer par votre vrai appel API
      const traduction = await new Promise(resolve => {
        setTimeout(() => {
          const found = histories.find(item => item.id === id);
          resolve(found);
        }, 500);
      });
      
      if (traduction) {
        setSelectedTraduction(traduction);
        // Fermer la sidebar et ouvrir la page de détail
        setShowSidebar(false);
        setShowDetail(true);
      }
      
      setIsLoading(false);
      return traduction;
    } catch (error) {
      console.error('Erreur lors de la récupération de la traduction:', error);
      setIsLoading(false);
      return null;
    }
  };

  // Gérer la création d'une nouvelle traduction
  const handleNewTranslation = () => {
    // Implémenter la logique pour commencer une nouvelle traduction
    console.log('Nouvelle traduction');
    // Fermer à la fois la sidebar et la page de détail
    setShowSidebar(false);
    setShowDetail(false);
  };

  // Gérer la fermeture de la sidebar
  const handleCloseSidebar = () => {
    setShowSidebar(false);
  };

  // Gérer la fermeture de la page de détail
  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedTraduction(null);
  };

  // Gérer l'ouverture de la sidebar
  const handleOpenSidebar = () => {
    setShowSidebar(true);
  };

  // Gérer la suppression d'une traduction
  const handleDeleteHistory = async (id) => {
    try {
      // Appel à l'API pour supprimer la traduction
      await axios.delete(`${API_BASE_URL}/traduction/traductions/${id}`);
      // Rafraîchir l'historique après la suppression
      fetchHistories();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Contenu principal de la page */}
      {!showDetail && (
        <View style={styles.mainContent}>
          {/* Votre interface principale de traduction ici */}
        </View>
      )}

      {/* Page de détail */}
      {showDetail && selectedTraduction && (
        <DetailTraduction 
          traduction={selectedTraduction} 
          onClose={handleCloseDetail}
          navigation={navigation}
        />
      )}
      
      {/* Sidebar */}
      {showSidebar && !showDetail && (
        <SidebarTraduction 
          histories={histories}
          onSelectHistory={handleSelectHistory}
          onNewTranslation={handleNewTranslation}
          onClose={handleCloseSidebar}
          onDeleteHistory={handleDeleteHistory}
          isLoadingHistories={isLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TraductionPage;
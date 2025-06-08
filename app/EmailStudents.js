{/*import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, ActivityIndicator, Alert, TextInput, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudents } from '../hooks/EmailHooks';
import CheckBox from 'expo-checkbox';

const EmailStudentsPage = () => {
  const { 
    students, 
    loading: studentsLoading, 
    error: studentsError, 
    selectedStudents, 
    selectAll: selectAllStudents,
    toggleSelectAll: toggleSelectAllStudents,
    toggleSelectStudent 
  } = useStudents();

  // État pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  
  // État pour gérer l'envoi d'emails directs et en masse
  const [directEmailSending, setDirectEmailSending] = useState(false);
  const [massEmailSending, setMassEmailSending] = useState(false);

  // Filtrer les données selon la recherche
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase().trim();
    return students.filter(item => 
      item.nom.toLowerCase().includes(query) ||
      item.prenom.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.id.toString().includes(query)
    );
  }, [students, searchQuery]);

  // Fonction pour récupérer le mot de passe d'un utilisateur depuis la base de données
  const fetchUserPassword = async (userId) => {
    try {
      const endpoint = `/api/students/${userId}/password`;
      const response = await fetch(`http://192.168.1.10:5000${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La réponse n\'est pas au format JSON');
      }
      const result = await response.json();
      if (response.ok && result.success) {
        return result.password;
      } else {
        throw new Error(result.message || 'Impossible de récupérer le mot de passe');
      }
    } catch (error) {
      throw error;
    }
  };

  // Fonction pour envoyer un email direct avec les informations de connexion de l'utilisateur
  const sendDirectEmail = async (user) => {
    setDirectEmailSending(true);
    try {
      const password = await fetchUserPassword(user.id);
      const emailData = {
        email: user.email,
        user_id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        password: password
      };
      const response = await fetch('http://192.168.1.10:5000/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        Alert.alert(
          "Succès",
          `Email envoyé avec succès à ${user.prenom} ${user.nom}`,
          [{ text: "OK" }]
        );
      } else {
        throw new Error(result.message || 'Échec de l\'envoi');
      }
    } catch (error) {
      Alert.alert(
        "Erreur d'envoi",
        `Impossible d'envoyer l'email à ${user.prenom} ${user.nom}: ${error.message}`,
        [{ text: "OK" }]
      );
    } finally {
      setDirectEmailSending(false);
    }
  };

  // Fonction pour envoyer des emails à tous les utilisateurs sélectionnés
  const sendMassEmail = async () => {
    if (selectedStudents.length === 0) {
      Alert.alert(
        "Erreur",
        "Veuillez sélectionner au moins un étudiant",
        [{ text: "OK" }]
      );
      return;
    }
    setMassEmailSending(true);
    try {
      let successCount = 0;
      let errors = [];
      const selectedUserDetails = students.filter(user => 
        selectedStudents.includes(user.id)
      );
      for (const user of selectedUserDetails) {
        try {
          const password = await fetchUserPassword(user.id);
          const emailData = {
            email: user.email,
            user_id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            password: password
          };
          const response = await fetch('http://192.168.1.10:5000/api/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData)
          });
          const result = await response.json();
          if (response.ok && result.success) {
            successCount++;
          } else {
            errors.push(`${user.prenom} ${user.nom}: ${result.message || 'Erreur inconnue'}`);
          }
        } catch (error) {
          errors.push(`${user.prenom} ${user.nom}: ${error.message}`);
        }
      }
      if (successCount === selectedUserDetails.length) {
        Alert.alert(
          "Succès",
          `Emails envoyés avec succès à ${successCount} étudiant(s)`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Résultat mixte",
          `${successCount} emails envoyés avec succès sur ${selectedUserDetails.length}.\n\nErreurs:\n${errors.join('\n')}`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Erreur",
        `Erreur lors de l'envoi en masse: ${error.message}`,
        [{ text: "OK" }]
      );
    } finally {
      setMassEmailSending(false);
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={[
      styles.tableRow,
      selectedStudents.includes(item.id) && styles.selectedRow
    ]}>
      <View style={styles.checkboxCell}>
        <CheckBox
          value={selectedStudents.includes(item.id)}
          onValueChange={() => toggleSelectStudent(item.id)}
          color={selectedStudents.includes(item.id) ? '#8B2FC9' : undefined}
        />
      </View>
      <Text style={[styles.tableCell, styles.idCell]}>{item.id}</Text>
      <Text style={[styles.tableCell, styles.nameCell]}>{item.nom}</Text>
      <Text style={[styles.tableCell, styles.nameCell]}>{item.prenom}</Text>
      <Text style={[styles.tableCell, styles.emailCell]}>{item.email}</Text>
      <View style={styles.actionCell}>
        <TouchableOpacity 
          onPress={() => sendDirectEmail(item)}
          style={[styles.actionButton, styles.sendButton]}
          disabled={directEmailSending}
        >
          {directEmailSending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="mail-outline" size={18} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (studentsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C5CE7" />
          <Text style={styles.loadingText}>
            Chargement des étudiants...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (studentsError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#e74c3c" />
          <Text style={styles.errorText}>
            Erreur lors du chargement des étudiants: {studentsError}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emails Étudiants</Text>
        <View style={styles.underline} />
        {/* Barre de recherche hors de la table 
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un étudiant..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {/* Afficher le nombre de résultats si une recherche est active 
        {searchQuery.trim() !== '' && (
          <Text style={styles.searchResults}>
            {filteredData.length} résultat(s) trouvé(s)
          </Text>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.toolbarContainer}>
          <TouchableOpacity
            style={[
              styles.massEmailButton,
              (selectedStudents.length === 0 || massEmailSending) && styles.disabledButton
            ]}
            onPress={sendMassEmail}
            disabled={selectedStudents.length === 0 || massEmailSending}
          >
            {massEmailSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="mail-outline" size={20} color="#FFF" />
            )}
            <Text style={styles.massEmailButtonText}>
              {massEmailSending 
                ? 'Envoi en cours...' 
                : `Envoyer aux sélectionnés (${selectedStudents.length})`
              }
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={styles.checkboxHeaderCell}>
              <CheckBox
                value={selectAllStudents}
                onValueChange={toggleSelectAllStudents}
                color={selectAllStudents ? '#6C5CE7' : undefined}
              />
              <Text style={styles.selectAllText}>Tout</Text>
            </View>
            <Text style={[styles.columnHeader, styles.idColumnHeader]}>ID</Text>
            <Text style={styles.columnHeader}>NOM</Text>
            <Text style={styles.columnHeader}>PRÉNOM</Text>
            <Text style={styles.columnHeader}>EMAIL</Text>
            <Text style={styles.columnHeader}>ACTION</Text>
          </View>

          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderUserItem}
            contentContainerStyle={styles.tableContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons name="mail-outline" size={48} color="#CCC" />
                <Text style={styles.emptyText}>
                  {searchQuery.trim() 
                    ? 'Aucun étudiant trouvé pour cette recherche' 
                    : 'Aucun étudiant disponible'
                  }
                </Text>
              </View>
            )}
          />

          <View style={styles.paginationContainer}>
            <Text style={styles.paginationInfo}>
              {filteredData.length} étudiant(s) affiché(s)
            </Text>
            <Text style={styles.selectedInfo}>
              {selectedStudents.length} sélectionné(s)
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};*/}
import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, ActivityIndicator, Alert, TextInput, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudents } from '../hooks/EmailHooks';
import { useLanguage } from './i18n';
import CheckBox from 'expo-checkbox';
import { useAuth } from '../contexts/AuthContext';


const EmailStudentsPage = () => {
  const { t } = useLanguage();
  
  
  const { 
    students, 
    loading: studentsLoading, 
    error: studentsError, 
    selectedStudents, 
    selectAll: selectAllStudents,
    toggleSelectAll: toggleSelectAllStudents,
    toggleSelectStudent 
  } = useStudents();

  // État pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  
  // État pour gérer l'envoi d'emails directs et en masse
  const [directEmailSending, setDirectEmailSending] = useState(false);
  const [massEmailSending, setMassEmailSending] = useState(false);
  const { isLoggedIn, user } = useAuth(); // ✅ AJOUTER ICI
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

  // Filtrer les données selon la recherche
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase().trim();
    return students.filter(item => 
      item.nom.toLowerCase().includes(query) ||
      item.prenom.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.id.toString().includes(query)
    );
  }, [students, searchQuery]);

  // Fonction pour récupérer le mot de passe d'un utilisateur depuis la base de données
  const fetchUserPassword = async (userId) => {
    try {
      const endpoint = `/api/students/${userId}/password`;
      const response = await fetch(`http://192.168.1.10:5000${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(t('responseNotJson'));
      }
      const result = await response.json();
      if (response.ok && result.success) {
        return result.password;
      } else {
        throw new Error(result.message || t('cannotRetrievePassword'));
      }
    } catch (error) {
      throw error;
    }
  };

  // Fonction pour envoyer un email direct avec les informations de connexion de l'utilisateur
  const sendDirectEmail = async (user) => {
    setDirectEmailSending(true);
    try {
      const password = await fetchUserPassword(user.id);
      const emailData = {
        email: user.email,
        user_id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        password: password
      };
      const response = await fetch('http://192.168.1.10:5000/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        Alert.alert(
          t('success'),
          `${t('emailSentSuccess')} ${user.prenom} ${user.nom}`,
          [{ text: t('ok') }]
        );
      } else {
        throw new Error(result.message || t('studentEmailSendError'));
      }
    } catch (error) {
      Alert.alert(
        t('error'),
        `${t('studentEmailSendError')} ${user.prenom} ${user.nom}: ${error.message}`,
        [{ text: t('ok') }]
      );
    } finally {
      setDirectEmailSending(false);
    }
  };

  // Fonction pour envoyer des emails à tous les utilisateurs sélectionnés
  const sendMassEmail = async () => {
    if (selectedStudents.length === 0) {
      Alert.alert(
        t('error'),
        t('selectAtLeastOneStudent'),
        [{ text: t('ok') }]
      );
      return;
    }
    setMassEmailSending(true);
    try {
      let successCount = 0;
      let errors = [];
      const selectedUserDetails = students.filter(user => 
        selectedStudents.includes(user.id)
      );
      for (const user of selectedUserDetails) {
        try {
          const password = await fetchUserPassword(user.id);
          const emailData = {
            email: user.email,
            user_id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            password: password
          };
          const response = await fetch('http://192.168.1.10:5000/api/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData)
          });
          const result = await response.json();
          if (response.ok && result.success) {
            successCount++;
          } else {
            errors.push(`${user.prenom} ${user.nom}: ${result.message || t('error')}`);
          }
        } catch (error) {
          errors.push(`${user.prenom} ${user.nom}: ${error.message}`);
        }
      }
      if (successCount === selectedUserDetails.length) {
        Alert.alert(
          t('success'),
          `${t('emailsSentToStudents')} ${successCount} ${t('studentsDisplayed')}`,
          [{ text: t('ok') }]
        );
      } else {
        Alert.alert(
          t('mixedResult'),
          `${successCount} ${t('emailsSent')} ${selectedUserDetails.length}.\n\n${t('errors')}\n${errors.join('\n')}`,
          [{ text: t('ok') }]
        );
      }
    } catch (error) {
      Alert.alert(
        t('error'),
        `${t('massEmailError')} ${error.message}`,
        [{ text: t('ok') }]
      );
    } finally {
      setMassEmailSending(false);
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={[
      styles.tableRow,
      selectedStudents.includes(item.id) && styles.selectedRow
    ]}>
      <View style={styles.checkboxCell}>
        <CheckBox
          value={selectedStudents.includes(item.id)}
          onValueChange={() => toggleSelectStudent(item.id)}
          color={selectedStudents.includes(item.id) ? '#8B2FC9' : undefined}
        />
      </View>
      {/*<Text style={[styles.tableCell, styles.idCell]}>{item.id}</Text>*/}
      <Text style={styles.idTableCell}>{item.id}</Text>
      <Text style={[styles.tableCell, styles.nameCell]}>{item.nom}</Text>
      <Text style={[styles.tableCell, styles.nameCell]}>{item.prenom}</Text>
      <Text style={[styles.tableCell, styles.emailCell]}>{item.email}</Text>
      <View style={styles.actionCell}>
        <TouchableOpacity 
          onPress={() => sendDirectEmail(item)}
          style={[styles.actionButton, styles.sendButton]}
          disabled={directEmailSending}
        >
          {directEmailSending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="mail-outline" size={18} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (studentsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C5CE7" />
          <Text style={styles.loadingText}>
            {t('loadingStudents')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (studentsError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#e74c3c" />
          <Text style={styles.errorText}>
            {t('errorLoadingStudents')} {studentsError}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.header}>
        {/*<Text style={styles.headerTitle}>{t('emailStudents')}</Text>
        <View style={styles.underline} />*/}
        {/* Barre de recherche hors de la table */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchStudent')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {/* Afficher le nombre de résultats si une recherche est active */}
        {searchQuery.trim() !== '' && (
          <Text style={styles.searchResults}>
            {filteredData.length} {t('resultsFound')}
          </Text>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.toolbarContainer}>
          <TouchableOpacity
            style={[
              styles.massEmailButton,
              (selectedStudents.length === 0 || massEmailSending) && styles.disabledButton
            ]}
            onPress={sendMassEmail}
            disabled={selectedStudents.length === 0 || massEmailSending}
          >
            {massEmailSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="mail-outline" size={20} color="#FFF" />
            )}
            <Text style={styles.massEmailButtonText}>
              {massEmailSending 
                ? t('sending') 
                : `${t('sendToSelectedStudents')} (${selectedStudents.length})`
              }
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={styles.checkboxHeaderCell}>
              <CheckBox
                value={selectAllStudents}
                onValueChange={toggleSelectAllStudents}
                color={selectAllStudents ? '#6C5CE7' : undefined}
              />
              {/*<Text style={styles.selectAllText}>{t('selectAll')}</Text>*/}
            </View>
            <Text style={[styles.columnHeader, styles.idColumnHeader]}>{t('id')}</Text>
            <Text style={styles.columnHeader}>{t('lastName')}</Text>
            <Text style={styles.columnHeader}>{t('firstName')}</Text>
            <Text style={styles.columnHeader}>{t('email')}</Text>
            <Text style={styles.columnHeader}>{t('action')}</Text>
          </View>
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderUserItem}
            contentContainerStyle={styles.tableContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons name="mail-outline" size={48} color="#CCC" />
                <Text style={styles.emptyText}>
                  {searchQuery.trim() 
                    ? t('noStudentsFound')
                    : t('noStudentsAvailable')
                  }
                </Text>
              </View>
            )}
          />

          <View style={styles.paginationContainer}>
            <Text style={styles.paginationInfo}>
              {filteredData.length} 
              {t('studentsDisplayed')}
            </Text>
            <Text style={styles.selectedInfo}>
              {selectedStudents.length} {t('selected')}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
      );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6818a5',
  },
  underline: {
    height: 3,
    width: 100,
    backgroundColor: '#6818a5',
    marginTop: 8,
    borderRadius: 2,
    marginBottom: 16,
  },
  searchContainer: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  searchIcon: {
    marginLeft: 16,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#32325D',
  },
  searchResults: {
    fontSize: 14,
    color: '#6C5CE7',
    marginTop: 6,
    fontStyle: 'italic',
    fontWeight: '500',
    alignSelf: 'flex-start',
  },
  toolbarContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  massEmailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B2FC9',
    paddingHorizontal: 20,
    borderRadius: 10,
    height: 50,
  },
  disabledButton: {
    backgroundColor: '#B39DDB',
  },
  massEmailButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tableHeader: {
  flexDirection: 'row',
  backgroundColor: '#6818a5', // Changé de '#F5F6FA' vers '#6818a5'
  paddingVertical: 16,
  paddingHorizontal: 12, // Changé de 5 vers 12
  borderBottomWidth: 1,
  borderBottomColor: '#EAEDF2',
  alignItems: 'center',
},
  checkboxHeaderCell: {
  flex: 0.5, // Changé de width: 60 vers flex: 0.5
  flexDirection: 'row',
  alignItems: 'center',
},

selectAllText: {
  marginLeft: 8,
  color: '#FFF', // Changé de '#5A108F' vers '#FFF'
  fontWeight: '600',
  fontSize: 12,
},
  
idColumnHeader: {
  flex: 0.5, // Changé de width: 30 vers flex: 0.5
  color: '#FFF', // Ajouté
  fontWeight: '700', // Ajouté
  fontSize: 14, // Changé de 11 vers 14
  textAlign: 'center', // Ajouté
},
columnHeader: {
  flex: 1,
  color: '#FFF', // Changé de '#4F566B' vers '#FFF'
  fontWeight: '700',
  fontSize: 14, // Changé de 11 vers 14
  textAlign: 'center', // Ajouté
},
  tableContent: {
    paddingBottom: 20,
  },
  
tableRow: {
  flexDirection: 'row',
  paddingVertical: 16,
  paddingHorizontal: 12, // Changé de 0.5 vers 12
  borderBottomWidth: 1,
  borderBottomColor: '#F0F2F5', // Changé de '#F5F6FA' vers '#F0F2F5'
  alignItems: 'center',
},
  selectedRow: {
    backgroundColor: '#F3E5F5',
  },
  
checkboxCell: {
  flex: 0.5, // Changé de width: 60 vers flex: 0.5
  flexDirection: 'row',
  alignItems: 'center',
},

idTableCell: { // Nouveau style pour la cellule ID
  flex: 0.5,
  fontSize: 14,
  color: '#4F566B',
  textAlign: 'center',
  fontWeight: '600',
},
 
tableCell: {
  flex: 1,
  fontSize: 14, // Changé de 13 vers 14
  color: '#32325D',
  textAlign: 'center', // Ajouté
  fontWeight: '500', // Ajouté
   paddingLeft: 10, // Ajouté pour décaler l'icône vers la droite
},

actionCell: {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  paddingLeft: 10, // Ajouté pour décaler l'icône vers la droite
},
  idCell: {
    width: 50,
    textAlign: 'center',
  },
  nameCell: {
    flex: 1,
  },
  emailCell: {
    flex: 1.5,
  },
  actionCell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#8B2FC9',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F6FA',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#5A108F',
  },
  selectedInfo: {
    fontSize: 15,
    color: '#5A108F',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#8792A2',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EmailStudentsPage;
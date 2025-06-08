import React, { memo, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Modal, 
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminUsers } from '../hooks/HooksAdmin';
import { useImportUsers } from '../hooks/HooksImport';
import { useLanguage } from './i18n';
import { useAuth } from '../contexts/AuthContext';

// Modal d'import Excel complète
const ImportModal = memo(({ 
  isVisible, 
  onClose, 
  selectedFile, 
  onSelectFile, 
  onImport, 
  importLoading, 
  importResult, 
  importError
}) => {
  const { t } = useLanguage();

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.importModalContainer}>
          <View style={styles.importModalHeader}>
            <Text style={styles.importModalTitle}>
              {t('importEnseignants') || 'Importer des enseignants'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.importModalBody} showsVerticalScrollIndicator={false}>
            {/* Section sélection fichier */}
            <View style={styles.fileSection}>
              <Text style={styles.sectionTitle}>
                {t('selectFile') || 'Sélectionner le fichier Excel'}
              </Text>
              
              <TouchableOpacity 
                style={[styles.fileButton, selectedFile && styles.fileButtonSelected]} 
                onPress={onSelectFile}
                activeOpacity={0.7}
              >
                <View style={styles.fileButtonContent}>
                  <Ionicons 
                    name={selectedFile ? "document-text" : "cloud-upload-outline"} 
                    size={24} 
                    color={selectedFile ? "#27AE60" : "#8B2FC9"} 
                  />
                  <Text style={[styles.fileButtonText, selectedFile && styles.fileButtonTextSelected]}>
                    {selectedFile 
                      ? `${t('fileSelected') || 'Fichier sélectionné'}: ${selectedFile.name}`
                      : (t('chooseExcelFile') || 'Choisir un fichier Excel')
                    }
                  </Text>
                </View>
              </TouchableOpacity>

              {selectedFile && (
                <View style={styles.fileInfo}>
                  <View style={styles.fileInfoRow}>
                    <Ionicons name="document" size={16} color="#27AE60" />
                    <Text style={styles.fileInfoText}>
                      {selectedFile.name}
                    </Text>
                  </View>
                  <View style={styles.fileInfoRow}>
                    <Ionicons name="information-circle" size={16} color="#27AE60" />
                    <Text style={styles.fileInfoText}>
                      {t('fileSize') || 'Taille'}: {(selectedFile.size / 1024).toFixed(2)} KB
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Affichage des erreurs */}
            {importError && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#E74C3C" />
                <View style={styles.messageContent}>
                  <Text style={styles.errorTitle}>Erreur</Text>
                  <Text style={styles.errorText}>{importError}</Text>
                </View>
              </View>
            )}

            {/* Résultats d'import */}
            {importResult && (
              <View style={[
                styles.resultContainer, 
                importResult.success ? styles.successContainer : styles.errorResultContainer
              ]}>
                <Ionicons 
                  name={importResult.success ? "checkmark-circle" : "alert-circle"} 
                  size={20} 
                  color={importResult.success ? "#27AE60" : "#E74C3C"} 
                />
                <View style={styles.messageContent}>
                  <Text style={[
                    styles.resultTitle,
                    importResult.success ? styles.successTitle : styles.errorTitle
                  ]}>
                    {importResult.success ? 'Succès' : 'Erreur'}
                  </Text>
                  <Text style={[
                    styles.resultText, 
                    importResult.success ? styles.successText : styles.errorText
                  ]}>
                    {importResult.message}
                  </Text>
                  
                  {importResult.success && importResult.totalProcessed && (
                    <View style={styles.statsContainer}>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Total traité:</Text>
                        <Text style={styles.statValue}>{importResult.totalProcessed}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Créés avec succès:</Text>
                        <Text style={styles.statValue}>{importResult.totalCreated}</Text>
                      </View>
                      {importResult.totalFailed > 0 && (
                        <View style={styles.statRow}>
                          <Text style={styles.statLabel}>Échecs:</Text>
                          <Text style={styles.statValueError}>{importResult.totalFailed}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.importModalFooter}>
            <TouchableOpacity 
              style={styles.importCancelButton} 
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.importCancelButtonText}>
                {t('cancel') || 'Annuler'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.importButton, 
                (!selectedFile || importLoading) && styles.disabledButton
              ]} 
              onPress={onImport}
              disabled={!selectedFile || importLoading}
              activeOpacity={0.7}
            >
              {importLoading ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.importButtonText}>
                    {t('importing') || 'Importation...'}
                  </Text>
                </View>
              ) : (
                <View style={styles.importButtonContent}>
                  <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
                  <Text style={styles.importButtonText}>
                    {t('import') || 'Importer'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

// Modal de formulaire enseignant
const TeacherFormModal = memo(({ 
  isVisible, 
  onClose, 
  onSubmit, 
  title, 
  submitText, 
  formData, 
  handleInputChange, 
  error 
}) => {
  const { t } = useLanguage();

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#E74C3C" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <View>
              <Text style={styles.label}>{t('name') || 'Nom'}</Text>
              <TextInput
                style={styles.input}
                value={formData.nom}
                onChangeText={(text) => handleInputChange('nom', text)}
                placeholder={t('namePlaceholder') || 'Entrez le nom'}
              />
            </View>
            
            <View>
              <Text style={styles.label}>{t('firstName') || 'Prénom'}</Text>
              <TextInput
                style={styles.input}
                value={formData.prenom}
                onChangeText={(text) => handleInputChange('prenom', text)}
                placeholder={t('firstNamePlaceholder') || 'Entrez le prénom'}
              />
            </View>
            
            <View>
              <Text style={styles.label}>{t('email') || 'Email'}</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholder={t('emailPlaceholder') || 'Entrez l\'email'}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View>
              <Text style={styles.label}>{t('password') || 'Mot de passe'}</Text>
              <TextInput
                style={styles.input}
                value={formData.mot_de_passe}
                onChangeText={(text) => handleInputChange('mot_de_passe', text)}
                placeholder={t('passwordPlaceholder') || 'Entrez le mot de passe'}
                secureTextEntry
              />
            </View>
            
            <View>
              <Text style={styles.label}>
                {t('confirmPassword') || 'Confirmer le mot de passe'}
              </Text>
              <TextInput
                style={styles.input}
                value={formData.confirm_mot_de_passe}
                onChangeText={(text) => handleInputChange('confirm_mot_de_passe', text)}
                placeholder={t('confirmPasswordPlaceholder') || 'Confirmez le mot de passe'}
                secureTextEntry
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>
                {t('cancel') || 'Annuler'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={onSubmit}
              activeOpacity={0.7}
            >
              <Text style={styles.submitButtonText}>{submitText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

// Élément de la liste des enseignants
const TeacherItem = memo(({ item, openEditModal, handleDeleteUser }) => {
  const { t } = useLanguage();
  
  return (
    <View style={styles.tableRow}>
      <Text style={styles.idTableCell}>{item.id}</Text>
      <Text style={styles.tableCell}>{item.nom}</Text>
      <Text style={styles.tableCell}>{item.prenom}</Text>
      <View style={styles.actionCell}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={() => openEditModal(item)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={18} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            Alert.alert(
              t('confirmation') || 'Confirmation',
              t('deleteTeacherConfirmation') || 'Êtes-vous sûr de vouloir supprimer cet enseignant ?',
              [
                {
                  text: t('cancel') || 'Annuler',
                  style: 'cancel'
                },
                {
                  text: t('delete') || 'Supprimer',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await handleDeleteUser(item.id);
                      Alert.alert(
                        t('success') || 'Succès',
                        t('teacherDeleted') || 'L\'enseignant a été supprimé avec succès.',
                        [{ text: t('ok') || 'OK' }]
                      );
                    } catch (error) {
                      Alert.alert(
                        t('error') || 'Erreur',
                        t('teacherDeleteError') || 'Une erreur est survenue lors de la suppression de l\'enseignant.',
                        [{ text: t('ok') || 'OK' }]
                      );
                    }
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Composant principal
const AdminTeachers = () => {
  const { t } = useLanguage();
  const { isLoggedIn, user, logout } = useAuth();

  // Hook pour les utilisateurs existants (false = enseignants)
  const {
    currentPageUsers,
    searchQuery,
    currentPage,
    isAddModalVisible,
    isEditModalVisible,
    formData,
    setSearchQuery,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
    handleInputChange,
    goToPage,
    totalPages,
    fetchUsers,
    error
  } = useAdminUsers(false);

  // Hook pour l'import
  const {
    isImportModalVisible,
    importLoading,
    importResult,
    selectedFile,
    importError,
    openImportModal,
    closeImportModal,
    selectFile,
    importUsers
  } = useImportUsers();

  useEffect(() => {
    if (importResult && importResult.success) {
      // Rafraîchir immédiatement la liste des utilisateurs
      if (typeof fetchUsers === 'function') {
        fetchUsers();
      }
      
      // Optionnel : Fermer automatiquement le modal après 2 secondes
      const timer = setTimeout(() => {
        closeImportModal();
      }, 600000);
      
      return () => clearTimeout(timer);
    }
  }, [importResult, fetchUsers, closeImportModal]);

  const renderTeacherItem = ({ item }) => (
    <TeacherItem 
      item={item} 
      openEditModal={openEditModal} 
      handleDeleteUser={handleDeleteUser} 
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <View style={styles.header}>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchTeacher') || 'Rechercher un enseignant...'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.toolbarContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.importActionButton} 
              onPress={openImportModal}
              activeOpacity={0.7}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
              <Text style={styles.buttonText}>
                {t('import') || 'Importer Excel'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={openAddModal}
              activeOpacity={0.7}
            >
              <Ionicons name="add-outline" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>
                {t('addTeacher') || 'Ajouter enseignant'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.idColumnHeader}>{t('id') || 'ID'}</Text>
            <Text style={styles.columnHeader}>{t('lastName') || 'Nom'}</Text>
            <Text style={styles.columnHeader}>{t('firstName') || 'Prénom'}</Text>
            <Text style={styles.columnHeader}>{t('actions') || 'Actions'}</Text>
          </View>
          
          <FlatList
            data={currentPageUsers}
            renderItem={renderTeacherItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.tableContent}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.paginationContainer}>
            <Text style={styles.paginationInfo}>
              {currentPageUsers.length} {t('teachersDisplayed') || 'enseignants affichés'}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Modal d'ajout d'enseignant */}
      <TeacherFormModal
        isVisible={isAddModalVisible}
        onClose={closeAddModal}
        onSubmit={handleAddUser}
        title={t('addTeacherTitle') || 'Ajouter un enseignant'}
        submitText={t('add') || 'Ajouter'}
        formData={formData}
        handleInputChange={handleInputChange}
        error={error}
      />
      
      {/* Modal de modification d'enseignant */}
      <TeacherFormModal
        isVisible={isEditModalVisible}
        onClose={closeEditModal}
        onSubmit={handleUpdateUser}
        title={t('editTeacherTitle') || 'Modifier l\'enseignant'}
        submitText={t('update') || 'Mettre à jour'}
        formData={formData}
        handleInputChange={handleInputChange}
        error={error}
      />

      {/* Modal d'import */}
      <ImportModal
        isVisible={isImportModalVisible}
        onClose={closeImportModal}
        selectedFile={selectedFile}
        onSelectFile={selectFile}
        onImport={importUsers}
        importLoading={importLoading}
        importResult={importResult}
        importError={importError}
      />
    </SafeAreaView>
  );
};

// Styles
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
  /* headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6818a5',
    marginBottom: 8,
  },
  underline: {
    height: 3,
    width: 100,
    backgroundColor: '#6818a5',
    marginBottom: 20,
    borderRadius: 2,
  },*/
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
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  toolbarContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  importActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    paddingHorizontal: 20,
    borderRadius: 10,
    height: 50,
    marginRight: 12,
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B2FC9',
    paddingHorizontal: 20,
    borderRadius: 10,
    height: 50,
    flex: 1,
  },
  toolbarContainer: {
    alignItems: 'stretch', // Changez de 'flex-end' à 'stretch'
    marginBottom:20,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
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
  alignItems: 'flex-start', // Ajouté
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F6FA',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEDF2',
  },
  idColumnHeader: {
    fontWeight: '700',
    fontSize: 12,
    color: '#4F566B',
    width: 50,
  },
  columnHeader: {
    fontWeight: '700',
    fontSize: 11,
    color: '#4F566B',
    flex: 1,
  },
 tableContent: {
  paddingBottom: 20,
  alignItems: 'flex-start', // Ajoute cette ligne
},
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6FA',
    alignItems: 'center',
  },
  idTableCell: {
    width: 50,
    fontSize: 15,
    color: '#32325D',
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: '#32325D',
    textAlign: 'left',
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
    marginRight: 10,
  },
  editButton: {
    backgroundColor: '#8B2FC9',
  },
  deleteButton: {
    backgroundColor: '#5A108F',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F6FA',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#5A108F',
  },
  
  // STYLES POUR LES MODALS D'AJOUT/EDIT (design du paste.txt)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F3F7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#32325D',
  },
  modalBody: {
    padding: 15,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F2F3F7',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F566B',
    marginBottom: 6,
  },
  input: {
    height: 50,
    backgroundColor: '#F8F9FC',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#32325D',
  },
  cancelButton: {
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    marginRight: 12,
  },
  cancelButtonText: {
    fontWeight: '600',
    color: '#4F566B',
  },
  submitButton: {
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6C5CE7',
  },
  submitButtonText: {
    fontWeight: '600',
    color: '#FFF',
  },

  // STYLES SPECIFIQUES POUR LE MODAL D'IMPORT (garde son design actuel)
  importModalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '95%',
    maxHeight: '100%',
    minHeight: 300,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  importModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEDF2',
    backgroundColor: '#F8F9FC',
  },
  importCancelButton: {
  flex: 1,
  backgroundColor: '#E1E8ED', // light grey
  borderRadius: 10,
  paddingVertical: 14,
  alignItems: 'center',
  marginRight: 8,
},
importCancelButtonText: {
  color: '#4F566B',
  fontWeight: '600',
  fontSize: 16,
},
  importModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#32325D',
  },
  importModalBody: {
    padding: 15,
    maxHeight: 400,
  },
 // Pour les boutons du modal d'import (import/cancel)
importModalFooter: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: 20,
  borderTopWidth: 1,
  borderTopColor: '#EAEDF2',
  backgroundColor: '#F8F9FC',
},
  fileSection: {
    marginBottom: 24,

  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#32325D',
    marginBottom: 12,
  },
  fileButton: {
    backgroundColor: '#F8F9FC',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E1E8ED',
    borderStyle: 'dashed',
  },
  fileButtonSelected: {
    backgroundColor: '#E8F5E8',
    borderColor: '#27AE60',
    borderStyle: 'solid',
  },
  fileButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileButtonText: {
    color: '#8B2FC9',
    fontWeight: '600',
    marginLeft: 12,
    fontSize: 16,
  },
  fileButtonTextSelected: {
    color: '#27AE60',
  },
  fileInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fileInfoText: {
    fontSize: 14,
    color: '#27AE60',
    marginLeft: 8,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEAEA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  errorResultContainer: {
    backgroundColor: '#FFEAEA',
    borderLeftColor: '#E74C3C',
  },
  successContainer: {
    backgroundColor: '#E8F5E8',
    borderLeftColor: '#27AE60',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 4,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    lineHeight: 20,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  
},
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
  successText: {
    color: '#27AE60',
  },
  statsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#4F566B',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '600',
  },
  statValueError: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
  },
  // Boutons du modal
  cancelButton: {
    flex: 1,
    backgroundColor: '#E1E8ED',
    borderRadius: 10,
    paddingVertical: 14,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4F566B',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#8B2FC9',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
 importButton: {
  flex: 1,
  backgroundColor: '#27AE60',
  borderRadius: 10,
  paddingVertical: 14,
  alignItems: 'center',
  
},
  importButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  importButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Formulaire
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#32325D',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FC',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#32325D',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  
  // Styles du tableau
  tableContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#6818a5',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  idColumnHeader: {
    flex: 0.5,
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  columnHeader: {
    flex: 1,
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  tableContent: {
    flexGrow: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    alignItems: 'center',
  },
  idTableCell: {
    flex: 0.5,
    fontSize: 14,
    color: '#4F566B',
    textAlign: 'center',
    fontWeight: '600',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#32325D',
    textAlign: 'center',
    fontWeight: '500',
  },
  actionCell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#3498DB',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  
  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FC',
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#4F566B',
    fontWeight: '500',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#E1E8ED',
  },
  activePageButton: {
    backgroundColor: '#8B2FC9',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#4F566B',
    fontWeight: '600',
  },
  activePageButtonText: {
    color: '#FFF',
  },
  
  // États de chargement et vides
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4F566B',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#32325D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#4F566B',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Styles pour les alertes et confirmations
  alertContainer: {
    backgroundColor: '#FFF5E6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E67E22',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#D68910',
    lineHeight: 20,
  },
  
  // Styles pour les badges et statuts
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  inactiveBadge: {
    backgroundColor: '#FFEAEA',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeStatusText: {
    color: '#27AE60',
  },
  inactiveStatusText: {
    color: '#E74C3C',
  },
  
  // Styles pour les tooltips et info bulles
  tooltipContainer: {
    position: 'absolute',
    backgroundColor: '#32325D',
    padding: 8,
    borderRadius: 6,
    maxWidth: 200,
    zIndex: 1000,
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
  },
  tooltipArrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#32325D',
  },
  
  // Styles pour les sections pliables
  collapsibleSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FC',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  collapsibleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#32325D',
  },
  collapsibleContent: {
    padding: 16,
  },
  filterContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F566B',
    marginRight: 12,
    minWidth: 80,
  },
  filterInput: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#32325D',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  bulkActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  bulkActionsText: {
    flex: 1,
    fontSize: 14,
    color: '#2980B9',
    fontWeight: '500',
  },
  bulkActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  bulkDeleteButton: {
    backgroundColor: '#E74C3C',
  },
  bulkActionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
export default AdminTeachers;
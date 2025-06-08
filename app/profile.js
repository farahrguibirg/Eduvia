{/*import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const Profile = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur ton profil</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'center',
  },
});

export default Profile;*/}

// UserProfile.js
{/*import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useProfileImage } from '../hooks/UserHooks';

const UserProfile = ({ userId, onLogout }) => {
  const { 
    user, 
    loading: userLoading, 
    error: userError,
    updatePassword,
    passwordUpdateLoading,
    passwordUpdateError,
    passwordUpdateSuccess
  } = useUser(userId);
  
  const { 
    imageUrl, 
    uploadImage, 
    updateImage,
    deleteImage,
    loading: imageLoading, 
    error: imageError,
    refreshImageUrl
  } = useProfileImage(userId);
  
  const [imageActionVisible, setImageActionVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Fonction pour sélectionner une image depuis la galerie
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin des permissions pour accéder à vos photos!');
        return;
      }
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Image sélectionnée:', JSON.stringify(result.assets[0], null, 2));
        
        if (imageUrl) {
          updateImage(result.assets[0]);
        } else {
          uploadImage(result.assets[0]);
        }
        setImageActionVisible(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image: ' + error.message);
    }
  };

  // Fonction pour prendre une photo avec la caméra
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin des permissions pour accéder à votre caméra!');
        return;
      }
      
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (imageUrl) {
          updateImage(result.assets[0]);
        } else {
          uploadImage(result.assets[0]);
        }
        setImageActionVisible(false);
      }
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre une photo');
    }
  };

  // Fonction pour supprimer l'image de profil
  const handleDeleteImage = () => {
    Alert.alert(
      'Supprimer la photo de profil',
      'Êtes-vous sûr de vouloir supprimer votre photo de profil ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteImage();
              setImageActionVisible(false);
            } catch (error) {
              console.error('Erreur lors de la suppression de l\'image:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'image: ' + error.message);
            }
          }
        }
      ]
    );
  };

  // Fonction pour réinitialiser le formulaire de mot de passe
  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordVisible(false);
  };

  // Fonction pour gérer la mise à jour du mot de passe
  const handlePasswordUpdate = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert('Erreur', 'Tous les champs sont obligatoires');
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
        return;
      }

      const success = await updatePassword(currentPassword, newPassword, confirmPassword);
      
      if (success) {
        Alert.alert(
          'Succès', 
          'Votre mot de passe a été mis à jour avec succès', 
          [{ text: 'OK', onPress: () => {
            resetPasswordForm();
            setPasswordModalVisible(false);
          }}]
        );
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le mot de passe');
    }
  };

  if (userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={styles.loadingText}>Chargement des informations utilisateur...</Text>
      </View>
    );
  }

  if (userError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur: {userError}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.notFoundText}>Utilisateur non trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => setImageActionVisible(true)}
        >
          {imageLoading ? (
            <View style={styles.avatar}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.avatar} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {user.prenom && user.nom ? user.prenom[0] + user.nom[0] : "?"}
              </Text>
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Ionicons name="camera" size={16} color="#ffffff" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.verticalSpace} />
        
        <View style={styles.userInfo}>
          <View style={styles.inputField}>
            <Ionicons name="person-outline" size={20} color="#666666" style={styles.inputIcon} />
            <Text style={styles.inputLabel}>Prénom</Text>
            <Text style={styles.inputValue}>{user.prenom}</Text>
          </View>
          
          <View style={styles.inputField}>
            <Ionicons name="person-outline" size={20} color="#666666" style={styles.inputIcon} />
            <Text style={styles.inputLabel}>Nom</Text>
            <Text style={styles.inputValue}>{user.nom}</Text>
          </View>
          
          <View style={styles.inputField}>
            <Ionicons name="mail-outline" size={20} color="#666666" style={styles.inputIcon} />
            <Text style={styles.inputLabel}>E-Mail</Text>
            <Text style={styles.inputValue}>{user.email}</Text>
          </View>

          <TouchableOpacity 
            style={styles.passwordButton}
            onPress={() => setPasswordModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-closed-outline" size={18} color="#1E90FF" />
            <Text style={styles.passwordButtonText}>Modifier le mot de passe</Text>
          </TouchableOpacity>
          {/*}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            {<Ionicons name="log-out-outline" size={18} color="#ffffff" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={imageActionVisible}
        onRequestClose={() => setImageActionVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setImageActionVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Photo de profil</Text>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={pickImage}
            >
              <Ionicons name="images-outline" size={22} color="#1E90FF" />
              <Text style={styles.modalButtonText}>Choisir depuis la galerie</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={takePhoto}
            >
              <Ionicons name="camera-outline" size={22} color="#1E90FF" />
              <Text style={styles.modalButtonText}>Prendre une photo</Text>
            </TouchableOpacity>
            
            {imageUrl && (
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteImage}
              >
                <Ionicons name="trash-outline" size={22} color="#e74c3c" />
                <Text style={styles.deleteButtonText}>Supprimer la photo</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setImageActionVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => {
          resetPasswordForm();
          setPasswordModalVisible(false);
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            resetPasswordForm();
            setPasswordModalVisible(false);
          }}
        >
          <View style={styles.passwordModalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Modifier le mot de passe</Text>
            
            <View style={styles.passwordInputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666666" style={styles.passwordInputIcon} />
              <TextInput
                style={styles.passwordInput}
                placeholder="Mot de passe actuel"
                secureTextEntry={!passwordVisible}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholderTextColor="#999999"
              />
              <TouchableOpacity 
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={passwordVisible ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666666" 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.passwordInputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666666" style={styles.passwordInputIcon} />
              <TextInput
                style={styles.passwordInput}
                placeholder="Nouveau mot de passe"
                secureTextEntry={!passwordVisible}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor="#999999"
              />
            </View>
            
            <View style={styles.passwordInputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666666" style={styles.passwordInputIcon} />
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirmer le nouveau mot de passe"
                secureTextEntry={!passwordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#999999"
              />
            </View>
            
            {passwordUpdateError && (
              <Text style={styles.passwordErrorText}>{passwordUpdateError}</Text>
            )}
            
            <View style={styles.passwordButtonGroup}>
              <TouchableOpacity 
                style={styles.confirmPasswordButton}
                onPress={handlePasswordUpdate}
                disabled={passwordUpdateLoading}
              >
                {passwordUpdateLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmPasswordText}>Confirmer</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelPasswordButton}
                onPress={() => {
                  resetPasswordForm();
                  setPasswordModalVisible(false);
                }}
                disabled={passwordUpdateLoading}
              >
                <Text style={styles.cancelPasswordText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {imageError && (
        <View style={styles.imageErrorContainer}>
          <Text style={styles.imageErrorText}>{imageError}</Text>
        </View>
      )}
    </ScrollView>
  );
};*/}{/*
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useProfileImage } from '../hooks/UserHooks';
import { useLanguage } from './i18n';
import { useAuth } from '../context/AuthContext'; 

const UserProfile = ({ userId, onLogout }) => {
  const { t } = useLanguage();
  const { user: authUser, logout } = useAuth();
  const userId = authUser?.id || authUser?.user_id; // Adaptez selon la structure de vos données
  
  const { 
    user, 
    loading: userLoading, 
    error: userError,
    updatePassword,
    passwordUpdateLoading,
    passwordUpdateError,
    passwordUpdateSuccess
  } = useUser(userId);
  
  const { 
    imageUrl, 
    uploadImage, 
    updateImage,
    deleteImage,
    loading: imageLoading, 
    error: imageError,
    refreshImageUrl
  } = useProfileImage(userId);
  
  const [imageActionVisible, setImageActionVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Fonction pour sélectionner une image depuis la galerie
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(t('permissionDenied'), t('galleryPermissionNeeded'));
        return;
      }
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Image sélectionnée:', JSON.stringify(result.assets[0], null, 2));
        
        if (imageUrl) {
          updateImage(result.assets[0]);
        } else {
          uploadImage(result.assets[0]);
        }
        setImageActionVisible(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert(t('error'), t('imageSelectionError') + ': ' + error.message);
    }
  };

  // Fonction pour prendre une photo avec la caméra
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(t('permissionDenied'), t('cameraPermissionNeeded'));
        return;
      }
      
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (imageUrl) {
          updateImage(result.assets[0]);
        } else {
          uploadImage(result.assets[0]);
        }
        setImageActionVisible(false);
      }
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      Alert.alert(t('error'), t('photoTakingError'));
    }
  };

  // Fonction pour supprimer l'image de profil
  const handleDeleteImage = () => {
    Alert.alert(
      t('deleteProfilePhoto'),
      t('deletePhotoConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteImage();
              setImageActionVisible(false);
            } catch (error) {
              console.error('Erreur lors de la suppression de l\'image:', error);
              Alert.alert(t('error'), t('imageDeleteError') + ': ' + error.message);
            }
          }
        }
      ]
    );
  };

  // Fonction pour réinitialiser le formulaire de mot de passe
  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordVisible(false);
  };

  // Fonction pour gérer la mise à jour du mot de passe
  const handlePasswordUpdate = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert(t('error'), t('allFieldsRequired'));
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert(t('error'), t('passwordsDontMatch'));
        return;
      }

      const success = await updatePassword(currentPassword, newPassword, confirmPassword);
      
      if (success) {
        Alert.alert(
          t('success'), 
          t('passwordUpdateSuccess'), 
          [{ text: t('ok'), onPress: () => {
            resetPasswordForm();
            setPasswordModalVisible(false);
          }}]
        );
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      Alert.alert(t('error'), error.message || t('passwordUpdateError'));
    }
  };

  if (userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={styles.loadingText}>{t('loadingUserInfo')}</Text>
      </View>
    );
  }

  if (userError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('error')}: {userError}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.notFoundText}>{t('userNotFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => setImageActionVisible(true)}
        >
          {imageLoading ? (
            <View style={styles.avatar}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.avatar} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {user.prenom && user.nom ? user.prenom[0] + user.nom[0] : "?"}
              </Text>
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Ionicons name="camera" size={16} color="#ffffff" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.verticalSpace} />
        
        <View style={styles.userInfo}>
          <View style={styles.inputField}>
            <Ionicons name="person-outline" size={20} color="#666666" style={styles.inputIcon} />
            <Text style={styles.inputLabel}>{t('firstName')}</Text>
            <Text style={styles.inputValue}>{user.prenom}</Text>
          </View>
          
          <View style={styles.inputField}>
            <Ionicons name="person-outline" size={20} color="#666666" style={styles.inputIcon} />
            <Text style={styles.inputLabel}>{t('lastName')}</Text>
            <Text style={styles.inputValue}>{user.nom}</Text>
          </View>
          
          <View style={styles.inputField}>
            <Ionicons name="mail-outline" size={20} color="#666666" style={styles.inputIcon} />
            <Text style={styles.inputLabel}>{t('email')}</Text>
            <Text style={styles.inputValue}>{user.email}</Text>
          </View>

          <TouchableOpacity 
            style={styles.passwordButton}
            onPress={() => setPasswordModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-closed-outline" size={18} color="#1E90FF" />
            <Text style={styles.passwordButtonText}>{t('changePassword')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal pour les actions sur l'image 
      <Modal
        animationType="slide"
        transparent={true}
        visible={imageActionVisible}
        onRequestClose={() => setImageActionVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setImageActionVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('profilePicture')}</Text>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={pickImage}
            >
              <Ionicons name="images-outline" size={22} color="#1E90FF" />
              <Text style={styles.modalButtonText}>{t('chooseFromGallery')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={takePhoto}
            >
              <Ionicons name="camera-outline" size={22} color="#1E90FF" />
              <Text style={styles.modalButtonText}>{t('takePhoto')}</Text>
            </TouchableOpacity>
            
            {imageUrl && (
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteImage}
              >
                <Ionicons name="trash-outline" size={22} color="#e74c3c" />
                <Text style={styles.deleteButtonText}>{t('deletePhoto')}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setImageActionVisible(false)}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal pour changer le mot de passe 
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => {
          resetPasswordForm();
          setPasswordModalVisible(false);
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            resetPasswordForm();
            setPasswordModalVisible(false);
          }}
        >
          <View style={styles.passwordModalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>{t('changePassword')}</Text>
            
            <View style={styles.passwordInputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666666" style={styles.passwordInputIcon} />
              <TextInput
                style={styles.passwordInput}
                placeholder={t('currentPassword')}
                secureTextEntry={!passwordVisible}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholderTextColor="#999999"
              />
              <TouchableOpacity 
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={passwordVisible ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666666" 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.passwordInputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666666" style={styles.passwordInputIcon} />
              <TextInput
                style={styles.passwordInput}
                placeholder={t('newPassword')}
                secureTextEntry={!passwordVisible}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor="#999999"
              />
            </View>
            
            <View style={styles.passwordInputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666666" style={styles.passwordInputIcon} />
              <TextInput
                style={styles.passwordInput}
                placeholder={t('confirmPassword')}
                secureTextEntry={!passwordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#999999"
              />
            </View>
            
            {passwordUpdateError && (
              <Text style={styles.passwordErrorText}>{passwordUpdateError}</Text>
            )}
            
            <View style={styles.passwordButtonGroup}>
              <TouchableOpacity 
                style={styles.confirmPasswordButton}
                onPress={handlePasswordUpdate}
                disabled={passwordUpdateLoading}
              >
                {passwordUpdateLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmPasswordText}>{t('confirm')}</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelPasswordButton}
                onPress={() => {
                  resetPasswordForm();
                  setPasswordModalVisible(false);
                }}
                disabled={passwordUpdateLoading}
              >
                <Text style={styles.cancelPasswordText}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {imageError && (
        <View style={styles.imageErrorContainer}>
          <Text style={styles.imageErrorText}>{imageError}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1E90FF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 50,
    marginTop: 50,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e6ecff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e6ecff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1E90FF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#f5f7fa',
  },
  userInfo: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  verticalSpace: {
    height: 50,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputLabel: {
   fontSize: 14,
    color: '#666666',
    width: 80,
  },
  inputValue: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordButtonText: {
    color: '#1E90FF',
    fontWeight: '500',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    justifyContent: 'center',
    marginTop: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  passwordModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 14,
  },
  deleteButton: {
    borderBottomWidth: 0,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#e74c3c',
    marginLeft: 14,
  },
  cancelButton: {
    backgroundColor: '#f5f7fa',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  imageErrorContainer: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  imageErrorText: {
    color: '#e74c3c',
    fontSize: 14,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    width: '100%',
  },
  passwordInputIcon: {
    marginRight: 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  passwordToggle: {
    padding: 5,
  },
  passwordErrorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  passwordButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  confirmPasswordButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  confirmPasswordText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 16,
  },
  cancelPasswordButton: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelPasswordText: {
    color: '#333333',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default UserProfile;*/}
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useProfileImage } from '../hooks/UserHooks';
import { useLanguage } from './i18n';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = ({ onLogout }) => {
  const { t } = useLanguage();
  
  const { user: authUser, logout } = useAuth();
  
  const userId = authUser?.id || authUser?.user_id;
  
  const { 
    user, 
    loading: userLoading, 
    error: userError,
    updatePassword,
    passwordUpdateLoading,
    passwordUpdateError,
    passwordUpdateSuccess
  } = useUser(userId);
  
  const { 
    imageUrl, 
    uploadImage, 
    updateImage,
    deleteImage,
    loading: imageLoading, 
    error: imageError,
    refreshImageUrl
  } = useProfileImage(userId);
  
  const [imageActionVisible, setImageActionVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              if (onLogout) {
                onLogout();
              }
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert(t('error'), t('logoutError'));
            }
          }
        }
      ]
    );
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(t('permissionDenied'), t('galleryPermissionNeeded'));
        return;
      }
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Image sélectionnée:', JSON.stringify(result.assets[0], null, 2));
        
        if (imageUrl) {
          updateImage(result.assets[0]);
        } else {
          uploadImage(result.assets[0]);
        }
        setImageActionVisible(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert(t('error'), t('imageSelectionError') + ': ' + error.message);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(t('permissionDenied'), t('cameraPermissionNeeded'));
        return;
      }
      
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (imageUrl) {
          updateImage(result.assets[0]);
        } else {
          uploadImage(result.assets[0]);
        }
        setImageActionVisible(false);
      }
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      Alert.alert(t('error'), t('photoTakingError'));
    }
  };

  const handleDeleteImage = () => {
    Alert.alert(
      t('deleteProfilePhoto'),
      t('deletePhotoConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteImage();
              setImageActionVisible(false);
            } catch (error) {
              console.error('Erreur lors de la suppression de l\'image:', error);
              Alert.alert(t('error'), t('imageDeleteError') + ': ' + error.message);
            }
          }
        }
      ]
    );
  };

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordVisible(false);
  };

  const handlePasswordUpdate = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert(t('error'), t('allFieldsRequired'));
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert(t('error'), t('passwordsDontMatch'));
        return;
      }

      const success = await updatePassword(currentPassword, newPassword, confirmPassword);
      
      if (success) {
        Alert.alert(
          t('success'), 
          t('passwordUpdateSuccess'), 
          [{ text: t('ok'), onPress: () => {
            resetPasswordForm();
            setPasswordModalVisible(false);
          }}]
        );
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      Alert.alert(t('error'), error.message || t('passwordUpdateError'));
    }
  };

  if (!authUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('userNotLoggedIn')}</Text>
      </View>
    );
  }

  if (userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B2FC9" />
        <Text style={styles.loadingText}>{t('loadingUserInfo')}</Text>
      </View>
    );
  }

  if (userError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('error')}: {userError}</Text>
      </View>
    );
  }

  const displayUser = user || authUser;

  if (!displayUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.notFoundText}>{t('userNotFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => setImageActionVisible(true)}
        >
          {imageLoading ? (
            <View style={styles.avatar}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.avatar} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {displayUser.prenom && displayUser.nom ? displayUser.prenom[0] + displayUser.nom[0] : "?"}
              </Text>
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Ionicons name="camera" size={16} color="#ffffff" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.verticalSpace} />
        
        <View style={styles.userInfo}>
          <View style={styles.inputField}>
            <Ionicons name="person-outline" size={20} color="#8B2FC9" style={styles.inputIcon} />
            <Text style={styles.inputLabel}>{t('firstName')}</Text>
            <Text style={styles.inputValue}>{displayUser.prenom}</Text>
          </View>
          
          <View style={styles.inputField}>
            <Ionicons name="person-outline" size={20} color="#8B2FC9" style={styles.inputIcon} />
            <Text style={styles.inputLabel}>{t('lastName')}</Text>
            <Text style={styles.inputValue}>{displayUser.nom}</Text>
          </View>
          
          <View style={styles.inputField}>
            <Ionicons name="mail-outline" size={20} color="#8B2FC9" style={styles.inputIcon} />
            <Text style={styles.inputLabel}>{t('email')}</Text>
            <Text style={styles.inputValue}>{displayUser.email}</Text>
          </View>

          <TouchableOpacity 
            style={styles.passwordButton}
            onPress={() => setPasswordModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-closed-outline" size={18} color="#6818A5" />
            <Text style={styles.passwordButtonText}>{t('changePassword')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color="#ffffff" />
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal pour les actions sur l'image */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={imageActionVisible}
        onRequestClose={() => setImageActionVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setImageActionVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('profilePicture')}</Text>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={pickImage}
            >
              <Ionicons name="images-outline" size={22} color="#8B2FC9" />
              <Text style={styles.modalButtonText}>{t('chooseFromGallery')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={takePhoto}
            >
              <Ionicons name="camera-outline" size={22} color="#8B2FC9" />
              <Text style={styles.modalButtonText}>{t('takePhoto')}</Text>
            </TouchableOpacity>
            
            {imageUrl && (
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteImage}
              >
                <Ionicons name="trash-outline" size={22} color="#e74c3c" />
                <Text style={styles.deleteButtonText}>{t('deletePhoto')}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setImageActionVisible(false)}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal pour changer le mot de passe */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => {
          resetPasswordForm();
          setPasswordModalVisible(false);
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            resetPasswordForm();
            setPasswordModalVisible(false);
          }}
        >
          <View style={styles.passwordModalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>{t('changePassword')}</Text>
            
            <View style={styles.passwordInputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B2FC9" style={styles.passwordInputIcon} />
              <TextInput
                style={styles.passwordInput}
                placeholder={t('currentPassword')}
                secureTextEntry={!passwordVisible}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholderTextColor="#DC97FF"
              />
              <TouchableOpacity 
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={passwordVisible ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#8B2FC9" 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.passwordInputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B2FC9" style={styles.passwordInputIcon} />
              <TextInput
                style={styles.passwordInput}
                placeholder={t('newPassword')}
                secureTextEntry={!passwordVisible}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor="#DC97FF"
              />
            </View>
            
            <View style={styles.passwordInputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B2FC9" style={styles.passwordInputIcon} />
              <TextInput
                style={styles.passwordInput}
                placeholder={t('confirmPassword')}
                secureTextEntry={!passwordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#DC97FF"
              />
            </View>
            
            {passwordUpdateError && (
              <Text style={styles.passwordErrorText}>{passwordUpdateError}</Text>
            )}
            
            <View style={styles.passwordButtonGroup}>
              <TouchableOpacity 
                style={styles.confirmPasswordButton}
                onPress={handlePasswordUpdate}
                disabled={passwordUpdateLoading}
              >
                {passwordUpdateLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmPasswordText}>{t('confirm')}</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelPasswordButton}
                onPress={() => {
                  resetPasswordForm();
                  setPasswordModalVisible(false);
                }}
                disabled={passwordUpdateLoading}
              >
                <Text style={styles.cancelPasswordText}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {imageError && (
        <View style={styles.imageErrorContainer}>
          <Text style={styles.imageErrorText}>{imageError}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5ff ', // Light purple background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f5ff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8B2FC9',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f5ff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#8B2FC9',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 50,
    marginTop: 50,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8B2FC9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#DC97FF',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DC97FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#8B2FC9',
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#6818A5',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6818A5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#f8f5ff',
  },
  userInfo: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  verticalSpace: {
    height: 50,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    width: '90%',
    shadowColor: '#8B2FC9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#DC97FF',
  },
  inputIcon: {
    marginRight: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: '#8B2FC9',
    width: 80,
    fontWeight: '500',
  },
  inputValue: {
    flex: 1,
    fontSize: 14,
    color: '#6818A5',
    fontWeight: '500',
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC97FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    width: '90%',
    shadowColor: '#8B2FC9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordButtonText: {
    color: '#6818A5',
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B2FC9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    justifyContent: 'center',
    marginTop: 10,
    width: '90%',
    shadowColor: '#6818A5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(104, 24, 165, 0.5)', // Purple overlay
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 3,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#DC97FF',
    ...Platform.select({
      ios: {
        shadowColor: '#8B2FC9',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  passwordModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 3,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#DC97FF',
    ...Platform.select({
      ios: {
        shadowColor: '#8B2FC9',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6818A5',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#DC97FF',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#6818A5',
    marginLeft: 14,
    fontWeight: '500',
  },
  deleteButton: {
    borderBottomWidth: 0,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#e74c3c',
    marginLeft: 14,
  },
  cancelButton: {
    backgroundColor: '#DC97FF',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6818A5',
  },
  imageErrorContainer: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  imageErrorText: {
    color: '#e74c3c',
    fontSize: 14,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f5ff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#DC97FF',
  },
  passwordInputIcon: {
    marginRight: 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#6818A5',
  },
  passwordToggle: {
    padding: 5,
  },
  passwordErrorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  passwordButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  confirmPasswordButton: {
    backgroundColor: '#6818A5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
    shadowColor: '#6818A5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmPasswordText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelPasswordButton: {
    backgroundColor: '#DC97FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelPasswordText: {
    color: '#6818A5',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default UserProfile;
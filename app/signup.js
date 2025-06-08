import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import colors from '../constants/colors';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    type: 'etudiant', // Default value
    code_secret: '', // Ajout du champ code_secret
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleBack = () => {
    // Navigate back to welcome screen instead of using router.back()
    router.replace('/WelcomeScreen');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom || formData.nom.length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 2 caractères";
    }
    
    if (!formData.prenom || formData.prenom.length < 2) {
      newErrors.prenom = "Le prénom doit contenir au moins 2 caractères";
    }
    
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!formData.email.endsWith("@gmail.com") && !formData.email.endsWith("@uca.ac.ma")) {
      newErrors.email = "L'email doit être une adresse gmail.com ou uca.ac.ma";
    }
    
    if (!formData.mot_de_passe || formData.mot_de_passe.length < 8) {
      newErrors.mot_de_passe = "Le mot de passe doit contenir au moins 8 caractères";
    }
    
    // Validation du code secret pour les enseignants
    if (formData.type === 'enseignant' && !formData.code_secret) {
      newErrors.code_secret = "Le code d'enseignant est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    console.log('Sign up button pressed');
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }
    console.log('Validation passed');

    setLoading(true);
    try {
      const response = await axios.post('http://192.168.11.103:5000/api/register', formData);
      
      if (response.data) {
        Alert.alert(
          "Inscription réussie",
          "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
          [
            {
              text: "OK",
              onPress: () => router.replace('/login')
            }
          ]
        );
      }
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors de l'inscription";
      
      if (error.response) {
        if (error.response.data.errors) {
          if (error.response.data.errors.general === "Cet email est déjà utilisé") {
            errorMessage = "Cet email est déjà utilisé. Voulez-vous vous connecter ?";
            Alert.alert(
              "Email déjà utilisé",
              errorMessage,
              [
                {
                  text: "Annuler",
                  style: "cancel"
                },
                {
                  text: "Se connecter",
                  onPress: () => router.replace('/login')
                }
              ]
            );
            return;
          }
          const errorMessages = Object.values(error.response.data.errors).join('\n');
          errorMessage = errorMessages;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#ffffff', '#f7f7f7', '#eeeeee']} style={styles.background}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Back button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.card}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Créer un compte</Text>
              <Text style={styles.subtitle}>Remplissez vos informations pour commencer</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom</Text>
                <View style={[styles.inputWrapper, errors.nom && styles.inputError]}>
                  <Icon name="user" size={18} color={colors.mid1} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez votre nom"
                    placeholderTextColor={colors.light2}
                    value={formData.nom}
                    onChangeText={(text) => setFormData({ ...formData, nom: text })}
                  />
                </View>
                {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prénom</Text>
                <View style={[styles.inputWrapper, errors.prenom && styles.inputError]}>
                  <Icon name="user" size={18} color={colors.mid1} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez votre prénom"
                    placeholderTextColor={colors.light2}
                    value={formData.prenom}
                    onChangeText={(text) => setFormData({ ...formData, prenom: text })}
                  />
                </View>
                {errors.prenom && <Text style={styles.errorText}>{errors.prenom}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                  <Icon name="envelope" size={18} color={colors.mid1} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez votre email"
                    placeholderTextColor={colors.light2}
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mot de passe</Text>
                <View style={[styles.inputWrapper, errors.mot_de_passe && styles.inputError]}>
                  <Icon name="lock" size={18} color={colors.mid1} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez votre mot de passe"
                    placeholderTextColor={colors.light2}
                    secureTextEntry
                    value={formData.mot_de_passe}
                    onChangeText={(text) => setFormData({ ...formData, mot_de_passe: text })}
                  />
                </View>
                {errors.mot_de_passe && <Text style={styles.errorText}>{errors.mot_de_passe}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type de compte</Text>
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.type === 'etudiant' && styles.typeButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, type: 'etudiant' })}
                  >
                    <Icon 
                      name="graduation-cap" 
                      size={18} 
                      color={formData.type === 'etudiant' ? colors.white : colors.mid1} 
                      style={styles.typeIcon}
                    />
                    <Text style={[
                      styles.typeButtonText,
                      formData.type === 'etudiant' && styles.typeButtonTextActive
                    ]}>Étudiant</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.type === 'enseignant' && styles.typeButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, type: 'enseignant' })}
                  >
                    <Icon 
                      name="briefcase" 
                      size={18} 
                      color={formData.type === 'enseignant' ? colors.white : colors.mid1} 
                      style={styles.typeIcon}
                    />
                    <Text style={[
                      styles.typeButtonText,
                      formData.type === 'enseignant' && styles.typeButtonTextActive
                    ]}>Enseignant</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Champ code d'enseignant (conditionnel) */}
              {formData.type === 'enseignant' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Code d'enseignant</Text>
                  <View style={[styles.inputWrapper, errors.code_secret && styles.inputError]}>
                    <Icon name="key" size={18} color={colors.mid1} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Entrez le code d'enseignant"
                      placeholderTextColor={colors.light2}
                      secureTextEntry
                      value={formData.code_secret}
                      onChangeText={(text) => setFormData({ ...formData, code_secret: text })}
                    />
                  </View>
                  {errors.code_secret && <Text style={styles.errorText}>{errors.code_secret}</Text>}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.signupButtonText}>Créer un compte</Text>
              )}
            </TouchableOpacity>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Vous avez déjà un compte? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.linkText}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
 backButton: {
    position: 'absolute',
    top: 8, // Réduit la valeur pour le placer plus haut
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C5B4E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 30,
    padding: 20,
    shadowColor: colors.dark1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark3,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.dark4,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    color: colors.dark3,
    marginBottom: 5,
    fontWeight: '600',
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light3,
    borderRadius: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    color: colors.dark1,
    fontSize: 14,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 11,
    marginTop: 2,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.mid1,
    marginHorizontal: 5,
    backgroundColor: colors.white,
  },
  typeButtonActive: {
    backgroundColor: colors.mid1,
  },
  typeIcon: {
    marginRight: 8,
  },
  typeButtonText: {
    color: colors.mid1,
    fontWeight: 'bold',
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  signupButton: {
    backgroundColor: colors.mid1,
    borderRadius: 15,
    padding: 14,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 15,
    shadowColor: colors.mid1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  signupButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomText: {
    color: colors.dark3,
    fontSize: 14,
  },
  linkText: {
    color: colors.mid1,
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFE6E6',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  errorLink: {
    color: '#7C5CBF',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});
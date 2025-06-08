import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  SafeAreaView, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import colors from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useLanguage } from './i18n';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  
  // États pour la 2FA
  const { token } = useLocalSearchParams();
  const [screenMode, setScreenMode] = useState(token ? 'resetPassword' : 'login'); // 'login', '2fa', 'forgotPassword', 'resetPassword'
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(token || '');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Effet pour détecter si un token est présent dans l'URL
  useEffect(() => {
    if (token) {
      setResetToken(token);
      setScreenMode('resetPassword');
    }
  }, [token]);

  const handleBack = () => {
    if (screenMode === 'login') {
      router.replace('/WelcomeScreen');
    } else {
      setScreenMode('login');
      setError('');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('enterEmailAndPassword'));
      return;
    }

    // Vérification du format de l'email
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || 
        !(email.endsWith("@gmail.com") || email.endsWith("@uca.ac.ma"))) {
      Alert.alert(t('error'), t('enterValidEmail'));
      return;
    }
    
    setLoading(true);
    try {
      console.log('Tentative de connexion avec:', { email });
      
      const response = await fetch('http://192.168.1.10:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mot_de_passe: password }),
      });
      
      const data = await response.json();
      console.log('Réponse du serveur:', data);
      
      if (response.ok) {
        if (data.need_2fa) {
          setUserId(data.user_id);
          setScreenMode('2fa');
        } else if (data.token && data.user) {
          await login(data.user, data.token);
          router.replace('/');
        } else {
          console.error('Réponse invalide du serveur:', data);
          Alert.alert(t('error'), t('tokenMissing'));
        }
      } else {
        console.error('Erreur de connexion:', data);
        const errorMessage = data.errors?.general || data.errors?.email || t('incorrectEmailPassword');
        Alert.alert(t('error'), errorMessage);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      Alert.alert(t('error'), t('serverConnectionError'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorCode) {
      setError(t('enter2FACode'));
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.10:5000/api/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId,
          token: twoFactorCode
        }),
      });
      
      const data = await response.json();
      if (response.ok && data.token && data.user) {
        await login(data.user, data.token);
        router.replace('/');
      } else {
        setError(t('invalid2FACode'));
      }
    } catch (error) {
      setError(t('serverConnectionError'));
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour demander la réinitialisation du mot de passe
  const handleRequestPasswordReset = async () => {
    setError('');
    if (!email) {
      setError(t('enterEmail'));
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || 
        !(email.endsWith("@gmail.com") || email.endsWith("@uca.ac.ma"))) {
      setError(t('enterValidEmail'));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.10:5000/api/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setEmailSent(true);
      } else {
        const errorMessage = data.errors?.general || data.errors?.email || t('error');
        setError(errorMessage);
      }
    } catch (error) {
      setError(t('serverConnectionError'));
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour réinitialiser le mot de passe
  const handleResetPassword = async () => {
    setError('');
    if (!newPassword) {
      setError(t('enterNewPassword'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('passwordMinLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.10:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: resetToken,
          nouveau_mot_de_passe: newPassword 
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setResetSuccess(true);
        setTimeout(() => {
          setScreenMode('login');
          setResetSuccess(false);
        }, 2000);
      } else {
        const errorMessage = data.errors?.general || t('passwordResetError');
        setError(errorMessage);
      }
    } catch (error) {
      setError(t('serverConnectionError'));
    } finally {
      setLoading(false);
    }
  };

  // Rendu de l'écran de connexion
  const renderLoginScreen = () => (
    <View style={styles.card}>
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>{t('welcome')}</Text>
        <Text style={styles.subheaderText}>{t('loginToContinue')}</Text>
      </View>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{t('email')}</Text>
        <View style={styles.inputWrapper}>
          <Icon name="envelope" size={18} color={colors.mid1} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('enterEmail')}
            placeholderTextColor={colors.light2}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <Text style={styles.inputLabel}>{t('password')}</Text>
        <View style={styles.inputWrapper}>
          <Icon name="lock" size={18} color={colors.mid1} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('enterPassword')}
            placeholderTextColor={colors.light2}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => setScreenMode('forgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleLogin} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.loginButtonText}>{t('login')}</Text>
        )}
      </TouchableOpacity>
      {/*<View style={styles.bottomRow}>
        <Text style={styles.bottomText}>{t('dontHaveAccount')} </Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.linkText}>{t('signUp')}</Text>
        </TouchableOpacity>
      </View>*/}
    </View>
  );

  // Rendu de l'écran de vérification 2FA
  const render2FAScreen = () => (
    <View style={styles.card}>
          <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>{t('twoFactorAuth')}</Text>
        <Text style={styles.subheaderText}>{t('enter2FACode')}</Text>
          </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      
          <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{t('verificationCode')}</Text>
            <View style={styles.inputWrapper}>
          <Icon name="key" size={18} color={colors.mid1} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
            placeholder={t('enter2FACode')}
                placeholderTextColor={colors.light2}
            value={twoFactorCode}
            onChangeText={setTwoFactorCode}
            keyboardType="numeric"
            maxLength={6}
              />
            </View>
            </View>
      
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleVerify2FA} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.loginButtonText}>{t('verify')}</Text>
        )}
      </TouchableOpacity>{/*
      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>{t('dontHaveAccount')} </Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.linkText}>{t('signUp')}</Text>
        </TouchableOpacity>
      </View>*/}
    </View>
  );

  // Rendu de l'écran de demande de réinitialisation
  const renderForgotPasswordScreen = () => (
    <View style={styles.card}>
      {emailSent ? (
        <View style={styles.successContainer}>
          <Icon name="envelope-o" size={50} color="#7C5CBF" />
          <Text style={styles.successTitle}>{t('emailSent')}</Text>
          <Text style={styles.successText}>{t('emailSentMessage')}</Text>
          <Text style={styles.noteText}>{t('checkInboxSpam')}</Text>
          <TouchableOpacity 
            style={styles.backToLoginButton} 
            onPress={() => {
              setScreenMode('login');
              setEmailSent(false);
            }}
          >
            <Text style={styles.backToLoginText}>{t('backToLogin')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>{t('forgotPasswordTitle')}</Text>
            <Text style={styles.subheaderText}>{t('forgotPasswordSubtitle')}</Text>
          </View>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('email')}</Text>
            <View style={styles.inputWrapper}>
              <Icon name="envelope" size={18} color={colors.mid1} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('enterEmail')}
                placeholderTextColor={colors.light2}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleRequestPasswordReset} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>{t('sendResetLink')}</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // Rendu de l'écran de réinitialisation du mot de passe
  const renderResetPasswordScreen = () => (
    <View style={styles.card}>
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>{t('resetPassword')}</Text>
        <Text style={styles.subheaderText}>{t('createNewPassword')}</Text>
      </View>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {resetSuccess ? (
        <View style={styles.successContainer}>
          <Icon name="check-circle" size={50} color="#7C5CBF" />
          <Text style={styles.successTitle}>{t('passwordResetSuccess')}</Text>
          <Text style={styles.successText}>{t('passwordUpdatedSuccess')}</Text>
          <Text style={styles.noteText}>{t('redirectingToLogin')}</Text>
        </View>
      ) : (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('newPassword')}</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={18} color={colors.mid1} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('enterNewPassword')}
                placeholderTextColor={colors.light2}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
            <Text style={styles.inputLabel}>{t('confirmPassword')}</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={18} color={colors.mid1} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('confirmNewPassword')}
                placeholderTextColor={colors.light2}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleResetPassword} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>{t('resetPasswordButton')}</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // Déterminer quel fond utiliser selon le mode
  const getBackgroundGradient = () => {
    return ['#ffffff', '#f7f7f7', '#eeeeee'];
  };

  // Couleur du texte du bouton de retour
  const getBackButtonColor = () => {
    return screenMode === 'login' || screenMode === 'resetPassword' ? '#C5B4E3' : '#7C5CBF';
  };

  // Couleur de fond du bouton de retour
  const getBackButtonBackground = () => {
    return screenMode === 'login' || screenMode === 'resetPassword' ? 'white' : 'white';
  };

  // Afficher le bouton retour sur tous les écrans sauf les pages de succès
  const showBackButton = !(emailSent || resetSuccess);

  return (
    <LinearGradient colors={['#ffffff', '#f7f7f7', '#eeeeee']} style={styles.background}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity 
          style={styles.backButton}
            onPress={handleBack}
          >
          <Icon name="arrow-left" size={20} color="#C5B4E3" />
          </TouchableOpacity>
        
        <View style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.cardContainer}
          >
            {screenMode === 'login' && renderLoginScreen()}
            {screenMode === '2fa' && render2FAScreen()}
            {screenMode === 'forgotPassword' && renderForgotPasswordScreen()}
            {screenMode === 'resetPassword' && renderResetPasswordScreen()}
          </KeyboardAvoidingView>
        </View>
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
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
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
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark3,
    marginBottom: 5,
  },
  subheaderText: {
    fontSize: 13,
    color: colors.dark4,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: colors.dark3,
    marginBottom: 5,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 8,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#7C5CBF',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
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
  loginButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  purpleButton: {
    backgroundColor: '#7C5CBF',
    borderRadius: 15,
    padding: 14,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
    shadowColor: '#7C5CBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
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
    color: '#7C5CBF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark3,
    marginTop: 15,
    marginBottom: 10,
  },
  successText: {
    fontSize: 14,
    color: colors.dark3,
    textAlign: 'center',
    marginBottom: 10,
  },
  noteText: {
    fontSize: 12,
    color: colors.dark4,
    textAlign: 'center',
    marginBottom: 20,
  },
  backToLoginButton: {
    backgroundColor: colors.mid1,
    borderRadius: 15,
    padding: 14,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#7C5CBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  backToLoginText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
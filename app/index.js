{/*import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const Home = () => {
  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Bienvenue sur AlphaLearn! 👋</Text>
        <Text style={styles.welcomeText}>
          Votre compagnon d'apprentissage intelligent qui vous aide à maîtriser de nouvelles compétences.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  welcomeContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

export default Home;*/}
{/*
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import React from 'react';
import { useUserInfo } from '../hooks/Hooks';

const Home = () => {
  // Utilisation de l'ID par défaut (1)
  const { userInfo, loading, error } = useUserInfo(1);

  // Vérifier si userInfo existe avant d'essayer d'accéder à ses propriétés
  const userName = userInfo ? `${userInfo.prenom || ''} ${userInfo.nom || ''}` : '';

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0891b2" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <Text style={styles.welcomeTitle}>
              Bienvenue {userName.trim() ? userName : 'sur AlphaLearn'} ! 👋
            </Text>
            <Text style={styles.welcomeText}>
              Votre compagnon d'apprentissage intelligent qui vous aide à maîtriser de nouvelles compétences.
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  welcomeContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  }
});

export default Home;
*/}{/*
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function Index() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn === false) {
      router.replace('/WelcomeScreen');
    }
  }, [isLoggedIn]);

  if (isLoggedIn === null) {
    // Affiche un loader pendant la vérification
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6818A5" />
      </View>
    );
  }
  if (isLoggedIn === false) return null;

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Bienvenue sur AlphaLearn! 👋</Text>
        <Text style={styles.welcomeText}>
          Votre compagnon d'apprentissage intelligent qui vous aide à maîtriser de nouvelles compétences.
        </Text>
      </View>
      <TouchableOpacity
        onPress={logout}
        style={styles.logoutButton}
      >
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  welcomeContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#5A108F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});*/}
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useLanguage } from './i18n'; // Import du hook de traduction

export default function Index() {
  const { isLoggedIn, logout, user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage(); // Utilisation du contexte de langue
  

    
  // Obtenir l'heure actuelle pour déterminer le message de salutation
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  useEffect(() => {
    if (isLoggedIn === false) {
      router.replace('/WelcomeScreen');
    }
  }, [isLoggedIn]);

  if (isLoggedIn === null) {
    // Affiche un loader pendant la vérification
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6818A5" />
      </View>
    );
  }
  if (isLoggedIn === false) return null;

  // Toujours afficher l'image féminine
  const profileImage = require('../assets/boygirl.jpg');

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête avec salutation */}
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{t('hello')} {user?.prenom}!</Text>
          <Text style={styles.subGreeting}>{getGreeting()}</Text>
        </View>
      </View>
      
      {/* Carte de bienvenue avec image de profil selon le genre */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeTitle}>{t('welcomeHome')}</Text>
          <Text style={styles.welcomeSubtitle}>{t('welcomeSubtitle')}</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image 
            source={profileImage}
            style={styles.welcomeImage}
            resizeMode="cover"
          />
        </View>
      </View>
      
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fb',
    padding: 20,
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
    marginBottom: 25,
  },
  greetingContainer: {
    marginBottom: 15,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6818A5',
  },
  subGreeting: {
    fontSize: 16,
    color: '#8893a6',
  },

  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9eef9',
  },
  welcomeTextContainer: {
    flex: 1,
    paddingRight: 20, // Espace entre le texte et l'image
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6818A5',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6d7e92',
    lineHeight: 20,
  },
  imageContainer: {
    // Container pour centrer et positionner l'image
    marginLeft: 10,
  },
  welcomeImage: {
    width: 100,        // Taille augmentée (était 60)
    height: 100,       // Taille augmentée (était 60)
    borderRadius: 40, // Doit être égal à la moitié de width/height pour un cercle parfait
    borderWidth: 3,   // Épaisseur de bordure augmentée
    borderColor: '#6818A5',
  },
  
});
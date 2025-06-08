import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLanguage } from './i18n';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  

  return (
    //<LinearGradient colors={['#4b2d83', '#6a3cb5', '#8c5bd1']} style={styles.background}>
     <LinearGradient colors={['#8B2FC9', '#f7f7f7', '#eeeeee']} style={styles.background}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/Logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.illustrationContainer}>
            <View style={styles.illustration}>
              <View style={styles.circleBackground} />
              <Image
                source={require('../assets/Education.png')}
                style={styles.illustrationImage}
                resizeMode="contain"
              />
            </View>
          </View>
          
         <View style={styles.textContainer}>
            <Text style={styles.title}>{t('appTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('appDescription')}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginButtonText}>{t('login')}</Text>
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    position: 'absolute',
    top:-30,
    left: -30,
    zIndex: 1,
  },
  logo: {
    width: 200,
    height: 200,
    backgroundColor: 'transparent',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  illustration: {
    position: 'relative',
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#310055',
  },
  illustrationImage: {
    width: 180,
    height: 180,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#310055',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#310055',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#8B2FC9',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    width: '90%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
import React, { useState, useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import QuizList from '../components/quiz/QuizList';
import CreateQuiz from '../components/quiz/CreateQuiz';
import TakeQuiz from '../components/quiz/TakeQuiz';
import QuizResults from '../components/quiz/QuizResults';
import QuizGenerator from '../components/quiz/QuizGenerator';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from './i18n';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();

// Composant QuizIntro pour l'écran de bienvenue
const QuizIntro = ({ navigation }) => {
  const { t } = useLanguage();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleGetStarted = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -Dimensions.get('window').width,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('QuizList');
    });
  };

  return (
    <Animated.View
      style={[
        styles.introContainer,
        { transform: [{ translateX: slideAnim }], opacity: fadeAnim }
      ]}
    >
      <View style={styles.introContent}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/Online test-amico.png')} style={styles.logoImage} />
        </View>
        <Text style={styles.introTitle}>{t('welcomeQuiz')}</Text>
        <Text style={styles.introSubtitle}>
          {t('quizInstruction')}
        </Text>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedArrows}>{'>>'}</Text>
          <Text style={styles.getStartedMainText}>{t('start')}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Composant QuizTypeSelector comme première page
const QuizTypeSelector = ({ onSelectType }) => {
  const [selectedType, setSelectedType] = useState(null);
  const { t } = useLanguage();

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      onSelectType(selectedType);
    }
  };

  return (
    <View style={styles.typeSelectorContainer}>
      <View style={styles.typeSelectorContent}>
        <View style={styles.illustrationContainer}>
          <Image 
            source={require('../assets/Online test-amico.png')} 
            style={styles.illustration} 
            resizeMode="contain"
          />
        </View>
        
        <TouchableOpacity 
          style={[
            styles.typeButton,
            selectedType === 'official' ? styles.selectedTypeButton : {}
          ]} 
          onPress={() => handleTypeSelect('official')}
        >
          <Text style={[
            styles.typeButtonText,
            selectedType === 'official' ? styles.selectedTypeButtonText : {}
          ]}>{t('officialQuizzes')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.typeButton,
            selectedType === 'practice' ? styles.selectedTypeButton : {}
          ]} 
          onPress={() => handleTypeSelect('practice')}
        >
          <Text style={[
            styles.typeButtonText,
            selectedType === 'practice' ? styles.selectedTypeButtonText : {}
          ]}>{t('interactiveQCM')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedType ? styles.disabledContinueButton : {}
          ]} 
          onPress={handleContinue}
          disabled={!selectedType}
        >
          <Text style={styles.continueButtonText}>{t('continue')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const QuizStack = (props) => {
  const { user } = useAuth();
  const [quizType, setQuizType] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleQuizTypeSelect = (type) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -Dimensions.get('window').width,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setQuizType(type);
    });
  };

  const handleBackToTypeSelector = () => {
    setQuizType(null);
    slideAnim.setValue(0);
    fadeAnim.setValue(1);
  };

  // Si l'utilisateur est un enseignant, on affiche d'abord l'écran de bienvenue
  if (user?.type === 'enseignant') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="QuizIntro" component={QuizIntro} />
        <Stack.Screen name="QuizList">
          {() => (
            <QuizList
              API_URL={API_URL}
              route={{ 
                params: { 
                  userType: 'enseignant', 
                  userId: user.id,
                  quizType: 'official'
                } 
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="CreateQuiz" component={CreateQuiz} />
        <Stack.Screen name="GenerateQuiz">
          {navProps => (
            <QuizGenerator
              {...navProps}
              API_URL={API_URL}
              route={{ params: { enseignantId: user.id } }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="TakeQuiz" component={TakeQuiz} />
        <Stack.Screen name="QuizResults" component={QuizResults} />
      </Stack.Navigator>
    );
  }

  // Pour les étudiants, on affiche d'abord la sélection du type de quiz
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!quizType ? (
        <Stack.Screen name="QuizTypeSelector">
          {() => (
            <Animated.View
              style={[
                styles.container,
                { transform: [{ translateX: slideAnim }], opacity: fadeAnim }
              ]}
            >
              <QuizTypeSelector onSelectType={handleQuizTypeSelect} />
            </Animated.View>
          )}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="QuizList">
            {() => (
              <QuizList
                API_URL={API_URL}
                route={{ 
                  params: { 
                    userType: user?.type, 
                    userId: user?.id,
                    quizType: quizType 
                  } 
                }}
                onBackToTypeSelector={handleBackToTypeSelector}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="TakeQuiz">
            {navProps => (
              <TakeQuiz
                {...navProps}
                API_URL={API_URL}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="QuizResults">
            {navProps => (
              <QuizResults
                {...navProps}
                API_URL={API_URL}
              />
            )}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  typeSelectorContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  typeSelectorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  illustrationContainer: {
    marginBottom: 40,
  },
  illustration: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6818A5',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  typeButton: {
    backgroundColor: '#8B2FC9',
    width: '100%',
    padding: 15,
    borderRadius: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedTypeButton: {
    backgroundColor: '#AB51E3',
    borderWidth: 2,
    borderColor: '#5A108F',  },
  typeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedTypeButtonText: {
    color: '#fff',
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
  introContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  introContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoContainer: {
    width: '100%',
    height: 270,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6818A5',
    textAlign: 'center',
    marginBottom: 10,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B2FC9',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  getStartedArrows: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  getStartedMainText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default QuizStack;

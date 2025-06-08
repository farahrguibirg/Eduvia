{/*import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const Quiz = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz</Text>
      <Text style={styles.description}>Testez vos connaissances avec des quiz interactifs</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default Quiz; 
*/}
{/*
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import QuizList from '../components/quiz/QuizList';
import CreateQuiz from '../components/quiz/CreateQuiz';
import TakeQuiz from '../components/quiz/TakeQuiz';
import QuizResults from '../components/quiz/QuizResults';
import { API_URL } from '../config';
import QuizGenerator from '../components/quiz/QuizGenerator';
import { View, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

const QuizStack = (props) => {
  const { navigation, route } = props;
  const userType = route?.params?.userType || 'etudiant';
  const userId = route?.params?.userId || 4;

  return (
    <Stack.Navigator>
      <Stack.Screen name="QuizList" options={{ title: 'Quiz' }}>
        {navProps => (
          <QuizList
            {...navProps}
            API_URL={API_URL}
            route={{ params: { userType, userId } }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CreateQuiz" component={CreateQuiz} options={{ title: 'Créer un quiz' }} />
      <Stack.Screen name="GenerateQuiz" options={{ title: 'Générer un quiz depuis PDF' }}>
        {navProps => (
          <QuizGenerator
            {...navProps}
            API_URL={API_URL}
            route={{ params: { enseignantId: userId } }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="TakeQuiz" options={{ title: 'Passer le quiz' }}>
        {navProps => (
          <TakeQuiz
            {...navProps}
            API_URL={API_URL}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="QuizResults" options={{ title: 'Résultats du quiz' }}>
        {navProps => (
          <QuizResults
            {...navProps}
            API_URL={API_URL}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default QuizStack;

export function QuizScreen() {
  return (
    <View style={styles.container}>
      <QuizGenerator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  // Ajoute ici d'autres styles si besoin
});
*/}{/*
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import QuizList from '../components/quiz/QuizList';
import CreateQuiz from '../components/quiz/CreateQuiz';
import TakeQuiz from '../components/quiz/TakeQuiz';
import QuizResults from '../components/quiz/QuizResults';
import { API_URL } from '../config';
import QuizGenerator from '../components/quiz/QuizGenerator';
import { View, StyleSheet, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator();

const QuizStack = (props) => {
  const { user } = useAuth();
  // Si l'utilisateur n'est pas enseignant, il n'a pas accès à la création/génération de quiz
  return (
    <Stack.Navigator>
      <Stack.Screen name="QuizList" options={{ title: 'Quiz' }}>
        {navProps => (
          <QuizList
            {...navProps}
            API_URL={API_URL}
            route={{ params: { userType: user?.type, userId: user?.id } }}
          />
        )}
      </Stack.Screen>
      {/* Si l'utilisateur est enseignant, il a accès à la création/génération de quiz 
      {user?.type === 'enseignant' && (
        <Stack.Screen name="CreateQuiz" component={CreateQuiz} options={{ title: 'Créer un quiz' }} />
      )}
      {user?.type === 'enseignant' && (
        <Stack.Screen name="GenerateQuiz" options={{ title: 'Générer un quiz depuis PDF' }}>
          {navProps => (
            <QuizGenerator
              {...navProps}
              API_URL={API_URL}
              route={{ params: { enseignantId: user?.id } }}
            />
          )}
        </Stack.Screen>
      )}
      <Stack.Screen name="TakeQuiz" options={{ title: 'Passer le quiz' }}>
        {navProps => (
          <TakeQuiz
            {...navProps}
            API_URL={API_URL}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="QuizResults" options={{ title: 'Résultats du quiz' }}>
        {navProps => (
          <QuizResults
            {...navProps}
            API_URL={API_URL}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default QuizStack;

export function QuizScreen() {
  const { user } = useAuth();
  if (user?.type !== 'enseignant') {
    return (
      <View style={styles.container}>
        <Text>Accès réservé aux enseignants.</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <QuizGenerator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  // Ajoute ici d'autres styles si besoin
});*/}
import React, { useState, useRef, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import QuizList from '../components/quiz/QuizList';
import CreateQuiz from '../components/quiz/CreateQuiz';
import TakeQuiz from '../components/quiz/TakeQuiz';
import QuizResults from '../components/quiz/QuizResults';
import { API_URL } from '../config';
import QuizGenerator from '../components/quiz/QuizGenerator';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from './i18n';

const Stack = createStackNavigator();



// Nouveau composant IntroScreen
const IntroScreen = ({ onGetStarted }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { t } = useLanguage();

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
      onGetStarted();
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

const QuizStack = (props) => {
  const { user } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
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
      setShowIntro(false);
    });
  };

  const handleBackToIntro = () => {
    setShowIntro(true);
    slideAnim.setValue(0);
    fadeAnim.setValue(1);
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showIntro ? (
        <Stack.Screen name="IntroScreen">
          {() => <IntroScreen onGetStarted={handleGetStarted} />}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="QuizList">
            {() => (
              <QuizList
                API_URL={API_URL}
                route={{ params: { userType: user?.type, userId: user?.id } }}
                onBackToIntro={handleBackToIntro}
              />
            )}
          </Stack.Screen>
          {user?.type === 'enseignant' && (
            <Stack.Screen name="CreateQuiz" component={CreateQuiz} />
          )}
          {user?.type === 'enseignant' && (
            <Stack.Screen name="GenerateQuiz">
              {navProps => (
                <QuizGenerator
                  {...navProps}
                  API_URL={API_URL}
                  route={{ params: { enseignantId: user?.id } }}
                />
              )}
            </Stack.Screen>
          )}
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
  introContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  introContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6818A5',
    textAlign: 'center',
    marginBottom: 20,
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
    backgroundColor: '#6818A5',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  getStartedArrows: {
    color: '#fff',
    fontSize: 20,
    marginRight: 10,
  },
  getStartedMainText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default QuizStack;
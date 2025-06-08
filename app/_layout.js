import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Tabs, usePathname, Stack, useRouter, Slot } from 'expo-router';
import TabBar from '../components/navigation/TabBar';
import { Ionicons } from '@expo/vector-icons';
import SettingsPanel from '../components/SettingsPanel';
import Sidebar from '../components/Sidebar';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LanguageProvider, useLanguage } from './i18n';

function RootLayoutNav() {
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  // Initialisation
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Gestion de la navigation basée sur l'état d'authentification
  useEffect(() => {
    if (!isInitialized) return;

    const publicRoutes = ['/login', '/signup', '/WelcomeScreen'];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (isLoggedIn === false && !isPublicRoute) {
      router.replace('/WelcomeScreen');
    }
  }, [isLoggedIn, pathname, isInitialized]);

  // Réinitialisation des panneaux lors de la déconnexion
  useEffect(() => {
    if (!isLoggedIn) {
      setShowSettings(false);
      setShowSidebar(false);
    }
  }, [isLoggedIn]);

  const handleCloseSettings = () => setShowSettings(false);
  const handleCloseSidebar = () => setShowSidebar(false);

  const isHomePage = pathname === '/';
  const isUserManagement = pathname === '/Admin' || pathname === '/AdminEnseignants' || pathname === '/AdminStudents';
  const isEmailManagement = pathname === '/email' || pathname === '/EmailEnseignants' || pathname === '/EmailStudents';

  const getHeaderTitle = () => {
    switch (pathname) {
      case '/email':
        return t('emailManagement');
      case '/EmailEnseignants':
        return t('emailTeachers');
      case '/EmailStudents':
        return t('emailStudents');
      case '/Admin':
        return t('userManagement');
      case '/AdminEnseignants':
        return t('teacherManagement');
      case '/AdminStudents':
        return t('studentManagement');
      default:
        return "";
    }
  };

  // Toujours rendre un Slot pendant l'initialisation
  if (!isInitialized) {
    return <Slot />;
  }

  // Routes publiques
  if (!isLoggedIn) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="WelcomeScreen" />
      </Stack>
    );
  }

  const isTeacher = user?.type === 'enseignant';
  const screenOptions = {
    headerShown: isHomePage || isUserManagement || isEmailManagement,
    headerTitle: () => (
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>
          {getHeaderTitle()}
        </Text>
      </View>
    ),
    headerTitleAlign: 'center',
    headerLeft: () => (isHomePage || isUserManagement || isEmailManagement) && (
      <TouchableOpacity 
        onPress={() => setShowSidebar(true)}
        style={{ marginLeft: 15 }}
      >
        <Ionicons name="menu" size={24} color="#6818a5" />
      </TouchableOpacity>
    ),
    headerRight: () => (isHomePage || isUserManagement || isEmailManagement) && (
      <TouchableOpacity 
        onPress={() => setShowSettings(!showSettings)}
        style={{ marginRight: 15 }}
      >
        <Ionicons name="settings-outline" size={24} color="#6818a5" />
      </TouchableOpacity>
    )
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={screenOptions}
        tabBar={props => <TabBar {...props} userType={user?.type} userId={user?.id} />}
      >
        {user?.type !== 'admin' && (
          <>
            <Tabs.Screen
              name="index"
              options={{
                title: 'Home',
                href: '/',
                headerShown: true
              }}
            />
            <Tabs.Screen
              name="cours"
              options={{
                title: "Cours",
                headerShown: false
              }}
            />
            {!isTeacher && (
              <>
                <Tabs.Screen
                  name="Chatbot"
                  options={{
                    title: "Chatbot",
                    headerShown: false
                  }}
                />
                <Tabs.Screen
                  name="resume"
                  options={{
                    title: "Résumé",
                    headerShown: false
                  }}
                />
                <Tabs.Screen
                  name="qcm"
                  options={{
                    title: "t(QCM)",
                    headerShown: false
                  }}
                />
                <Tabs.Screen
                  name="traduction"
                  options={{
                    title: "Traduction",
                    headerShown: false
                  }}
                />
              </>
            )}
            <Tabs.Screen
              name="quiz"
              options={{
                title: "t(Quiz)",
                headerShown: false
              }}
            />
          </>
        )}
        {user?.type === 'admin' && (
          <>
            <Tabs.Screen
              name="Admin"
              options={{
                title: "Gestion Utilisateurs",
                headerShown: true
              }}
            />
            <Tabs.Screen
              name="Email"
              options={{
                title: "Gestion Emails",
                headerShown: true
                
              }}
            />
          </>
        )}
      </Tabs>
      <SettingsPanel
        visible={showSettings}
        onClose={handleCloseSettings}
      />
      {showSidebar && (
        <Sidebar
          visible={showSidebar}
          onClose={handleCloseSidebar}
        />
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6818a5',
    textAlign: 'center',
  }
});
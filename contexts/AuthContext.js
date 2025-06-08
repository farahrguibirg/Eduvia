import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [etudiantId, setEtudiantId] = useState(null);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const isLoggedInValue = await AsyncStorage.getItem('isLoggedIn');
        const userStr = await AsyncStorage.getItem('user');
        const tokenStr = await AsyncStorage.getItem('token');
        const etudiantIdStr = await AsyncStorage.getItem('etudiantId');
        
        console.log('Chargement des données stockées:');
        console.log('isLoggedIn:', isLoggedInValue);
        console.log('user:', userStr);
        console.log('token:', tokenStr ? 'présent' : 'absent');
        console.log('etudiantId:', etudiantIdStr);
        
        setIsLoggedIn(isLoggedInValue === 'true');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          // Extraire l'ID étudiant des données utilisateur si nécessaire
          if (!etudiantIdStr && userData?.id) {
            const extractedId = String(userData.id).trim();
            if (extractedId && !isNaN(Number(extractedId))) {
              await AsyncStorage.setItem('etudiantId', extractedId);
              setEtudiantId(extractedId);
            }
          }
        }
        if (tokenStr) setToken(tokenStr);
        if (etudiantIdStr) setEtudiantId(etudiantIdStr);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    
    loadStoredData();
  }, []);

  const login = async (userData, tokenValue) => {
    try {
      console.log('Tentative de connexion avec:');
      console.log('userData:', userData);
      console.log('tokenValue:', tokenValue ? 'présent' : 'absent');
      
      // S'assurer que le token est une chaîne de caractères
      const cleanToken = String(tokenValue).replace(/^"(.*)"$/, '$1');
      console.log('Token nettoyé:', cleanToken);
      
      // Extraire et valider l'ID étudiant des données utilisateur
      let etudiantId = null;
      if (userData?.id) {
        etudiantId = String(userData.id).trim();
        if (!etudiantId || isNaN(Number(etudiantId))) {
          console.warn('ID étudiant invalide dans les données utilisateur:', userData.id);
          etudiantId = null;
        }
      }
      console.log('ID étudiant extrait:', etudiantId);
      
      // Stocker les données
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', cleanToken);
      
      if (etudiantId) {
        await AsyncStorage.setItem('etudiantId', etudiantId);
        console.log('ID étudiant stocké:', etudiantId);
      } else {
        console.warn('Aucun ID étudiant valide à stocker');
      }
      
      // Vérifier que les données ont été stockées
      const storedToken = await AsyncStorage.getItem('token');
      const storedEtudiantId = await AsyncStorage.getItem('etudiantId');
      console.log('Token stocké:', storedToken);
      console.log('ID étudiant stocké:', storedEtudiantId);
      
      // Mettre à jour l'état
      setIsLoggedIn(true);
      setUser(userData);
      setToken(cleanToken);
      if (etudiantId) setEtudiantId(etudiantId);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('etudiantId');
      
      // Vérifier que les données ont été supprimées
      const storedToken = await AsyncStorage.getItem('token');
      const storedEtudiantId = await AsyncStorage.getItem('etudiantId');
      console.log('Token après déconnexion:', storedToken ? 'présent' : 'absent');
      console.log('ID étudiant après déconnexion:', storedEtudiantId ? 'présent' : 'absent');
      
      setIsLoggedIn(false);
      setUser(null);
      setToken(null);
      setEtudiantId(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, etudiantId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

{/*import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.10:5000/api';

export const useSidebarResume = () => {
  const [savedResumes, setSavedResumes] = useState([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [etudiantId, setEtudiantId] = useState(null);
  

  // Charger l'ID étudiant au montage
  useEffect(() => {
    const getEtudiantId = async () => {
      try {
        const id = await AsyncStorage.getItem('etudiantId');
        if (id) {
          setEtudiantId(id);
          fetchResumes(id);
        } else {
          setEtudiantId(null);
          fetchResumes(null);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'ID étudiant:', err);
        setEtudiantId(null);
        fetchResumes(null);
      }
    };
    getEtudiantId();
  }, []);

  // Charger l'historique depuis l'API
  const fetchResumes = useCallback(async (id = null) => {
    setIsLoadingResumes(true);
    try {
      const studentId = id || etudiantId || '1';
      const response = await axios.get(`${API_BASE_URL}/resume/historique/etudiant/${studentId}`);
      if (response.data && response.data.success) {
        setSavedResumes(response.data.resumes || []);
      } else {
        setSavedResumes([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des résumés:', err);
      setSavedResumes([]);
    } finally {
      setIsLoadingResumes(false);
    }
  }, [etudiantId]);

  // Ajouter un résumé à l'historique via l'API
  const addResumeToHistory = useCallback(async (resume) => {
    try {
      const studentId = etudiantId || '1';
      const { etudiant_id, ...rest } = resume;
      const payload = { ...rest, etudiantId: studentId };
      const response = await axios.post(`${API_BASE_URL}/resume/historique`, payload);
      if (response.data && response.data.success) {
        fetchResumes(studentId);
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout du résumé:', err);
      throw err;
    }
  }, [etudiantId, fetchResumes]);

  // Supprimer un résumé via l'API
  const deleteResumeFromHistory = useCallback(async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/resume/historique/${id}`);
      fetchResumes();
    } catch (err) {
      console.error('Erreur lors de la suppression du résumé:', err);
    }
  }, [fetchResumes]);

  // Sélectionner un résumé depuis l'historique (local, déjà chargé)
  const selectResume = useCallback((id) => {
    const found = savedResumes.find(item => item.id === id);
    return found || null;
  }, [savedResumes]);

  return {
    savedResumes,
    isLoadingResumes,
    fetchResumes,
    addResumeToHistory,
    deleteResumeFromHistory,
    selectResume,
    etudiantId
  };
}; */}
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://192.168.1.10:5000/api';

export const useSidebarResume = () => {
  const [savedResumes, setSavedResumes] = useState([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [etudiantId, setEtudiantId] = useState(null);
  const { isLoggedIn, user, logout } = useAuth();

  // Charger l'ID étudiant au montage
  useEffect(() => {
    const getEtudiantId = async () => {
      try {
        // Priorité à l'ID depuis le contexte d'authentification
        let id = user?.id || user?.etudiantId;
        
        // Si pas d'ID dans le contexte, essayer AsyncStorage
        if (!id) {
          id = await AsyncStorage.getItem('etudiantId');
        }
        
        if (id) {
          setEtudiantId(id);
          await fetchResumes(id);
        } else {
          console.warn('Aucun ID étudiant trouvé');
          setEtudiantId(null);
          setSavedResumes([]); // Vider les résumés si pas d'utilisateur
        }
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'ID étudiant:', err);
        setEtudiantId(null);
        setSavedResumes([]);
      }
    };

    // Vérifier l'authentification avant de charger
    if (isLoggedIn && user) {
      getEtudiantId();
    } else {
      // Si pas connecté, vider les données
      setEtudiantId(null);
      setSavedResumes([]);
    }
  }, [isLoggedIn, user]);

  // Charger l'historique depuis l'API - UNIQUEMENT pour l'utilisateur connecté
  const fetchResumes = useCallback(async (id = null) => {
    const studentId = id || etudiantId;
    
    // Ne pas faire d'appel API si pas d'ID étudiant
    if (!studentId) {
      console.warn('Impossible de charger les résumés: aucun ID étudiant');
      setSavedResumes([]);
      return;
    }

    // Vérification supplémentaire de l'authentification
    if (!isLoggedIn) {
      console.warn('Utilisateur non connecté, impossible de charger les résumés');
      setSavedResumes([]);
      return;
    }

    setIsLoadingResumes(true);
    try {
      // Endpoint spécifique pour l'étudiant connecté
      const response = await axios.get(
        `${API_BASE_URL}/resume/historique/etudiant/${studentId}`,
        {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`, // Si vous utilisez des tokens
          }
        }
      );
      
      if (response.data && response.data.success) {
        // Correction : comparer les IDs en string pour éviter les problèmes de type
        const userResumes = (response.data.resumes || []).filter(
          resume => String(resume.etudiantId) === String(studentId) || String(resume.etudiant_id) === String(studentId)
        );
        setSavedResumes(userResumes);
      } else {
        setSavedResumes([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des résumés:', err);
      
      // Si erreur 401/403, potentiellement déconnecter l'utilisateur
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn('Accès non autorisé, déconnexion de l\'utilisateur');
        logout();
      }
      
      setSavedResumes([]);
    } finally {
      setIsLoadingResumes(false);
    }
  }, [etudiantId, isLoggedIn, logout]);

  // Ajouter un résumé à l'historique via l'API
  const addResumeToHistory = useCallback(async (resume) => {
    if (!etudiantId) {
      console.warn('Impossible d\'ajouter le résumé: aucun ID étudiant');
      return false;
    }

    if (!isLoggedIn) {
      console.warn('Utilisateur non connecté, impossible d\'ajouter le résumé');
      return false;
    }

    try {
      const studentId = etudiantId || '1';
      // On retire la clé 'etudiant_id' si elle existe, et on envoie 'etudiantId' uniquement
      const { etudiant_id, ...rest } = resume;
      const payload = { ...rest, etudiantId: studentId };
      const response = await axios.post(
        `${API_BASE_URL}/resume/historique`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
          }
        }
      );
      
      if (response.data && response.data.success) {
        await fetchResumes(studentId);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du résumé:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
      
      return false;
    }
  }, [etudiantId, fetchResumes, isLoggedIn, logout]);

  // Supprimer un résumé via l'API
  const deleteResumeFromHistory = useCallback(async (id) => {
    console.log('deleteResumeFromHistory appelé avec id:', id);
    if (!isLoggedIn || !etudiantId) {
      console.warn('Utilisateur non connecté ou ID manquant');
      return false;
    }
    try {
      // Vérifier que le résumé appartient bien à l'utilisateur avant suppression
      const resumeToDelete = savedResumes.find(resume => String(resume.id) === String(id));
      if (!resumeToDelete || (String(resumeToDelete.etudiantId) !== String(etudiantId) && String(resumeToDelete.etudiant_id) !== String(etudiantId))) {
        console.warn('Tentative de suppression d\'un résumé qui n\'appartient pas à l\'utilisateur');
        return false;
      }
      const response = await axios.delete(
        `${API_BASE_URL}/resume/historique/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
          }
        }
      );
      console.log('Réponse suppression backend:', response?.data);
      await fetchResumes();
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du résumé:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
      return false;
    }
  }, [fetchResumes, isLoggedIn, etudiantId, savedResumes, logout]);

  // Sélectionner un résumé depuis l'historique
  const selectResume = useCallback((id) => {
    const found = savedResumes.find(item => String(item.id) === String(id));
    // Vérification supplémentaire que le résumé appartient à l'utilisateur
    if (found && (String(found.etudiantId) === String(etudiantId) || String(found.etudiant_id) === String(etudiantId))) {
      return found;
    }
    return null;
  }, [savedResumes, etudiantId]);

  return {
    savedResumes,
    isLoadingResumes,
    fetchResumes,
    addResumeToHistory,
    deleteResumeFromHistory,
    selectResume,
    etudiantId,
    isLoggedIn
  };
};
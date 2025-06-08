import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Hook pour intégration avec l'API réelle
export const useApi = () => {
  const apiClient = axios.create({
    baseURL: 'http://192.168.1.10:5000/api',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  };

  apiClient.interceptors.request.use(
    async (config) => {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          console.warn('Session expirée, veuillez vous reconnecter');
          return Promise.reject(error);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return {
    getStudents: async () => {
      try {
        return await apiClient.get('/admin/students');
      } catch (error) {
        console.error('Erreur API (getStudents):', error);
        throw error;
      }
    },
    getTeachers: async () => {
      try {
        return await apiClient.get('/admin/teachers');
      } catch (error) {
        console.error('Erreur API (getTeachers):', error);
        throw error;
      }
    },
    getUser: async (id) => {
      try {
        return await apiClient.get(`/admin/users/${id}`);
      } catch (error) {
        console.error(`Erreur API (getUser ${id}):`, error);
        throw error;
      }
    },
    createStudent: async (data) => {
      try {
        return await apiClient.post('/admin/students', data);
      } catch (error) {
        console.error('Erreur API (createStudent):', error);
        throw error;
      }
    },
    createTeacher: async (data) => {
      try {
        return await apiClient.post('/admin/teachers', data);
      } catch (error) {
        console.error('Erreur API (createTeacher):', error);
        throw error;
      }
    },
    updateUser: async (id, data) => {
      try {
        return await apiClient.put(`/admin/users/${id}`, data);
      } catch (error) {
        console.error(`Erreur API (updateUser ${id}):`, error);
        throw error;
      }
    },
    deleteUser: async (id) => {
      try {
        return await apiClient.delete(`/admin/users/${id}`);
      } catch (error) {
        console.error(`Erreur API (deleteUser ${id}):`, error);
        throw error;
      }
    }
  };
};

// CHANGEMENT: Ajout du paramètre isStudentsViewParam avec une valeur par défaut
export const useAdminUsers = (isStudentsViewParam = true) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // CHANGEMENT: Utilisation du paramètre pour initialiser isStudentsView
  const [isStudentsView, setIsStudentsView] = useState(isStudentsViewParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
  });

  const api = useApi();

  // CHANGEMENT: useEffect pour synchroniser isStudentsView avec le paramètre
  useEffect(() => {
    setIsStudentsView(isStudentsViewParam);
  }, [isStudentsViewParam]);

  // Récupération des données depuis l'API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à ces données.');
        setUsers([]);
        setIsLoading(false);
        return;
      }

      const response = isStudentsView
        ? await api.getStudents()
        : await api.getTeachers();

      if (response && response.data && response.data.data) {
        setUsers(response.data.data);
      } else if (response && response.data) {
        setUsers(response.data);
      } else {
        setUsers([]);
        setError('Format de réponse inattendu de l\'API');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
          try {
            await AsyncStorage.removeItem('token');
          } catch (storageError) {
            console.error('Erreur lors de la suppression du token:', storageError);
          }
        } else {
          setError(`Erreur ${error.response.status}: ${error.response.data?.message || 'Erreur du serveur'}`);
        }
      } else if (error.request) {
        setError('Impossible de communiquer avec le serveur. Vérifiez votre connexion internet.');
      } else {
        setError(`Erreur de configuration: ${error.message}`);
      }
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [isStudentsView]); // CHANGEMENT: Supprimé la dépendance 'api'

  // Fetch users when the students/teachers view changes
  useEffect(() => {
    fetchUsers();
  }, [isStudentsView, fetchUsers]);

  // Filter users and update total pages
  useEffect(() => {
    if (!users || !Array.isArray(users)) {
      setFilteredUsers([]);
      setTotalPages(1);
      return;
    }

    let result = [...users];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user =>
        (user.nom && user.nom.toLowerCase().includes(query)) ||
        (user.prenom && user.prenom.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(result);
    setTotalPages(Math.max(1, Math.ceil(result.length / itemsPerPage)));
  }, [users, searchQuery, itemsPerPage]);

  // Update currentPage when totalPages changes
  useEffect(() => {
    // Only update if currentPage is out of bounds
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const getCurrentPageUsers = useCallback(() => {
    if (!filteredUsers || filteredUsers.length === 0) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const toggleView = useCallback((isStudents) => {
    if (isStudentsView !== isStudents) {
      setIsStudentsView(isStudents);
      // Reset to page 1 when switching views
      setCurrentPage(1);
    }
  }, [isStudentsView]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const openAddModal = useCallback(() => {
    setFormData({ nom: '', prenom: '', email: '', mot_de_passe: '' });
    setIsAddModalVisible(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setIsAddModalVisible(false);
  }, []);

  const openEditModal = useCallback((user) => {
    if (!user) return;
    setSelectedUser(user);
    // Assurez-vous que toutes les données de l'utilisateur sont correctement définies
    setFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      mot_de_passe: '' // Ne pas afficher le mot de passe existant pour des raisons de sécurité
    });
    setIsEditModalVisible(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalVisible(false);
    setSelectedUser(null);
  }, []);

  // Fonction pour éviter la réinitialisation du formulaire
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAddUser = useCallback(async () => {
    if (!formData.nom || !formData.prenom || !formData.email || !formData.mot_de_passe) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (formData.mot_de_passe !== formData.confirm_mot_de_passe) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      setIsLoading(true);
      if (isStudentsView) {
        await api.createStudent(formData);
      } else {
        await api.createTeacher(formData);
      }
      await fetchUsers();
      closeAddModal();
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de l\'ajout de l\'utilisateur');
    } finally {
      setIsLoading(false);
    }
  }, [formData, isStudentsView, fetchUsers]); // CHANGEMENT: Supprimé la dépendance 'api'

  const handleUpdateUser = useCallback(async () => {
    if (!selectedUser || !selectedUser.id) {
      setError('Aucun utilisateur sélectionné');
      return;
    }
    // Vérification uniquement si un nouveau mot de passe est saisi
    if (formData.mot_de_passe) {
      if (formData.mot_de_passe !== formData.confirm_mot_de_passe) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
    }
    // Only send fields that were changed
    const dataToUpdate = {};
    if (formData.nom) dataToUpdate.nom = formData.nom;
    if (formData.prenom) dataToUpdate.prenom = formData.prenom;
    if (formData.email) dataToUpdate.email = formData.email;
    if (formData.mot_de_passe) dataToUpdate.mot_de_passe = formData.mot_de_passe;
    try {
      setIsLoading(true);
      await api.updateUser(selectedUser.id, dataToUpdate);
      await fetchUsers();
      closeEditModal();
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur');
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser, formData, fetchUsers]); // CHANGEMENT: Supprimé les dépendances 'api' et 'closeEditModal'

  

  const handleDeleteUser = async (userId) => {
    try {
      setIsLoading(true);
      await api.deleteUser(userId);
      await fetchUsers();
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    filteredUsers,
    currentPageUsers: getCurrentPageUsers(),
    isLoading,
    error,
    searchQuery,
    isStudentsView,
    currentPage,
    totalPages,
    selectedUser,
    isAddModalVisible,
    isEditModalVisible,
    formData,
    setSearchQuery,
    toggleView,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
    handleInputChange,
    goToPage,
    refreshData: fetchUsers
  };
};
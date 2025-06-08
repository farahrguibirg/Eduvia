import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de base de l'API - remplacer par une variable d'environnement ou configurable
const API_BASE_URL = 'http://192.168.1.10:5000';  // URL complète du serveur

// Fonction sécurisée pour récupérer le token depuis AsyncStorage (pour React Native)
const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.warn('AsyncStorage error:', error);
    return null;
  }
};

// Hook pour gérer les requêtes API
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const fetchOptions = {
        method: options.method || 'GET',
        headers: {
          ...headers,
          ...options.headers
        },
        ...(options.data && { body: JSON.stringify(options.data) })
      };

      console.log(`Fetching from: ${API_BASE_URL}${url}`);
      console.log('Request headers:', fetchOptions.headers);

      const response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error (${response.status}):`, errorData);
        throw new Error(`Request failed with status code ${response.status}`);
      }
      
      const responseData = await response.json();
      setData(responseData);
      setLoading(false);
      return responseData;
    } catch (error) {
      const errorMessage = error.message || 'Une erreur est survenue';
      console.error('API request error:', errorMessage);
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  return { loading, error, data, fetchData };
};

// Hook pour gérer les étudiants
export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const { loading, error, fetchData } = useApi();

  const getStudents = async () => {
    try {
      console.log('Fetching students...');
      const response = await fetchData('/api/email/students');
      
      if (response.success) {
        console.log(`Retrieved ${response.data.length} students`);
        setStudents(response.data);
      } else {
        console.warn('API returned success:false for students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedStudents(selectAll ? [] : students.map(student => student.id));
  };

  const toggleSelectStudent = (studentId) => {
    setSelectedStudents(prevSelected => {
      if (prevSelected.includes(studentId)) {
        const newSelected = prevSelected.filter(id => id !== studentId);
        setSelectAll(false);
        return newSelected;
      } else {
        const newSelected = [...prevSelected, studentId];
        if (newSelected.length === students.length) {
          setSelectAll(true);
        }
        return newSelected;
      }
    });
  };

  useEffect(() => {
    getStudents();
  }, []);

  return {
    students,
    loading,
    error,
    selectedStudents,
    selectAll,
    toggleSelectAll,
    toggleSelectStudent,
    getStudents
  };
};

// Hook pour gérer les enseignants
export const useTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const { loading, error, fetchData } = useApi();

  const getTeachers = async () => {
    try {
      const response = await fetchData('/api/email/teachers');
      
      if (response.success) {
        setTeachers(response.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des enseignants:', error);
    }
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedTeachers(selectAll ? [] : teachers.map(teacher => teacher.id));
  };

  const toggleSelectTeacher = (teacherId) => {
    setSelectedTeachers(prevSelected => {
      if (prevSelected.includes(teacherId)) {
        const newSelected = prevSelected.filter(id => id !== teacherId);
        setSelectAll(false);
        return newSelected;
      } else {
        const newSelected = [...prevSelected, teacherId];
        if (newSelected.length === teachers.length) {
          setSelectAll(true);
        }
        return newSelected;
      }
    });
  };

  useEffect(() => {
    getTeachers();
  }, []);

  return {
    teachers,
    loading,
    error,
    selectedTeachers,
    selectAll,
    toggleSelectAll,
    toggleSelectTeacher,
    getTeachers
  };
};

// Hook pour gérer les utilisateurs
export const useUsers = () => {
  const { loading, error, fetchData } = useApi();
  
  const getUser = async (userId) => {
    try {
      const response = await fetchData(`/api/email/users/${userId}`);
      return response;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
      throw error;
    }
  };
  
  return { getUser, loading, error };
};

// Hook pour gérer les logs d'emails
export const useEmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const { loading, error, fetchData } = useApi();
  
  const getEmailLogs = async () => {
    try {
      const response = await fetchData('/api/email/logs');
      if (response.success) {
        setLogs(response.data);
      }
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des logs d\'emails:', error);
      throw error;
    }
  };
  
  return { logs, getEmailLogs, loading, error };
};

// Hook pour gérer les emails
export const useEmails = () => {
  const { loading, error, fetchData } = useApi();
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(null);

  const sendEmail = async (userId, subject, message, templateName = null, context = {}) => {
    setEmailSending(true);
    setEmailSuccess(null);

    try {
      const payload = {
        user_id: userId,
        subject,
        message
      };

      if (templateName) {
        payload.template_name = templateName;
        payload.context = context;
      }

      const response = await fetchData('/api/send', {
        method: 'POST',
        data: payload
      });

      setEmailSuccess(response.success);
      setEmailSending(false);
      return response;
    } catch (error) {
      setEmailSuccess(false);
      setEmailSending(false);
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  };

  const sendMassEmail = async (userIds, subject, message, templateName = null, context = {}) => {
    setEmailSending(true);
    setEmailSuccess(null);

    try {
      const payload = {
        user_ids: userIds,
        subject,
        message
      };

      if (templateName) {
        payload.template_name = templateName;
        payload.context = context;
      }

      const response = await fetchData('/api/email/send/mass', {
        method: 'POST',
        data: payload
      });

      setEmailSuccess(response.success);
      setEmailSending(false);
      return response;
    } catch (error) {
      setEmailSuccess(false);
      setEmailSending(false);
      console.error('Erreur lors de l\'envoi des emails de masse:', error);
      throw error;
    }
  };

  const sendEmailToAllStudents = async (subject, message, templateName = null, context = {}) => {
    setEmailSending(true);
    setEmailSuccess(null);

    try {
      const payload = {
        subject,
        message
      };

      if (templateName) {
        payload.template_name = templateName;
        payload.context = context;
      }

      const response = await fetchData('/api/email/send/students', {
        method: 'POST',
        data: payload
      });

      setEmailSuccess(response.success);
      setEmailSending(false);
      return response;
    } catch (error) {
      setEmailSuccess(false);
      setEmailSending(false);
      console.error('Erreur lors de l\'envoi des emails aux étudiants:', error);
      throw error;
    }
  };

  const sendEmailToAllTeachers = async (subject, message, templateName = null, context = {}) => {
    setEmailSending(true);
    setEmailSuccess(null);

    try {
      const payload = {
        subject,
        message
      };

      if (templateName) {
        payload.template_name = templateName;
        payload.context = context;
      }

      const response = await fetchData('/api/email/send/teachers', {
        method: 'POST',
        data: payload
      });

      setEmailSuccess(response.success);
      setEmailSending(false);
      return response;
    } catch (error) {
      setEmailSuccess(false);
      setEmailSending(false);
      console.error('Erreur lors de l\'envoi des emails aux enseignants:', error);
      throw error;
    }
  };

  return {
    sendEmail,
    sendMassEmail,
    sendEmailToAllStudents,
    sendEmailToAllTeachers,
    emailSending,
    emailSuccess,
    error
  };
};
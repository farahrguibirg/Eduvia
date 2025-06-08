import { useState, useEffect } from 'react';
import { API_URL } from '../config';

/**
 * Hook pour gérer les quiz.
 * @param {number} [enseignantId=null] - ID de l'enseignant (facultatif).
 * @returns {Object} - Liste des quiz, état de chargement, et fonctions associées.
 */
export const useQuiz = (enseignantId = null) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const endpoint = enseignantId
          ? `${API_URL}/quiz/enseignant/${enseignantId}`
          : `${API_URL}/quiz`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des quiz:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [enseignantId]);

  return { quizzes, loading, error, setQuizzes };
};

/**
 * Hook pour ajouter un quiz.
 * @returns {Function} - Fonction pour ajouter un quiz.
 */
export const useAddQuiz = () => {
  const addQuiz = async (quizData) => {
    try {
      const response = await fetch(`${API_URL}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Erreur lors de l\'ajout du quiz:', err);
      throw err;
    }
  };

  return { addQuiz };
};

/**
 * Hook pour supprimer un quiz.
 * @returns {Function} - Fonction pour supprimer un quiz.
 */
export const useDeleteQuiz = () => {
  const deleteQuiz = async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/quiz/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du quiz:', err);
      throw err;
    }
  };

  return { deleteQuiz };
};
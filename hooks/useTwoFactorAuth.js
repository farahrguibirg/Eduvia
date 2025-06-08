import { useState } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

export function useTwoFactorAuth() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const send2FACode = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/security/2fa/send_code`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'envoi du code');
      }
      setMessage('Un code a été envoyé à votre email.');
    } catch (error) {
      setMessage(error.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };

  const verify2FACode = async (code) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/security/2fa/verify_code`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Code invalide');
      }
      setMessage('2FA activée !');
      setIs2FAEnabled(true);
    } catch (error) {
      setMessage(error.message || 'Erreur lors de la vérification du code');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/security/2fa/disable`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la désactivation');
      }
      setMessage('2FA désactivée.');
      setIs2FAEnabled(false);
    } catch (error) {
      setMessage(error.message || 'Erreur lors de la désactivation');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    message,
    is2FAEnabled,
    send2FACode,
    verify2FACode,
    disable2FA,
    setMessage,
  };
}

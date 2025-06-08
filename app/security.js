import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTwoFactorAuth } from '../hooks/useTwoFactorAuth';
import { useLanguage } from './i18n';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SecurityScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const {
    loading,
    message,
    is2FAEnabled,
    send2FACode,
    verify2FACode,
    disable2FA,
  } = useTwoFactorAuth();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={{ position: 'absolute', top: 40, left: 20, zIndex: 2 }}>
        <Ionicons name="arrow-back" size={28} color="#6818a5" />
      </TouchableOpacity>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Ionicons name="shield-checkmark-outline" size={28} color="#6818a5" />
          <Text style={styles.title}>{t('twoFactorAuth')}</Text>
        </View>
        <Text style={styles.description}>{t('twoFactorAuthDescription')}</Text>
        <TouchableOpacity style={styles.activateButton} onPress={send2FACode} disabled={loading}>
          <Ionicons name="mail-outline" size={22} color="#fff" />
          <Text style={styles.buttonText}>{loading ? t('sending') : t('enable2FA')}</Text>
        </TouchableOpacity>
        <View style={styles.inputRow}>
          <Ionicons name="key-outline" size={20} color="#6818a5" />
          <TextInput
            style={styles.input}
            placeholder={t('enterCode')}
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            maxLength={6}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.verifyButton} onPress={() => verify2FACode(code)} disabled={loading || !code}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
          <Text style={styles.buttonText}>{t('verify')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deactivateButton} onPress={() => {
          Alert.alert(
            t('disable2FA'),
            t('disable2FAConfirm'),
            [
              { text: t('confirm'), style: 'confirm' },
              { text: t('disable'), onPress: disable2FA, style: 'destructive' },
            ]
          );
        }} disabled={loading}>
          <Ionicons name="close-circle-outline" size={22} color="#fff" />
          <Text style={styles.buttonText}>{t('disable2FA')}</Text>
        </TouchableOpacity>
        {message ? (
          <Text style={message.toLowerCase().includes('succès') || message.toLowerCase().includes('success') ? styles.success : styles.error}>
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6818a5',
    marginLeft: 8,
  },
  description: {
    color: '#555',
    fontSize: 15,
    marginBottom: 18,
    marginTop: 4,
  },
  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6818a5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    justifyContent: 'center',
    shadowColor: '#6818a5',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f0fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6818a5',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
    backgroundColor: 'transparent',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    justifyContent: 'center',
  },
  deactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  success: {
    color: '#4CAF50',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  error: {
    color: '#dc3545',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from './i18n';

export default function Admin() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/AdminEnseignants')}
        >
          <Ionicons name="school-outline" size={24} color="#8B2FC9" />
          <Text style={styles.buttonText}>{t('teacherManagement')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/AdminStudents')}
        >
          <Ionicons name="person-outline" size={24} color="#8B2FC9" />
          <Text style={styles.buttonText}>{t('studentManagement')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B2FC9',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonText: {
    marginLeft: 15,
    fontSize: 18,
    color: '#333',
  },
});
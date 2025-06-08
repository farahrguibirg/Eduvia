import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../app/i18n';

const Sidebar = ({ visible, onClose }) => {
  const router = useRouter();
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({
    users: false,
    emails: false
  });
  const { user } = useAuth();

  const handleNavigation = (route) => {
    onClose();
    setTimeout(() => {
      router.replace(route);
    }, 100);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Menu simplifié pour les enseignants
  const menuItems = user?.type === 'enseignant' 
    ? [
        { route: '/cours', icon: 'book-outline', label: t('courses') },
        { route: '/', icon: 'home-outline', label: t('home') },
        { route: '/quiz', icon: 'help-circle-outline', label: t('quiz') }
      ]
    : user?.type === 'admin'
    ? [        { route: '/', icon: 'home-outline', label: t('home') },
    ] // Menu vide pour l'admin car il n'aura accès qu'aux fonctionnalités de gestion
    : [
        { route: '/', icon: 'home-outline', label: t('home') },
        { route: '/cours', icon: 'book-outline', label: t('courses') },
        { route: '/Chatbot', icon: 'chatbubble-outline', label: t('chatbot') },
        { route: '/resume', icon: 'document-text-outline', label: t('summaries') },
        { route: '/qcm', icon: 'checkbox-outline', label: t('qcm') },
        { route: '/traduction', icon: 'language-outline', label: t('translation') },
        { route: '/quiz', icon: 'help-circle-outline', label: t('quiz') }
      ];

  if (!visible) return null;

  return (
    <TouchableOpacity 
      style={styles.overlay} 
      activeOpacity={1} 
      onPress={onClose}
    >
      <TouchableOpacity 
        activeOpacity={1} 
        style={styles.container} 
        onPress={e => e.stopPropagation()}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('menu')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Menu items de base */}
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.menuItem} 
              onPress={() => handleNavigation(item.route)}
            >
              <Ionicons name={item.icon} size={24} color="#8B2FC9" />
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          {/* Section Administration - visible uniquement pour les admins */}
          {user?.type === 'admin' && (
            <>
              {/* Gestion des Utilisateurs */}
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation("/Admin")}>
                <Ionicons name="people-outline" size={24} color="#8B2FC9" />
                <Text style={styles.menuText}>{t('userManagement')}</Text>
              </TouchableOpacity>

              {/* Gestion des Emails */}
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation("/email")}>
                <Ionicons name="mail-outline" size={24} color="#8B2FC9" />
                <Text style={styles.menuText}>{t('emailManagement')}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    maxWidth: 400,
    backgroundColor: 'white',
    zIndex: 1001
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B2FC9'
  },
  closeButton: {
    padding: 4
  },
  content: {
    flex: 1,
    padding: 16
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333'
  },
  subMenuContainer: {
    marginLeft: 36,
    marginTop: 4
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  subMenuText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666'
  },
  chevron: {
    marginLeft: 'auto'
  }
});

export default Sidebar;

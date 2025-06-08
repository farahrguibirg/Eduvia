{/*import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SettingsPanel = ({ visible, onClose }) => {
  const router = useRouter();

  if (!visible) return null;

  const handleProfilePress = () => {
    router.push("/profile");
    onClose(); // Ferme le panneau après la navigation
  };

  const handleLogoutPress = () => {
    router.push("/WelcomeScreen");
    onClose(); // Ferme le panneau après la navigation
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
          <View style={styles.container}>
            {/*<ScrollView>
              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Paramètres généraux</Text>
                {/*<TouchableOpacity style={styles.option}>
                  <Ionicons name="notifications-outline" size={24} color="#0891b2" />
                  <Text style={styles.optionText}>Notifications</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option}>
                  <Ionicons name="language-outline" size={24} color="#6818a5" />
                  <Text style={styles.optionText}>Langue</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Compte</Text>
                <TouchableOpacity 
                  style={styles.option}
                  onPress={handleProfilePress}
                >
                  <Ionicons name="person-outline" size={24} color="#6818a5" />
                  <Text style={styles.optionText}>Profil</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option}>
                  <Ionicons name="shield-outline" size={24} color="#6818a5" />
                  <Text style={styles.optionText}>Sécurité</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={handleLogoutPress}>
                  <Ionicons name="log-out-outline" size={24} color="#6818a5" />
                  <Text style={styles.optionText}>Déconnexion</Text>
                </TouchableOpacity>
              </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
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
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  container: {
    width: 250,
    marginTop: 60,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 400,
  },
  settingsSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B2FC9',
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
});

export default SettingsPanel;*/}

{/*
              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Aide</Text>
                <TouchableOpacity style={styles.option}>
                  <Ionicons name="help-circle-outline" size={24} color="#0891b2" />
                  <Text style={styles.optionText}>Centre d'aide</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option}>
                  <Ionicons name="information-circle-outline" size={24} color="#0891b2" />
                  <Text style={styles.optionText}>À propos</Text>
                </TouchableOpacity>
              </View>*/}
            {/*</ScrollView>*/}

//settingpanel.js
//settingpanel.js
{/*
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../app/i18n';

const SettingsPanel = ({ visible, onClose }) => {
  const router = useRouter();
  const { currentLanguage, changeLanguage, t } = useLanguage(); // Ajout de t ici
  const [expandedSections, setExpandedSections] = useState({
    language: false
  });

  if (!visible) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProfilePress = () => {
    router.push("/profile");
    onClose();
  };

  const handleLogoutPress = () => {
    router.push("/WelcomeScreen");
    onClose();
  };

  const handleLanguageSelect = async (languageCode) => {
    await changeLanguage(languageCode);
    // Optionnel: fermer la section après sélection
    setExpandedSections(prev => ({ ...prev, language: false }));
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
          <View style={styles.container}>
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Paramètres généraux</Text>
              
              {/* Gestion des Langues 
              <TouchableOpacity style={styles.menuItem} onPress={() => toggleSection('language')}>
                <Ionicons name="language-outline" size={24} color="#8B2FC9" />
                <Text style={styles.menuText}>Langue</Text>
                <Ionicons
                  name={expandedSections.language ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#8B2FC9"
                  style={styles.chevron}
                />
              </TouchableOpacity>

              {expandedSections.language && (
                <View style={styles.subMenuContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.subMenuItem,
                      currentLanguage === 'fr' && styles.selectedLanguage
                    ]} 
                    onPress={() => handleLanguageSelect('fr')}
                  >
                    <Text style={styles.flag}>🇫🇷</Text>
                    <Text style={[
                      styles.subMenuText,
                      currentLanguage === 'fr' && styles.selectedText
                    ]}>
                      Français
                    </Text>
                    {currentLanguage === 'fr' && (
                      <Ionicons name="checkmark" size={20} color="#8B2FC9" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.subMenuItem,
                      currentLanguage === 'en' && styles.selectedLanguage
                    ]} 
                    onPress={() => handleLanguageSelect('en')}
                  >
                    <Text style={styles.flag}>🇺🇸</Text>
                    <Text style={[
                      styles.subMenuText,
                      currentLanguage === 'en' && styles.selectedText
                    ]}>
                      Anglais
                    </Text>
                    {currentLanguage === 'en' && (
                      <Ionicons name="checkmark" size={20} color="#8B2FC9" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Compte</Text>
              
              <TouchableOpacity
                style={styles.option}
                onPress={handleProfilePress}
              >
                <Ionicons name="person-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>Profil</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.option}>
                <Ionicons name="shield-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>Sécurité</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.option} onPress={handleLogoutPress}>
                <Ionicons name="log-out-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>Déconnexion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
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
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  container: {
    width: 250,
    marginTop: 60,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 400,
  },
  settingsSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B2FC9',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 'auto',
  },
  subMenuContainer: {
    marginLeft: 15,
    marginTop: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#f0f0ff',
    paddingLeft: 10,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 2,
  },
  selectedLanguage: {
    backgroundColor: '#f0f0ff',
  },
  flag: {
    fontSize: 20,
    marginRight: 10,
  },
  subMenuText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  selectedText: {
    color: '#8B2FC9',
    fontWeight: 'bold',
  },
  checkmark: {
    marginLeft: 'auto',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
});

export default SettingsPanel;*/}
//settingpanel.js
 {/*
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../app/i18n';

const SettingsPanel = ({ visible, onClose }) => {
  const router = useRouter();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({
    language: false
  });

  if (!visible) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProfilePress = () => {
    router.push("/profile");
    onClose();
  };

  const handleLogoutPress = () => {
    router.push("/WelcomeScreen");
    onClose();
  };

  const handleLanguageSelect = async (languageCode) => {
    await changeLanguage(languageCode);
    // Optionnel: fermer la section après sélection
    setExpandedSections(prev => ({ ...prev, language: false }));
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
          <View style={styles.container}>
            <View style={styles.settingsSection}>
              {/* Utilisation de t() pour le titre de la section 
              <Text style={styles.sectionTitle}>{t('generalSettings')}</Text>

              {/* Gestion des Langues 
              {/* Utilisation de t() pour le texte du menu 
              <TouchableOpacity style={styles.menuItem} onPress={() => toggleSection('language')}>
                <Ionicons name="language-outline" size={24} color="#8B2FC9" />
                <Text style={styles.menuText}>{t('language')}</Text>
                <Ionicons
                  name={expandedSections.language ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#8B2FC9"
                  style={styles.chevron}
                />
              </TouchableOpacity>

              {expandedSections.language && (
                <View style={styles.subMenuContainer}>
                  <TouchableOpacity
                    style={[
                      styles.subMenuItem,
                      currentLanguage === 'fr' && styles.selectedLanguage
                    ]}
                    onPress={() => handleLanguageSelect('fr')}
                  >
                    <Text style={styles.flag}>🇫🇷</Text>
                    {/* Utilisation de t() pour le nom de la langue 
                    <Text style={[
                      styles.subMenuText,
                      currentLanguage === 'fr' && styles.selectedText
                    ]}>
                      {t('french')}
                    </Text>
                    {currentLanguage === 'fr' && (
                      <Ionicons name="checkmark" size={20} color="#8B2FC9" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.subMenuItem,
                      currentLanguage === 'en' && styles.selectedLanguage
                    ]}
                    onPress={() => handleLanguageSelect('en')}
                  >
                    <Text style={styles.flag}>🇺🇸</Text>
                    {/* Utilisation de t() pour le nom de la langue 
                    <Text style={[
                      styles.subMenuText,
                      currentLanguage === 'en' && styles.selectedText
                    ]}>
                      {t('english')}
                    </Text>
                    {currentLanguage === 'en' && (
                      <Ionicons name="checkmark" size={20} color="#8B2FC9" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.settingsSection}>
              {/* Utilisation de t() pour le titre de la section 
              <Text style={styles.sectionTitle}>{t('account')}</Text>

              {/* Utilisation de t() pour le texte de l'option 
              <TouchableOpacity
                style={styles.option}
                onPress={handleProfilePress}
              >
                <Ionicons name="person-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('profile')}</Text>
              </TouchableOpacity>

              {/* Utilisation de t() pour le texte de l'option 
              <TouchableOpacity style={styles.option}>
                <Ionicons name="shield-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('security')}</Text>
              </TouchableOpacity>

              {/* Utilisation de t() pour le texte de l'option 
              <TouchableOpacity style={styles.option} onPress={handleLogoutPress}>
                <Ionicons name="log-out-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
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
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  container: {
    width: 250,
    marginTop: 60,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 400,
  },
  settingsSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B2FC9',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 'auto',
  },
  subMenuContainer: {
    marginLeft: 15,
    marginTop: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#f0f0ff',
    paddingLeft: 10,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 2,
  },
  selectedLanguage: {
    backgroundColor: '#f0f0ff',
  },
  flag: {
    fontSize: 20,
    marginRight: 10,
  },
  subMenuText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  selectedText: {
    color: '#8B2FC9',
    fontWeight: 'bold',
  },
  checkmark: {
    marginLeft: 'auto',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
});

export default SettingsPanel;
*/}{/*
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, TextInput, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../app/i18n';
import { useTwoFactorAuth } from '../hooks/useTwoFactorAuth';

const SettingsPanel = ({ visible, onClose }) => {
  const router = useRouter();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({ language: false, security: false });
  const [code, setCode] = useState('');

  // Utilisation du hook 2FA
  const {
    loading,
    message,
    is2FAEnabled,
    send2FACode,
    verify2FACode,
    disable2FA,
    setMessage,
  } = useTwoFactorAuth();

  if (!visible) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProfilePress = () => {
    router.push("/profile");
    onClose();
  };

  const handleLogoutPress = () => {
    router.push("/WelcomeScreen");
    onClose();
  };

  const handleLanguageSelect = async (languageCode) => {
    await changeLanguage(languageCode);
    setExpandedSections(prev => ({ ...prev, language: false }));
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
          <View style={styles.container}>
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>{t('generalSettings')}</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => toggleSection('language')}>
                <Ionicons name="language-outline" size={24} color="#8B2FC9" />
                <Text style={styles.menuText}>{t('language')}</Text>
                <Ionicons
                  name={expandedSections.language ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#8B2FC9"
                  style={styles.chevron}
                />
              </TouchableOpacity>
              {expandedSections.language && (
                <View style={styles.subMenuContainer}>
                  <TouchableOpacity
                    style={[styles.subMenuItem, currentLanguage === 'fr' && styles.selectedLanguage]}
                    onPress={() => handleLanguageSelect('fr')}
                  >
                    <Text style={styles.flag}>🇫🇷</Text>
                    <Text style={[styles.subMenuText, currentLanguage === 'fr' && styles.selectedText]}>{t('french')}</Text>
                    {currentLanguage === 'fr' && (
                      <Ionicons name="checkmark" size={20} color="#8B2FC9" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.subMenuItem, currentLanguage === 'en' && styles.selectedLanguage]}
                    onPress={() => handleLanguageSelect('en')}
                  >
                    <Text style={styles.flag}>🇺🇸</Text>
                    <Text style={[styles.subMenuText, currentLanguage === 'en' && styles.selectedText]}>{t('english')}</Text>
                    {currentLanguage === 'en' && (
                      <Ionicons name="checkmark" size={20} color="#8B2FC9" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>{t('account')}</Text>
              <TouchableOpacity style={styles.option} onPress={handleProfilePress}>
                <Ionicons name="person-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('profile')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option} onPress={() => toggleSection('security')}>
                <Ionicons name="shield-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('security')}</Text>
                <Ionicons
                  name={expandedSections.security ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#8B2FC9"
                  style={styles.chevron}
                />
              </TouchableOpacity>
              {expandedSections.security && (
                <View style={{ marginTop: 10 }}>
                  <Button 
                    title="Activer la 2FA par email" 
                    onPress={send2FACode}
                    disabled={loading}
                  />
                  <TextInput
                    placeholder="Code reçu par email"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="numeric"
                    style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginVertical: 8, padding: 6 }}
                  />
                  <Button 
                    title="Valider le code" 
                    onPress={() => verify2FACode(code)}
                    disabled={loading}
                  />
                  <Button 
                    title="Désactiver la 2FA" 
                    onPress={disable2FA} 
                    color="#e74c3c"
                    disabled={loading}
                  />
                  <Text style={{ color: '#8B2FC9', marginTop: 8, textAlign: 'center' }}>{message}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.option} onPress={handleLogoutPress}>
                <Ionicons name="log-out-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
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
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  container: {
    width: 250,
    marginTop: 60,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 400,
  },
  settingsSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B2FC9',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 'auto',
  },
  subMenuContainer: {
    marginLeft: 15,
    marginTop: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#f0f0ff',
    paddingLeft: 10,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 2,
  },
  selectedLanguage: {
    backgroundColor: '#f0f0ff',
  },
  flag: {
    fontSize: 20,
    marginRight: 10,
  },
  subMenuText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  selectedText: {
    color: '#8B2FC9',
    fontWeight: 'bold',
  },
  checkmark: {
    marginLeft: 'auto',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
});

export default SettingsPanel;*/}{/*
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, TextInput, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../app/i18n';
import { useTwoFactorAuth } from '../hooks/useTwoFactorAuth';
import { useAuth } from '../contexts/AuthContext';
const SettingsPanel = ({ visible, onClose }) => {
  const router = useRouter();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({ language: false, security: false });
  const [code, setCode] = useState('');
  const { logout } = useAuth();

  // Utilisation du hook 2FA
  const {
    loading,
    message,
    is2FAEnabled,
    send2FACode,
    verify2FACode,
    disable2FA,
    setMessage,
  } = useTwoFactorAuth();

  if (!visible) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProfilePress = () => {
    router.push("/profile");
    onClose();
  };
  const handleSecurityPress = () => {
    router.push("/security");
    onClose();
  };
  {/*const handleLogoutPress = () => {
    // Effacer toute l'historique de navigation et rediriger vers WelcomeScreen
    router.replace("/WelcomeScreen");
    onClose();
  };
  const handleLogoutPress = async () => {
  onClose();
  await logout();
};


  const handleLanguageSelect = async (languageCode) => {
    await changeLanguage(languageCode);
    setExpandedSections(prev => ({ ...prev, language: false }));
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
          <View style={styles.container}>
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>{t('generalSettings')}</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => toggleSection('language')}>
                <Ionicons name="language-outline" size={24} color="#8B2FC9" />
                <Text style={styles.menuText}>{t('language')}</Text>
                <Ionicons
                  name={expandedSections.language ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#8B2FC9"
                  style={styles.chevron}
                />
              </TouchableOpacity>
              {expandedSections.language && (
                <View style={styles.subMenuContainer}>
                  <TouchableOpacity
                    style={[styles.subMenuItem, currentLanguage === 'fr' && styles.selectedLanguage]}
                    onPress={() => handleLanguageSelect('fr')}
                  >
                    <Text style={styles.flag}>🇫🇷</Text>
                    <Text style={[styles.subMenuText, currentLanguage === 'fr' && styles.selectedText]}>{t('french')}</Text>
                    {currentLanguage === 'fr' && (
                      <Ionicons name="checkmark" size={20} color="#8B2FC9" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.subMenuItem, currentLanguage === 'en' && styles.selectedLanguage]}
                    onPress={() => handleLanguageSelect('en')}
                  >
                    <Text style={styles.flag}>🇺🇸</Text>
                    <Text style={[styles.subMenuText, currentLanguage === 'en' && styles.selectedText]}>{t('english')}</Text>
                    {currentLanguage === 'en' && (
                      <Ionicons name="checkmark" size={20} color="#8B2FC9" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>{t('account')}</Text>
              <TouchableOpacity style={styles.option} onPress={handleProfilePress}>
                <Ionicons name="person-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('profile')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option} onPress={handleSecurityPress}>
                <Ionicons name="shield-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('security')}</Text>
                
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.option} onPress={handleLogoutPress}>
                <Ionicons name="log-out-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
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
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  container: {
    width: 250,
    marginTop: 60,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 400,
  },
  settingsSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B2FC9',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 'auto',
  },
  subMenuContainer: {
    marginLeft: 15,
    marginTop: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#f0f0ff',
    paddingLeft: 10,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 2,
  },
  selectedLanguage: {
    backgroundColor: '#f0f0ff',
  },
  flag: {
    fontSize: 20,
    marginRight: 10,
  },
  subMenuText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  selectedText: {
    color: '#8B2FC9',
    fontWeight: 'bold',
  },
  checkmark: {
    marginLeft: 'auto',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
});

export default SettingsPanel;*/}{/*
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, TextInput, Button, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../app/i18n';
import { useTwoFactorAuth } from '../hooks/useTwoFactorAuth';
import { useAuth } from '../contexts/AuthContext';
const SettingsPanel = ({ visible, onClose }) => {
  const router = useRouter();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({ language: false, security: false });
  const [code, setCode] = useState('');
  const { logout } = useAuth();

  // Utilisation du hook 2FA
  const {
    loading,
    message,
    is2FAEnabled,
    send2FACode,
    verify2FACode,
    disable2FA,
    setMessage,
  } = useTwoFactorAuth();

  if (!visible) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProfilePress = () => {
    router.push("/profile");
    onClose();
  };
  const handleSecurityPress = () => {
    router.push("/security");
    onClose();
  };
  {/*const handleLogoutPress = () => {
    // Effacer toute l'historique de navigation et rediriger vers WelcomeScreen
    router.replace("/WelcomeScreen");
    onClose();
  };
  const handleLogoutPress = () => {
    Alert.alert(
      t('confirmation'),
      t('logoutConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              onClose();
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert(t('error'), t('logoutError'));
            }
          }
        }
      ]
    );
  };

  const handleLanguageSelect = async (languageCode) => {
    await changeLanguage(languageCode);
    setExpandedSections(prev => ({ ...prev, language: false }));
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
          <View style={styles.container}>
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>{t('generalSettings')}</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => toggleSection('language')}>
                <Ionicons name="language-outline" size={24} color="#8B2FC9" />
                <Text style={styles.menuText}>{t('language')}</Text>
                <Ionicons
                  name={expandedSections.language ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#8B2FC9"
                  style={styles.chevron}
                />
              </TouchableOpacity>
              {expandedSections.language && (
                <View style={styles.subMenuContainer}>
                  <TouchableOpacity
                    style={[styles.subMenuItem, currentLanguage === 'fr' && styles.selectedLanguage]}
                    onPress={() => handleLanguageSelect('fr')}
                  >
                    <Text style={styles.flag}>🇫🇷</Text>
                    <Text style={[styles.subMenuText, currentLanguage === 'fr' && styles.selectedText]}>{t('french')}</Text>
                    {currentLanguage === 'fr' && (
                      <Ionicons name="checkmark" size={20} color="#8B2FC9" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.subMenuItem, currentLanguage === 'en' && styles.selectedLanguage]}
                    onPress={() => handleLanguageSelect('en')}
                  >
                    <Text style={styles.flag}>🇺🇸</Text>
                    <Text style={[styles.subMenuText, currentLanguage === 'en' && styles.selectedText]}>{t('english')}</Text>
                    {currentLanguage === 'en' && (
                      <Ionicons name="checkmark" size={20} color="#8B2FC9" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>{t('account')}</Text>
              <TouchableOpacity style={styles.option} onPress={handleProfilePress}>
                <Ionicons name="person-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('profile')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option} onPress={handleSecurityPress}>
                <Ionicons name="shield-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('security')}</Text>
                
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.option} onPress={handleLogoutPress}>
                <Ionicons name="log-out-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
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
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  container: {
    width: 250,
    marginTop: 60,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 400,
  },
  settingsSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B2FC9',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 'auto',
  },
  subMenuContainer: {
    marginLeft: 15,
    marginTop: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#f0f0ff',
    paddingLeft: 10,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 2,
  },
  selectedLanguage: {
    backgroundColor: '#f0f0ff',
  },
  flag: {
    fontSize: 20,
    marginRight: 10,
  },
  subMenuText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  selectedText: {
    color: '#8B2FC9',
    fontWeight: 'bold',
  },
  checkmark: {
    marginLeft: 'auto',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
});

export default SettingsPanel;*/}
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, TextInput, Button, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../app/i18n';
import { useTwoFactorAuth } from '../hooks/useTwoFactorAuth';
import { useAuth } from '../contexts/AuthContext';

const SettingsPanel = ({ visible, onClose }) => {
  const router = useRouter();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({ language: false, security: false });
  const [code, setCode] = useState('');
  const { logout } = useAuth();

  // Utilisation du hook 2FA
  const {
    loading,
    message,
    is2FAEnabled,
    send2FACode,
    verify2FACode,
    disable2FA,
    setMessage,
  } = useTwoFactorAuth();

  if (!visible) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProfilePress = () => {
    router.push("/profile");
    onClose();
  };
  
  const handleSecurityPress = () => {
    router.push("/security");
    onClose();
  };
  
  const handleLogoutPress = () => {
    Alert.alert(
      t('confirmation'),
      t('logoutConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              onClose();
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert(t('error'), t('logoutError'));
            }
          }
        }
      ]
    );
  };

  const handleLanguageSelect = async (languageCode) => {
    await changeLanguage(languageCode);
    setExpandedSections(prev => ({ ...prev, language: false }));
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
          <View style={styles.container}>
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>{t('generalSettings')}</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => toggleSection('language')}>
                <Ionicons name="language-outline" size={24} color="#8B2FC9" />
                <Text style={styles.menuText}>{t('language')}</Text>
                <Ionicons
                  name={expandedSections.language ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#8B2FC9"
                  style={styles.chevron}
                />
              </TouchableOpacity>
              {expandedSections.language && (
                <View style={styles.subMenuContainer}>
                  <TouchableOpacity
                    style={[styles.subMenuItem, currentLanguage === 'fr' && styles.selectedLanguage]}
                    onPress={() => handleLanguageSelect('fr')}
                  >
                    <Text style={styles.flag}>🇫🇷</Text>
                    <Text style={[styles.subMenuText, currentLanguage === 'fr' && styles.selectedText]}>{t('french')}</Text>
                    {currentLanguage === 'fr' && (
                      <Ionicons name="checkmark" size={20} color="#8B2FC9" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.subMenuItem, currentLanguage === 'en' && styles.selectedLanguage]}
                    onPress={() => handleLanguageSelect('en')}
                  >
                    <Text style={styles.flag}>🇺🇸</Text>
                    <Text style={[styles.subMenuText, currentLanguage === 'en' && styles.selectedText]}>{t('english')}</Text>
                    {currentLanguage === 'en' && (
                      <Ionicons name="checkmark" size={20} color="#8B2FC9" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.subMenuItem, currentLanguage === 'ar' && styles.selectedLanguage]}
                    onPress={() => handleLanguageSelect('ar')}
                  >
                    <Text style={styles.flag}>🇸🇦</Text>
                    <Text style={[styles.subMenuText, currentLanguage === 'ar' && styles.selectedText]}>{t('arabic')}</Text>
                    {currentLanguage === 'ar' && (
                      <Ionicons name="checkmark" size={20} color="#8B2FC9" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>{t('account')}</Text>
              <TouchableOpacity style={styles.option} onPress={handleProfilePress}>
                <Ionicons name="person-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('profile')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option} onPress={handleSecurityPress}>
                <Ionicons name="shield-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('security')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.option} onPress={handleLogoutPress}>
                <Ionicons name="log-out-outline" size={24} color="#6818a5" />
                <Text style={styles.optionText}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
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
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  container: {
    width: 250,
    marginTop: 60,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 400,
  },
  settingsSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B2FC9',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 'auto',
  },
  subMenuContainer: {
    marginLeft: 15,
    marginTop: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#f0f0ff',
    paddingLeft: 10,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 2,
  },
  selectedLanguage: {
    backgroundColor: '#f0f0ff',
  },
  flag: {
    fontSize: 20,
    marginRight: 10,
  },
  subMenuText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  selectedText: {
    color: '#8B2FC9',
    fontWeight: 'bold',
  },
  checkmark: {
    marginLeft: 'auto',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
});

export default SettingsPanel;
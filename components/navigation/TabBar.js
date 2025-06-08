import { View, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import TabBarButton from './TabBarButton';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../app/i18n';
import { icons } from '../../assets/icons';

const TabBar = ({ state, descriptors, navigation, userType, userId }) => {
    const { t } = useLanguage();
    const primaryColor = '#AB51E3';
    const greyColor = '#5A108F';
    
    // Filtrer et réorganiser les routes
    const orderedRoutes = [...state.routes]
        .filter(route => {
            // Pour les enseignants, ne montrer que les cours, quiz et l'accueil
            if (userType === 'enseignant') {
                return ['cours', 'quiz', 'index'].includes(route.name);
            }
            // Pour les administrateurs, ne montrer que les routes de gestion
            if (userType === 'admin') {
                return ['Admin', 'email', 'index'].includes(route.name);
            }
            // Pour les étudiants, montrer toutes les routes sauf celles exclues
            return !['_sitemap', '+not-found', 'profile', 'login', 'signup','EmailStudents','EmailEnseignants','Admin','AdminEnseignants','AdminStudents','email','WelcomeScreen','security'].includes(route.name);
        })
        .sort((a, b) => {
            const order = userType === 'enseignant' ? {
                'cours': 1,
                'index': 2,
                'quiz': 3
            } : userType === 'admin' ? {
                'Admin': 1,
                'email': 3,
                'index': 2
            } : {
                'cours': 1,
                'Chatbot': 2,
                'resume': 3,
                'index': 4,
                'qcm': 5,
                'traduction': 6,
                'quiz': 7
            };
            return (order[a.name] || 99) - (order[b.name] || 99);
        });

    // Fonction pour obtenir le label traduit
    const getTranslatedLabel = (routeName) => {
        switch (routeName) {
            case 'cours':
                return t('coursess');
            case 'quiz':
                return t('quiz');
            case 'index':
                return t('home');
            case 'Chatbot':
                return t('chatbot');
            case 'resume':
                return t('resume');
            case 'qcm':
                return t('qcm');
            case 'traduction':
                return t('translation');
            case 'Admin':
                return t('userManagement');
            case 'email':
                return t('emailManagement');
            default:
                return routeName;
        }
    };

    return (
        <View style={styles.tabBar}>
            {orderedRoutes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = getTranslatedLabel(route.name);
                const isFocused = state.routes.indexOf(route) === state.index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        if (route.name === 'quiz') {
                            navigation.navigate('quiz', { userType: userType, userId: userId });
                        } else {
                            navigation.navigate(route.name);
                        }
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                if (route.name === 'index') {
                    return (
                        <TabBarButton 
                            key={route.key}
                            style={styles.tabbarItem}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            isFocused={isFocused}
                            routeName="home"
                            color={isFocused ? primaryColor : greyColor}
                            label={t('home')}
                        />
                    );
                }

                if (route.name === 'Admin') {
                    return (
                        <TabBarButton 
                            key={route.key}
                            style={styles.tabbarItem}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            isFocused={isFocused}
                            routeName="admin"
                            color={isFocused ? primaryColor : greyColor}
                            label={label}
                        />
                    );
                }

                if (route.name === 'email') {
                    return (
                        <TabBarButton 
                            key={route.key}
                            style={styles.tabbarItem}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            isFocused={isFocused}
                            routeName="email"
                            color={isFocused ? primaryColor : greyColor}
                            label={label}
                        />
                    );
                }

                return (
                    <TabBarButton 
                        key={route.key}
                        style={styles.tabbarItem}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        isFocused={isFocused}
                        routeName={route.name}
                        color={isFocused ? primaryColor : greyColor}
                        label={label}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'white',
        height: 60,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    tabbarItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default TabBar;
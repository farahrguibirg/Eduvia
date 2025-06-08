import React from 'react';
import { AntDesign, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

// Définir les icônes en minuscules pour assurer la cohérence avec les noms de routes
export const icons = {
    index: () => (
        <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#AB51E3',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        }}>
            <AntDesign name="home" size={28} color="#fff" />
        </View>
    ),
    cours: ({ color }) => <MaterialIcons name="menu-book" size={24} color={color} />,
    profile: ({ color }) => <Feather name="user" size={24} color={color} />,
    Chatbot: ({ color }) => <Ionicons name="chatbubble-ellipses-outline" size={24} color={color} />,
    resume: ({ color }) => <MaterialIcons name="summarize" size={24} color={color} />,
    qcm: ({ color }) => (
        <View style={{ alignItems: 'center', width: 24, height: 24, justifyContent: 'center' }}>
            <MaterialIcons name="fact-check" size={22} color={color} />
        </View>
    ),
    traduction: ({ color }) => <Ionicons name="language" size={24} color={color} />,
    quiz: ({ color }) => <AntDesign name="questioncircle" size={24} color={color} />,
    admin: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />,
    email: ({ color }) => <Ionicons name="mail-outline" size={24} color={color} />,
    
    // Ajouter des variantes pour assurer la compatibilité
    'chatbot': ({ color }) => <Ionicons name="chatbubble-ellipses-outline" size={24} color={color} />,
    'home': () => (
        <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#5A108F',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
            elevation: 4,
            shadowColor: '#AB51E3',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        }}>
            <AntDesign name="home" size={28} color="#fff" />
        </View>
    ),
    'user': ({ color }) => <Feather name="user" size={24} color={color} />,
    'summary': ({ color }) => <MaterialIcons name="summarize" size={24} color={color} />,
    'translation': ({ color }) => <Ionicons name="language" size={24} color={color} />,
};
import { View, Text, Pressable, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { icons } from '../../assets/icons';
import Animated, { 
    interpolate, 
    useAnimatedStyle, 
    useSharedValue, 
    withSpring,
    withTiming
} from 'react-native-reanimated';

const TabBarButton = (props) => {
    const { isFocused, label, routeName, color, onPress } = props;

    // Utiliser une valeur animée
    const scale = useSharedValue(0);

    // Mettre à jour la valeur animée lorsque isFocused change
    useEffect(() => {
        scale.value = withSpring(
            isFocused ? 1 : 0,
            { 
                damping: 12,
                stiffness: 120 
            }
        );
    }, [isFocused, scale]);

    // Style animé pour l'icône
    const animatedIconStyle = useAnimatedStyle(() => {
        const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
        const translateY = interpolate(scale.value, [0, 1], [0, -8]);
        
        return {
            transform: [{ scale: scaleValue }, { translateY }]
        };
    });

    // Style animé pour le texte
    const animatedTextStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scale.value, [0, 1], [1, 0]);
        const translateY = interpolate(scale.value, [0, 1], [0, 10]);
        
        return { 
            opacity,
            transform: [{ translateY }]
        };
    });

    // Composant d'icône pour ce bouton basé sur le nom de la route
    const IconComponent = icons[routeName.toLowerCase()];

    return (
        <Pressable 
            onPress={onPress}
            style={styles.container}
            android_ripple={{ color: '#e0e0e0', borderless: true, radius: 24 }}
        >
            <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                {IconComponent && <IconComponent color={color} />}
            </Animated.View>

            <Animated.Text style={[styles.label, { color }, animatedTextStyle]}>
                {label}
            </Animated.Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 11,
        marginTop: 4,
        textAlign: 'center',
    }
});

export default TabBarButton;
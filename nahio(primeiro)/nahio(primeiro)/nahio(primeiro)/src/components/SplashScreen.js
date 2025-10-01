import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { colors } from '../styles/colors';
import LoginScreen from '../screens/LoginScreen';
const appLogo = require('../../assets/logo.png');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 7000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 7000,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 7000,
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.navigate('LoginScreen');
    }, 7000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image source={appLogo} style={styles.logoImage} resizeMode="contain" />
      </Animated.View>

      <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
        <Text style={styles.appName}>Nahio</Text>
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 80,
  },
  logoImage: {
    width: 250,
    height: 250,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary || '#000000',
    marginBottom: 40,
    letterSpacing: 2,
  },
  progressContainer: {
    width: 200,
    height: 4,
    backgroundColor: colors.backgroundSecondary || '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary || '#007AFF',
    borderRadius: 2,
  },
});

export default SplashScreen;
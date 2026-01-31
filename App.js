// HomeFit - Main App Entry Point
import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, Image, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Font from 'expo-font';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ExercisesScreen from './src/screens/ExercisesScreen';
import RoutinesScreen from './src/screens/RoutinesScreen';
import TrainingScreen from './src/screens/TrainingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Theme and translations
import { colors } from './src/theme';
import { loadSettings } from './src/storage/storage';

const Tab = createBottomTabNavigator();

// Tab bar icons - loaded from assets/icons/
const tabIcons = {
  Home: require('./assets/icons/home.png'),
  Exercises: require('./assets/icons/exercises.png'),
  Routines: require('./assets/icons/routines.png'),
  Profile: require('./assets/icons/profile.png'),
  Settings: require('./assets/icons/settings.png'),
};

// Custom icon component using PNG images
const TabIcon = ({ routeName, focused }) => (
  <View style={styles.tabIconContainer}>
    <Image
      source={tabIcons[routeName]}
      style={[
        styles.tabIcon,
        { opacity: focused ? 1 : 0.5 }
      ]}
      resizeMode="contain"
    />
  </View>
);

// Tab navigator with safe area handling
function MainNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: route.name === 'Training'
          ? { display: 'none' }
          : {
              backgroundColor: '#000000',
              borderTopWidth: 0,
              height: 50 + insets.bottom,
              paddingBottom: insets.bottom,
            },
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon routeName={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Exercises" component={ExercisesScreen} />
      <Tab.Screen name="Routines" component={RoutinesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen
        name="Training"
        component={TrainingScreen}
        options={{ tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [language, setLanguage] = useState('en');
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'ArialNarrow': require('./assets/fonts/ARIALN.ttf'),
          'JosefinSans': require('./assets/fonts/JosefinSans-Regular.ttf'),
          'JosefinSans-Bold': require('./assets/fonts/JosefinSans-Bold.ttf'),
          'JosefinSans-BoldItalic': require('./assets/fonts/JosefinSans-BoldItalic.ttf'),
          'JosefinSans-Italic': require('./assets/fonts/JosefinSans-Italic.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        // Still allow app to run with system fonts
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  // Load language setting on mount and when app regains focus
  const loadLanguage = useCallback(async () => {
    const settings = await loadSettings();
    setLanguage(settings.language || 'en');
  }, []);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer onStateChange={loadLanguage}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.primary}
        />
        <MainNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  loadingText: {
    marginTop: 10,
    color: colors.white,
    fontSize: 16,
  },
  tabIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    width: 34,
    height: 34,
  },
});

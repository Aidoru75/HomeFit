// HomeFit - Main App Entry Point
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Image, StyleSheet, View, ActivityIndicator, Text, Platform, Linking } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ExercisesScreen from './src/screens/ExercisesScreen';
import RoutinesScreen from './src/screens/RoutinesScreen';
import TrainingScreen from './src/screens/TrainingScreen';
import StatsScreen from './src/screens/StatsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Config
import { IS_PRO } from './src/config';

// Theme and translations
import { colors } from './src/theme';
import { loadSettings, seedDefaultRoutines, checkOnboarded, markOnboarded } from './src/storage/storage';
import OnboardingWalkthrough from './src/components/OnboardingWalkthrough';
import { ThemeProvider } from './src/context/ThemeContext';
import { readAndValidateBackup, promptAndImport } from './src/utils/backupImport';

const Tab = createBottomTabNavigator();

// Tab bar icons - loaded from assets/icons/
const tabIcons = {
  Home: require('./assets/icons/home.png'),
  Exercises: require('./assets/icons/exercises.png'),
  Routines: require('./assets/icons/routines.png'),
  Stats: require('./assets/icons/stats.png'),
  Profile: require('./assets/icons/profile.png'),
  Settings: require('./assets/icons/settings.png'),
};

// Tab bar configuration
const TAB_BAR_HEIGHT = 58;
const ICON_SIZE = 34;

// Tab navigator
function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: route.name === 'Training'
          ? { display: 'none' }
          : {
              backgroundColor: '#000000',
              borderTopWidth: 0,
              height: TAB_BAR_HEIGHT,
              paddingTop: 8,
              paddingBottom: 8,
            },
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => (
          <Image
            source={tabIcons[route.name]}
            style={{
              width: ICON_SIZE,
              height: ICON_SIZE,
              opacity: focused ? 1 : 0.5,
            }}
            resizeMode="contain"
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Exercises" component={ExercisesScreen} />
      <Tab.Screen name="Routines" component={RoutinesScreen} />
      {IS_PRO && <Tab.Screen name="Stats" component={StatsScreen} />}
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen
        name="Training"
        component={TrainingScreen}
        options={{ tabBarButton: () => null,
        tabBarItemStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [language, setLanguage] = useState('en');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigationRef = useNavigationContainerRef();

  // Configure Android navigation bar (immersive mode)
  useEffect(() => {
    async function configureNavigationBar() {
      if (Platform.OS === 'android') {
        try {
          await NavigationBar.setVisibilityAsync('hidden');
        } catch (error) {
          console.warn('Failed to configure navigation bar:', error);
        }
      }
    }
    configureNavigationBar();
  }, []);

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
    async function init() {
      await loadLanguage();
      seedDefaultRoutines();
      const onboarded = await checkOnboarded();
      if (!onboarded) setShowOnboarding(true);
    }
    init();
  }, [loadLanguage]);

  // Handle .homefit backup files opened from other apps (WhatsApp, Files, etc.)
  useEffect(() => {
    const handle = async (url) => {
      // Only handle file/content URIs — ignore homefit:// deep links and null
      if (!url || (!url.startsWith('content://') && !url.startsWith('file://'))) return;
      try {
        const backup = await readAndValidateBackup(url);
        promptAndImport(backup, language, Alert);
      } catch (e) {
        Alert.alert('HomeFit', e.message === 'invalid' ? 'Invalid backup file.' : 'Could not open backup file.');
      }
    };
    Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', ({ url }) => handle(url));
    return () => sub.remove();
  }, [language]);

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Deep link configuration for routine import
  const linking = {
    prefixes: ['homefit://', 'homefitfree://'],
    config: {
      screens: {
        Routines: {
          path: 'import',
        },
      },
    },
  };

  return (
    <ThemeProvider>
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} linking={linking} onStateChange={loadLanguage}>
        <StatusBar style="light" backgroundColor={colors.primary} />
        <MainNavigator />
      </NavigationContainer>
      {showOnboarding && (
        <OnboardingWalkthrough
          lang={language}
          onDone={async () => {
            await markOnboarded();
            setShowOnboarding(false);
          }}
        />
      )}
    </SafeAreaProvider>
    </ThemeProvider>
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
});

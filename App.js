// HomeFit - Main App Entry Point
import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
import { t } from './src/data/translations';

const Tab = createBottomTabNavigator();

// Simple icon component
const TabIcon = ({ icon, focused }) => (
  <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
    {icon}
  </Text>
);

export default function App() {
  const [language, setLanguage] = useState('en');

  // Load language setting on mount and when app regains focus
  const loadLanguage = useCallback(async () => {
    const settings = await loadSettings();
    setLanguage(settings.language || 'en');
  }, []);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  return (
    <SafeAreaProvider>
      <NavigationContainer onStateChange={loadLanguage}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            // Hide tab bar on Training screen
            tabBarStyle: route.name === 'Training' 
              ? { display: 'none' }
              : {
                  backgroundColor: colors.white,
                  borderTopColor: colors.border,
                  height: 90,
                  paddingBottom: 30,
                  paddingTop: 10,
                },
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textLight,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '500',
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: t('home', language),
              tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Exercises"
            component={ExercisesScreen}
            options={{
              tabBarLabel: t('exercises', language),
              tabBarIcon: ({ focused }) => <TabIcon icon="💪" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Routines"
            component={RoutinesScreen}
            options={{
              tabBarLabel: t('routines', language),
              tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: t('profile', language),
              tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarLabel: t('settings', language),
              tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Training"
            component={TrainingScreen}
            options={{
              tabBarButton: () => null, // Hidden from tab bar
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

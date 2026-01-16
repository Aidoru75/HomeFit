// HomeFit - Main App Entry Point
import React, { useEffect } from 'react';
import { StatusBar, Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ExercisesScreen from './src/screens/ExercisesScreen';
import RoutinesScreen from './src/screens/RoutinesScreen';
import TrainingScreen from './src/screens/TrainingScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Theme
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

// Simple icon component
const TabIcon = ({ icon, focused }) => (
  <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
    {icon}
  </Text>
);

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('transparent');
      NavigationBar.setPositionAsync('absolute');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
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
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Exercises"
            component={ExercisesScreen}
            options={{
              tabBarLabel: 'Exercises',
              tabBarIcon: ({ focused }) => <TabIcon icon="💪" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Routines"
            component={RoutinesScreen}
            options={{
              tabBarLabel: 'Routines',
              tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarLabel: 'Settings',
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

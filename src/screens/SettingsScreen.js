// Settings Screen - App preferences (without profile - moved to ProfileScreen)
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import { spacing, borderRadius, fontSize, shadows, fonts } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { loadSettings, saveSettings } from '../storage/storage';
import { t } from '../data/translations';
import {
  inchesToCm,
  cmToInches,
  lbToKg,
  kgToLb,
} from '../utils/unitConversions';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [settings, setSettings] = useState({
    language: 'en',
    soundEnabled: true,
    soundVolume: 1.0,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    const saved = await loadSettings();
    setSettings(saved);
    setLoaded(true);
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const isImperial = settings.measurementSystem === 'imperial';

  // Handle measurement system change with value conversion
  const changeMeasurementSystem = async (newSystem) => {
    const currentSystem = settings.measurementSystem || 'metric';
    if (newSystem === currentSystem) return;

    const newSettings = { ...settings, measurementSystem: newSystem };

    // Convert height if it exists
    if (settings.userHeight) {
      const currentHeight = parseFloat(settings.userHeight);
      if (!isNaN(currentHeight) && currentHeight > 0) {
        if (newSystem === 'imperial') {
          // cm -> inches
          const totalInches = Math.round(cmToInches(currentHeight));
          newSettings.userHeight = String(totalInches);
        } else {
          // inches -> cm
          const cm = Math.round(inchesToCm(currentHeight));
          newSettings.userHeight = String(cm);
        }
      }
    }

    // Convert weight if it exists
    if (settings.userWeight) {
      const currentWeight = parseFloat(settings.userWeight);
      if (!isNaN(currentWeight) && currentWeight > 0) {
        if (newSystem === 'imperial') {
          // kg -> lbs
          const lbs = Math.round(kgToLb(currentWeight));
          newSettings.userWeight = String(lbs);
        } else {
          // lbs -> kg
          const kg = Math.round(lbToKg(currentWeight));
          newSettings.userWeight = String(kg);
        }
      }
    }

    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleLanguageChange = async (newLanguage) => {
    if (newLanguage === settings.language) return;
    
    // Get the correct translation for the confirmation based on the NEW language
    const confirmTitle = newLanguage === 'es' ? 'Cambiar Idioma' : 'Change Language';
    const confirmMessage = newLanguage === 'es' 
      ? 'La aplicación se reiniciará para aplicar el nuevo idioma.'
      : 'The app will restart to apply the new language.';
    const cancelText = newLanguage === 'es' ? 'Cancelar' : 'Cancel';
    const confirmText = newLanguage === 'es' ? 'Reiniciar' : 'Restart';
    
    Alert.alert(
      confirmTitle,
      confirmMessage,
      [
        { text: cancelText, style: 'cancel' },
        { 
          text: confirmText, 
          onPress: async () => {
            // Save the new language setting first
            const newSettings = { ...settings, language: newLanguage };
            await saveSettings(newSettings);
            
            // Reload the app
            try {
              await Updates.reloadAsync();
            } catch (error) {
              // If Updates.reloadAsync fails (e.g., in development), 
              // just update the state and show a message
              console.log('Could not reload app:', error);
              setSettings(newSettings);
              Alert.alert(
                newLanguage === 'es' ? 'Nota' : 'Note',
                newLanguage === 'es' 
                  ? 'Por favor, cierra y vuelve a abrir la app para ver todos los cambios.'
                  : 'Please close and reopen the app to see all changes.'
              );
            }
          }
        },
      ]
    );
  };

  const lang = settings.language;

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>{t('settingsTitle', lang)}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Section */}
        <Text style={styles.sectionTitle}>{t('language', lang)}</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{t('selectLanguage', lang)}</Text>
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                settings.language === 'en' && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[
                styles.languageButtonText,
                settings.language === 'en' && styles.languageButtonTextActive,
              ]}>
                🇬🇧 {t('english', lang)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                settings.language === 'es' && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageChange('es')}
            >
              <Text style={[
                styles.languageButtonText,
                settings.language === 'es' && styles.languageButtonTextActive,
              ]}>
                🇪🇸 {t('spanish', lang)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Measurement System Section */}
        <Text style={styles.sectionTitle}>{t('measurementSystem', lang)}</Text>
        <View style={styles.card}>
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                !isImperial && styles.languageButtonActive,
              ]}
              onPress={() => changeMeasurementSystem('metric')}
            >
              <Text style={[
                styles.languageButtonText,
                !isImperial && styles.languageButtonTextActive,
              ]}>
                {t('metric', lang)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                isImperial && styles.languageButtonActive,
              ]}
              onPress={() => changeMeasurementSystem('imperial')}
            >
              <Text style={[
                styles.languageButtonText,
                isImperial && styles.languageButtonTextActive,
              ]}>
                {t('imperial', lang)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sound Section */}
        <Text style={styles.sectionTitle}>{t('sound', lang)}</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>{t('countdownSound', lang)}</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => updateSetting('soundEnabled', value)}
              trackColor={{ false: colors.border, true: colors.accentLight }}
              thumbColor={settings.soundEnabled ? colors.accent : colors.textLight}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>{t('voiceAnnouncements', lang)}</Text>
            <Switch
              value={settings.voiceEnabled}
              onValueChange={(value) => updateSetting('voiceEnabled', value)}
              trackColor={{ false: colors.border, true: colors.accentLight }}
              thumbColor={settings.voiceEnabled ? colors.accent : colors.textLight}
            />
          </View>

          {(settings.soundEnabled || settings.voiceEnabled) && (
            <View style={styles.volumeContainer}>
              <Text style={styles.label}>{t('volume', lang)}</Text>
              <View style={styles.sliderRow}>
                <Text style={styles.volumeIcon}>🔈</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={settings.soundVolume}
                  onSlidingComplete={(value) => updateSetting('soundVolume', value)}
                  minimumTrackTintColor={colors.accent}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.accent}
                />
                <Text style={styles.volumeIcon}>🔊</Text>
              </View>
              <Text style={styles.volumeValue}>
                {Math.round(settings.soundVolume * 100)}%
              </Text>
            </View>
          )}
        </View>

        {/* DARK MODE TOGGLE — comment out the block below to hide from users */}
        <Text style={styles.sectionTitle}>{t('appearance', lang)}</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>{t('darkMode', lang)}</Text>
            <Switch
              value={isDark}
              onValueChange={toggleDark}
              trackColor={{ false: colors.border, true: colors.accentLight }}
              thumbColor={isDark ? colors.accent : colors.textLight}
            />
          </View>
        </View>
        {/* END DARK MODE TOGGLE */}

        {/* About Section */}
        <Text style={styles.sectionTitle}>{t('about', lang)}</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>HomeFit</Text>
            <Text style={styles.aboutValue}>{t('version', lang)} {Constants.expoConfig?.version || '1.0.0'}</Text>
          </View>
        </View>

        {/* Legal Section */}
        <Text style={styles.sectionTitle}>{t('legal', lang)}</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.legalRow}
            onPress={() => Linking.openURL('https://www.aidoru.com/homefit/privacy-policy.html')}
          >
            <Text style={styles.legalLink}>{t('privacyPolicy', lang)}</Text>
            <Text style={styles.legalChevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.legalDivider} />
          <TouchableOpacity
            style={styles.legalRow}
            onPress={() => Linking.openURL('https://www.aidoru.com/homefit/terms-of-service.html')}
          >
            <Text style={styles.legalLink}>{t('termsOfService', lang)}</Text>
            <Text style={styles.legalChevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  header: {
    backgroundColor: colors.primary,
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xxl,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  languageButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: colors.accent,
  },
  languageButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  languageButtonTextActive: {
    color: colors.white,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  volumeIcon: {
    fontFamily: fonts.regular,
    fontSize: 18,
    width: 30,
    textAlign: 'center',
  },
  volumeValue: {
    fontFamily: fonts.regular,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  aboutValue: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  bottomPadding: {
    height: 100,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  legalLink: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.accent,
  },
  legalChevron: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  legalDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
});

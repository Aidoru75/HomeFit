// Settings Screen - App preferences (without profile - moved to ProfileScreen)
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
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
import { loadSettings, saveSettings, exportAllData } from '../storage/storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { readAndValidateBackup, promptAndImport } from '../utils/backupImport';
import { t } from '../data/translations';
import { IS_PRO } from '../config';
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

  const handleExport = async () => {
    try {
      const backup = await exportAllData();
      const date = new Date().toISOString().slice(0, 10);
      const uri = FileSystem.cacheDirectory + `homefit_backup_${date}.homefit`;
      await FileSystem.writeAsStringAsync(uri, JSON.stringify(backup, null, 2));
      await Sharing.shareAsync(uri, { mimeType: 'application/x-homefit', dialogTitle: t('exportBackup', lang) });
    } catch (e) {
      Alert.alert('HomeFit', t('exportError', lang));
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      const backup = await readAndValidateBackup(result.assets[0].uri);
      promptAndImport(backup, lang, Alert);
    } catch (e) {
      Alert.alert('HomeFit', e.message === 'invalid' ? t('importInvalid', lang) : t('importError', lang));
    }
  };

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
              <View style={styles.volumeLabelRow}>
                <Text style={styles.label}>{t('volume', lang)}</Text>
                <Text style={styles.volumeValue}>{Math.round(settings.soundVolume * 100)}%</Text>
              </View>
              <View style={styles.sliderRow}>
                <Image
                  source={isDark
                    ? require('../../assets/icons/volume-low-dark.png')
                    : require('../../assets/icons/volume-low-light.png')}
                  style={styles.volumeIcon}
                />
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={settings.soundVolume}
                  onValueChange={(value) => setSettings(s => ({ ...s, soundVolume: value }))}
                  onSlidingComplete={(value) => updateSetting('soundVolume', value)}
                  minimumTrackTintColor={colors.accent}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.accent}
                />
                <Image
                  source={isDark
                    ? require('../../assets/icons/volume-high-dark.png')
                    : require('../../assets/icons/volume-high-light.png')}
                  style={styles.volumeIcon}
                />
              </View>
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

        {/* Data Section */}
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { marginHorizontal: 0, marginTop: 0, marginBottom: 0 }]}>{t('data', lang)}</Text>
          <TouchableOpacity
            onPress={() => Alert.alert(t('dataHelp', lang), t('dataHelpBody', lang))}
            style={styles.helpButton}
          >
            <Image source={IS_PRO ? require('../../assets/icons/tooltip_pro.png') : require('../../assets/icons/tooltip_free.png')} style={styles.helpButtonIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={styles.dataButton} onPress={handleExport}>
            <Text style={styles.dataButtonText}>{t('exportBackup', lang)}</Text>
          </TouchableOpacity>
          <View style={styles.legalDivider} />
          <TouchableOpacity style={styles.dataButton} onPress={handleImport}>
            <Text style={styles.dataButtonText}>{t('importBackup', lang)}</Text>
          </TouchableOpacity>
        </View>

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
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  volumeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeValue: {
    fontFamily: fonts.regular,
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  helpButton: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  helpButtonIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  helpButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: fontSize.sm + 1,
  },
  dataButton: {
    paddingVertical: spacing.sm,
  },
  dataButtonText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.accent,
  },
});

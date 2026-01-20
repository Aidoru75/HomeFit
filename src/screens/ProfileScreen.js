// Profile Screen - User profile information
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontSize, shadows } from '../theme';
import { loadSettings, saveSettings } from '../storage/storage';
import { t } from '../data/translations';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    userName: '',
    userHeight: '',
    userWeight: '',
    language: 'en',
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

  const lang = settings.language || 'en';

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>{t('profileTitle', lang)}</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar/Icon Section */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {settings.userName ? settings.userName.charAt(0).toUpperCase() : '👤'}
            </Text>
          </View>
        </View>

        {/* Personal Info Section */}
        <Text style={styles.sectionTitle}>{t('personalInfo', lang)}</Text>
        <View style={styles.card}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('yourName', lang)}</Text>
            <TextInput
              style={styles.textInput}
              value={settings.userName}
              onChangeText={(text) => updateSetting('userName', text)}
              placeholder={t('namePlaceholder', lang)}
              placeholderTextColor={colors.textLight}
              autoCapitalize="words"
            />
          </View>

          {/* Height */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('height', lang)}</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={[styles.textInput, styles.numberInput]}
                value={settings.userHeight}
                onChangeText={(text) => {
                  // Only allow numbers
                  const numericValue = text.replace(/[^0-9]/g, '');
                  updateSetting('userHeight', numericValue);
                }}
                placeholder="175"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.unitText}>cm</Text>
            </View>
          </View>

          {/* Weight */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('bodyWeight', lang)}</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={[styles.textInput, styles.numberInput]}
                value={settings.userWeight}
                onChangeText={(text) => {
                  // Allow numbers and one decimal point
                  const numericValue = text.replace(/[^0-9.]/g, '');
                  // Ensure only one decimal point
                  const parts = numericValue.split('.');
                  const sanitized = parts.length > 2 
                    ? parts[0] + '.' + parts.slice(1).join('')
                    : numericValue;
                  updateSetting('userWeight', sanitized);
                }}
                placeholder="70"
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <Text style={styles.unitText}>kg</Text>
            </View>
          </View>
        </View>

        {/* Stats Preview */}
        {(settings.userHeight || settings.userWeight) && (
          <>
            <Text style={styles.sectionTitle}>{t('stats', lang)}</Text>
            <View style={styles.card}>
              <View style={styles.statsRow}>
                {settings.userHeight ? (
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{settings.userHeight}</Text>
                    <Text style={styles.statLabel}>cm</Text>
                  </View>
                ) : null}
                {settings.userWeight ? (
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{settings.userWeight}</Text>
                    <Text style={styles.statLabel}>kg</Text>
                  </View>
                ) : null}
                {settings.userHeight && settings.userWeight ? (
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {(parseFloat(settings.userWeight) / 
                        Math.pow(parseFloat(settings.userHeight) / 100, 2)).toFixed(1)}
                    </Text>
                    <Text style={styles.statLabel}>BMI</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  header: {
    backgroundColor: colors.primary,
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  avatarText: {
    fontSize: 40,
    color: colors.white,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
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
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  unitText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    fontWeight: '600',
    minWidth: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.accent,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bottomPadding: {
    height: 100,
  },
});

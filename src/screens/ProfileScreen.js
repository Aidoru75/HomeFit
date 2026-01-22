// Profile Screen - User profile and equipment management
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontSize, shadows, fonts } from '../theme';
import { 
  loadSettings, 
  saveSettings, 
  loadAvailableEquipment,
  updateExcludedByEquipment,
} from '../storage/storage';
import { 
  equipment, 
  equipmentCategories, 
  getEquipmentName,
  getCategoryName,
  getAllEquipmentIds,
} from '../data/equipment';
import { t } from '../data/translations';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    userName: '',
    userHeight: '',
    userWeight: '',
    language: 'en',
  });
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const savedSettings = await loadSettings();
    const savedEquipment = await loadAvailableEquipment();
    setSettings(savedSettings);
    setAvailableEquipment(savedEquipment);
    setLoaded(true);
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const lang = settings.language || 'en';

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleEquipment = async (equipmentId) => {
    let newAvailable;
    if (availableEquipment.includes(equipmentId)) {
      newAvailable = availableEquipment.filter(id => id !== equipmentId);
    } else {
      newAvailable = [...availableEquipment, equipmentId];
    }
    
    setAvailableEquipment(newAvailable);
    await updateExcludedByEquipment(newAvailable);
  };

  const toggleAllInCategory = async (categoryId, enable) => {
    const category = equipmentCategories[categoryId];
    if (!category) return;

    let newAvailable;
    if (enable) {
      // Add all equipment from this category
      const toAdd = category.equipmentIds.filter(id => !availableEquipment.includes(id));
      newAvailable = [...availableEquipment, ...toAdd];
    } else {
      // Remove all equipment from this category
      newAvailable = availableEquipment.filter(id => !category.equipmentIds.includes(id));
    }

    setAvailableEquipment(newAvailable);
    await updateExcludedByEquipment(newAvailable);
  };

  const selectAllEquipment = async () => {
    const allIds = getAllEquipmentIds();
    setAvailableEquipment(allIds);
    await updateExcludedByEquipment(allIds);
  };

  const deselectAllEquipment = async () => {
    setAvailableEquipment([]);
    await updateExcludedByEquipment([]);
  };

  const getCategoryStatus = (categoryId) => {
    const category = equipmentCategories[categoryId];
    if (!category) return { count: 0, total: 0 };
    
    const total = category.equipmentIds.length;
    const count = category.equipmentIds.filter(id => availableEquipment.includes(id)).length;
    return { count, total };
  };

  const renderEquipmentItem = (equipmentId) => {
    const isAvailable = availableEquipment.includes(equipmentId);
    
    return (
      <View key={equipmentId} style={styles.equipmentItem}>
        <Text style={styles.equipmentName}>
          {getEquipmentName(equipmentId, lang)}
        </Text>
        <Switch
          value={isAvailable}
          onValueChange={() => toggleEquipment(equipmentId)}
          trackColor={{ false: colors.border, true: colors.accentLight }}
          thumbColor={isAvailable ? colors.accent : colors.textLight}
        />
      </View>
    );
  };

  const renderCategory = (categoryKey) => {
    const category = equipmentCategories[categoryKey];
    const isExpanded = expandedCategories[categoryKey];
    const { count, total } = getCategoryStatus(categoryKey);
    const allEnabled = count === total;
    
    return (
      <View key={categoryKey} style={styles.categoryContainer}>
        <TouchableOpacity 
          style={styles.categoryHeader}
          onPress={() => toggleCategory(categoryKey)}
          activeOpacity={0.7}
        >
          <View style={styles.categoryLeft}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <View>
              <Text style={styles.categoryName}>
                {getCategoryName(category, lang)}
              </Text>
              <Text style={styles.categoryCount}>
                {count}/{total} {t('enabled', lang)}
              </Text>
            </View>
          </View>
          <View style={styles.categoryRight}>
            <Switch
              value={allEnabled}
              onValueChange={(value) => toggleAllInCategory(categoryKey, value)}
              trackColor={{ false: colors.border, true: colors.accentLight }}
              thumbColor={allEnabled ? colors.accent : colors.textLight}
            />
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.equipmentList}>
            {category.equipmentIds.map(renderEquipmentItem)}
          </View>
        )}
      </View>
    );
  };

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const totalEquipment = getAllEquipmentIds().length;
  const availableCount = availableEquipment.length;

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
                  const numericValue = text.replace(/[^0-9.]/g, '');
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

        {/* My Equipment Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('myEquipment', lang)}</Text>
          <Text style={styles.sectionSubtitle}>
            {availableCount}/{totalEquipment} {t('items', lang)}
          </Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.equipmentHint}>
            {t('equipmentHint', lang)}
          </Text>
          
          {/* Quick actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={selectAllEquipment}
            >
              <Text style={styles.quickActionText}>{t('selectAll', lang)}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.quickActionButtonOutline]}
              onPress={deselectAllEquipment}
            >
              <Text style={[styles.quickActionText, styles.quickActionTextOutline]}>
                {t('deselectAll', lang)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Equipment Categories */}
        {Object.keys(equipmentCategories).map(renderCategory)}

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
    fontFamily: fonts.bold,
    fontSize: 40,
    color: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontFamily: fonts.bold,
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
    fontFamily: fonts.bold,
  },
  textInput: {
    fontFamily: fonts.regular,
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
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
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
    fontFamily: fonts.bold,
    color: colors.accent,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  equipmentHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  quickActionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  quickActionText: {
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: fontSize.sm,
  },
  quickActionTextOutline: {
    color: colors.accent,
  },
  categoryContainer: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.small,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontFamily: fonts.regular,
    fontSize: 24,
    marginRight: spacing.md,
  },
  categoryName: {
    fontSize: fontSize.md,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  categoryCount: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  expandIcon: {
    fontFamily: fonts.re,
    fontSize: fontSize.sm,
    color: colors.textLight,
    width: 20,
    textAlign: 'center',
  },
  equipmentList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  equipmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  equipmentName: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    flex: 1,
  },
  bottomPadding: {
    height: 120,
  },
});

// Profile Screen - User profile and equipment management
import React, { useState, useMemo, useRef } from 'react';
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
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Category icons
const categoryIcons = {
  freeWeights: require('../../assets/icons/cat_weights.png'),
  racksAndBenches: require('../../assets/icons/cat_benches.png'),
  cableMachine: require('../../assets/icons/cat_cables.png'),
  machineStations: require('../../assets/icons/cat_machines.png'),
  cableAttachments: require('../../assets/icons/cat_cable_accessories.png'),
  accessories: require('../../assets/icons/cat_accessories.png'),
};

// Equipment images - uncomment as images are created
// Place images in: assets/equipment/{equipment_id}.png
const equipmentImages = {
  // Cable Pulley System
  // high_pulley: require('../../assets/equipment/high_pulley.png'),
  // mid_pulley: require('../../assets/equipment/mid_pulley.png'),
  // low_pulley: require('../../assets/equipment/low_pulley.png'),

  // Machine Stations
  leg_extension_station: require('../../assets/equipment/leg_extension_station.png'),
  leg_curl_station: require('../../assets/equipment/leg_curl_station.png'),
  standing_leg_curl_station: require('../../assets/equipment/standing_leg_curl_station.png'),
  leg_press_station: require('../../assets/equipment/leg_press_station.png'),
  squat_station: require('../../assets/equipment/squat_station.png'),
  pec_deck_station: require('../../assets/equipment/pec_deck_station.png'),
  chest_press_station: require('../../assets/equipment/chest_press_station.png'),
  lat_station: require('../../assets/equipment/lat_station.png'),
  calf_station: require('../../assets/equipment/calf_station.png'),
  ghd_machine: require('../../assets/equipment/ghd_machine.png'),
  treadmill: require('../../assets/equipment/treadmill.png'),
  stationary_bike: require('../../assets/equipment/stationary_bike.png'),
  stepper: require('../../assets/equipment/stepper.png'),
  rowing_machine: require('../../assets/equipment/rowing_machine.png'),
  reverse_fly_machine: require('../../assets/equipment/reverse_fly_machine.png'),
  hip_abductor_adductor: require('../../assets/equipment/hip_abductor_adductor.png'),

  // Racks and Benches
  rack: require('../../assets/equipment/rack.png'),
  pullup_rack: require('../../assets/equipment/pullup_rack.png'),
  flat_bench: require('../../assets/equipment/flat_bench.png'),
  incline_bench: require('../../assets/equipment/incline_bench.png'),
  decline_bench: require('../../assets/equipment/decline_bench.png'),
  upright_bench: require('../../assets/equipment/upright_bench.png'),
  preacher_pad: require('../../assets/equipment/preacher_pad.png'),
  parallels: require('../../assets/equipment/parallels.png'),

  // Barbells
  straight_bar: require('../../assets/equipment/straight_bar.png'),
  ez_bar: require('../../assets/equipment/ez_bar.png'),
  neutral_bar: require('../../assets/equipment/neutral_bar.png'),

  // Dumbbells
  dumbbells: require('../../assets/equipment/dumbbells.png'),

  // Kettlebells
  kettlebells: require('../../assets/equipment/kettlebells.png'),

  // Weight Plates
  plates: require('../../assets/equipment/plates.png'),

  // Cable Attachments
  lat_bar: require('../../assets/equipment/lat_bar.png'),
  rope: require('../../assets/equipment/rope.png'),
  single_rope: require('../../assets/equipment/single_rope.png'),
  single_handle: require('../../assets/equipment/single_handle.png'),
  straight_bar_attachment: require('../../assets/equipment/straight_bar_attachment.png'),
  curved_bar_attachment: require('../../assets/equipment/curved_bar_attachment.png'),
  neutral_bar_attachment: require('../../assets/equipment/neutral_bar_attachment.png'),
  v_bar: require('../../assets/equipment/v_bar.png'),
  rowing_handle: require('../../assets/equipment/rowing_handle.png'),
  ankle_strap: require('../../assets/equipment/ankle_strap.png'),

  // Other Accessories
  step_platform: require('../../assets/equipment/step_platform.png'),
  dip_belt: require('../../assets/equipment/dip_belt.png'),
  resistance_band: require('../../assets/equipment/resistance_band.png'),
  towel: require('../../assets/equipment/towel.png'),
  jump_rope: require('../../assets/equipment/jump_rope.png'),
  ball: require('../../assets/equipment/ball.png'),
  abs_wheel: require('../../assets/equipment/abs_wheel.png'),
};
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { spacing, borderRadius, fontSize, shadows, fonts } from '../theme';
import { useTheme } from '../context/ThemeContext';
import {
  loadSettings,
  saveSettings,
  loadAvailableEquipment,
  updateExcludedByEquipment,
  loadExcludedExercises,
  calculateExcludedByEquipment,
} from '../storage/storage';
import {
  equipment,
  getEquipmentName,
  getCategoryName,
  getAllEquipmentIds,
  getVisibleCategories,
} from '../data/equipment';
import { t } from '../data/translations';
import { IS_PRO } from '../config';
import {
  totalInchesToFeetInches,
  feetInchesToTotalInches,
  inchesToCm,
  lbToKg,
} from '../utils/unitConversions';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [settings, setSettings] = useState({
    userName: '',
    userHeight: '',
    userWeight: '',
    language: 'en',
  });
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const visibleCategories = getVisibleCategories();
  const [loaded, setLoaded] = useState(false);
  // Separate state for feet/inches when in imperial mode
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  // Equipment image preview modal
  const [previewImage, setPreviewImage] = useState(null);
  const [previewName, setPreviewName] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    const savedSettings = await loadSettings();
    const savedEquipment = await loadAvailableEquipment();
    setSettings(savedSettings);
    setAvailableEquipment(savedEquipment);

    const excluded = await loadExcludedExercises();
    const equipmentExcluded = calculateExcludedByEquipment(savedEquipment);
    const excludedSet = new Set(excluded);
    const equipmentSet = new Set(equipmentExcluded);
    hasManualOverrides.current =
      excluded.some(id => !equipmentSet.has(id)) ||
      equipmentExcluded.some(id => !excludedSet.has(id));

    // Parse height into feet/inches if imperial and height exists
    if (savedSettings.measurementSystem === 'imperial' && savedSettings.userHeight) {
      const totalInches = parseFloat(savedSettings.userHeight);
      if (!isNaN(totalInches)) {
        const { feet, inches } = totalInchesToFeetInches(totalInches);
        setHeightFeet(String(feet));
        setHeightInches(String(inches));
      }
    }

    setLoaded(true);
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const lang = settings.language || 'en';
  const isImperial = settings.measurementSystem === 'imperial';

  // Update height from feet/inches input (imperial mode)
  const updateImperialHeight = async (newFeet, newInches) => {
    setHeightFeet(newFeet);
    setHeightInches(newInches);

    const feet = parseInt(newFeet) || 0;
    const inches = parseInt(newInches) || 0;
    const totalInches = feetInchesToTotalInches(feet, inches);

    // Store as total inches
    const newSettings = { ...settings, userHeight: String(totalInches) };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const hasManualOverrides = useRef(false);
  const withEquipmentWarning = (action) => {
    if (hasManualOverrides.current) {
      Alert.alert(t('equipmentWarningTitle', lang), t('equipmentWarning', lang), [
        { text: t('cancel', lang), style: 'cancel' },
        { text: t('continue', lang), onPress: action },
      ]);
    } else {
      action();
    }
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
    const category = visibleCategories[categoryId];
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
    const allIds = Object.values(visibleCategories).flatMap(cat => cat.equipmentIds);
    setAvailableEquipment(allIds);
    await updateExcludedByEquipment(allIds);
  };

  const deselectAllEquipment = async () => {
    setAvailableEquipment([]);
    await updateExcludedByEquipment([]);
  };

  const getCategoryStatus = (categoryId) => {
    const category = visibleCategories[categoryId];
    if (!category) return { count: 0, total: 0 };
    
    const total = category.equipmentIds.length;
    const count = category.equipmentIds.filter(id => availableEquipment.includes(id)).length;
    return { count, total };
  };

  const renderEquipmentItem = (equipmentId) => {
    const isAvailable = availableEquipment.includes(equipmentId);
    const image = equipmentImages[equipmentId];

    return (
      <View key={equipmentId} style={styles.equipmentItem}>
        {image && (
          <TouchableOpacity
            style={styles.equipmentImageContainer}
            onPress={() => {
              setPreviewImage(image);
              setPreviewName(getEquipmentName(equipmentId, lang));
            }}
          >
            <Image source={image} style={styles.equipmentImage} />
          </TouchableOpacity>
        )}
        <Text style={styles.equipmentName}>
          {getEquipmentName(equipmentId, lang)}
        </Text>
        <Switch
          value={isAvailable}
          onValueChange={() => withEquipmentWarning(() => toggleEquipment(equipmentId))}
          trackColor={{ false: colors.border, true: colors.accentLight }}
          thumbColor={isAvailable ? colors.accent : colors.textLight}
        />
      </View>
    );
  };

  const renderCategory = (categoryKey) => {
    const category = visibleCategories[categoryKey];
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
            <Image
              source={categoryIcons[categoryKey]}
              style={styles.categoryIcon}
              resizeMode="contain"
            />
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
        style={[styles.content, { backgroundColor: colors.background }]}
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
          {/* Name + Age row */}
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
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
            <View style={[styles.inputGroup, { flex: 0.6 }]}>
              <Text style={styles.label}>{t('age', lang)}</Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={[styles.textInput, styles.numberInput]}
                  value={settings.userAge}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    updateSetting('userAge', numericValue);
                  }}
                  placeholder="30"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={styles.unitText}>{t('years', lang)}</Text>
              </View>
            </View>
          </View>

          {/* Height + Weight row */}
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            {/* Height */}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>{t('height', lang)}</Text>
              {isImperial ? (
                <View style={styles.inputWithUnit}>
                  <TextInput
                    style={[styles.textInput, styles.smallNumberInput]}
                    value={heightFeet}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9]/g, '');
                      updateImperialHeight(numericValue, heightInches);
                    }}
                    placeholder="5"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                    maxLength={1}
                  />
                  <Text style={styles.unitText}>{t('feet', lang)}</Text>
                  <TextInput
                    style={[styles.textInput, styles.smallNumberInput]}
                    value={heightInches}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9]/g, '');
                      const inches = parseInt(numericValue) || 0;
                      if (inches <= 11) {
                        updateImperialHeight(heightFeet, numericValue);
                      }
                    }}
                    placeholder="10"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.unitText}>{t('inches', lang)}</Text>
                </View>
              ) : (
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
                  <Text style={styles.unitText}>{t('cm', lang)}</Text>
                </View>
              )}
            </View>

            {/* Weight */}
            <View style={[styles.inputGroup, { flex: 1 }]}>
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
                  placeholder={isImperial ? "155" : "70"}
                  placeholderTextColor={colors.textLight}
                  keyboardType="decimal-pad"
                  maxLength={5}
                />
                <Text style={styles.unitText}>{isImperial ? t('lbs', lang) : t('kg', lang)}</Text>
              </View>
            </View>
          </View>

          {/* Sex */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('sex', lang)}</Text>
            <View style={styles.sexOptions}>
              <TouchableOpacity
                style={[
                  styles.sexOption,
                  settings.userSex === 'male' && styles.sexOptionSelected,
                ]}
                onPress={() => updateSetting('userSex', 'male')}
              >
                <Text style={[
                  styles.sexOptionText,
                  settings.userSex === 'male' && styles.sexOptionTextSelected,
                ]}>
                  {t('male', lang)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sexOption,
                  settings.userSex === 'female' && styles.sexOptionSelected,
                ]}
                onPress={() => updateSetting('userSex', 'female')}
              >
                <Text style={[
                  styles.sexOptionText,
                  settings.userSex === 'female' && styles.sexOptionTextSelected,
                ]}>
                  {t('female', lang)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sexOption,
                  settings.userSex === 'prefer_not_to_say' && styles.sexOptionSelected,
                ]}
                onPress={() => updateSetting('userSex', 'prefer_not_to_say')}
              >
                <Text style={[
                  styles.sexOptionText,
                  settings.userSex === 'prefer_not_to_say' && styles.sexOptionTextSelected,
                ]}>
                  {t('preferNotToSay', lang)}
                </Text>
              </TouchableOpacity>
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
                    {isImperial ? (
                      <>
                        <Text style={styles.statValue}>{heightFeet}'{heightInches}"</Text>
                        <Text style={styles.statLabel}>{t('feet', lang)}/{t('inches', lang)}</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.statValue}>{settings.userHeight}</Text>
                        <Text style={styles.statLabel}>{t('cm', lang)}</Text>
                      </>
                    )}
                  </View>
                ) : null}
                {settings.userWeight ? (
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{settings.userWeight}</Text>
                    <Text style={styles.statLabel}>{isImperial ? t('lbs', lang) : t('kg', lang)}</Text>
                  </View>
                ) : null}
                {settings.userHeight && settings.userWeight ? (
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {(() => {
                        // Convert to metric for BMI calculation
                        let heightCm, weightKg;
                        if (isImperial) {
                          heightCm = inchesToCm(parseFloat(settings.userHeight));
                          weightKg = lbToKg(parseFloat(settings.userWeight));
                        } else {
                          heightCm = parseFloat(settings.userHeight);
                          weightKg = parseFloat(settings.userWeight);
                        }
                        const heightM = heightCm / 100;
                        return (weightKg / (heightM * heightM)).toFixed(1);
                      })()}
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
          <Text style={[styles.sectionTitle, { marginHorizontal: 0, marginTop: 0, marginBottom: 0 }]}>{t('myEquipment', lang)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text style={styles.sectionSubtitle}>
              {availableCount}/{totalEquipment} {t('items', lang)}
            </Text>
            <TouchableOpacity
              onPress={() => Alert.alert(t('equipmentHintTitle', lang), t('equipmentHint', lang))}
              style={styles.helpButton}
            >
              <Image
                source={IS_PRO ? require('../../assets/icons/tooltip_pro.png') : require('../../assets/icons/tooltip_free.png')}
                style={styles.helpButtonIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          {/* Quick actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => withEquipmentWarning(selectAllEquipment)}
            >
              <Text style={styles.quickActionText}>{t('selectAll', lang)}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.quickActionButtonOutline]}
              onPress={() => withEquipmentWarning(deselectAllEquipment)}
            >
              <Text style={[styles.quickActionText, styles.quickActionTextOutline]}>
                {t('deselectAll', lang)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Equipment Categories */}
        {Object.keys(visibleCategories).map(renderCategory)}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Equipment Image Preview Modal */}
      <Modal
        visible={!!previewImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <TouchableOpacity
          style={styles.previewOverlay}
          activeOpacity={1}
          onPress={() => setPreviewImage(null)}
        >
          <View style={styles.previewContainer}>
            <LinearGradient
              colors={['#ffffff', '#b8b8b8']}
              style={styles.previewGradient}
            >
              {previewImage && (
                <Image source={previewImage} style={styles.previewImage} />
              )}
            </LinearGradient>
            <Text style={styles.previewName}>{previewName}</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
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
    backgroundColor: colors.card,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  smallNumberInput: {
    width: 60,
    marginRight: spacing.xs,
    textAlign: 'center',
  },
  unitText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    minWidth: 30,
  },
  sexOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sexOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  sexOptionSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sexOptionText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  sexOptionTextSelected: {
    color: colors.white,
    fontFamily: fonts.bold,
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
  helpButton: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
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
    width: 50,
    height: 50,
    marginRight: 20,
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
  equipmentImageContainer: {
    width: 50,
    height: 50,
    marginRight: 20,
  },
  equipmentImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
  },
  equipmentName: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    flex: 1,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewGradient: {
    width: 250,
    height: 250,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: 250,
    height: 250,
  },
  previewName: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.white,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});

// Exercises Screen - Browse all exercises by muscle group
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Switch,
  TextInput,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fonts, fontSize, shadows } from '../theme';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  availableExercises,
  muscleGroups,
  getAvailableExercisesByMuscle,
  getExerciseName,
  getMuscleGroupName,
  getExerciseDescription,
} from '../data/exercises';
import { getEquipmentName } from '../data/equipment';
import { loadSettings, loadExcludedExercises, toggleExerciseExclusion } from '../storage/storage';
import { t } from '../data/translations';
import ExerciseImage from '../components/ExerciseImage';

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const { isLandscape } = useResponsiveLayout();
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [settings, setSettings] = useState({ language: 'en' });
  const [excludedExercises, setExcludedExercises] = useState([]);
  const [exerciseSearchText, setExerciseSearchText] = useState('');
  const listRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      loadUserSettings();
      loadExcluded();
    }, [])
  );

  const loadUserSettings = async () => {
    const saved = await loadSettings();
    setSettings(saved);
  };

  const loadExcluded = async () => {
    const excluded = await loadExcludedExercises();
    setExcludedExercises(excluded);
  };

  const handleToggleExclusion = async (exerciseId) => {
    const newExcluded = await toggleExerciseExclusion(exerciseId);
    setExcludedExercises(newExcluded);
  };

  const lang = settings.language || 'en';

  const filteredExercises = selectedMuscle
    ? getAvailableExercisesByMuscle(selectedMuscle)
    : exerciseSearchText.trim()
      ? availableExercises.filter(ex => {
          const name = ex.name?.[lang]?.toLowerCase() || '';
          return name.includes(exerciseSearchText.toLowerCase().trim());
        })
      : availableExercises;

  // Helper to format equipment list with localized names
  // Supports nested arrays for OR alternatives: ['a', ['b', 'c']] → "A • B or C"
  const formatEquipmentList = (equipmentIds) => {
    if (!equipmentIds || equipmentIds.length === 0) return t('bodyweightOnly', lang);
    return equipmentIds.map(item =>
      Array.isArray(item)
        ? item.map(alt => getEquipmentName(alt, lang)).join(` ${t('or', lang)} `)
        : getEquipmentName(item, lang)
    ).join(' • ');
  };

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const handleSearchChange = (text) => {
    setExerciseSearchText(text);
    scrollToTop();
  };

  const renderMuscleChip = (muscle) => {
    const isSelected = selectedMuscle === muscle.id;
    const muscleColor = colors.muscleColors[muscle.id] || colors.accent;

    return (
      <TouchableOpacity
        key={muscle.id}
        style={[
          styles.muscleChip,
          isSelected && { backgroundColor: muscleColor },
        ]}
        onPress={() => {
          setSelectedMuscle(isSelected ? null : muscle.id);
          setExerciseSearchText('');
          scrollToTop();
        }}
      >
        <Text style={[
          styles.muscleChipText,
          isSelected && { color: colors.white },
        ]}>
          {getMuscleGroupName(muscle, lang)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderExerciseItem = ({ item }) => {
    const muscleColor = colors.muscleColors[item.muscleGroup] || colors.accent;
    const isExcluded = excludedExercises.includes(item.id);
    
    return (
      <View style={[styles.exerciseCard, isExcluded && styles.exerciseCardExcluded]}>
        <TouchableOpacity 
          style={styles.exerciseCardTouchable}
          onPress={() => setSelectedExercise(item)}
        >
          <View style={[styles.exerciseColorBar, { backgroundColor: muscleColor }]} />
          {/* Exercise Thumbnail */}
          <View style={styles.exerciseThumbnail}>
            <ExerciseImage 
              exerciseId={item.id} 
              size={48} 
              showEndImage={true}
              animate={false}
            />
          </View>
          <View style={styles.exerciseContent}>
            <Text style={[styles.exerciseName, isExcluded && styles.exerciseNameExcluded]}>
              {getExerciseName(item, lang)}
            </Text>
            <Text style={styles.exerciseEquipment}>
              {item.equipment.length === 0
                ? t('bodyweightOnly', lang)
                : formatEquipmentList(item.equipment)}
            </Text>
          </View>
          <Text style={styles.exerciseArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.switchContainer}>
          <Switch
            value={!isExcluded}
            onValueChange={() => handleToggleExclusion(item.id)}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={isExcluded ? colors.textLight : colors.white}
          />
        </View>
      </View>
    );
  };

  // Count included exercises
  const relevantExcluded = excludedExercises.filter(id => availableExercises.some(ex => ex.id === id));
  const includedCount = availableExercises.length - relevantExcluded.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>{t('exerciseLibrary', lang)}</Text>
        <Text style={styles.headerSubtitle}>
          {includedCount} / {availableExercises.length} {t('exercisesAvailable', lang)}
        </Text>
      </View>

      {/* Muscle Group Filter */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.muscleChips}
        >
          <TouchableOpacity
            style={[
              styles.muscleChip,
              !selectedMuscle && styles.muscleChipSelected,
            ]}
            onPress={() => {
              setSelectedMuscle(null);
              setExerciseSearchText('');
              scrollToTop();
            }}
          >
            <Text style={[
              styles.muscleChipText,
              !selectedMuscle && { color: colors.white },
            ]}>
              {t('all', lang)}
            </Text>
          </TouchableOpacity>
          {muscleGroups.map(renderMuscleChip)}
        </ScrollView>
      </View>

      {/* Search input - only visible in "All" tab */}
      {!selectedMuscle && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.exerciseSearchInput}
            value={exerciseSearchText}
            onChangeText={handleSearchChange}
            placeholder={t('searchExercises', lang)}
            placeholderTextColor={colors.textLight}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      )}

      {/* Hint text */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          {t('exerciseToggleHint', lang) || 'Toggle switch to include/exclude from routines'}
        </Text>
      </View>

      {/* Exercise List */}
      <FlatList
        ref={listRef}
        data={filteredExercises}
        renderItem={renderExerciseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.exerciseList}
        showsVerticalScrollIndicator={false}
      />

      {/* Exercise Detail Modal */}
      <Modal
        visible={selectedExercise !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedExercise(null)}
      >
        <View style={[styles.modalOverlay, isLandscape && styles.modalOverlayLandscape]}>
          <View style={[styles.modalContent, isLandscape && styles.modalContentLandscape]}>
            {selectedExercise && (
              <>
                <View style={[
                  styles.modalHeader,
                  { backgroundColor: colors.muscleColors[selectedExercise.muscleGroup] || colors.accent }
                ]}>
                  <Text style={styles.modalMuscle}>
                    {getMuscleGroupName(selectedExercise.muscleGroup, lang)}
                  </Text>
                  <Text style={styles.modalTitle}>
                    {getExerciseName(selectedExercise, lang)}
                  </Text>
                </View>
                
                <ScrollView style={styles.modalBody}>
                  {/* Exercise Image */}
                  <View style={styles.imageContainer}>
                    <ExerciseImage
                      exerciseId={selectedExercise.id}
                      size={isLandscape ? 200 : 350}
                      animate={true}
                    />
                  </View>

                  <Text style={styles.modalSectionTitle}>{t('description', lang)}</Text>
                  <Text style={styles.modalDescription}>
                    {getExerciseDescription(selectedExercise, lang)}
                  </Text>

                  <Text style={styles.modalSectionTitle}>{t('equipmentNeeded', lang)}</Text>
                  <View style={styles.equipmentList}>
                    {selectedExercise.equipment.length === 0 ? (
                      <View style={styles.equipmentItem}>
                        <Text style={styles.equipmentIcon}>👤</Text>
                        <Text style={styles.equipmentText}>{t('bodyweightOnly', lang)}</Text>
                      </View>
                    ) : (
                      selectedExercise.equipment.map((item, index) => (
                        <View key={index} style={styles.equipmentItem}>
                          <Text style={styles.equipmentIcon}>•</Text>
                          <Text style={styles.equipmentText}>
                            {Array.isArray(item)
                              ? item.map(alt => getEquipmentName(alt, lang)).join(` ${t('or', lang)} `)
                              : getEquipmentName(item, lang)}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>

                  {selectedExercise.optionalEquipment?.length > 0 && (
                    <>
                      <Text style={styles.modalSectionTitle}>{t('optional', lang)}</Text>
                      <View style={styles.equipmentList}>
                        {selectedExercise.optionalEquipment.map((item, index) => (
                          <View key={index} style={styles.equipmentItem}>
                            <Text style={styles.equipmentIcon}>◦</Text>
                            <Text style={styles.equipmentText}>
                              {Array.isArray(item)
                                ? item.map(alt => getEquipmentName(alt, lang)).join(` ${t('or', lang)} `)
                                : getEquipmentName(item, lang)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}

                  <TouchableOpacity
                    style={styles.videoLinkButton}
                    onPress={() => {
                      const exerciseName = getExerciseName(selectedExercise, lang);
                      const query = lang === 'es'
                        ? `como hacer ${exerciseName}`.replace(/\s+/g, '+')
                        : `how to ${exerciseName}`.replace(/\s+/g, '+');
                      Linking.openURL(`https://www.youtube.com/results?search_query=${query}`);
                    }}
                  >
                    <Text style={styles.videoLinkText}>{t('searchVideo', lang)} ▶</Text>
                  </TouchableOpacity>

                  <Text style={styles.imageDisclaimer}>{t('imageDisclaimer', lang)}</Text>
                </ScrollView>

                <TouchableOpacity
                  style={[styles.modalCloseButton, { marginBottom: insets.bottom + spacing.md }]}
                  onPress={() => setSelectedExercise(null)}
                >
                  <Text style={styles.modalCloseText}>{t('close', lang)}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xxl,
    color: colors.white,
  },
  headerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  filterContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    ...shadows.small,
  },
  muscleChips: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  muscleChip: {
    fontFamily: fonts.regular,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
  },
  muscleChipSelected: {
    backgroundColor: colors.accent,
  },
  muscleChipText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.white,
  },
  exerciseSearchInput: {
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  hintContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  hintText: {
    fontFamily: fonts.italic,
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  exerciseList: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  exerciseCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.small,
  },
  exerciseCardExcluded: {
    opacity: 0.6,
  },
  exerciseCardTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseColorBar: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
  },
  exerciseThumbnail: {
    marginLeft: spacing.sm,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  exerciseContent: {
    flex: 1,
    padding: spacing.md,
    paddingLeft: spacing.sm,
  },
  exerciseName: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  exerciseNameExcluded: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  exerciseEquipment: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  exerciseArrow: {
    fontSize: 24,
    color: colors.textLight,
    paddingRight: spacing.sm,
  },
  switchContainer: {
    paddingRight: spacing.md,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayLandscape: {
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  modalContentLandscape: {
    maxHeight: '95%',
    borderRadius: borderRadius.xl,
  },
  modalHeader: {
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  modalMuscle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.white,
    marginTop: spacing.xs,
  },
  modalBody: {
    padding: spacing.lg,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalSectionTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  equipmentList: {
    gap: spacing.xs,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  equipmentIcon: {
    fontSize: fontSize.md,
  },
  equipmentText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  weightTypeBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  weightTypeText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  videoLinkButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignSelf: 'center',
  },
  videoLinkText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.white,
  },
  imageDisclaimer: {
    fontFamily: fonts.italic,
    fontSize: fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: 50,
  },
  modalCloseButton: {
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalCloseText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.white,
  },
});

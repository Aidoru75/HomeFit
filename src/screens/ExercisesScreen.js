// Exercises Screen - Browse all exercises by muscle group
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fonts, fontSize, shadows } from '../theme';
import { 
  exercises, 
  muscleGroups, 
  getExercisesByMuscle,
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
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [settings, setSettings] = useState({ language: 'en' });
  const [excludedExercises, setExcludedExercises] = useState([]);

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
    ? getExercisesByMuscle(selectedMuscle)
    : exercises;

  // Helper to format equipment list with localized names
  const formatEquipmentList = (equipmentIds) => {
    if (!equipmentIds || equipmentIds.length === 0) return t('bodyweightOnly', lang);
    return equipmentIds.map(eq => getEquipmentName(eq, lang)).join(' • ');
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
        onPress={() => setSelectedMuscle(isSelected ? null : muscle.id)}
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
  const includedCount = exercises.length - excludedExercises.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>{t('exerciseLibrary', lang)}</Text>
        <Text style={styles.headerSubtitle}>
          {includedCount} / {exercises.length} {t('exercisesAvailable', lang)}
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
            onPress={() => setSelectedMuscle(null)}
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

      {/* Hint text */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          {t('exerciseToggleHint', lang) || 'Toggle switch to include/exclude from routines'}
        </Text>
      </View>

      {/* Exercise List */}
      <FlatList
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
                      size={180}
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
                      selectedExercise.equipment.map((eq, index) => (
                        <View key={index} style={styles.equipmentItem}>
                          <Text style={styles.equipmentIcon}>•</Text>
                          <Text style={styles.equipmentText}>
                            {getEquipmentName(eq, lang)}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>

                  <Text style={styles.modalSectionTitle}>{t('weightType', lang)}</Text>
                  <View style={styles.weightTypeBadge}>
                    <Text style={styles.weightTypeText}>
                      {selectedExercise.weightType.charAt(0).toUpperCase() + 
                       selectedExercise.weightType.slice(1)}
                    </Text>
                  </View>
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
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
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
    marginBottom: 50,
  },
  weightTypeText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
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

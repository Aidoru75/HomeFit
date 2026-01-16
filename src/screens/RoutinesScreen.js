// Routines Screen - Create and manage workout routines
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
  Alert,
  PanResponder,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontSize, shadows } from '../theme';
import { 
  exercises, 
  muscleGroups, 
  getExercisesByMuscle,
  getExerciseName,
  getMuscleGroupName,
  getExerciseById,
} from '../data/exercises';
import { loadRoutines, addRoutine, updateRoutine, deleteRoutine, loadSettings } from '../storage/storage';
import { t } from '../data/translations';
import ExerciseImage from '../components/ExerciseImage';

export default function RoutinesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [showNewRoutineModal, setShowNewRoutineModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);
  const [currentMuscleFilter, setCurrentMuscleFilter] = useState(0); // Index in muscleGroups, 0 = all
  const [settings, setSettings] = useState({ language: 'en' });
  
  // New routine form state
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineDays, setNewRoutineDays] = useState(4);
  const [newRestBetweenSets, setNewRestBetweenSets] = useState('60');
  const [newRestBetweenExercises, setNewRestBetweenExercises] = useState('90');

  // Exercise config state
  const [exerciseConfig, setExerciseConfig] = useState({
    exerciseId: null,
    sets: 3,
    reps: [10, 10, 10],
    weights: [0, 0, 0],
  });

  // Drag state
  const [draggingIndex, setDraggingIndex] = useState(null);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    // Handle deep link from home screen
    if (route.params?.routineId) {
      const routine = routines.find(r => r.id === route.params.routineId);
      if (routine) {
        setSelectedRoutine(routine);
      }
    }
  }, [route.params, routines]);

  const loadData = async () => {
    const data = await loadRoutines();
    const userSettings = await loadSettings();
    setRoutines(data);
    setSettings(userSettings);
  };

  const lang = settings.language || 'en';

  const handleCreateRoutine = async () => {
    if (!newRoutineName.trim()) {
      Alert.alert('Error', t('routineName', lang));
      return;
    }

    const days = [];
    for (let i = 0; i < newRoutineDays; i++) {
      days.push({
        name: `${t('days', lang).slice(0, -1)} ${i + 1}`,
        exercises: [],
      });
    }

    const newRoutine = await addRoutine({
      name: newRoutineName.trim(),
      restBetweenSets: parseInt(newRestBetweenSets) || 60,
      restBetweenExercises: parseInt(newRestBetweenExercises) || 90,
      days,
    });

    setRoutines([...routines, newRoutine]);
    setShowNewRoutineModal(false);
    setNewRoutineName('');
    setNewRoutineDays(4);
    setNewRestBetweenSets('60');
    setNewRestBetweenExercises('90');
    setSelectedRoutine(newRoutine);
  };

  const handleDeleteRoutine = (routine) => {
    Alert.alert(
      t('delete', lang),
      `${t('confirmDelete', lang)} "${routine.name}"?`,
      [
        { text: t('cancel', lang), style: 'cancel' },
        {
          text: t('delete', lang),
          style: 'destructive',
          onPress: async () => {
            await deleteRoutine(routine.id);
            setRoutines(routines.filter(r => r.id !== routine.id));
            if (selectedRoutine?.id === routine.id) {
              setSelectedRoutine(null);
            }
          },
        },
      ]
    );
  };

  const openAddExerciseModal = (dayIndex) => {
    setEditingDayIndex(dayIndex);
    setExerciseConfig({
      exerciseId: null,
      sets: 3,
      reps: [10, 10, 10],
      weights: [0, 0, 0],
    });
    setShowAddExerciseModal(true);
  };

  const selectExerciseForAdd = (exercise) => {
    setExerciseConfig(prev => ({
      ...prev,
      exerciseId: exercise.id,
    }));
  };

  const updateSetsCount = (newCount) => {
    const count = Math.max(1, Math.min(10, newCount));
    setExerciseConfig(prev => {
      const newReps = [...prev.reps];
      const newWeights = [...prev.weights];
      
      while (newReps.length < count) {
        newReps.push(newReps[newReps.length - 1] || 10);
        newWeights.push(newWeights[newWeights.length - 1] || 0);
      }
      
      return {
        ...prev,
        sets: count,
        reps: newReps.slice(0, count),
        weights: newWeights.slice(0, count),
      };
    });
  };

  const updateRep = (index, value) => {
    const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
    const clampedValue = Math.max(1, Math.min(99, numValue));
    setExerciseConfig(prev => {
      const newReps = [...prev.reps];
      newReps[index] = clampedValue;
      return { ...prev, reps: newReps };
    });
  };

  const updateWeight = (index, value) => {
    setExerciseConfig(prev => {
      const newWeights = [...prev.weights];
      newWeights[index] = parseFloat(value) || 0;
      return { ...prev, weights: newWeights };
    });
  };

  const handleAddExercise = async () => {
    if (!exerciseConfig.exerciseId) return;
    
    if (selectedRoutine && editingDayIndex !== null) {
      const updatedDays = [...selectedRoutine.days];
      updatedDays[editingDayIndex].exercises.push({
        exerciseId: exerciseConfig.exerciseId,
        sets: exerciseConfig.sets,
        reps: exerciseConfig.reps,
        weights: exerciseConfig.weights,
      });

      const updated = await updateRoutine(selectedRoutine.id, { days: updatedDays });
      setSelectedRoutine(updated);
      setRoutines(routines.map(r => r.id === updated.id ? updated : r));
      setShowAddExerciseModal(false);
    }
  };

  const openEditExerciseModal = (dayIndex, exerciseIndex) => {
    const exercise = selectedRoutine.days[dayIndex].exercises[exerciseIndex];
    setEditingDayIndex(dayIndex);
    setEditingExerciseIndex(exerciseIndex);
    setExerciseConfig({
      exerciseId: exercise.exerciseId,
      sets: exercise.sets,
      reps: exercise.reps || Array(exercise.sets).fill(10),
      weights: exercise.weights || Array(exercise.sets).fill(0),
    });
    setShowEditExerciseModal(true);
  };

  const handleSaveExercise = async () => {
    if (selectedRoutine && editingDayIndex !== null && editingExerciseIndex !== null) {
      const updatedDays = [...selectedRoutine.days];
      updatedDays[editingDayIndex].exercises[editingExerciseIndex] = {
        exerciseId: exerciseConfig.exerciseId,
        sets: exerciseConfig.sets,
        reps: exerciseConfig.reps,
        weights: exerciseConfig.weights,
      };

      const updated = await updateRoutine(selectedRoutine.id, { days: updatedDays });
      setSelectedRoutine(updated);
      setRoutines(routines.map(r => r.id === updated.id ? updated : r));
      setShowEditExerciseModal(false);
    }
  };

  const handleRemoveExercise = async () => {
    if (selectedRoutine && editingDayIndex !== null && editingExerciseIndex !== null) {
      const updatedDays = [...selectedRoutine.days];
      updatedDays[editingDayIndex].exercises.splice(editingExerciseIndex, 1);

      const updated = await updateRoutine(selectedRoutine.id, { days: updatedDays });
      setSelectedRoutine(updated);
      setRoutines(routines.map(r => r.id === updated.id ? updated : r));
      setShowEditExerciseModal(false);
    }
  };

  const moveExercise = async (dayIndex, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    
    const updatedDays = [...selectedRoutine.days];
    const exercises = [...updatedDays[dayIndex].exercises];
    const [moved] = exercises.splice(fromIndex, 1);
    exercises.splice(toIndex, 0, moved);
    updatedDays[dayIndex].exercises = exercises;

    const updated = await updateRoutine(selectedRoutine.id, { days: updatedDays });
    setSelectedRoutine(updated);
    setRoutines(routines.map(r => r.id === updated.id ? updated : r));
  };

  const startWorkout = (dayIndex) => {
    const day = selectedRoutine.days[dayIndex];
    if (!day.exercises || day.exercises.length === 0) {
      Alert.alert('⚠️', t('emptyDayWarning', lang));
      return;
    }
    navigation.navigate('Training', {
      routineId: selectedRoutine.id,
      dayIndex,
    });
  };

  // Get filtered exercises for add modal
  const getFilteredExercises = () => {
    if (currentMuscleFilter === 0) return exercises;
    const muscle = muscleGroups[currentMuscleFilter - 1];
    return getExercisesByMuscle(muscle.id);
  };

  const nextMuscleFilter = () => {
    setCurrentMuscleFilter(prev => (prev + 1) % (muscleGroups.length + 1));
  };

  const prevMuscleFilter = () => {
    setCurrentMuscleFilter(prev => (prev - 1 + muscleGroups.length + 1) % (muscleGroups.length + 1));
  };

  const getCurrentFilterName = () => {
    if (currentMuscleFilter === 0) return t('all', lang);
    return getMuscleGroupName(muscleGroups[currentMuscleFilter - 1], lang);
  };

  // Render routine list
  const renderRoutineList = () => (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>{t('myRoutines', lang)}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowNewRoutineModal(true)}
        >
          <Text style={styles.addButtonText}>+ {t('newRoutine', lang)}</Text>
        </TouchableOpacity>
      </View>

      {routines.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>{t('noRoutinesYet', lang)}</Text>
          <Text style={styles.emptySubtitle}>{t('createYourFirst', lang)}</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setShowNewRoutineModal(true)}
          >
            <Text style={styles.emptyButtonText}>{t('createRoutine', lang)}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        routines.map((routine) => (
          <TouchableOpacity
            key={routine.id}
            style={styles.routineCard}
            onPress={() => setSelectedRoutine(routine)}
            onLongPress={() => handleDeleteRoutine(routine)}
          >
            <View style={styles.routineInfo}>
              <Text style={styles.routineName}>{routine.name}</Text>
              <Text style={styles.routineMeta}>
                {routine.days?.length || 0} {t('days', lang).toLowerCase()} • {routine.restBetweenSets || 60}s {t('rest', lang).toLowerCase()}
              </Text>
            </View>
            <Text style={styles.routineArrow}>→</Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.hint}>{t('longPressDelete', lang)}</Text>
      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  // Render routine detail
  const renderRoutineDetail = () => (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => setSelectedRoutine(null)}>
          <Text style={styles.backButton}>← {t('back', lang)}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitleSmall}>{selectedRoutine.name}</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.routineStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{selectedRoutine.days?.length || 0}</Text>
          <Text style={styles.statLabel}>{t('days', lang)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{selectedRoutine.restBetweenSets || 60}s</Text>
          <Text style={styles.statLabel}>{t('sets', lang)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{selectedRoutine.restBetweenExercises || 90}s</Text>
          <Text style={styles.statLabel}>{t('exercisesLabel', lang)}</Text>
        </View>
      </View>

      {selectedRoutine.days?.map((day, dayIndex) => (
        <View key={dayIndex} style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayTitle}>{day.name}</Text>
            <View style={styles.dayActions}>
              <TouchableOpacity
                style={styles.dayActionButton}
                onPress={() => openAddExerciseModal(dayIndex)}
              >
                <Text style={styles.dayActionText}>+ {t('add', lang)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.dayActionButton, 
                  styles.dayActionButtonPrimary,
                  (!day.exercises || day.exercises.length === 0) && styles.dayActionButtonDisabled
                ]}
                onPress={() => startWorkout(dayIndex)}
              >
                <Text style={styles.dayActionTextPrimary}>▶ {t('start', lang)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {!day.exercises || day.exercises.length === 0 ? (
            <Text style={styles.noExercises}>{t('noExercisesAdded', lang)}</Text>
          ) : (
            day.exercises.map((ex, exIndex) => {
              const exerciseData = getExerciseById(ex.exerciseId);
              const totalWeight = ex.weights ? ex.weights.reduce((a, b) => a + b, 0) : 0;
              return (
                <TouchableOpacity 
                  key={exIndex} 
                  style={styles.exerciseItem}
                  onPress={() => openEditExerciseModal(dayIndex, exIndex)}
                >
                  <View style={styles.dragHandle}>
                    <Text style={styles.dragIcon}>☰</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseItemName}>
                      {exerciseData ? getExerciseName(exerciseData, lang) : 'Unknown'}
                    </Text>
                    <Text style={styles.exerciseItemDetails}>
                      {ex.sets} {t('sets', lang).toLowerCase()} • {ex.reps?.[0] || 10} {t('reps', lang).toLowerCase()}
                      {totalWeight > 0 && ` • ${ex.weights[0]}kg`}
                    </Text>
                  </View>
                  <View style={styles.reorderButtons}>
                    {exIndex > 0 && (
                      <TouchableOpacity
                        style={styles.reorderButton}
                        onPress={() => moveExercise(dayIndex, exIndex, exIndex - 1)}
                      >
                        <Text style={styles.reorderIcon}>▲</Text>
                      </TouchableOpacity>
                    )}
                    {exIndex < day.exercises.length - 1 && (
                      <TouchableOpacity
                        style={styles.reorderButton}
                        onPress={() => moveExercise(dayIndex, exIndex, exIndex + 1)}
                      >
                        <Text style={styles.reorderIcon}>▼</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      ))}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  // Exercise config modal (shared between add and edit)
  const renderExerciseConfigModal = (isEdit = false) => {
    const exerciseData = exerciseConfig.exerciseId ? getExerciseById(exerciseConfig.exerciseId) : null;
    
    return (
      <Modal
        visible={isEdit ? showEditExerciseModal : showAddExerciseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => isEdit ? setShowEditExerciseModal(false) : setShowAddExerciseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <Text style={styles.modalTitle}>
              {isEdit ? t('editExercise', lang) : t('addExercise', lang)}
            </Text>
            
            {!isEdit && !exerciseConfig.exerciseId ? (
              // Exercise selection
              <>
                <View style={styles.muscleFilterRow}>
                  <TouchableOpacity onPress={prevMuscleFilter} style={styles.filterArrow}>
                    <Text style={styles.filterArrowText}>◀</Text>
                  </TouchableOpacity>
                  <Text style={styles.filterLabel}>{getCurrentFilterName()}</Text>
                  <TouchableOpacity onPress={nextMuscleFilter} style={styles.filterArrow}>
                    <Text style={styles.filterArrowText}>▶</Text>
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={getFilteredExercises()}
                  keyExtractor={(item) => item.id}
                  style={styles.exerciseList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.exerciseOption}
                      onPress={() => selectExerciseForAdd(item)}
                    >
                      <View style={[
                        styles.exerciseOptionColor,
                        { backgroundColor: colors.muscleColors[item.muscleGroup] }
                      ]} />
                      <View style={styles.exerciseOptionInfo}>
                        <Text style={styles.exerciseOptionName}>{getExerciseName(item, lang)}</Text>
                        <Text style={styles.exerciseOptionMuscle}>
                          {getMuscleGroupName(item.muscleGroup, lang)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </>
            ) : (
              // Exercise configuration
              <ScrollView style={styles.configScroll}>
                {exerciseData && (
                  <View style={styles.selectedExerciseHeader}>
                    <View style={styles.selectedExerciseInfo}>
                      <View style={[
                        styles.selectedExerciseColor,
                        { backgroundColor: colors.muscleColors[exerciseData.muscleGroup] }
                      ]} />
                      <Text style={styles.selectedExerciseName}>
                        {getExerciseName(exerciseData, lang)}
                      </Text>
                    </View>
                    <View style={styles.configImageContainer}>
                      <ExerciseImage 
                        exerciseId={exerciseData.id} 
                        size={120}
                        animate={true}
                        animationDuration={1500}
                      />
                    </View>
                  </View>
                )}

                {/* Sets count */}
                <View style={styles.configRow}>
                  <Text style={styles.configLabel}>{t('sets', lang)}</Text>
                  <View style={styles.configControls}>
                    <TouchableOpacity 
                      style={styles.configButton}
                      onPress={() => updateSetsCount(exerciseConfig.sets - 1)}
                    >
                      <Text style={styles.configButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.configValue}>{exerciseConfig.sets}</Text>
                    <TouchableOpacity 
                      style={styles.configButton}
                      onPress={() => updateSetsCount(exerciseConfig.sets + 1)}
                    >
                      <Text style={styles.configButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Per-set configuration */}
                <Text style={styles.configSectionTitle}>
                  {t('reps', lang)} & {t('weight', lang)}
                </Text>
                {Array.from({ length: exerciseConfig.sets }).map((_, index) => (
                  <View key={index} style={styles.setConfigRow}>
                    <Text style={styles.setLabel}>{t('set', lang)} {index + 1}</Text>
                    <View style={styles.setInputs}>
                      {/* Reps with arrows */}
                      <View style={styles.setInputGroup}>
                        <TouchableOpacity 
                          style={styles.miniButton}
                          onPress={() => updateRep(index, (exerciseConfig.reps[index] || 10) - 1)}
                        >
                          <Text style={styles.miniButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.repValue}>{exerciseConfig.reps[index] || 10}</Text>
                        <TouchableOpacity 
                          style={styles.miniButton}
                          onPress={() => updateRep(index, (exerciseConfig.reps[index] || 10) + 1)}
                        >
                          <Text style={styles.miniButtonText}>+</Text>
                        </TouchableOpacity>
                        <Text style={styles.setInputLabelSmall}>{t('reps', lang).toLowerCase()}</Text>
                      </View>
                      {/* Weight with clear on focus */}
                      <View style={styles.setInputGroup}>
                        <TextInput
                          style={styles.weightInput}
                          value={String(exerciseConfig.weights[index] || 0)}
                          onChangeText={(text) => updateWeight(index, text)}
                          onFocus={() => {
                            // Clear the field when focused for easier input
                            if (exerciseConfig.weights[index] === 0) {
                              // Already zero, no need to clear
                            } else {
                              updateWeight(index, '');
                            }
                          }}
                          keyboardType="decimal-pad"
                          placeholder="0"
                          selectTextOnFocus={true}
                        />
                        <Text style={styles.setInputLabelSmall}>kg</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              {isEdit && (
                <TouchableOpacity
                  style={styles.modalDeleteButton}
                  onPress={handleRemoveExercise}
                >
                  <Text style={styles.modalDeleteText}>{t('delete', lang)}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => isEdit ? setShowEditExerciseModal(false) : setShowAddExerciseModal(false)}
              >
                <Text style={styles.modalCancelText}>{t('cancel', lang)}</Text>
              </TouchableOpacity>
              {(exerciseConfig.exerciseId || isEdit) && (
                <TouchableOpacity
                  style={styles.modalCreateButton}
                  onPress={isEdit ? handleSaveExercise : handleAddExercise}
                >
                  <Text style={styles.modalCreateText}>{isEdit ? t('save', lang) : t('add', lang)}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {selectedRoutine ? renderRoutineDetail() : renderRoutineList()}

      {/* New Routine Modal */}
      <Modal
        visible={showNewRoutineModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewRoutineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('createRoutine', lang)}</Text>
            
            <Text style={styles.inputLabel}>{t('routineName', lang)}</Text>
            <TextInput
              style={styles.textInput}
              value={newRoutineName}
              onChangeText={setNewRoutineName}
              placeholder={t('routineNamePlaceholder', lang)}
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.inputLabel}>{t('daysPerWeek', lang)}</Text>
            <View style={styles.daysSelector}>
              {[3, 4, 5, 6].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.dayOption,
                    newRoutineDays === num && styles.dayOptionSelected,
                  ]}
                  onPress={() => setNewRoutineDays(num)}
                >
                  <Text style={[
                    styles.dayOptionText,
                    newRoutineDays === num && styles.dayOptionTextSelected,
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>{t('restBetweenSets', lang)}</Text>
            <TextInput
              style={styles.textInput}
              value={newRestBetweenSets}
              onChangeText={setNewRestBetweenSets}
              keyboardType="numeric"
              placeholder="60"
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.inputLabel}>{t('restBetweenExercises', lang)}</Text>
            <TextInput
              style={styles.textInput}
              value={newRestBetweenExercises}
              onChangeText={setNewRestBetweenExercises}
              keyboardType="numeric"
              placeholder="90"
              placeholderTextColor={colors.textLight}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowNewRoutineModal(false)}
              >
                <Text style={styles.modalCancelText}>{t('cancel', lang)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCreateButton}
                onPress={handleCreateRoutine}
              >
                <Text style={styles.modalCreateText}>{t('create', lang)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Exercise Modal */}
      {renderExerciseConfigModal(false)}

      {/* Edit Exercise Modal */}
      {renderExerciseConfigModal(true)}
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
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerTitleSmall: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    fontSize: fontSize.md,
    color: colors.accentLight,
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptyButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  emptyButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSize.md,
  },
  routineCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.small,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  routineMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  routineArrow: {
    fontSize: fontSize.xl,
    color: colors.accent,
  },
  hint: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: fontSize.sm,
    marginTop: spacing.lg,
  },
  routineStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.accent,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  dayCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dayTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  dayActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayActionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  dayActionButtonPrimary: {
    backgroundColor: colors.accent,
  },
  dayActionButtonDisabled: {
    backgroundColor: colors.border,
  },
  dayActionText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
  },
  dayActionTextPrimary: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  noExercises: {
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: spacing.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dragHandle: {
    paddingRight: spacing.sm,
  },
  dragIcon: {
    color: colors.textLight,
    fontSize: fontSize.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseItemName: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  exerciseItemDetails: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  reorderButtons: {
    flexDirection: 'column',
    gap: 2,
  },
  reorderButton: {
    padding: spacing.xs,
  },
  reorderIcon: {
    color: colors.accent,
    fontSize: fontSize.sm,
  },
  bottomPadding: {
    height: 100,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  daysSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayOption: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  dayOptionSelected: {
    backgroundColor: colors.accent,
  },
  dayOptionText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  dayOptionTextSelected: {
    color: colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalCancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  modalCreateButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  modalCreateText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  modalDeleteButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  modalDeleteText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  
  // Muscle filter
  muscleFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  filterArrow: {
    padding: spacing.md,
  },
  filterArrowText: {
    fontSize: fontSize.lg,
    color: colors.accent,
    fontWeight: 'bold',
  },
  filterLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  exerciseList: {
    maxHeight: 300,
  },
  exerciseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseOptionColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  exerciseOptionInfo: {
    flex: 1,
  },
  exerciseOptionName: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  exerciseOptionMuscle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  
  // Config styles
  configScroll: {
    maxHeight: 400,
  },
  selectedExerciseHeader: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  selectedExerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  selectedExerciseColor: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  selectedExerciseName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  configImageContainer: {
    marginTop: spacing.sm,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  configLabel: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  configControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  configButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  configButtonText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  configValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    minWidth: 30,
    textAlign: 'center',
  },
  configSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  setConfigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  setLabel: {
    width: 55,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  setInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  setInputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  repValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    minWidth: 35,
    textAlign: 'center',
  },
  weightInput: {
    width: 55,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  setInputLabelSmall: {
    marginLeft: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});

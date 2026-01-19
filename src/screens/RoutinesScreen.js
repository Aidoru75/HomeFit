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
import { loadRoutines, addRoutine, updateRoutine, deleteRoutine, loadSettings, loadExcludedExercises } from '../storage/storage';
import { t } from '../data/translations';
import ExerciseImage from '../components/ExerciseImage';

export default function RoutinesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [showNewRoutineModal, setShowNewRoutineModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  const [showRenameDayModal, setShowRenameDayModal] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);
  const [currentMuscleFilter, setCurrentMuscleFilter] = useState(0); // Index in muscleGroups, 0 = all
  const [settings, setSettings] = useState({ language: 'en' });
  const [dayNameInput, setDayNameInput] = useState('');
  const [excludedExercises, setExcludedExercises] = useState([]);
  
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
    const excluded = await loadExcludedExercises();
    setRoutines(data);
    setSettings(userSettings);
    setExcludedExercises(excluded);
  };

  const lang = settings.language || 'en';

  // Get display name for a day (customName takes priority)
  const getDayDisplayName = (day, index) => {
    if (day.customName) {
      return day.customName;
    }
    // Fallback to translated default name
    return day.name || `${t('days', lang).slice(0, -1)} ${index + 1}`;
  };

  const handleCreateRoutine = async () => {
    if (!newRoutineName.trim()) {
      Alert.alert('Error', t('routineName', lang));
      return;
    }

    const days = [];
    for (let i = 0; i < newRoutineDays; i++) {
      days.push({
        name: `Day ${i + 1}`, // Default English name
        customName: null, // No custom name initially
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

  // Day reordering functions
  const moveDay = async (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    if (toIndex < 0 || toIndex >= selectedRoutine.days.length) return;
    
    const updatedDays = [...selectedRoutine.days];
    const [moved] = updatedDays.splice(fromIndex, 1);
    updatedDays.splice(toIndex, 0, moved);

    const updated = await updateRoutine(selectedRoutine.id, { days: updatedDays });
    setSelectedRoutine(updated);
    setRoutines(routines.map(r => r.id === updated.id ? updated : r));
  };

  // Day renaming functions
  const openRenameDayModal = (dayIndex) => {
    const day = selectedRoutine.days[dayIndex];
    setEditingDayIndex(dayIndex);
    setDayNameInput(day.customName || '');
    setShowRenameDayModal(true);
  };

  const handleRenameDay = async () => {
    if (selectedRoutine && editingDayIndex !== null) {
      const updatedDays = [...selectedRoutine.days];
      const trimmedName = dayNameInput.trim();
      
      // Set customName if provided, otherwise clear it
      updatedDays[editingDayIndex] = {
        ...updatedDays[editingDayIndex],
        customName: trimmedName || null,
      };

      const updated = await updateRoutine(selectedRoutine.id, { days: updatedDays });
      setSelectedRoutine(updated);
      setRoutines(routines.map(r => r.id === updated.id ? updated : r));
      setShowRenameDayModal(false);
      setDayNameInput('');
      setEditingDayIndex(null);
    }
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

  // Get filtered exercises for add modal (excluding disabled ones)
  const getFilteredExercises = () => {
    let filtered = exercises.filter(ex => !excludedExercises.includes(ex.id));
    if (currentMuscleFilter !== 0) {
      const muscle = muscleGroups[currentMuscleFilter - 1];
      filtered = filtered.filter(ex => ex.muscleGroup === muscle.id);
    }
    return filtered;
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
            <View style={styles.dayTitleRow}>
              {/* Day reorder buttons */}
              <View style={styles.dayReorderButtons}>
                {dayIndex > 0 && (
                  <TouchableOpacity
                    style={styles.dayReorderButton}
                    onPress={() => moveDay(dayIndex, dayIndex - 1)}
                  >
                    <Text style={styles.dayReorderIcon}>▲</Text>
                  </TouchableOpacity>
                )}
                {dayIndex < selectedRoutine.days.length - 1 && (
                  <TouchableOpacity
                    style={styles.dayReorderButton}
                    onPress={() => moveDay(dayIndex, dayIndex + 1)}
                  >
                    <Text style={styles.dayReorderIcon}>▼</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Day title (tappable to rename) */}
              <TouchableOpacity 
                style={styles.dayTitleTouchable}
                onPress={() => openRenameDayModal(dayIndex)}
              >
                <Text style={styles.dayTitle}>{getDayDisplayName(day, dayIndex)}</Text>
                <Text style={styles.dayEditIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
            
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
                <View style={styles.muscleFilter}>
                  <TouchableOpacity onPress={prevMuscleFilter}>
                    <Text style={styles.filterArrow}>◀</Text>
                  </TouchableOpacity>
                  <Text style={styles.filterName}>{getCurrentFilterName()}</Text>
                  <TouchableOpacity onPress={nextMuscleFilter}>
                    <Text style={styles.filterArrow}>▶</Text>
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
                      <ExerciseImage exerciseId={item.id} size={40} />
                      <Text style={styles.exerciseOptionName}>
                        {getExerciseName(item, lang)}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            ) : (
              // Exercise configuration
              <ScrollView>
                {exerciseData && (
                  <View style={styles.selectedExercise}>
                    <ExerciseImage exerciseId={exerciseData.id} size={60} />
                    <Text style={styles.selectedExerciseName}>
                      {getExerciseName(exerciseData, lang)}
                    </Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>{t('sets', lang)}</Text>
                <View style={styles.setsControl}>
                  <TouchableOpacity
                    style={styles.setsButton}
                    onPress={() => updateSetsCount(exerciseConfig.sets - 1)}
                  >
                    <Text style={styles.setsButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.setsValue}>{exerciseConfig.sets}</Text>
                  <TouchableOpacity
                    style={styles.setsButton}
                    onPress={() => updateSetsCount(exerciseConfig.sets + 1)}
                  >
                    <Text style={styles.setsButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>{t('reps', lang)} & {t('weight', lang)}</Text>
                {Array.from({ length: exerciseConfig.sets }).map((_, index) => (
                  <View key={index} style={styles.setRow}>
                    <Text style={styles.setNumber}>{index + 1}</Text>
                    <View style={styles.setInput}>
                      <Text style={styles.setInputLabel}>{t('reps', lang)}</Text>
                      <TextInput
                        style={styles.setInputField}
                        value={String(exerciseConfig.reps[index] || 10)}
                        onChangeText={(value) => updateRep(index, value)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.setInput}>
                      <Text style={styles.setInputLabel}>Kg</Text>
                      <TextInput
                        style={styles.setInputField}
                        value={String(exerciseConfig.weights[index] || 0)}
                        onChangeText={(value) => updateWeight(index, value)}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                ))}

                {isEdit && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleRemoveExercise}
                  >
                    <Text style={styles.deleteButtonText}>{t('delete', lang)}</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => isEdit ? setShowEditExerciseModal(false) : setShowAddExerciseModal(false)}
              >
                <Text style={styles.modalCancelText}>{t('cancel', lang)}</Text>
              </TouchableOpacity>
              {exerciseConfig.exerciseId && (
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

  // Rename day modal
  const renderRenameDayModal = () => (
    <Modal
      visible={showRenameDayModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowRenameDayModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('renameDay', lang) || 'Rename Day'}</Text>
          
          <Text style={styles.inputLabel}>{t('dayName', lang) || 'Day Name'}</Text>
          <TextInput
            style={styles.textInput}
            value={dayNameInput}
            onChangeText={setDayNameInput}
            placeholder={t('dayNamePlaceholder', lang) || 'e.g., Push Day, Leg Day'}
            placeholderTextColor={colors.textLight}
            autoFocus={true}
          />
          
          <Text style={styles.hintText}>
            {t('renameDayHint', lang) || 'Leave empty to use default name'}
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowRenameDayModal(false);
                setDayNameInput('');
                setEditingDayIndex(null);
              }}
            >
              <Text style={styles.modalCancelText}>{t('cancel', lang)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCreateButton}
              onPress={handleRenameDay}
            >
              <Text style={styles.modalCreateText}>{t('save', lang)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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

      {/* Rename Day Modal */}
      {renderRenameDayModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
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
    fontSize: fontSize.sm,
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
    fontSize: fontSize.xl,
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
  hintText: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    fontStyle: 'italic',
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
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayReorderButtons: {
    flexDirection: 'column',
    marginRight: spacing.sm,
  },
  dayReorderButton: {
    padding: spacing.xs,
  },
  dayReorderIcon: {
    color: colors.accent,
    fontSize: fontSize.xs,
  },
  dayTitleTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  dayEditIcon: {
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
    opacity: 0.5,
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
    fontWeight: 'bold',
    fontSize: fontSize.md,
  },
  
  // Exercise selection
  muscleFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  filterArrow: {
    fontSize: fontSize.lg,
    color: colors.accent,
    padding: spacing.sm,
  },
  filterName: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  exerciseList: {
    maxHeight: 300,
  },
  exerciseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseOptionName: {
    marginLeft: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  selectedExercise: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  selectedExerciseName: {
    marginLeft: spacing.md,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  setsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  setsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setsButtonText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  setsValue: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  setNumber: {
    width: 24,
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.accent,
  },
  setInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
  },
  setInputLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  setInputField: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    padding: spacing.xs,
  },
  deleteButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#ff4444',
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSize.md,
  },
});

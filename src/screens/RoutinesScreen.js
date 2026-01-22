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
import { colors, spacing, borderRadius, fontSize, shadows, fonts } from '../theme';
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

  // Raw string inputs for weights (to preserve decimal point while typing)
  const [weightInputs, setWeightInputs] = useState(['0', '0', '0']);

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
        name: `${t('days', lang).slice(0, -1)} ${i + 1}`,
        customName: '',
        exercises: [],
      });
    }

    const routine = {
      name: newRoutineName.trim(),
      days,
      restBetweenSets: parseInt(newRestBetweenSets) || 60,
      restBetweenExercises: parseInt(newRestBetweenExercises) || 90,
    };

    const created = await addRoutine(routine);
    setRoutines([...routines, created]);
    setShowNewRoutineModal(false);
    setNewRoutineName('');
    setNewRoutineDays(4);
    setNewRestBetweenSets('60');
    setNewRestBetweenExercises('90');
    setSelectedRoutine(created);
  };

  const handleDeleteRoutine = async (routineId) => {
    const routine = routines.find(r => r.id === routineId);
    Alert.alert(
      t('confirmDelete', lang),
      `"${routine?.name}"?`,
      [
        { text: t('cancel', lang), style: 'cancel' },
        {
          text: t('delete', lang),
          style: 'destructive',
          onPress: async () => {
            await deleteRoutine(routineId);
            setRoutines(routines.filter(r => r.id !== routineId));
          },
        },
      ]
    );
  };

  const startWorkout = (dayIndex) => {
    if (selectedRoutine) {
      const day = selectedRoutine.days[dayIndex];
      if (!day.exercises || day.exercises.length === 0) {
        Alert.alert('⚠️', t('emptyDayWarning', lang), [{ text: 'OK' }]);
        return;
      }
      navigation.navigate('Training', {
        routineId: selectedRoutine.id,
        dayIndex,
      });
    }
  };

  const moveDay = async (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= selectedRoutine.days.length) return;
    
    const updatedDays = [...selectedRoutine.days];
    const [moved] = updatedDays.splice(fromIndex, 1);
    updatedDays.splice(toIndex, 0, moved);
    
    const updated = await updateRoutine(selectedRoutine.id, { days: updatedDays });
    setSelectedRoutine(updated);
    setRoutines(routines.map(r => r.id === updated.id ? updated : r));
  };

  const openRenameDayModal = (dayIndex) => {
    setEditingDayIndex(dayIndex);
    setDayNameInput(selectedRoutine.days[dayIndex].customName || '');
    setShowRenameDayModal(true);
  };

  const handleRenameDay = async () => {
    if (selectedRoutine && editingDayIndex !== null) {
      const updatedDays = [...selectedRoutine.days];
      updatedDays[editingDayIndex] = {
        ...updatedDays[editingDayIndex],
        customName: dayNameInput.trim(),
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
    // Initialize weight inputs as strings
    setWeightInputs(['0', '0', '0']);
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
    
    // Also update weight inputs
    setWeightInputs(prev => {
      const newInputs = [...prev];
      while (newInputs.length < count) {
        newInputs.push(newInputs[newInputs.length - 1] || '0');
      }
      return newInputs.slice(0, count);
    });
  };

  // Updated updateRep: auto-copy first set value to other sets in Add mode
  const updateRep = (index, value, isAddMode = false) => {
    const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
    const clampedValue = Math.max(1, Math.min(99, numValue));
    
    setExerciseConfig(prev => {
      const newReps = [...prev.reps];
      
      // If editing first set (index 0) in Add mode, propagate to all sets
      if (index === 0 && isAddMode) {
        for (let i = 0; i < newReps.length; i++) {
          newReps[i] = clampedValue;
        }
      } else {
        newReps[index] = clampedValue;
      }
      
      return { ...prev, reps: newReps };
    });
  };

  // Updated updateWeight: preserve decimal point and auto-copy first set value in Add mode
  const updateWeight = (index, value, isAddMode = false) => {
    // Store raw string value to preserve decimal point while typing
    setWeightInputs(prev => {
      const newInputs = [...prev];
      
      // If editing first set (index 0) in Add mode, propagate to all sets
      if (index === 0 && isAddMode) {
        for (let i = 0; i < newInputs.length; i++) {
          newInputs[i] = value;
        }
      } else {
        newInputs[index] = value;
      }
      
      return newInputs;
    });
    
    // Also update the numeric weights (for saving)
    setExerciseConfig(prev => {
      const newWeights = [...prev.weights];
      const numValue = parseFloat(value) || 0;
      
      // If editing first set (index 0) in Add mode, propagate to all sets
      if (index === 0 && isAddMode) {
        for (let i = 0; i < newWeights.length; i++) {
          newWeights[i] = numValue;
        }
      } else {
        newWeights[index] = numValue;
      }
      
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
    // Initialize weight inputs from existing weights
    const weights = exercise.weights || Array(exercise.sets).fill(0);
    setWeightInputs(weights.map(w => String(w)));
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

  // Get available exercises (not excluded)
  const getAvailableExercises = () => {
    return exercises.filter(ex => !excludedExercises.includes(ex.id));
  };

  // Filter exercises by muscle group
  const getFilteredExercises = () => {
    const available = getAvailableExercises();
    if (currentMuscleFilter === 0) return available;
    const muscleId = muscleGroups[currentMuscleFilter - 1]?.id;
    return available.filter(ex => ex.muscleGroup === muscleId);
  };

  const renderRoutineList = () => (
    <ScrollView style={styles.content}>
      {routines.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>{t('noRoutinesYet', lang)}</Text>
          <Text style={styles.emptyText}>{t('createYourFirst', lang)}</Text>
        </View>
      ) : (
        <>
          {routines.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              style={styles.routineCard}
              onPress={() => setSelectedRoutine(routine)}
              onLongPress={() => handleDeleteRoutine(routine.id)}
            >
              <View style={styles.routineInfo}>
                <Text style={styles.routineName}>{routine.name}</Text>
                <Text style={styles.routineDetails}>
                  {routine.days?.length || 0} {t('days', lang)} • {routine.restBetweenSets}s {t('rest', lang)}
                </Text>
              </View>
              <Text style={styles.routineArrow}>›</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.hintText}>{t('longPressDelete', lang)}</Text>
        </>
      )}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  const renderRoutineDetail = () => (
    <ScrollView style={styles.content}>
      {selectedRoutine.days?.map((day, dayIndex) => (
        <View key={dayIndex} style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <View style={styles.dayTitleContainer}>
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
                  <View style={styles.exerciseThumbnail}>
                    <ExerciseImage 
                      exerciseId={ex.exerciseId} 
                      size={40} 
                      showEndImage={true}
                      animate={false}
                    />
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
    const isAddMode = !isEdit; // For propagating first set values
    
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
              // Exercise selection (Add mode only)
              <>
                <View style={styles.muscleFilter}>
                  <TouchableOpacity
                    onPress={() => setCurrentMuscleFilter(prev => 
                      prev === 0 ? muscleGroups.length : prev - 1
                    )}
                  >
                    <Text style={styles.filterArrow}>◀</Text>
                  </TouchableOpacity>
                  <Text style={styles.filterName}>
                    {currentMuscleFilter === 0 
                      ? t('all', lang)
                      : getMuscleGroupName(muscleGroups[currentMuscleFilter - 1], lang)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCurrentMuscleFilter(prev => 
                      prev === muscleGroups.length ? 0 : prev + 1
                    )}
                  >
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
              // Exercise configuration (both Add and Edit modes)
              <ScrollView showsVerticalScrollIndicator={false}>
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
                        onChangeText={(value) => updateRep(index, value, isAddMode)}
                        keyboardType="numeric"
                        selectTextOnFocus={true}
                      />
                    </View>
                    <View style={styles.setInput}>
                      <Text style={styles.setInputLabel}>Kg</Text>
                      <TextInput
                        style={styles.setInputField}
                        value={weightInputs[index] || '0'}
                        onChangeText={(value) => updateWeight(index, value, isAddMode)}
                        keyboardType="decimal-pad"
                        selectTextOnFocus={true}
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
      {selectedRoutine ? (
        // Routine detail view
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <TouchableOpacity onPress={() => setSelectedRoutine(null)}>
            <Text style={styles.backButton}>←{t('back', lang)}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitleSmall}>{selectedRoutine.name}</Text>
          <View style={{ width: 50 }} />
        </View>
      ) : (
        // Routine list header
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Text style={styles.headerTitle}>{t('routines', lang)}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowNewRoutineModal(true)}
          >
            <Text style={styles.addButtonText}>+{t('newRoutine', lang)}</Text>
          </TouchableOpacity>
        </View>
      )}

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
    fontFamily: fonts.regular,
    fontSize: fontSize.xxl,
    color: colors.white,
  },
  headerTitleSmall: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    fontFamily: fonts.regular,
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
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: fontSize.sm,
  },
  content: {
    flex: 1,
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
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  routineDetails: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  routineArrow: {
    fontSize: fontSize.xxl,
    color: colors.accent,
  },
  hintText: {
    fontFamily: fonts.italic,
    fontSize: fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  dayCard: {
    backgroundColor: colors.card,
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dayTitleContainer: {
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
    fontFamily: fonts.regular,
    color: colors.accent,
    fontSize: fontSize.xs,
  },
  dayTitleTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  dayTitleSmall: {
    fontFamily: fonts.regular,
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
    fontFamily: fonts.regular,
    color: colors.textPrimary,
    fontSize: fontSize.sm,
  },
  dayActionTextPrimary: {
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: fontSize.sm,
  },
  noExercises: {
    fontFamily: fonts.italic,
    color: colors.textLight,
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
  exerciseThumbnail: {
    marginRight: spacing.sm,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseItemName: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  exerciseItemDetails: {
    fontFamily: fonts.regular,
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
    fontFamily: fonts.regular,
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
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  textInput: {
    fontFamily: fonts.regular,
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
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
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
    fontFamily: fonts.regular,
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
    fontFamily: fonts.bold,
    color: colors.white,
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
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
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
    fontFamily: fonts.regular,
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
    fontFamily: fonts.bold,
    marginLeft: spacing.md,
    fontSize: fontSize.lg,
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
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: fontSize.xxl,
  },
  setsValue: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xxl,
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
    fontFamily: fonts.bold,
    width: 24,
    fontSize: fontSize.md,
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
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  setInputField: {
    fontFamily: fonts.regular,
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
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: fontSize.md,
  },
});

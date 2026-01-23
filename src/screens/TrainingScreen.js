// Training Screen - Active workout with timer and exercise guidance
// Redesigned with thumbnail navigation, editable reps/weight, and change tracking
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  BackHandler,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontSize, fonts } from '../theme';
import { exercises, getExerciseName, getExerciseDescription } from '../data/exercises';
import { loadRoutines, loadSettings, saveLastWorkout, addToHistory, updateRoutine } from '../storage/storage';
import { t } from '../data/translations';
import ExerciseImage from '../components/ExerciseImage';

// Audio source for beep sound
const beepSource = require('../../assets/beep.mp3');

// Background images
const startBackground = require('../../assets/start.png');
const successBackground = require('../../assets/success.png');

export default function TrainingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { routineId, dayIndex } = route.params || {};
  
  const [routine, setRoutine] = useState(null);
  const [settings, setSettings] = useState({ language: 'en', soundEnabled: true, soundVolume: 1.0 });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [isExerciseRest, setIsExerciseRest] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  
  // Track modifications to reps/weights during workout
  const [modifiedExercises, setModifiedExercises] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const timerRef = useRef(null);
  const thumbnailScrollRef = useRef(null);
  const soundPlayedRef = useRef(false);
  const modifiedExercisesRef = useRef({});
  
  // Use the new expo-audio hook
  const player = useAudioPlayer(beepSource);

  const lang = settings.language || 'en';

  const allowNavigation = useRef(false);
  const paramsRef = useRef({ routineId: null, dayIndex: null });

  // Reset all workout state to initial values
  const resetWorkoutState = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setIsResting(false);
    setRestTimeLeft(0);
    setIsExerciseRest(false);
    setWorkoutStarted(false);
    setWorkoutComplete(false);
    soundPlayedRef.current = false;
    setModifiedExercises({});
    setHasChanges(false);
  }, []);

  // Update params ref when new workout params are received
  useEffect(() => {
    if (routineId && dayIndex !== undefined) {
      // Check if this is actually a NEW workout (different params)
      const isDifferentWorkout =
        paramsRef.current.routineId !== routineId ||
        paramsRef.current.dayIndex !== dayIndex;

      paramsRef.current = { routineId, dayIndex };

      // Only reset and load data if we're starting a different workout
      // Don't reset or reload if just re-rendering with same params
      if (isDifferentWorkout) {
        resetWorkoutState();
        loadData();
      }
    }
  }, [routineId, dayIndex, resetWorkoutState]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Keep ref in sync with state to avoid closure issues
  useEffect(() => {
    modifiedExercisesRef.current = modifiedExercises;
  }, [modifiedExercises]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (workoutStarted && !workoutComplete) {
        showExitConfirmation();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [workoutStarted, workoutComplete, hasChanges]);

  // Prevent navigation when workout is active
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (allowNavigation.current) {
        allowNavigation.current = false;
        return;
      }

      if (workoutStarted && !workoutComplete) {
        e.preventDefault();
        showExitConfirmation();
      }
    });

    return unsubscribe;
  }, [navigation, workoutStarted, workoutComplete, hasChanges]);

  const showExitConfirmation = () => {
    if (hasChanges) {
      Alert.alert(
        t('saveChanges', lang) || 'Save Changes?',
        t('unsavedChanges', lang) || 'You have unsaved changes. Do you want to save them?',
        [
          { text: t('discardChanges', lang) || 'Discard', style: 'destructive', onPress: exitWithoutSaving },
          { text: t('cancel', lang) || 'Cancel', style: 'cancel' },
          { text: t('save', lang) || 'Save', onPress: saveAndExit },
        ]
      );
    } else {
      Alert.alert(
        t('endWorkout', lang) || 'End Workout?',
        t('endWorkoutConfirm', lang) || 'Are you sure you want to end this workout?',
        [
          { text: t('continueButton', lang) || 'Continue', style: 'cancel' },
          { text: t('end', lang) || 'End', style: 'destructive', onPress: exitWithoutSaving },
        ]
      );
    }
  };

  const exitWithoutSaving = () => {
    allowNavigation.current = true;
    navigation.goBack();
  };

  const saveAndExit = async () => {
    try {
      await saveModifiedExercises();
      allowNavigation.current = true;
      navigation.goBack();
    } catch (error) {
      console.error('Error in saveAndExit:', error);
      Alert.alert('Error', 'Failed to save and exit: ' + error.message);
    }
  };

  const saveModifiedExercises = async () => {
    // Use ref to get the latest value, avoiding closure issues
    const currentModifiedExercises = modifiedExercisesRef.current;

    if (!hasChanges || !routine) {
      return;
    }

    // Create a deep copy of the days array and the specific day's exercises
    const updatedDays = routine.days.map((day, idx) => {
      if (idx !== paramsRef.current.dayIndex) {
        return day; // Keep other days unchanged
      }

      // Create a new exercises array for the current day
      const updatedExercises = day.exercises.map((exercise, exIdx) => {
        const mods = currentModifiedExercises[exIdx];
        if (mods) {
          return {
            ...exercise,
            reps: mods.reps ? [...mods.reps] : exercise.reps,
            weights: mods.weights ? [...mods.weights] : exercise.weights,
          };
        }
        return exercise;
      });

      return {
        ...day,
        exercises: updatedExercises,
      };
    });

    try {
      await updateRoutine(routine.id, { days: updatedDays });
    } catch (error) {
      console.error('Error in updateRoutine:', error);
      Alert.alert('Error', 'Failed to save changes: ' + error.message);
    }
  };

  const loadData = async () => {
    const routines = await loadRoutines();
    const userSettings = await loadSettings();
    
    const found = routines.find(r => r.id === paramsRef.current.routineId);
    setRoutine(found);
    setSettings(userSettings);
    
    if (userSettings.soundVolume !== undefined && player) {
      player.volume = userSettings.soundVolume;
    }
  };

  const getExerciseData = (exerciseId) => {
    return exercises.find(e => e.id === exerciseId);
  };

  // Get current reps (modified or original)
  const getCurrentReps = () => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    const currentEx = day?.exercises?.[currentExerciseIndex];
    if (!currentEx) return 10;
    
    const modified = modifiedExercises[currentExerciseIndex];
    if (modified?.reps?.[currentSetIndex] !== undefined) {
      return modified.reps[currentSetIndex];
    }
    return currentEx.reps?.[currentSetIndex] || 10;
  };

  // Get current weight (modified or original)
  const getCurrentWeight = () => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    const currentEx = day?.exercises?.[currentExerciseIndex];
    if (!currentEx) return 0;
    
    const modified = modifiedExercises[currentExerciseIndex];
    if (modified?.weights?.[currentSetIndex] !== undefined) {
      return modified.weights[currentSetIndex];
    }
    return currentEx.weights?.[currentSetIndex] || 0;
  };

  // Update reps for current set
  const updateReps = (delta) => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    const currentEx = day?.exercises?.[currentExerciseIndex];
    if (!currentEx) return;

    setModifiedExercises(prev => {
      const existing = prev[currentExerciseIndex] || {
        reps: [...(currentEx.reps || Array(currentEx.sets).fill(10))],
        weights: [...(currentEx.weights || Array(currentEx.sets).fill(0))]
      };

      // Get current value from the existing state (most up-to-date)
      const currentReps = existing.reps[currentSetIndex] !== undefined
        ? existing.reps[currentSetIndex]
        : (currentEx.reps?.[currentSetIndex] || 10);
      const newReps = Math.max(1, currentReps + delta);

      const newRepsArray = [...existing.reps];
      newRepsArray[currentSetIndex] = newReps;

      return {
        ...prev,
        [currentExerciseIndex]: { ...existing, reps: newRepsArray }
      };
    });
    setHasChanges(true);
  };

  // Update weight for current set
  const updateWeight = (delta) => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    const currentEx = day?.exercises?.[currentExerciseIndex];
    if (!currentEx) return;

    setModifiedExercises(prev => {
      const existing = prev[currentExerciseIndex] || {
        reps: [...(currentEx.reps || Array(currentEx.sets).fill(10))],
        weights: [...(currentEx.weights || Array(currentEx.sets).fill(0))]
      };

      // Get current value from the existing state (most up-to-date)
      const currentWeight = existing.weights[currentSetIndex] !== undefined
        ? existing.weights[currentSetIndex]
        : (currentEx.weights?.[currentSetIndex] || 0);
      const newWeight = Math.max(0, currentWeight + delta);

      const newWeightsArray = [...existing.weights];
      newWeightsArray[currentSetIndex] = newWeight;
      return {
        ...prev,
        [currentExerciseIndex]: { ...existing, weights: newWeightsArray }
      };
    });
    setHasChanges(true);
  };

  const playBeep = () => {
    if (settings.soundEnabled && player) {
      try {
        player.seekTo(0);
        player.play();
      } catch (error) {
        console.log('Error playing sound:', error);
      }
    }
  };

  const startRest = (isExRest = false) => {
    const restTime = isExRest 
      ? (routine?.restBetweenExercises || 90)
      : (routine?.restBetweenSets || 60);
    
    setIsResting(true);
    setIsExerciseRest(isExRest);
    setRestTimeLeft(restTime);
    soundPlayedRef.current = false;

    timerRef.current = setInterval(() => {
      setRestTimeLeft(prev => {
        if (prev === 9 && !soundPlayedRef.current) {
          playBeep();
          soundPlayedRef.current = true;
        }
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          Vibration.vibrate(500);
          setIsResting(false);
          setIsExerciseRest(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsResting(false);
    setIsExerciseRest(false);
  };

  const completeSet = () => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    const currentEx = day?.exercises?.[currentExerciseIndex];
    
    if (currentSetIndex < (currentEx?.sets || 3) - 1) {
      setCurrentSetIndex(prev => prev + 1);
      startRest(false);
    } else if (currentExerciseIndex < day?.exercises?.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
      startRest(true);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (hasChanges) {
      await saveModifiedExercises();
    }
    
    await saveLastWorkout({
      routineId: paramsRef.current.routineId,
      dayIndex: paramsRef.current.dayIndex,
      routineName: routine?.name,
      dayName: routine?.days?.[paramsRef.current.dayIndex]?.name,
    });

    await addToHistory({
      routineId: paramsRef.current.routineId,
      dayIndex: paramsRef.current.dayIndex,
      routineName: routine?.name,
      dayName: routine?.days?.[paramsRef.current.dayIndex]?.name,
      exerciseCount: routine?.days?.[paramsRef.current.dayIndex]?.exercises?.length || 0,
    });

    setWorkoutComplete(true);
  };

  const handleFinishAndGoHome = () => {
    allowNavigation.current = true;
    navigation.navigate('Home');
  };

  const exitWorkout = () => {
    if (workoutStarted) {
      showExitConfirmation();
    } else {
      allowNavigation.current = true;
      navigation.goBack();
    }
  };

  // Get info about next exercise/set for rest screen
  const getNextInfo = () => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    const currentEx = day?.exercises?.[currentExerciseIndex];
    
    if (currentSetIndex < (currentEx?.sets || 3)) {
      const exerciseData = getExerciseData(currentEx?.exerciseId);
      const nextReps = modifiedExercises[currentExerciseIndex]?.reps[currentSetIndex + 1] 
        || currentEx?.reps?.[currentSetIndex + 1] || 10;
      const nextWeight = modifiedExercises[currentExerciseIndex]?.weights[currentSetIndex + 1]
        || currentEx?.weights?.[currentSetIndex + 1] || 0;
      return {
        exerciseId: currentEx?.exerciseId,
        name: exerciseData ? getExerciseName(exerciseData, lang) : 'Next Set',
        set: currentSetIndex + 1,
        reps: nextReps,
        weight: nextWeight,
      };
    }
    
    if (currentExerciseIndex < day?.exercises?.length - 1) {
      const nextEx = day.exercises[currentExerciseIndex + 1];
      const exerciseData = getExerciseData(nextEx.exerciseId);
      const nextReps = modifiedExercises[currentExerciseIndex + 1]?.reps[0]
        || nextEx.reps?.[0] || 10;
      const nextWeight = modifiedExercises[currentExerciseIndex + 1]?.weights[0]
        || nextEx.weights?.[0] || 0;
      return {
        exerciseId: nextEx.exerciseId,
        name: exerciseData ? getExerciseName(exerciseData, lang) : 'Next Exercise',
        set: 1,
        reps: nextReps,
        weight: nextWeight,
      };
    }
    
    return null;
  };

  // Render thumbnail strip
  const renderThumbnailStrip = () => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    if (!day?.exercises) return null;

    return (
      <View style={styles.thumbnailContainer}>
        <ScrollView
          ref={thumbnailScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailScroll}
        >
          {day.exercises.map((ex, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnailWrapper,
                index === currentExerciseIndex && styles.thumbnailWrapperActive,
              ]}
              onPress={() => {
                if (index !== currentExerciseIndex) {
                  setCurrentExerciseIndex(index);
                  setCurrentSetIndex(0);
                }
              }}
            >
              <ExerciseImage 
                exerciseId={ex.exerciseId} 
                size={50}
                animate={false}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Get current values for display
  const currentReps = getCurrentReps();
  const currentWeight = getCurrentWeight();
  const nextInfo = getNextInfo();

  // Format weight for display
  const formatWeight = (weight) => {
    if (weight === 0) return '0';
    if (weight % 1 === 0) return weight.toString();
    return weight.toFixed(2).replace(/\.?0+$/, '');
  };

  // Get day name
  const getDayName = (day) => {
    return day?.customName || day?.name || '';
  };

  // Loading state
  if (!routine) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>{t('loadingWorkout', lang)}</Text>
      </View>
    );
  }

  const day = routine.days?.[paramsRef.current.dayIndex];

  // Workout complete screen
  if (workoutComplete) {
    return (
      <ImageBackground 
        source={successBackground} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={[styles.completeContainer, { paddingTop: insets.top }]}>
          <View style={styles.overlayCard}>
            <Text style={styles.completeTitle}>{t('workoutComplete', lang)}</Text>
            <Text style={styles.completeRoutine}>{routine.name}</Text>
            <Text style={styles.completeDay}>{getDayName(day)}</Text>
            {hasChanges && (
              <Text style={styles.changesNote}>
                {t('changesDetected', lang) || '* Changes were made to reps/weights'}
              </Text>
            )}
            <TouchableOpacity 
              style={styles.finishButton}
              onPress={handleFinishAndGoHome}
            >
              <Text style={styles.finishButtonText}>{t('finish', lang)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  // Pre-workout screen
  if (!workoutStarted) {
    return (
      <ImageBackground 
        source={startBackground} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={[styles.preWorkoutContainer, { paddingTop: insets.top }]}>
          <View style={styles.preWorkoutHeader}>
            <TouchableOpacity style={styles.exitButton} onPress={exitWorkout}>
              <Text style={styles.exitButtonText}>{t('back', lang)}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.preWorkoutContent}>
            <View style={styles.overlayCard}>
              <Text style={styles.preWorkoutRoutine}>{routine.name}</Text>
              <Text style={styles.preWorkoutDay}>{getDayName(day)}</Text>
              <Text style={styles.preWorkoutExercises}>
                {day?.exercises?.length || 0} {t('exercisesLabel', lang).toLowerCase()}
              </Text>
              
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => setWorkoutStarted(true)}
              >
                <Text style={styles.startButtonText}>{t('startWorkoutButton', lang)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    );
  }

  // Active workout
  const currentEx = day?.exercises?.[currentExerciseIndex];
  const exerciseData = currentEx ? getExerciseData(currentEx.exerciseId) : null;

  return isResting ? (
    /* Rest screen */
    <View style={[styles.restScreen, { paddingTop: insets.top }]}>
      {/* Thumbnail strip */}
      {renderThumbnailStrip()}

      <View style={styles.restContent}>
        <Text style={styles.restLabel}>
          {t('restLabel', lang)}
        </Text>
        <Text style={styles.restTimer}>{restTimeLeft}</Text>
        <Text style={styles.restSeconds}>{t('seconds', lang)}</Text>
        
        {nextInfo && (
          <View style={styles.nextPreview}>
            <Text style={styles.nextLabel}>{t('upNext', lang)}</Text>
            <View style={styles.nextImageContainer}>
              <ExerciseImage 
                exerciseId={nextInfo.exerciseId} 
                size={80}
                animate={true}
                animationDuration={1500}
              />
            </View>
            <Text style={styles.nextExercise}>{nextInfo.name}</Text>
            <Text style={styles.nextDetails}>
              {t('set', lang)} {nextInfo.set} • {nextInfo.reps} {t('reps', lang).toLowerCase()}
              {nextInfo.weight > 0 && ` • ${formatWeight(nextInfo.weight)}kg`}
            </Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.skipRestButton} onPress={skipRest}>
          <Text style={styles.skipRestButtonText}>{t('skipRest', lang)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    /* Exercise mode */
    <View style={styles.exerciseScreen}>
      {/* Thumbnail strip */}
      {renderThumbnailStrip()}

      {/* Main content */}
      <View style={styles.exerciseContent}>
        {/* Exercise name */}
        <Text style={styles.exerciseName}>
          {exerciseData ? getExerciseName(exerciseData, lang) : 'Exercise'}
        </Text>
        
        {/* Exercise description */}
        {exerciseData && (
          <Text style={styles.exerciseDescription}>
            {getExerciseDescription(exerciseData, lang)}
          </Text>
        )}
        
        {/* Set indicator */}
        <Text style={styles.setIndicator}>
          {t('set', lang).toUpperCase()} {currentSetIndex + 1} / {currentEx?.sets || 3}
        </Text>

        {/* Exercise Image */}
        <View style={styles.imageContainer}>
          <ExerciseImage 
            exerciseId={currentEx?.exerciseId} 
            size={220}
            animate={true}
            animationDuration={2000}
          />
        </View>

        {/* Done button */}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={completeSet}
        >
          <Text style={styles.doneButtonText}>
            {t('done', lang) || 'DONE'}
          </Text>
        </TouchableOpacity>

        {/* Reps control */}
        <View style={styles.controlsRow}>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>{t('reps', lang)}</Text>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => updateReps(-1)}
              >
                <Text style={styles.controlButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.controlValue}>{currentReps}</Text>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => updateReps(1)}
              >
                <Text style={styles.controlButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Weight control */}
        <View style={styles.controlsRow}>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>{t('weight', lang)}</Text>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => updateWeight(-1)}
              >
                <Text style={styles.controlButtonText}>-1</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => updateWeight(-0.25)}
              >
                <Text style={styles.controlButtonTextS}>−0.25</Text>
              </TouchableOpacity>

              <Text style={styles.controlValue}>{formatWeight(currentWeight)}</Text>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => updateWeight(0.25)}
              >
                <Text style={styles.controlButtonTextS}>+0.25</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => updateWeight(1)}
              >
                <Text style={styles.controlButtonText}>+1</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {hasChanges && (
          <Text style={styles.changesIndicator}>
            {t('changesDetected', lang) || '* Changes will be saved when you finish'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Background image
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  // Overlay card for content on background images
  overlayCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.white,
    fontSize: fontSize.lg,
  },
  
  // Complete screen
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  completeTitle: {
    fontFamily: fonts.bold,
    textAlign: 'center',
    color: colors.white,
    fontSize: fontSize.xxl,
    marginBottom: spacing.md,
  },
  completeRoutine: {
    fontFamily: fonts.regular,
    color: colors.textLight,
    fontSize: fontSize.lg,
  },
  completeDay: {
    fontFamily: fonts.regular,
    color: colors.accent,
    fontSize: fontSize.xl,
    marginTop: spacing.sm,
  },
  changesNote: {
    fontFamily: fonts.italic,
    color: colors.accent,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
  finishButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
  },
  finishButtonText: {
    fontFamily: fonts.regular,
    color: colors.white,
    fontSize: fontSize.lg,
  },
  
  // Pre-workout
  preWorkoutContainer: {
    flex: 1,
  },
  preWorkoutHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  exitButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius.md,
  },
  exitButtonText: {
    fontFamily: fonts.regular,
    color: colors.white,
    fontSize: fontSize.md,
  },
  preWorkoutContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  preWorkoutRoutine: {
    fontFamily: fonts.regular,
    color: colors.textLight,
    fontSize: fontSize.md,
    textTransform: 'uppercase',
  },
  preWorkoutDay: {
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: fontSize.xxl,
    marginTop: spacing.sm,
  },
  preWorkoutExercises: {
    color: colors.textLight,
    fontSize: fontSize.lg,
    marginTop: spacing.sm,
  },
  startButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
  },
  startButtonText: {
    textAlign: 'center',
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: fontSize.xl,
  },
  
  // Rest screen
  restScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  restContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  restLabel: {
    fontFamily: fonts.regular,
    color: '#666666',
    fontSize: fontSize.lg,
    letterSpacing: 4,
  },
  restTimer: {
    fontFamily: fonts.regular,
    color: '#000000',
    fontSize: 170,
  },
  restSeconds: {
    fontFamily: fonts.regular,
    color: '#666666',
    fontSize: fontSize.lg,
  },
  nextPreview: {
    backgroundColor: '#F0F0F0',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  nextLabel: {
    fontFamily: fonts.bold,
    color: colors.accent,
    fontSize: fontSize.xs,
    letterSpacing: 2,
  },
  nextImageContainer: {
    marginVertical: spacing.sm,
  },
  nextExercise: {
    fontFamily: fonts.bold,
    color: '#000000',
    fontSize: fontSize.lg,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  nextDetails: {
    fontFamily: fonts.regular,
    color: '#666666',
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  skipRestButton: {
    backgroundColor: '#000000',
    paddingHorizontal: spacing.xl * 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    marginTop: spacing.xl,
  },
  skipRestButtonText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    letterSpacing: 1,
  },
  
  // Exercise screen
  exerciseScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Thumbnail strip
  thumbnailContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  thumbnailScroll: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  thumbnailWrapper: {
    marginHorizontal: spacing.xs,
    padding: 2,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailWrapperActive: {
    borderColor: '#000000',
  },
  
  // Exercise content
  exerciseContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  exerciseName: {
    fontFamily: fonts.bold,
    color: '#000000',
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  exerciseDescription: {
    fontFamily: fonts.narrow,
    color: '#666666',
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  setIndicator: {
    fontFamily: fonts.regular,
    color: '#666666',
    fontSize: fontSize.md,
    marginTop: spacing.xs,
    letterSpacing: 1,
  },
  imageContainer: {
    marginVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Done button
  doneButton: {
    backgroundColor: '#000000',
    paddingHorizontal: spacing.xl * 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    marginVertical: spacing.md,
  },
  doneButtonText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    letterSpacing: 1,
  },
  
  // Controls
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  controlGroup: {
    alignItems: 'center',
  },
  controlLabel: {
    color: '#666666',
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 3,
    marginRight: 3,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl,
  },
  controlButtonTextS: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: fontSize.xs,
  },
  controlValue: {
    fontFamily: fonts.bold,
    color: '#000000',
    fontSize: fontSize.xxl,
    minWidth: 90,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  
  // Changes indicator
  changesIndicator: {
    fontFamily: fonts.italic,
    color: colors.accent,
    fontSize: fontSize.xs,
    marginTop: spacing.md,
  },
});

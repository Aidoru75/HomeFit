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
  AppState,
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
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  // Track modifications to reps/weights during workout
  const [modifiedExercises, setModifiedExercises] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const timerRef = useRef(null);
  const thumbnailScrollRef = useRef(null);
  const soundPlayedRef = useRef(false);
  const modifiedExercisesRef = useRef({});
  const restEndTimeRef = useRef(null); // Stores timestamp when rest should end
  
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
    restEndTimeRef.current = null;
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setIsResting(false);
    setRestTimeLeft(0);
    setIsExerciseRest(false);
    setWorkoutStarted(false);
    setWorkoutComplete(false);
    setWorkoutStartTime(null);
    setCaloriesBurned(0);
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

  // Handle app returning from background - recalculate rest timer
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && restEndTimeRef.current) {
        // App came back to foreground while resting - recalculate remaining time
        const remaining = Math.ceil((restEndTimeRef.current - Date.now()) / 1000);

        if (remaining <= 0) {
          // Rest period ended while in background
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          restEndTimeRef.current = null;
          Vibration.vibrate(500);
          setIsResting(false);
          setIsExerciseRest(false);
          setRestTimeLeft(0);
        } else {
          // Update display with actual remaining time
          setRestTimeLeft(remaining);
          // Play beep if we're in the warning zone and haven't played it yet
          if (remaining <= 8 && !soundPlayedRef.current) {
            playBeep();
            soundPlayedRef.current = true;
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
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
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    allowNavigation.current = true;
    navigation.goBack();
  };

  const saveAndExit = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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

  // Calculate calories burned during the workout using personalized data
  // Enhanced formula incorporating user weight, height, age, and sex
  const calculateCalories = (startTime) => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    if (!day?.exercises || !startTime) return 0;

    // Use ref to get the latest modifications
    const currentModifiedExercises = modifiedExercisesRef.current;

    // Get user data with fallbacks
    const userWeight = parseFloat(settings.userWeight) || 75; // Default 75kg
    const userHeight = parseFloat(settings.userHeight) || 170; // Default 170cm
    const userAge = parseInt(settings.userAge) || 30; // Default 30 years
    const userSex = settings.userSex || 'male'; // Default male

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (userSex === 'female') {
      // Women: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age_years) - 161
      bmr = (10 * userWeight) + (6.25 * userHeight) - (5 * userAge) - 161;
    } else {
      // Men (and "prefer not to say"): BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age_years) + 5
      bmr = (10 * userWeight) + (6.25 * userHeight) - (5 * userAge) + 5;
    }

    // Calculate personalized baseline rate
    // BMR per minute with activity factor of 2.0 for gym activity
    const bmrPerMinute = bmr / 1440; // 1440 minutes in a day
    const activityFactor = 2.0;
    const personalizedBaselineRate = bmrPerMinute * activityFactor;

    // Calculate User Mass Factor (75kg is reference weight)
    // Using 0.75 exponent for metabolic scaling
    const massFactor = Math.pow(userWeight / 75, 0.75);

    // Calculate BMI and Metabolic Efficiency
    const heightM = userHeight / 100;
    const bmi = userWeight / (heightM * heightM);
    let metabolicEfficiency = 1.0;
    if (bmi < 18.5) {
      metabolicEfficiency = 1.1; // Underweight - higher metabolic rate per kg
    } else if (bmi > 25) {
      metabolicEfficiency = 0.9; // Overweight - lower metabolic rate per kg
    }

    let totalExerciseCalories = 0;

    // Calculate calories for each exercise
    day.exercises.forEach((ex, exIndex) => {
      const exerciseData = getExerciseData(ex.exerciseId);
      if (!exerciseData) return;

      const bmc = exerciseData.bmc || 1.0;
      const wf = exerciseData.wf || 0.0;
      const sets = ex.sets || 3;
      const isBodyweight = wf === 0.0; // Bodyweight exercises have wf = 0

      // Get reps and weights (modified or original)
      const mods = currentModifiedExercises[exIndex];
      const repsArray = mods?.reps || ex.reps || Array(sets).fill(10);
      const weightsArray = mods?.weights || ex.weights || Array(sets).fill(0);

      // Calculate calories for each set
      for (let setIdx = 0; setIdx < sets; setIdx++) {
        const reps = repsArray[setIdx] || 10;
        const weight = weightsArray[setIdx] || 0;

        let setCalories;
        if (isBodyweight) {
          // Bodyweight exercise: calories = (BMC × user_weight/75) × (reps/10)
          setCalories = (bmc * userWeight / 75) * (reps / 10);
        } else {
          // Weighted exercise: calories = (BMC + (WF × weight_lifted)) × (reps/10) × mass_factor
          setCalories = (bmc + (wf * weight)) * (reps / 10) * massFactor;
        }
        totalExerciseCalories += setCalories;
      }
    });

    // Calculate session duration in minutes
    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationMinutes = durationMs / (1000 * 60);

    // Calculate baseline calories with personalized rate
    const baselineCalories = durationMinutes * personalizedBaselineRate;

    // Apply metabolic efficiency to both exercise and baseline calories
    const adjustedExerciseCalories = totalExerciseCalories * metabolicEfficiency;
    const adjustedBaselineCalories = baselineCalories * metabolicEfficiency;

    // Total calories
    const totalCalories = adjustedExerciseCalories + adjustedBaselineCalories;

    return Math.round(totalCalories);
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

    // Store the end time for background-aware countdown
    restEndTimeRef.current = Date.now() + (restTime * 1000);

    timerRef.current = setInterval(() => {
      // Calculate remaining time based on actual end time (works even after background)
      const remaining = Math.ceil((restEndTimeRef.current - Date.now()) / 1000);

      if (remaining <= 8 && remaining > 0 && !soundPlayedRef.current) {
        playBeep();
        soundPlayedRef.current = true;
      }
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        restEndTimeRef.current = null;
        Vibration.vibrate(500);
        setIsResting(false);
        setIsExerciseRest(false);
        setRestTimeLeft(0);
        return;
      }
      setRestTimeLeft(remaining);
    }, 1000);
  };

  const skipRest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    restEndTimeRef.current = null;
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

    // Calculate calories burned
    const calories = calculateCalories(workoutStartTime);
    setCaloriesBurned(calories);

    // Calculate workout duration in minutes
    const durationMinutes = workoutStartTime
      ? Math.round((new Date() - workoutStartTime) / (1000 * 60))
      : 0;

    await saveLastWorkout({
      routineId: paramsRef.current.routineId,
      dayIndex: paramsRef.current.dayIndex,
      routineName: routine?.name,
      dayName: routine?.days?.[paramsRef.current.dayIndex]?.name,
      calories,
      durationMinutes,
    });

    await addToHistory({
      routineId: paramsRef.current.routineId,
      dayIndex: paramsRef.current.dayIndex,
      routineName: routine?.name,
      dayName: routine?.days?.[paramsRef.current.dayIndex]?.name,
      exerciseCount: routine?.days?.[paramsRef.current.dayIndex]?.exercises?.length || 0,
      calories,
      durationMinutes,
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

            {/* Calories burned display */}
            <View style={styles.caloriesContainer}>
              <Text style={styles.caloriesValue}>{caloriesBurned}</Text>
              <Text style={styles.caloriesLabel}>{t('estimatedCalories', lang) || 'estimated calories'}</Text>
            </View>

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
                onPress={() => {
                  setWorkoutStartTime(new Date());
                  setWorkoutStarted(true);
                }}
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
  caloriesContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.lg,
  },
  caloriesValue: {
    fontFamily: fonts.bold,
    color: colors.accent,
    fontSize: 48,
  },
  caloriesLabel: {
    fontFamily: fonts.regular,
    color: colors.textLight,
    fontSize: fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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

// Training Screen - Active workout with timer and exercise guidance
// Redesigned with thumbnail navigation, editable reps/weight, and change tracking
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import * as StoreReview from 'expo-store-review';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { spacing, borderRadius, fontSize, fonts } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { exercises, getExerciseName, getExerciseDescription } from '../data/exercises';
import { loadRoutines, loadSettings, saveLastWorkout, addToHistory, getHistory, updateRoutine } from '../storage/storage';
import { t } from '../data/translations';
import ExerciseImage from '../components/ExerciseImage';
import { lbToKg, inchesToCm, getWeightIncrement, getSmallWeightIncrement } from '../utils/unitConversions';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { IS_PRO } from '../config';

// Audio source for countdown timer (single 10-second sequence)
const timerSource = require('../../assets/audio/timer.mp3');
// Silent clip — played before voice announcements to grab audio focus and stop background music
const silentSource = require('../../assets/audio/silent.mp3');
// 6-second silent clip — played at rest start to give a clean break before voice announcement
const silent6Source = require('../../assets/audio/silent6.mp3');

// Background images
const startBackground = IS_PRO
  ? require('../../assets/start.jpg')
  : require('../../assets/start_free.jpg');
const successBackground = IS_PRO
  ? require('../../assets/success.jpg')
  : require('../../assets/success_free.jpg');

export default function TrainingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { isLandscape, width, height } = useResponsiveLayout();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
  const [workoutDuration, setWorkoutDuration] = useState(0);

  // Track modifications to reps/weights during workout
  const [modifiedExercises, setModifiedExercises] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const timerRef = useRef(null);
  const thumbnailScrollRef = useRef(null);
  const modifiedExercisesRef = useRef({});
  const restEndTimeRef = useRef(null); // Stores timestamp when rest should end

  // Direct weight input modal
  const [weightInputVisible, setWeightInputVisible] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState('');
  const weightInputRef = useRef(null);

  // Exercise countdown timer (for timeBased exercises)
  const [isExerciseTimerActive, setIsExerciseTimerActive] = useState(false);
  const [exerciseTimerLeft, setExerciseTimerLeft] = useState(0);
  const exerciseTimerRef = useRef(null);
  const exerciseTimerEndRef = useRef(null);

  // Track which exercises had at least one set completed (for accurate calorie/volume)
  const [completedExerciseIndices, setCompletedExerciseIndices] = useState(new Set());
  const completedExerciseIndicesRef = useRef(new Set());

  // Audio player for countdown timer
  const timerPlayer = useAudioPlayer(timerSource);
  // Silent player — grabs audio focus before voice announcements to stop background music
  const silentPlayer = useAudioPlayer(silentSource);
  // 6-second silent player — played at rest start for a clean break before voice announcement
  const silent6Player = useAudioPlayer(silent6Source);

  // Refs to track current sound settings (updated on focus)
  const soundEnabledRef = useRef(true);
  const soundVolumeRef = useRef(1.0);
  const voiceEnabledRef = useRef(false);

  // Track whether timer sound / rep announcement has been triggered for current countdown
  const timerPlayedRef = useRef(false);
  const repAnnouncedRef = useRef(false);
  const nextInfoRef = useRef(null);

  const lang = settings.language || 'en';
  const isImperial = settings.measurementSystem === 'imperial';
  const weightUnit = isImperial ? t('lbs', lang) : t('kg', lang);

  const allowNavigation = useRef(false);
  const paramsRef = useRef({ routineId: null, dayIndex: null });

  // Reset all workout state to initial values
  const resetWorkoutState = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (exerciseTimerRef.current) {
      clearInterval(exerciseTimerRef.current);
      exerciseTimerRef.current = null;
    }
    restEndTimeRef.current = null;
    exerciseTimerEndRef.current = null;
    Speech.stop();
    setIsExerciseTimerActive(false);
    setExerciseTimerLeft(0);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setIsResting(false);
    setRestTimeLeft(0);
    setIsExerciseRest(false);
    setWorkoutStarted(false);
    setWorkoutComplete(false);
    setWorkoutStartTime(null);
    setCaloriesBurned(0);
    setWorkoutDuration(0);
    timerPlayedRef.current = false;
    initialAnnouncedRef.current = false;
    setModifiedExercises({});
    setHasChanges(false);
  }, []);

  // Configure audio mode on mount - stop other audio (music, etc.) when playing
  // Android: handled via native patch (patches/expo-audio+55.0.8.patch) that defaults
  // interruptionMode to DO_NOT_MIX, since setAudioModeAsync has an enum casting bug
  // iOS: configured here via setAudioModeAsync
  useEffect(() => {
    const configureAudio = async () => {
      if (Platform.OS === 'ios') {
        try {
          await setAudioModeAsync({
            playsInSilentMode: true,
            interruptionMode: 'doNotMix',
          });
        } catch (error) {
          console.log('Error configuring audio mode:', error);
        }
      }
    };
    configureAudio();
  }, []);

  // Reload settings and routine data when screen gains focus
  useFocusEffect(
    useCallback(() => {
      const reloadSettings = async () => {
        const userSettings = await loadSettings();
        setSettings(userSettings);
        // Update refs immediately for sound playback
        soundEnabledRef.current = userSettings.soundEnabled;
        soundVolumeRef.current = userSettings.soundVolume;
        voiceEnabledRef.current = userSettings.voiceEnabled;
        // Update player volumes
        if (userSettings.soundVolume !== undefined) {
          if (timerPlayer) timerPlayer.volume = userSettings.soundVolume;
        }
      };
      reloadSettings();
      // Reload routine data before workout starts (picks up superset edits, weight changes, etc.)
      if (!workoutStarted && !workoutComplete) {
        loadData();
      }
    }, [timerPlayer, workoutStarted, workoutComplete])
  );

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
      if (exerciseTimerRef.current) clearInterval(exerciseTimerRef.current);
    };
  }, []);

  // Handle app returning from background - recalculate rest timer
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      // Stop timer sound on return - it can't stay synced after background
      if (nextAppState === 'active' && timerPlayedRef.current) {
        if (timerPlayer) { try { timerPlayer.pause(); } catch(e) {} }
      }

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
          // Don't play timer sound here - it can't be synced after background
          // The interval will trigger it at exactly 10s if user returned in time
        }
      }

      // Handle exercise timer returning from background
      if (nextAppState === 'active' && exerciseTimerEndRef.current) {
        const remaining = Math.ceil((exerciseTimerEndRef.current - Date.now()) / 1000);

        if (remaining <= 0) {
          if (exerciseTimerRef.current) {
            clearInterval(exerciseTimerRef.current);
            exerciseTimerRef.current = null;
          }
          exerciseTimerEndRef.current = null;
          Vibration.vibrate(500);
          setIsExerciseTimerActive(false);
          setExerciseTimerLeft(0);
          completeSet();
        } else {
          setExerciseTimerLeft(remaining);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []); // No dependency needed - soundEnabledRef is always current

  // Keep ref in sync with state to avoid closure issues
  useEffect(() => {
    modifiedExercisesRef.current = modifiedExercises;
  }, [modifiedExercises]);

  // Handle back button - only when this screen is focused
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (workoutStarted && !workoutComplete) {
          showExitConfirmation();
          return true;
        }
        return false;
      });

      return () => backHandler.remove();
    }, [workoutStarted, workoutComplete])
  );

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
    resetWorkoutState();
    allowNavigation.current = true;
    navigation.goBack();
  };

  const saveAndExit = async () => {
    try {
      await saveModifiedExercises();
      resetWorkoutState();
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
            reps: mods.reps ? mods.reps.map((r, i) => {
              return exercise.reps?.[i] === 'E' ? 'E' : r;
            }) : exercise.reps,
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

    // Update refs for sound playback
    soundEnabledRef.current = userSettings.soundEnabled;
    soundVolumeRef.current = userSettings.soundVolume;

    if (userSettings.soundVolume !== undefined) {
      if (timerPlayer) timerPlayer.volume = userSettings.soundVolume;
    }
  };

  const getExerciseData = (exerciseId) => {
    return exercises.find(e => e.id === exerciseId);
  };

  // ============ SUPERSET HELPERS ============

  // Get all exercises in the same superset as the given exercise
  const getSupersetExercises = (exerciseIndex) => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    if (!day?.exercises) return [exerciseIndex];

    const currentEx = day.exercises[exerciseIndex];
    if (!currentEx?.supersetGroup) return [exerciseIndex];

    const group = currentEx.supersetGroup;
    const indices = [];

    // Find consecutive exercises with the same superset group
    // Start from exerciseIndex and go backwards to find the start
    let start = exerciseIndex;
    while (start > 0 && day.exercises[start - 1]?.supersetGroup === group) {
      start--;
    }

    // Now collect all consecutive exercises with this group
    for (let i = start; i < day.exercises.length; i++) {
      if (day.exercises[i]?.supersetGroup === group) {
        indices.push(i);
      } else {
        break;
      }
    }

    return indices.length > 1 ? indices : [exerciseIndex];
  };

  // Check if current exercise is in a superset
  const isInSuperset = () => {
    return getSupersetExercises(currentExerciseIndex).length > 1;
  };

  // Check if current exercise is the last in its superset
  const isLastInSuperset = () => {
    const supersetIndices = getSupersetExercises(currentExerciseIndex);
    return supersetIndices[supersetIndices.length - 1] === currentExerciseIndex;
  };

  // Get the first exercise index in the current superset
  const getFirstInSuperset = () => {
    return getSupersetExercises(currentExerciseIndex)[0];
  };

  // Get the next exercise index in the superset (or null if at end)
  const getNextInSuperset = () => {
    const supersetIndices = getSupersetExercises(currentExerciseIndex);
    const currentPos = supersetIndices.indexOf(currentExerciseIndex);
    if (currentPos < supersetIndices.length - 1) {
      return supersetIndices[currentPos + 1];
    }
    return null;
  };

  // Get the exercise index after the superset ends
  const getExerciseAfterSuperset = () => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    const supersetIndices = getSupersetExercises(currentExerciseIndex);
    const lastInSuperset = supersetIndices[supersetIndices.length - 1];
    if (lastInSuperset < day?.exercises?.length - 1) {
      return lastInSuperset + 1;
    }
    return null;
  };

  // Get the minimum sets count across all exercises in current superset
  const getSupersetSetsCount = () => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    const supersetIndices = getSupersetExercises(currentExerciseIndex);
    let minSets = Infinity;
    supersetIndices.forEach(idx => {
      const ex = day?.exercises?.[idx];
      const sets = ex?.sets || 3;
      if (sets < minSets) minSets = sets;
    });
    return minSets === Infinity ? 3 : minSets;
  };

  // Calculate calories burned during the workout using personalized data
  // Enhanced formula incorporating user weight, height, age, and sex
  const calculateCalories = (startTime) => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    if (!day?.exercises || !startTime) return 0;

    // Use ref to get the latest modifications
    const currentModifiedExercises = modifiedExercisesRef.current;

    // Get user data with fallbacks
    const isImperial = settings.measurementSystem === 'imperial';
    let userWeight = parseFloat(settings.userWeight) || (isImperial ? 165 : 75);
    let userHeight = parseFloat(settings.userHeight) || (isImperial ? 70 : 170);
    const userAge = parseInt(settings.userAge) || 30; // Default 30 years
    const userSex = settings.userSex || 'male'; // Default male

    // Convert to metric for BMR calculation if using imperial
    if (isImperial) {
      userWeight = lbToKg(userWeight);  // Convert lbs to kg
      userHeight = inchesToCm(userHeight);  // Convert inches to cm
    }

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
    const completed = completedExerciseIndicesRef.current;

    // Calculate calories for each exercise
    day.exercises.forEach((ex, exIndex) => {
      if (!completed.has(exIndex)) return; // Skip exercises user didn't perform
      const exerciseData = getExerciseData(ex.exerciseId);
      if (!exerciseData) return;

      const bmc = exerciseData.bmc || 1.0;
      const wf = exerciseData.wf || 0.0;
      const sets = ex.sets || 3;
      const isTimeBased = exerciseData.timeBased || false;
      // Dumbbell exercises: weight entered is per hand, so total = 2x unless singleWeight
      const isDumbbell = exerciseData.weightType === 'dumbbell';
      const weightMultiplier = (isDumbbell && !exerciseData.singleWeight) ? 2 : 1;
      const bwFraction = exerciseData.bwFraction ?? 0;

      // Get reps and weights (modified or original)
      const mods = currentModifiedExercises[exIndex];
      const defaultRep = isTimeBased ? 1 : 10;
      const repsArray = mods?.reps || ex.reps || Array(sets).fill(defaultRep);
      const weightsArray = mods?.weights || ex.weights || Array(sets).fill(0);

      // Calculate calories for each set
      for (let setIdx = 0; setIdx < sets; setIdx++) {
        const rawReps = repsArray[setIdx];
        const reps = typeof rawReps === 'number' ? rawReps : defaultRep;
        // Time-based: use minutes directly; rep-based: use reps/10
        const repsScaling = isTimeBased ? reps : (reps / 10);
        const rawWeight = (weightsArray[setIdx] || 0) * weightMultiplier * (isImperial ? 0.453592 : 1);

        let setCalories;
        if (bwFraction > 0) {
          // Bodyweight or hybrid: scale by total effective weight relative to 75kg reference
          const totalWeight = userWeight * bwFraction + rawWeight;
          setCalories = (bmc * totalWeight / 75) * repsScaling;
        } else {
          // Pure loaded exercise: calories = (BMC + (WF × weight_kg)) × repsScaling × mass_factor
          setCalories = (bmc + (wf * rawWeight)) * repsScaling * massFactor;
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

    const exData = getExerciseData(currentEx.exerciseId);
    const baseFallback = exData?.timeBased ? 1 : 10;

    setModifiedExercises(prev => {
      const existing = prev[currentExerciseIndex] || {
        reps: [...(currentEx.reps || Array(currentEx.sets).fill(baseFallback))],
        weights: [...(currentEx.weights || Array(currentEx.sets).fill(0))]
      };

      // Get current value from the existing state (most up-to-date)
      const rawReps = existing.reps[currentSetIndex] !== undefined
        ? existing.reps[currentSetIndex]
        : (currentEx.reps?.[currentSetIndex] || baseFallback);
      // If 'E' (exhaustion), convert to base value first
      const currentReps = typeof rawReps === 'number' ? rawReps : baseFallback;
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

  // Set weight directly (from numeric input modal)
  const setWeightDirectly = (value) => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    const currentEx = day?.exercises?.[currentExerciseIndex];
    if (!currentEx) return;

    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0) return;
    const newWeight = Math.round(parsed * 100) / 100;

    setModifiedExercises(prev => {
      const existing = prev[currentExerciseIndex] || {
        reps: [...(currentEx.reps || Array(currentEx.sets).fill(10))],
        weights: [...(currentEx.weights || Array(currentEx.sets).fill(0))]
      };
      const newWeightsArray = [...existing.weights];
      newWeightsArray[currentSetIndex] = newWeight;
      return {
        ...prev,
        [currentExerciseIndex]: { ...existing, weights: newWeightsArray }
      };
    });
    setHasChanges(true);
  };

  // Play the appropriate sound based on the remaining seconds
  const playTimerSound = async () => {
    if (!soundEnabledRef.current) return;
    if (timerPlayedRef.current) return;
    timerPlayedRef.current = true;

    try {
      if (timerPlayer) {
        await timerPlayer.seekTo(0);
        timerPlayer.play();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  // Voice announcement refs
  const initialAnnouncedRef = useRef(false);
  const thumbnailSwitchRef = useRef(null);
  const voiceIdRef = useRef({ en: undefined, es: undefined, fr: undefined, 'pt-BR': undefined });

  // Resolve best male voice per language on mount
  useEffect(() => {
    const maleNames = [
      'daniel', 'james', 'tom', 'aaron', 'alex', 'fred', 'oliver', 'thomas',
      'george', 'arthur', 'david', 'male', 'jorge', 'diego', 'carlos', 'andrés',
      'juan', 'pablo', 'thomas', 'pierre', 'lucas', 'felipe', 'ricardo',
    ];
    Speech.getAvailableVoicesAsync().then(voices => {
      const localeMap = { en: 'en', es: 'es', fr: 'fr', 'pt-BR': 'pt' };
      for (const [key, prefix] of Object.entries(localeMap)) {
        const candidates = voices.filter(v => v.language?.startsWith(prefix));
        const male = candidates.find(v =>
          maleNames.some(n => v.name?.toLowerCase().includes(n))
        );
        if (male) voiceIdRef.current[key] = male.identifier;
      }
    }).catch(() => {});
  }, []);

  const buildAnnouncement = (info, isNext = true) => {
    const pick = (en, es, fr, pt) =>
      lang === 'es' ? es : lang === 'fr' ? fr : lang === 'pt-BR' ? pt : en;

    const prefix = isNext ? pick('Next', 'Siguiente', 'Suivant', 'Próximo') : '';
    const setWord = pick('Set', 'Serie', 'Série', 'Série');
    const ofWord = pick('of', 'de', 'de', 'de');

    // Only include exercise name for new exercises
    let nameText = '';
    if (!info.sameExercise) {
      let name = info.name;
      if (info.isSuperset && info.supersetExercises) {
        const names = info.supersetExercises.map(e => e.name);
        const label = pick('Superset', 'Superserie', 'Supersérie', 'Superset');
        name = `${label}: ${names.join(', ')}`;
      }
      nameText = name + '. ';
    }

    const totalText = info.totalSets ? ` ${ofWord} ${info.totalSets}` : '';

    let repsText;
    if (info.reps === 'E') {
      repsText = pick('to exhaustion', 'al fallo', 'jusqu\'à l\'échec', 'até a falha');
    } else {
      const exData = getExerciseData(info.exerciseId);
      const unit = exData?.timeBased
        ? pick('minutes', 'minutos', 'minutes', 'minutos')
        : pick('reps', 'repeticiones', 'répétitions', 'repetições');
      repsText = `${info.reps} ${unit}`;
    }

    let weightText = '';
    if (info.weight > 0) {
      if (info.sameExercise && !info.weightChanged) {
        weightText = ', ' + pick('same weight', 'mismo peso', 'même poids', 'mesmo peso');
      } else {
        const unitName = isImperial
          ? pick('pounds', 'libras', 'livres', 'libras')
          : pick('kilograms', 'kilos', 'kilos', 'quilogramas');
        weightText = `, ${formatWeight(info.weight)} ${unitName}`;
      }
    }

    const separator = prefix ? (nameText ? ': ' : ', ') : '';
    return `${prefix}${separator}${nameText}${setWord} ${info.set}${totalText}, ${repsText}${weightText}`;
  };

  const getSpeechOpts = () => {
    const localeMap = { es: 'es-ES', fr: 'fr-FR', 'pt-BR': 'pt-BR' };
    const locale = localeMap[lang] || 'en-US';
    const voice = voiceIdRef.current[lang];
    const opts = { language: locale, volume: soundVolumeRef.current };
    if (voice) opts.voice = voice;
    return opts;
  };

  const speakWithFocus = (text, opts) => {
    silentPlayer.seekTo(0);
    silentPlayer.play();
    Speech.speak(text, opts);
  };

  const speakExerciseAt = (exerciseIndex, setIndex, isNext = false) => {
    if (!voiceEnabledRef.current) return;
    const day = routine?.days?.[paramsRef.current.dayIndex];
    const ex = day?.exercises?.[exerciseIndex];
    if (!ex) return;
    const exData = getExerciseData(ex.exerciseId);
    const text = buildAnnouncement({
      name: exData ? getExerciseName(exData, lang) : 'Exercise',
      set: setIndex + 1,
      totalSets: ex.sets || 3,
      reps: modifiedExercises[exerciseIndex]?.reps[setIndex] || ex.reps?.[setIndex] || 10,
      weight: modifiedExercises[exerciseIndex]?.weights[setIndex] || ex.weights?.[setIndex] || 0,
      exerciseId: ex.exerciseId,
      isSuperset: false,
      sameExercise: false,
      weightChanged: false,
    }, isNext);
    speakWithFocus(text, getSpeechOpts());
  };

  // Voice: announce when rest starts (state is settled in useEffect)
  useEffect(() => {
    if (!isResting || !voiceEnabledRef.current) return;
    const info = getNextInfo();
    // Store for 13-second countdown announcement (avoids stale closure in setInterval)
    nextInfoRef.current = info;
    if (info) {
      // Exercise rest means we switched exercises — always announce the name
      if (isExerciseRest) info.sameExercise = false;
      const text = buildAnnouncement(info, true);
      // Play 6-second silent simultaneously with speech to hold audio focus.
      // Stop the silent as soon as speech finishes so music can resume promptly.
      silent6Player.seekTo(0);
      silent6Player.play();
      Speech.speak(text, {
        ...getSpeechOpts(),
        onDone: () => setTimeout(() => silent6Player.pause(), 300),
      });
    }
  }, [isResting]);

  // Voice: announce first exercise when workout starts
  useEffect(() => {
    if (!workoutStarted || initialAnnouncedRef.current || workoutComplete) return;
    initialAnnouncedRef.current = true;
    speakExerciseAt(0, 0, false);
  }, [workoutStarted]);

  // Voice: announce after thumbnail switch (ref set in handleThumbnailPress)
  useEffect(() => {
    if (thumbnailSwitchRef.current === null || isResting) return;
    const idx = thumbnailSwitchRef.current;
    thumbnailSwitchRef.current = null;
    Speech.stop();
    speakExerciseAt(idx, 0, false);
  }, [currentExerciseIndex]);

  // Voice: announce workout completion with duration, calories, and motivational message
  useEffect(() => {
    if (!workoutComplete || !voiceEnabledRef.current) return;
    const motivational = {
      en: ['Great job!', 'Well done!', 'Keep it up!', 'Nicely done!', 'You crushed it!', 'Strong work!', 'Excellent job!', 'Impressive!'],
      es: ['¡Buen trabajo!', '¡Bien hecho!', '¡Sigue así!', '¡Muy bien!', '¡Lo lograste!', '¡Gran esfuerzo!', '¡Excelente trabajo!', '¡Impresionante!'],
      fr: ['Bravo !', 'Bien joué !', 'Continue comme ça !', 'Bien fait !', 'Tu l\'as écrasé !', 'Beau travail !', 'Excellent boulot !', 'Impressionnant !'],
      'pt-BR': ['Ótimo trabalho!', 'Muito bem!', 'Continue assim!', 'Bem feito!', 'Você arrasou!', 'Força total!', 'Excelente trabalho!', 'Impressionante!'],
    };
    const msgs = motivational[lang] || motivational.en;
    const motto = msgs[Math.floor(Math.random() * msgs.length)];
    const mins = Math.floor(workoutDuration / 60);
    const pick = (en, es, fr, pt) => lang === 'es' ? es : lang === 'fr' ? fr : lang === 'pt-BR' ? pt : en;
    const calWord = pick('calories', 'calorías', 'calories', 'calorias');
    const minWord = pick('minutes', 'minutos', 'minutes', 'minutos');
    const complete = pick('Workout complete', 'Entrenamiento completado', 'Entraînement terminé', 'Treino concluído');
    const text = `${complete}. ${mins} ${minWord}, ${caloriesBurned} ${calWord}. ${motto}`;
    Speech.stop();
    speakWithFocus(text, getSpeechOpts());
  }, [workoutComplete]);

  const startRest = (isExRest = false, isSupersetRound = false) => {
    const baseRest = isExRest
      ? (routine?.restBetweenExercises || 90)
      : (routine?.restBetweenSets || 60);
    const restTime = isSupersetRound ? Math.round(baseRest * 1.5) : baseRest;

    setIsResting(true);
    setIsExerciseRest(isExRest);
    setRestTimeLeft(restTime);

    // Reset timer sound / rep announcement tracking for new rest period
    timerPlayedRef.current = false;
    repAnnouncedRef.current = false;

    // Store the end time for background-aware countdown
    restEndTimeRef.current = Date.now() + (restTime * 1000);

    timerRef.current = setInterval(() => {
      // Calculate remaining time based on actual end time (works even after background)
      const remaining = Math.ceil((restEndTimeRef.current - Date.now()) / 1000);

      // Voice: announce upcoming reps + encouragement at 13 seconds remaining
      if (remaining === 13 && !repAnnouncedRef.current && voiceEnabledRef.current) {
        repAnnouncedRef.current = true;
        const info = nextInfoRef.current;
        if (info) {
          const encouragements = {
            en: ['Come on!', 'You got this!', "Let's go!", 'Push it!', 'Stay strong!', 'Keep going!', "Let's do it!", 'Give it your all!'],
            es: ['¡Vamos!', '¡Tú puedes!', '¡Dale!', '¡Con todo!', '¡Fuerza!', '¡Sigue así!', '¡A por ello!', '¡No pares!'],
            fr: ['Allez !', 'Tu peux le faire !', 'C\'est parti !', 'Force !', 'Reste fort !', 'Continue !', 'On y va !', 'Donne tout !'],
            'pt-BR': ['Vamos!', 'Você consegue!', 'Bora!', 'Força!', 'Não para!', 'Continua!', 'Vai com tudo!', 'Dá o máximo!'],
          };
          const msgs = encouragements[lang] || encouragements.en;
          const motto = msgs[Math.floor(Math.random() * msgs.length)];
          const pickE = (en, es, fr, pt) => lang === 'es' ? es : lang === 'fr' ? fr : lang === 'pt-BR' ? pt : en;
          let repsText;
          if (info.reps === 'E') {
            repsText = pickE('To exhaustion', 'Al fallo', 'Jusqu\'à l\'échec', 'Até a falha');
          } else {
            const exData = getExerciseData(info.exerciseId);
            const unit = exData?.timeBased
              ? pickE('minutes', 'minutos', 'minutes', 'minutos')
              : pickE('reps', 'repeticiones', 'répétitions', 'repetições');
            repsText = `${info.reps} ${unit}`;
          }
          Speech.stop();
          speakWithFocus(`${repsText}. ${motto}`, getSpeechOpts());
        }
      }

      // Play timer sound at 10 seconds remaining
      if (remaining === 10) {
        playTimerSound();
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
    timerPlayedRef.current = false;
    repAnnouncedRef.current = false;
    // Stop timer sound and speech if playing
    if (timerPlayer) { try { timerPlayer.pause(); } catch(e) {} }
    Speech.stop();
    setIsResting(false);
    setIsExerciseRest(false);
  };

  const startExerciseTimer = () => {
    const minutes = getCurrentReps();
    const totalSeconds = (typeof minutes === 'number' ? minutes : 1) * 60;

    timerPlayedRef.current = false;
    exerciseTimerEndRef.current = Date.now() + (totalSeconds * 1000);
    setExerciseTimerLeft(totalSeconds);
    setIsExerciseTimerActive(true);

    exerciseTimerRef.current = setInterval(() => {
      const remaining = Math.ceil((exerciseTimerEndRef.current - Date.now()) / 1000);

      if (remaining === 10) {
        playTimerSound();
      }

      if (remaining <= 0) {
        clearInterval(exerciseTimerRef.current);
        exerciseTimerRef.current = null;
        exerciseTimerEndRef.current = null;
        Vibration.vibrate(500);
        setIsExerciseTimerActive(false);
        setExerciseTimerLeft(0);
        completeSet();
        return;
      }
      setExerciseTimerLeft(remaining);
    }, 1000);
  };

  const stopExerciseTimer = () => {
    if (exerciseTimerRef.current) {
      clearInterval(exerciseTimerRef.current);
      exerciseTimerRef.current = null;
    }
    exerciseTimerEndRef.current = null;
    timerPlayedRef.current = false;
    // Stop timer sound if playing
    if (timerPlayer) { try { timerPlayer.pause(); } catch(e) {} }
    setIsExerciseTimerActive(false);
    setExerciseTimerLeft(0);
    completeSet();
  };

  const completeSet = () => {
    // Track this exercise as completed for accurate calorie/volume calculation
    setCompletedExerciseIndices(prev => {
      const next = new Set(prev).add(currentExerciseIndex);
      completedExerciseIndicesRef.current = next;
      return next;
    });

    const day = routine?.days?.[paramsRef.current.dayIndex];
    const currentEx = day?.exercises?.[currentExerciseIndex];
    const supersetIndices = getSupersetExercises(currentExerciseIndex);
    const inSuperset = supersetIndices.length > 1;
    const supersetSets = inSuperset ? getSupersetSetsCount() : (currentEx?.sets || 3);

    if (inSuperset) {
      // SUPERSET FLOW
      const nextInSuperset = getNextInSuperset();

      if (nextInSuperset !== null) {
        // More exercises in superset for this round - move to next (NO REST)
        setCurrentExerciseIndex(nextInSuperset);
        // Keep same set index
      } else {
        // Completed all exercises in superset for this set
        if (currentSetIndex < supersetSets - 1) {
          // More sets to do - go back to first exercise in superset
          const firstInSuperset = getFirstInSuperset();
          setCurrentExerciseIndex(firstInSuperset);
          setCurrentSetIndex(prev => prev + 1);
          startRest(false, true); // Rest between superset rounds (1.5x)
        } else {
          // Superset complete - move to next exercise/superset or finish
          const nextAfterSuperset = getExerciseAfterSuperset();
          if (nextAfterSuperset !== null) {
            setCurrentExerciseIndex(nextAfterSuperset);
            setCurrentSetIndex(0);
            startRest(true); // Rest between exercises/supersets
          } else {
            finishWorkout();
          }
        }
      }
    } else {
      // NORMAL FLOW (no superset)
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
    }
  };

  const finishWorkout = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (exerciseTimerRef.current) {
      clearInterval(exerciseTimerRef.current);
      exerciseTimerRef.current = null;
    }
    exerciseTimerEndRef.current = null;

    if (hasChanges) {
      await saveModifiedExercises();
    }

    // Calculate calories burned
    const calories = calculateCalories(workoutStartTime);
    setCaloriesBurned(calories);

    // Calculate workout duration in seconds
    const durationSeconds = workoutStartTime
      ? Math.round((new Date() - workoutStartTime) / 1000)
      : 0;
    setWorkoutDuration(durationSeconds);

    const currentDay = routine?.days?.[paramsRef.current.dayIndex];
    const dayDisplayName = currentDay?.customName || currentDay?.name;

    // Compute per-muscle-group volume for workload tracking
    const muscleVolume = {};
    if (currentDay?.exercises) {
      const currentMods = modifiedExercisesRef.current;
      const isImperial = settings.measurementSystem === 'imperial';
      let userWeight = parseFloat(settings.userWeight) || (isImperial ? 165 : 75);
      if (isImperial) userWeight = lbToKg(userWeight);

      const completed = completedExerciseIndicesRef.current;
      currentDay.exercises.forEach((ex, exIndex) => {
        if (!completed.has(exIndex)) return; // Skip exercises user didn't perform
        const exData = exercises.find(e => e.id === ex.exerciseId);
        if (!exData?.muscles) return;

        const sets = ex.sets || 3;
        const isDumbbell = exData.weightType === 'dumbbell';
        const weightMultiplier = (isDumbbell && !exData.singleWeight) ? 2 : 1;

        const isTimeBased = exData.timeBased || false;
        const defaultRep = isTimeBased ? 1 : 10;
        const mods = currentMods[exIndex];
        const repsArray = mods?.reps || ex.reps || Array(sets).fill(defaultRep);
        const weightsArray = mods?.weights || ex.weights || Array(sets).fill(0);

        for (let s = 0; s < sets; s++) {
          const rawReps = repsArray[s];
          const reps = typeof rawReps === 'number' ? rawReps : defaultRep;
          const effectiveReps = isTimeBased ? reps * 10 : reps;
          const rawWeight = (weightsArray[s] || 0) * weightMultiplier * (isImperial ? 0.453592 : 1);
          const bwFraction = exData.bwFraction ?? 0;
          const weight = userWeight * bwFraction + rawWeight;
          const setVolume = effectiveReps * weight;

          for (const [muscle, pct] of Object.entries(exData.muscles)) {
            muscleVolume[muscle] = (muscleVolume[muscle] || 0) + Math.round(setVolume * pct);
          }
        }
      });
    }

    await saveLastWorkout({
      routineId: paramsRef.current.routineId,
      dayIndex: paramsRef.current.dayIndex,
      routineName: routine?.name,
      dayName: dayDisplayName,
      caloriesBurned: calories,
      duration: durationSeconds,
    });

    await addToHistory({
      routineId: paramsRef.current.routineId,
      dayIndex: paramsRef.current.dayIndex,
      routineName: routine?.name,
      dayName: dayDisplayName,
      exerciseCount: completedExerciseIndicesRef.current.size || 0,
      caloriesBurned: calories,
      duration: durationSeconds,
      muscleVolume,
    });

    // Request store review after 3rd and every 10th completed workout
    try {
      const history = await getHistory();
      const count = history.length;
      if (count === 3 || (count > 3 && count % 10 === 0)) {
        const isAvailable = await StoreReview.isAvailableAsync();
        if (isAvailable) {
          await StoreReview.requestReview();
        }
      }
    } catch (_) {}

    setWorkoutComplete(true);
  };

  const handleFinishAndGoHome = () => {
    resetWorkoutState();
    allowNavigation.current = true;
    navigation.navigate(IS_PRO ? 'Stats' : 'Home', IS_PRO ? { tab: 'workload' } : undefined);
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
    const supersetIndices = getSupersetExercises(currentExerciseIndex);
    const inSuperset = supersetIndices.length > 1;

    if (inSuperset) {
      // SUPERSET: Show info about first exercise in superset for the upcoming set
      const firstIdx = supersetIndices[0];
      const firstEx = day?.exercises?.[firstIdx];
      const exerciseData = getExerciseData(firstEx?.exerciseId);
      const nextReps = modifiedExercises[firstIdx]?.reps[currentSetIndex]
        || firstEx?.reps?.[currentSetIndex] || 10;
      const nextWeight = modifiedExercises[firstIdx]?.weights[currentSetIndex]
        || firstEx?.weights?.[currentSetIndex] || 0;

      // Get names of all exercises in superset
      const supersetNames = supersetIndices.map(idx => {
        const ex = day?.exercises?.[idx];
        const data = getExerciseData(ex?.exerciseId);
        return data ? getExerciseName(data, lang) : 'Exercise';
      });

      // Weight and reps change comparison
      const prevWeight = currentSetIndex > 0
        ? (modifiedExercises[firstIdx]?.weights[currentSetIndex - 1]
           || firstEx?.weights?.[currentSetIndex - 1] || 0)
        : null;
      const weightChanged = prevWeight !== null && nextWeight !== prevWeight;
      const prevReps = currentSetIndex > 0
        ? (modifiedExercises[firstIdx]?.reps[currentSetIndex - 1]
           || firstEx?.reps?.[currentSetIndex - 1] || 10)
        : null;
      const repsChanged = prevReps !== null && nextReps !== prevReps;

      return {
        exerciseId: firstEx?.exerciseId,
        name: supersetNames[0],
        set: currentSetIndex + 1,
        totalSets: firstEx?.sets || 3,
        reps: nextReps,
        weight: nextWeight,
        weightChanged,
        repsChanged,
        sameExercise: true,
        isSuperset: true,
        supersetExercises: supersetIndices.map(idx => ({
          exerciseId: day?.exercises?.[idx]?.exerciseId,
          name: supersetNames[supersetIndices.indexOf(idx)],
        })),
      };
    }

    // Normal flow (not in superset)
    if (currentSetIndex < (currentEx?.sets || 3)) {
      const exerciseData = getExerciseData(currentEx?.exerciseId);
      const nextReps = modifiedExercises[currentExerciseIndex]?.reps[currentSetIndex]
        || currentEx?.reps?.[currentSetIndex] || 10;
      const nextWeight = modifiedExercises[currentExerciseIndex]?.weights[currentSetIndex]
        || currentEx?.weights?.[currentSetIndex] || 0;

      const prevWeight = currentSetIndex > 0
        ? (modifiedExercises[currentExerciseIndex]?.weights[currentSetIndex - 1]
           || currentEx?.weights?.[currentSetIndex - 1] || 0)
        : null;
      const weightChanged = prevWeight !== null && nextWeight !== prevWeight;
      const prevReps = currentSetIndex > 0
        ? (modifiedExercises[currentExerciseIndex]?.reps[currentSetIndex - 1]
           || currentEx?.reps?.[currentSetIndex - 1] || 10)
        : null;
      const repsChanged = prevReps !== null && nextReps !== prevReps;

      return {
        exerciseId: currentEx?.exerciseId,
        name: exerciseData ? getExerciseName(exerciseData, lang) : 'Next Set',
        set: currentSetIndex + 1,
        totalSets: currentEx?.sets || 3,
        reps: nextReps,
        weight: nextWeight,
        weightChanged,
        repsChanged,
        sameExercise: true,
        isSuperset: false,
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
        totalSets: nextEx.sets || 3,
        reps: nextReps,
        weight: nextWeight,
        weightChanged: false,
        repsChanged: false,
        sameExercise: false,
        isSuperset: false,
      };
    }

    return null;
  };

  // Handle thumbnail tap with confirmation
  const handleThumbnailPress = (index) => {
    if (index === currentExerciseIndex) return;

    const day = routine?.days?.[paramsRef.current.dayIndex];
    const targetEx = day?.exercises?.[index];
    const exerciseData = targetEx ? getExerciseData(targetEx.exerciseId) : null;
    const exerciseName = exerciseData ? getExerciseName(exerciseData, lang) : 'this exercise';

    Alert.alert(
      t('switchExercise', lang) || 'Switch Exercise?',
      (t('switchExerciseConfirm', lang) || 'Do you want to switch to {exercise}?').replace('{exercise}', exerciseName),
      [
        { text: t('cancel', lang) || 'Cancel', style: 'cancel' },
        {
          text: t('switch', lang) || 'Switch',
          onPress: () => {
            // Stop any active rest timer
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            restEndTimeRef.current = null;
            timerPlayedRef.current = false;
            if (timerPlayer) { try { timerPlayer.pause(); } catch(e) {} }
            Speech.stop();

            // Stop any active exercise timer
            if (exerciseTimerRef.current) {
              clearInterval(exerciseTimerRef.current);
              exerciseTimerRef.current = null;
            }
            exerciseTimerEndRef.current = null;
            setIsExerciseTimerActive(false);
            setExerciseTimerLeft(0);

            // Switch to the selected exercise at set 1
            thumbnailSwitchRef.current = index;
            setIsResting(false);
            setIsExerciseRest(false);
            setCurrentExerciseIndex(index);
            setCurrentSetIndex(0);
          },
        },
      ]
    );
  };

  // Render thumbnail strip
  const renderThumbnailStrip = () => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    if (!day?.exercises) return null;

    return (
      <View style={[styles.thumbnailContainer, isLandscape && styles.thumbnailContainerLandscape]}>
        <ScrollView
          ref={thumbnailScrollRef}
          horizontal={!isLandscape}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.thumbnailScroll, isLandscape && styles.thumbnailScrollLandscape]}
        >
          {day.exercises.map((ex, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnailWrapper,
                index === currentExerciseIndex && styles.thumbnailWrapperActive,
              ]}
              onPress={() => handleThumbnailPress(index)}
            >
              <ExerciseImage
                exerciseId={ex.exerciseId}
                size={50}
                animate={false}
                backgroundColor={colors.card}
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

            {/* Duration and calories display */}
            <View style={styles.completionStatsRow}>
              <View style={styles.completionStat}>
                <Text style={styles.caloriesValue}>{Math.floor(workoutDuration / 60)}</Text>
                <Text style={styles.caloriesLabel}>{t('minutes', lang) || 'minutes'}</Text>
              </View>
              <View style={styles.completionStat}>
                <Text style={styles.caloriesValue}>{caloriesBurned}</Text>
                <Text style={styles.caloriesLabel}>{t('calories', lang) || 'calories'}</Text>
              </View>
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
    <View style={[styles.restScreen, { paddingTop: insets.top }, isLandscape && styles.restScreenLandscape]}>
      {/* Thumbnail strip */}
      {renderThumbnailStrip()}

      <View style={[styles.restContent, isLandscape && styles.restContentLandscape]}>
        {/* In landscape: next preview on the LEFT */}
        {isLandscape && nextInfo && (
          <View style={styles.nextPreviewLandscape}>
            <Text style={styles.nextLabel}>
              {nextInfo.isSuperset ? `${t('superset', lang).toUpperCase()} - ${t('upNext', lang)}` : t('upNext', lang)}
            </Text>
            {nextInfo.isSuperset && nextInfo.supersetExercises ? (
              <View style={styles.supersetPreview}>
                {nextInfo.supersetExercises.map((ex, idx) => (
                  <View key={idx} style={styles.supersetExerciseRow}>
                    <View style={{ width: 105, height: 105, borderRadius: 19, overflow: 'hidden', backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
                      <ExerciseImage exerciseId={ex.exerciseId} size={90} animate={true} animationDuration={1500} backgroundColor={colors.card} />
                    </View>
                    <Text style={styles.supersetExerciseName}>{ex.name}</Text>
                  </View>
                ))}
                <Text style={styles.nextDetails}>{t('set', lang)} {nextInfo.set} {t('of', lang)} {nextInfo.totalSets}</Text>
                <Text style={styles.nextWeight}>
                  {nextInfo.reps === 'E'
                    ? <Text style={nextInfo.repsChanged && styles.nextWeightChanged}>{t('toExhaustion', lang)}</Text>
                    : <><Text style={nextInfo.repsChanged && styles.nextWeightChanged}>{nextInfo.reps}</Text>{` ${getExerciseData(nextInfo.exerciseId)?.timeBased ? t('min', lang) : t('reps', lang).toLowerCase()}`}</>
                  }
                </Text>
              </View>
            ) : (
              <>
                <View style={[styles.nextImageContainer, { width: 159, height: 159, borderRadius: 29, overflow: 'hidden', backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
                  <ExerciseImage exerciseId={nextInfo.exerciseId} size={144} animate={true} animationDuration={1500} backgroundColor={colors.card} />
                </View>
                <Text style={styles.nextExercise}>{nextInfo.name}</Text>
                <Text style={styles.nextDetails}>{t('set', lang)} {nextInfo.set} {t('of', lang)} {nextInfo.totalSets}</Text>
                <Text style={styles.nextWeight}>
                  {nextInfo.reps === 'E'
                    ? <Text style={nextInfo.repsChanged && styles.nextWeightChanged}>{t('toExhaustion', lang)}</Text>
                    : <><Text style={nextInfo.repsChanged && styles.nextWeightChanged}>{nextInfo.reps}</Text>{` ${getExerciseData(nextInfo.exerciseId)?.timeBased ? t('min', lang) : t('reps', lang).toLowerCase()}`}</>
                  }
                  {nextInfo.weight > 0 && <>{' • '}<Text style={nextInfo.weightChanged && styles.nextWeightChanged}>{formatWeight(nextInfo.weight)}</Text>{` ${weightUnit}`}</>}
                </Text>
              </>
            )}
          </View>
        )}

        {/* Timer + skip (always visible, RIGHT side in landscape) */}
        <View style={[styles.restTimerSide, isLandscape && styles.restTimerSideLandscape]}>
          <Text style={styles.restLabel}>
            {t('restLabel', lang)}
          </Text>
          <Text style={[styles.restTimer, isLandscape && styles.restTimerLandscape]}>{restTimeLeft}</Text>
          <Text style={styles.restSeconds}>{t('seconds', lang)}</Text>
          <TouchableOpacity style={styles.skipRestButton} onPress={skipRest}>
            <Text style={styles.skipRestButtonText}>{t('skipRest', lang)}</Text>
          </TouchableOpacity>
        </View>

        {/* In portrait: next preview BELOW timer */}
        {!isLandscape && nextInfo && (
          <View style={styles.nextPreview}>
            <Text style={styles.nextLabel}>
              {nextInfo.isSuperset ? `${t('superset', lang).toUpperCase()} - ${t('upNext', lang)}` : t('upNext', lang)}
            </Text>
            {nextInfo.isSuperset && nextInfo.supersetExercises ? (
              <View style={styles.supersetPreview}>
                {nextInfo.supersetExercises.map((ex, idx) => (
                  <View key={idx} style={styles.supersetExerciseRow}>
                    <View style={{ width: 81, height: 81, borderRadius: 15, overflow: 'hidden', backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
                      <ExerciseImage exerciseId={ex.exerciseId} size={66} animate={true} animationDuration={1500} backgroundColor={colors.card} />
                    </View>
                    <Text style={styles.supersetExerciseName}>{ex.name}</Text>
                  </View>
                ))}
                <Text style={styles.nextDetails}>{t('set', lang)} {nextInfo.set} {t('of', lang)} {nextInfo.totalSets}</Text>
                <Text style={styles.nextWeight}>
                  {nextInfo.reps === 'E'
                    ? <Text style={nextInfo.repsChanged && styles.nextWeightChanged}>{t('toExhaustion', lang)}</Text>
                    : <><Text style={nextInfo.repsChanged && styles.nextWeightChanged}>{nextInfo.reps}</Text>{` ${getExerciseData(nextInfo.exerciseId)?.timeBased ? t('min', lang) : t('reps', lang).toLowerCase()}`}</>
                  }
                </Text>
              </View>
            ) : (
              <>
                <View style={[styles.nextImageContainer, { width: 121, height: 121, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
                  <ExerciseImage exerciseId={nextInfo.exerciseId} size={106} animate={true} animationDuration={1500} backgroundColor={colors.card} />
                </View>
                <Text style={styles.nextExercise}>{nextInfo.name}</Text>
                <Text style={styles.nextDetails}>{t('set', lang)} {nextInfo.set} {t('of', lang)} {nextInfo.totalSets}</Text>
                <Text style={styles.nextWeight}>
                  {nextInfo.reps === 'E'
                    ? <Text style={nextInfo.repsChanged && styles.nextWeightChanged}>{t('toExhaustion', lang)}</Text>
                    : <><Text style={nextInfo.repsChanged && styles.nextWeightChanged}>{nextInfo.reps}</Text>{` ${getExerciseData(nextInfo.exerciseId)?.timeBased ? t('min', lang) : t('reps', lang).toLowerCase()}`}</>
                  }
                  {nextInfo.weight > 0 && <>{' • '}<Text style={nextInfo.weightChanged && styles.nextWeightChanged}>{formatWeight(nextInfo.weight)}</Text>{` ${weightUnit}`}</>}
                </Text>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  ) : (
    /* Exercise mode */
    <View style={[styles.exerciseScreen, { paddingTop: insets.top }, isLandscape && styles.exerciseScreenLandscape]}>
      {/* Thumbnail strip */}
      {renderThumbnailStrip()}

      {/* Main content */}
      <View style={[styles.exerciseContent, isLandscape && styles.exerciseContentLandscape]}>
        {/* Left side in landscape: image */}
        {isLandscape && (
          <View style={styles.landscapeImageSide}>
            <ExerciseImage
              exerciseId={currentEx?.exerciseId}
              size={Math.min(height * 0.8, (width - 66) * 0.45)}
              animate={true}
              animationDuration={2000}
              backgroundColor={colors.card}
            />
          </View>
        )}

        {/* Right side in landscape / full content in portrait */}
        <View style={[styles.exerciseControlsSide, isLandscape && styles.exerciseControlsSideLandscape]}>
          {/* Exercise name */}
          <Text style={[styles.exerciseName, isLandscape && styles.exerciseNameLandscape]}>
            {exerciseData ? getExerciseName(exerciseData, lang) : 'Exercise'}
          </Text>

          {/* Exercise description - hide in landscape to save space */}
          {!isLandscape && exerciseData && (
            <Text style={styles.exerciseDescription}>
              {getExerciseDescription(exerciseData, lang)}
            </Text>
          )}

          {/* Set indicator */}
          <Text style={styles.setIndicator}>
            {t('set', lang).toUpperCase()} {currentSetIndex + 1} / {currentEx?.sets || 3}
          </Text>

          {/* Superset indicator */}
          {isInSuperset() && (
            <View style={styles.supersetIndicator}>
              <Text style={styles.supersetIndicatorText}>
                ⛓ {t('superset', lang)} {getSupersetExercises(currentExerciseIndex).indexOf(currentExerciseIndex) + 1}/{getSupersetExercises(currentExerciseIndex).length}
              </Text>
            </View>
          )}

          {/* Exercise Image - portrait only (landscape shows it on the left) */}
          {!isLandscape && (
            <View style={styles.imageContainer}>
              <ExerciseImage
                exerciseId={currentEx?.exerciseId}
                size={220}
                animate={true}
                animationDuration={2000}
                backgroundColor={colors.card}
              />
            </View>
          )}

          {/* Done / Start button */}
          <TouchableOpacity
            style={[styles.doneButton, isLandscape && { marginVertical: spacing.sm }]}
            onPress={exerciseData?.timeBased && currentReps !== 'E' ? startExerciseTimer : completeSet}
          >
            <Text style={styles.doneButtonText}>
              {exerciseData?.timeBased && currentReps !== 'E'
                ? (t('start', lang) || 'START').toUpperCase()
                : (t('done', lang) || 'DONE')}
            </Text>
          </TouchableOpacity>

        {/* Reps control */}
        <View style={styles.controlsRow}>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>{exerciseData?.timeBased ? t('min', lang) : t('reps', lang)}</Text>
            {currentReps === 'E' ? (
              <Text style={styles.controlValue}>{t('toExhaustion', lang)}</Text>
            ) : (
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
            )}
          </View>
        </View>

        {/* Weight control */}
        <View style={styles.controlsRow}>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>{isImperial ? t('weightLbs', lang) : t('weight', lang)}</Text>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => updateWeight(-getWeightIncrement(settings.measurementSystem))}
              >
                <Text style={styles.controlButtonText}>-{getWeightIncrement(settings.measurementSystem)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => updateWeight(-getSmallWeightIncrement(settings.measurementSystem))}
              >
                <Text style={styles.controlButtonTextS}>−{getSmallWeightIncrement(settings.measurementSystem)}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {
                setWeightInputValue(formatWeight(currentWeight));
                setWeightInputVisible(true);
              }}>
                <Text style={styles.controlValue}>{formatWeight(currentWeight)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => updateWeight(getSmallWeightIncrement(settings.measurementSystem))}
              >
                <Text style={styles.controlButtonTextS}>+{getSmallWeightIncrement(settings.measurementSystem)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => updateWeight(getWeightIncrement(settings.measurementSystem))}
              >
                <Text style={styles.controlButtonText}>+{getWeightIncrement(settings.measurementSystem)}</Text>
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

        {/* Exercise Countdown Timer Modal */}
        <Modal
          visible={isExerciseTimerActive}
          animationType="fade"
          transparent
          statusBarTranslucent
          onRequestClose={stopExerciseTimer}
        >
          <View style={styles.timerModalOverlay}>
            <View style={styles.timerModalContent}>
              <Text style={styles.timerModalLabel}>
                {exerciseData ? getExerciseName(exerciseData, lang) : ''}
              </Text>
              <Text style={styles.timerModalCountdown}>
                {Math.floor(exerciseTimerLeft / 60)}:{(exerciseTimerLeft % 60).toString().padStart(2, '0')}
              </Text>
              <TouchableOpacity
                style={styles.timerModalStopButton}
                onPress={stopExerciseTimer}
              >
                <Text style={styles.timerModalStopButtonText}>
                  {(t('stop', lang) || 'STOP').toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Direct weight input modal */}
        <Modal
          visible={weightInputVisible}
          animationType="fade"
          transparent
          statusBarTranslucent
          onRequestClose={() => setWeightInputVisible(false)}
          onShow={() => setTimeout(() => weightInputRef.current?.focus(), 100)}
        >
          <TouchableOpacity
            style={styles.weightInputOverlay}
            activeOpacity={1}
            onPress={() => setWeightInputVisible(false)}
          >
            <View style={styles.weightInputBox}>
              <TextInput
                ref={weightInputRef}
                style={styles.weightInputField}
                value={weightInputValue}
                onChangeText={setWeightInputValue}
                keyboardType="decimal-pad"
                selectTextOnFocus
                onSubmitEditing={() => {
                  setWeightDirectly(weightInputValue);
                  setWeightInputVisible(false);
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
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
  completionStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  completionStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.lg,
  },
  caloriesValue: {
    fontFamily: fonts.bold,
    color: colors.accent,
    fontSize: 48,
  },
  caloriesLabel: {
    textAlign: 'center',
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
    backgroundColor: colors.card,
  },
  restScreenLandscape: {
    flexDirection: 'row',
  },
  restContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  restContentLandscape: {
    flexDirection: 'row',
    padding: spacing.lg,
  },
  restTimerSide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  restTimerSideLandscape: {
    flex: 1,
  },
  restTimerLandscape: {
    fontSize: 100,
  },
  nextPreviewLandscape: {
    width: '50%',
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restLabel: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: fontSize.lg,
    letterSpacing: 4,
  },
  restTimer: {
    fontFamily: fonts.regular,
    color: colors.textPrimary,
    fontSize: 170,
  },
  restSeconds: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: fontSize.lg,
  },
  nextPreview: {
    backgroundColor: colors.background,
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
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  nextDetails: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  nextWeight: {
    fontFamily: fonts.bold,
    color: colors.textSecondary,
    fontSize: fontSize.xl,
    marginTop: spacing.xs,
  },
  nextWeightChanged: {
    color: colors.accent,
  },
  supersetPreview: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  supersetExerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginVertical: spacing.xs,
    width: '100%',
  },
  supersetExerciseName: {
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    marginLeft: spacing.md,
    flex: 1,
  },
  supersetIndicator: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    marginTop: spacing.xs,
  },
  supersetIndicatorText: {
    fontFamily: fonts.bold,
    color: colors.accent,
    fontSize: fontSize.sm,
  },
  skipRestButton: {
    backgroundColor: colors.background === '#121212' ? colors.accent : colors.primary,
    paddingHorizontal: spacing.xl * 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    marginTop: spacing.xl,
  },
  skipRestButtonText: {
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: fontSize.lg,
    letterSpacing: 1,
  },
  
  // Exercise screen
  exerciseScreen: {
    flex: 1,
    backgroundColor: colors.card,
  },
  exerciseScreenLandscape: {
    flexDirection: 'row',
  },
  
  // Thumbnail strip
  thumbnailContainer: {
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    borderColor: colors.textPrimary,
  },
  thumbnailContainerLandscape: {
    borderBottomWidth: 0,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: 0,
    paddingHorizontal: spacing.xs,
    width: 66,
    flexShrink: 0,
  },
  thumbnailScrollLandscape: {
    paddingHorizontal: 0,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  
  // Exercise content
  exerciseContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  exerciseContentLandscape: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  landscapeImageSide: {
    width: '50%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseControlsSide: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  exerciseControlsSideLandscape: {
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  exerciseNameLandscape: {
    fontSize: fontSize.lg,
  },
  exerciseName: {
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  exerciseDescription: {
    fontFamily: fonts.narrow,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  setIndicator: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
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
    backgroundColor: colors.background === '#121212' ? colors.accent : colors.primary,
    paddingHorizontal: spacing.xl * 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    marginVertical: spacing.md,
  },
  doneButtonText: {
    fontFamily: fonts.bold,
    color: colors.white,
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
    color: colors.textSecondary,
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl,
  },
  controlButtonTextS: {
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: fontSize.xs,
  },
  controlValue: {
    fontFamily: fonts.bold,
    color: colors.textPrimary,
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

  // Exercise Timer Modal
  timerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerModalContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  timerModalLabel: {
    fontFamily: fonts.regular,
    color: '#AAAAAA',
    fontSize: fontSize.lg,
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },
  timerModalCountdown: {
    fontFamily: fonts.regular,
    color: '#FFFFFF',
    fontSize: 120,
    letterSpacing: 4,
  },
  timerModalStopButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl * 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    marginTop: spacing.xl * 2,
  },
  timerModalStopButtonText: {
    fontFamily: fonts.bold,
    color: '#000000',
    fontSize: fontSize.lg,
    letterSpacing: 1,
  },
  weightInputOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  weightInputBox: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    minWidth: 160,
    alignItems: 'center',
  },
  weightInputField: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    textAlign: 'center',
    minWidth: 120,
    borderBottomWidth: 2,
    borderBottomColor: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
});

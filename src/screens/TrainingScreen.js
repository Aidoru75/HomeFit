// Training Screen - Active workout with timer and exercise guidance
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  BackHandler,
} from 'react-native';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { exercises, getExerciseName, getExerciseDescription } from '../data/exercises';
import { loadRoutines, loadSettings, saveLastWorkout, addToHistory } from '../storage/storage';
import { t } from '../data/translations';
import ExerciseImage from '../components/ExerciseImage';

export default function TrainingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { routineId, dayIndex } = route.params || {};
  
  const [routine, setRoutine] = useState(null);
  const [settings, setSettings] = useState({ language: 'en', soundEnabled: true, soundVolume: 1.0 });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [isExerciseRest, setIsExerciseRest] = useState(false); // Track if resting between exercises
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false);
  
  const timerRef = useRef(null);
  const soundRef = useRef(null);

  const lang = settings.language || 'en';

  // Track if we should allow navigation (after user confirms exit)
  const allowNavigation = useRef(false);
  // Store params in ref to survive navigation
  const paramsRef = useRef({ routineId, dayIndex });

  useEffect(() => {
    // Update params ref when they change
    if (routineId && dayIndex !== undefined) {
      paramsRef.current = { routineId, dayIndex };
    }
  }, [routineId, dayIndex]);

  useEffect(() => {
    loadData();
    setupSound();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  // Handle Android back button
  useEffect(() => {
    if (!workoutStarted || workoutComplete) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      showExitConfirmation();
      return true; // Prevent default back behavior
    });

    return () => backHandler.remove();
  }, [workoutStarted, workoutComplete, lang]);

  // Handle tab bar navigation
  useEffect(() => {
    if (!workoutStarted || workoutComplete) return;

    const unsubscribe = navigation.addListener('blur', () => {
      if (allowNavigation.current) {
        allowNavigation.current = false;
        return;
      }
      
      // User tried to navigate away - bring them back and show confirmation
      const params = paramsRef.current;
      setTimeout(() => {
        if (workoutStarted && !workoutComplete && params.routineId) {
          navigation.navigate('Training', params);
          showExitConfirmation();
        }
      }, 50);
    });

    return unsubscribe;
  }, [navigation, workoutStarted, workoutComplete]);

  const showExitConfirmation = () => {
    Alert.alert(
      t('endWorkout', lang),
      t('endWorkoutConfirm', lang),
      [
        { text: t('continueButton', lang), style: 'cancel' },
        { 
          text: t('end', lang), 
          style: 'destructive', 
          onPress: () => {
            // Stop everything without saving
            if (timerRef.current) clearInterval(timerRef.current);
            stopSound();
            
            // Reset state (don't save to history)
            setWorkoutStarted(false);
            setCurrentExerciseIndex(0);
            setCurrentSetIndex(0);
            setIsResting(false);
            
            // Allow navigation and go to Home
            allowNavigation.current = true;
            navigation.navigate('Home');
          }
        },
      ]
    );
  };

  const loadData = async () => {
    const routines = await loadRoutines();
    const userSettings = await loadSettings();
    
    // Use params from ref if route params are missing
    const id = routineId || paramsRef.current.routineId;
    const found = routines.find(r => r.id === id);
    
    setSettings(userSettings);
    
    if (found) {
      setRoutine(found);
    } else if (id) {
      Alert.alert('Error', 'Routine not found');
      navigation.goBack();
    }
  };

  const setupSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/beep.mp3')
      );
      soundRef.current = sound;
    } catch (error) {
      console.log('Sound not loaded:', error);
    }
  };

  const playCountdownSound = async () => {
    if (!settings.soundEnabled) return;
    
    try {
      if (soundRef.current) {
        await soundRef.current.setVolumeAsync(settings.soundVolume);
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const stopSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
      }
    } catch (error) {
      console.log('Error stopping sound:', error);
    }
  };

  const startRest = (betweenExercises = false) => {
    setIsResting(true);
    setIsExerciseRest(betweenExercises);
    setSoundPlayed(false);
    
    // Use different rest time depending on whether it's between sets or exercises
    const restTime = betweenExercises 
      ? (routine.restBetweenExercises || 90)
      : (routine.restBetweenSets || 60);
    
    setRestTimeLeft(restTime);
    
    timerRef.current = setInterval(() => {
      setRestTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          Vibration.vibrate(500);
          setIsResting(false);
          setIsExerciseRest(false);
          return 0;
        }
        // Vibrate at 3, 2, 1
        if (prev <= 4 && prev > 1) {
          Vibration.vibrate(100);
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Effect to play sound when countdown reaches 8 seconds
  useEffect(() => {
    if (isResting && restTimeLeft === 8 && !soundPlayed) {
      playCountdownSound();
      setSoundPlayed(true);
    }
  }, [restTimeLeft, isResting, soundPlayed]);

  const skipRest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopSound();
    setIsResting(false);
    setIsExerciseRest(false);
    setRestTimeLeft(0);
  };

  const getCurrentDay = () => {
    if (!routine || !routine.days) return null;
    const idx = dayIndex !== undefined ? dayIndex : paramsRef.current.dayIndex;
    return routine.days[idx] || null;
  };

  const getCurrentExercise = () => {
    const day = getCurrentDay();
    if (!day || !day.exercises) return null;
    return day.exercises[currentExerciseIndex];
  };

  const getExerciseData = (exerciseId) => {
    return exercises.find(e => e.id === exerciseId);
  };

  const getNextInfo = () => {
    const day = getCurrentDay();
    if (!day || !day.exercises || !routine) return null;
    
    const currentEx = day.exercises[currentExerciseIndex];
    if (!currentEx) return null;
    
    // During rest, we want to show info about the set we're ABOUT to do
    // currentSetIndex has already been incremented when we entered rest
    // So currentSetIndex IS the next set we'll do
    
    const isLastExercise = currentExerciseIndex >= day.exercises.length - 1;
    const totalSets = currentEx.sets || 3;
    
    // If we just finished the last set of current exercise, show next exercise
    if (currentSetIndex >= totalSets) {
      if (isLastExercise) return null; // Workout will be complete
      
      const nextEx = day.exercises[currentExerciseIndex + 1];
      if (nextEx) {
        const data = getExerciseData(nextEx.exerciseId);
        return {
          exerciseId: nextEx.exerciseId,
          name: data ? getExerciseName(data, lang) : 'Next Exercise',
          set: 1,
          reps: nextEx.reps?.[0] || 10,
          weight: nextEx.weights?.[0] || 0,
          isNewExercise: true,
        };
      }
      return null;
    }
    
    // Show current set info (the one we're about to do after rest)
    return {
      exerciseId: currentEx.exerciseId,
      name: getExerciseName(getExerciseData(currentEx.exerciseId), lang),
      set: currentSetIndex + 1, // +1 for display (1-indexed)
      reps: currentEx.reps?.[currentSetIndex] || 10,
      weight: currentEx.weights?.[currentSetIndex] || 0,
      isNewExercise: false,
    };
  };

  const completeSet = () => {
    const day = getCurrentDay();
    const currentEx = getCurrentExercise();
    
    if (!day || !currentEx || !routine) return;
    
    const isLastSet = currentSetIndex >= currentEx.sets - 1;
    const isLastExercise = currentExerciseIndex >= day.exercises.length - 1;
    
    if (isLastSet && isLastExercise) {
      // Workout complete!
      finishWorkout();
    } else if (isLastSet) {
      // Move to next exercise - use exercise rest time
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      startRest(true); // true = between exercises
    } else {
      // Next set - use set rest time
      setCurrentSetIndex(currentSetIndex + 1);
      startRest(false); // false = between sets
    }
  };

  const finishWorkout = async () => {
    setWorkoutComplete(true);
    
    const day = getCurrentDay();
    if (!day || !routine) return;
    
    await saveLastWorkout({
      routineId: routine.id,
      routineName: routine.name,
      dayIndex,
      dayName: day.name,
    });
    
    await addToHistory({
      routineId: routine.id,
      routineName: routine.name,
      dayIndex,
      dayName: day.name,
      exercisesCompleted: day.exercises.length,
    });
  };

  const exitWorkout = () => {
    showExitConfirmation();
  };

  // Loading state
  if (!routine) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('loadingWorkout', lang)}</Text>
      </View>
    );
  }

  // Workout complete state
  if (workoutComplete) {
    return (
      <View style={[styles.completeContainer, { paddingBottom: insets.bottom }]}>
        <Text style={styles.completeIcon}>🎉</Text>
        <Text style={styles.completeTitle}>{t('workoutComplete', lang)}</Text>
        <Text style={styles.completeSubtitle}>
          {routine.name} - {getCurrentDay()?.name}
        </Text>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.completeButtonText}>{t('finish', lang)}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pre-workout state
  if (!workoutStarted) {
    const day = getCurrentDay();
    return (
      <View style={[styles.preWorkoutContainer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity 
          style={[styles.exitButton, { paddingTop: insets.top + 20 }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.exitButtonText}>← {t('back', lang)}</Text>
        </TouchableOpacity>
        
        <View style={styles.preWorkoutContent}>
          <Text style={styles.preWorkoutRoutine}>{routine.name}</Text>
          <Text style={styles.preWorkoutDay}>{day?.name}</Text>
          <Text style={styles.preWorkoutExercises}>
            {day?.exercises?.length || 0} {t('exercisesCount', lang)}
          </Text>
          
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setWorkoutStarted(true)}
          >
            <Text style={styles.startButtonText}>{t('startWorkoutButton', lang)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Active workout
  const day = getCurrentDay();
  const currentEx = getCurrentExercise();
  const exerciseData = currentEx ? getExerciseData(currentEx.exerciseId) : null;
  const nextInfo = getNextInfo();
  const totalExercises = day?.exercises?.length || 1;
  const progress = ((currentExerciseIndex * 3 + currentSetIndex) / (totalExercises * 3)) * 100;
  
  // Get current set's reps and weight
  const currentReps = currentEx?.reps?.[currentSetIndex] || 10;
  const currentWeight = currentEx?.weights?.[currentSetIndex] || 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={exitWorkout}>
          <Text style={styles.headerButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{day?.name}</Text>
        <Text style={styles.headerProgress}>
          {currentExerciseIndex + 1}/{day?.exercises?.length}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Main content */}
      {isResting ? (
        // Rest mode
        <View style={styles.restContainer}>
          <Text style={styles.restLabel}>
            {isExerciseRest ? t('restLabel', lang) : t('restLabel', lang)}
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
                {nextInfo.weight > 0 && ` • ${nextInfo.weight}kg`}
              </Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.skipButton} onPress={skipRest}>
            <Text style={styles.skipButtonText}>{t('skipRest', lang)}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Exercise mode
        <View style={styles.exerciseContainer}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseName}>
              {exerciseData ? getExerciseName(exerciseData, lang) : 'Exercise'}
            </Text>
            <Text style={styles.exerciseDescription}>
              {exerciseData ? getExerciseDescription(exerciseData, lang) : ''}
            </Text>
          </View>

          {/* Exercise Image */}
          <View style={styles.imageContainer}>
            <ExerciseImage 
              exerciseId={currentEx?.exerciseId} 
              size={150}
              animate={true}
            />
          </View>

          <View style={styles.setInfo}>
            <View style={styles.setCircle}>
              <Text style={styles.setNumber}>{currentSetIndex + 1}</Text>
              <Text style={styles.setTotal}>{t('of', lang)} {currentEx?.sets}</Text>
            </View>
          </View>

          <View style={styles.targetInfo}>
            <View style={styles.targetItem}>
              <Text style={styles.targetValue}>{currentReps}</Text>
              <Text style={styles.targetLabel}>{t('reps', lang)}</Text>
            </View>
            {currentWeight > 0 && (
              <View style={styles.targetItem}>
                <Text style={styles.targetValue}>{currentWeight}</Text>
                <Text style={styles.targetLabel}>kg</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.completeSetButton, { marginBottom: insets.bottom + spacing.lg }]}
            onPress={completeSet}
          >
            <Text style={styles.completeSetText}>{t('completeSet', lang)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  loadingText: {
    color: colors.white,
    fontSize: fontSize.lg,
  },
  
  // Pre-workout
  preWorkoutContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  exitButton: {
    paddingHorizontal: spacing.lg,
  },
  exitButtonText: {
    color: colors.accentLight,
    fontSize: fontSize.md,
  },
  preWorkoutContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  preWorkoutRoutine: {
    color: colors.textLight,
    fontSize: fontSize.md,
    textTransform: 'uppercase',
  },
  preWorkoutDay: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
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
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerButton: {
    color: colors.white,
    fontSize: fontSize.xl,
  },
  headerTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  headerProgress: {
    color: colors.textLight,
    fontSize: fontSize.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing.lg,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  
  // Rest mode
  restContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  restLabel: {
    color: colors.textLight,
    fontSize: fontSize.lg,
    letterSpacing: 4,
  },
  restTimer: {
    color: colors.white,
    fontSize: 120,
    fontWeight: 'bold',
  },
  restSeconds: {
    color: colors.textLight,
    fontSize: fontSize.lg,
  },
  nextPreview: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  nextLabel: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  nextImageContainer: {
    marginVertical: spacing.sm,
  },
  nextExercise: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  nextDetails: {
    color: colors.textLight,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  skipButton: {
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  skipButtonText: {
    color: colors.accent,
    fontSize: fontSize.md,
  },
  
  // Exercise mode
  exerciseContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  exerciseHeader: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  exerciseName: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exerciseDescription: {
    color: colors.textLight,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  setInfo: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  setCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumber: {
    color: colors.white,
    fontSize: 40,
    fontWeight: 'bold',
  },
  setTotal: {
    color: colors.textLight,
    fontSize: fontSize.sm,
  },
  targetInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  targetItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  targetValue: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
  },
  targetLabel: {
    color: colors.textLight,
    fontSize: fontSize.sm,
  },
  completeSetButton: {
    backgroundColor: colors.success,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: 'auto',
  },
  completeSetText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  
  // Complete
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.xl,
  },
  completeIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  completeTitle: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
  },
  completeSubtitle: {
    color: colors.textLight,
    fontSize: fontSize.lg,
    marginTop: spacing.sm,
  },
  completeButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
});

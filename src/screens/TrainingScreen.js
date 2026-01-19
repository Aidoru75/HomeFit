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
} from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { exercises, getExerciseName, getExerciseDescription } from '../data/exercises';
import { loadRoutines, loadSettings, saveLastWorkout, addToHistory, updateRoutine } from '../storage/storage';
import { t } from '../data/translations';
import ExerciseImage from '../components/ExerciseImage';

// Audio source for beep sound
const beepSource = require('../../assets/beep.mp3');

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
  const [soundPlayed, setSoundPlayed] = useState(false);
  
  // Track modifications to reps/weights during workout
  const [modifiedExercises, setModifiedExercises] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  
  const timerRef = useRef(null);
  const thumbnailScrollRef = useRef(null);
  
  // Use the new expo-audio hook
  const player = useAudioPlayer(beepSource);

  const lang = settings.language || 'en';

  const allowNavigation = useRef(false);
  const paramsRef = useRef({ routineId, dayIndex });

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
    setSoundPlayed(false);
    setModifiedExercises({});
    setHasChanges(false);
  }, []);

  // Update params ref and reset state when new workout params are received
  useEffect(() => {
    if (routineId && dayIndex !== undefined) {
      const isDifferentWorkout = 
        paramsRef.current.routineId !== routineId || 
        paramsRef.current.dayIndex !== dayIndex;
      
      paramsRef.current = { routineId, dayIndex };
      
      if (isDifferentWorkout) {
        resetWorkoutState();
      }
    }
  }, [routineId, dayIndex, resetWorkoutState]);

  useEffect(() => {
    loadData();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (routineId) {
      loadData();
    }
  }, [routineId, dayIndex]);

  // Handle Android back button
  useEffect(() => {
    if (!workoutStarted || workoutComplete) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      showExitConfirmation();
      return true;
    });

    return () => backHandler.remove();
  }, [workoutStarted, workoutComplete, lang, hasChanges]);

  // Handle tab bar navigation
  useEffect(() => {
    if (!workoutStarted || workoutComplete) return;

    const unsubscribe = navigation.addListener('blur', () => {
      if (allowNavigation.current) {
        allowNavigation.current = false;
        return;
      }
      
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

  // Scroll to current exercise thumbnail
  useEffect(() => {
    if (thumbnailScrollRef.current && workoutStarted && !isResting) {
      // Scroll to make current exercise visible (approximate centering)
      const scrollPosition = Math.max(0, currentExerciseIndex * 70 - 100);
      thumbnailScrollRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  }, [currentExerciseIndex, workoutStarted, isResting]);

  const showExitConfirmation = () => {
    if (hasChanges) {
      Alert.alert(
        t('endWorkout', lang),
        t('saveChangesPrompt', lang) || 'You have made changes to reps/weights. Do you want to save them?',
        [
          { text: t('cancel', lang), style: 'cancel' },
          { 
            text: t('discardChanges', lang) || 'Discard',
            style: 'destructive',
            onPress: () => {
              if (timerRef.current) clearInterval(timerRef.current);
              stopSound();
              resetWorkoutState();
              allowNavigation.current = true;
              navigation.navigate('Home');
            }
          },
          { 
            text: t('saveChanges', lang) || 'Save & Exit',
            onPress: async () => {
              await saveModifications();
              if (timerRef.current) clearInterval(timerRef.current);
              stopSound();
              resetWorkoutState();
              allowNavigation.current = true;
              navigation.navigate('Home');
            }
          },
        ]
      );
    } else {
      Alert.alert(
        t('endWorkout', lang),
        t('endWorkoutConfirm', lang),
        [
          { text: t('continueButton', lang), style: 'cancel' },
          { 
            text: t('end', lang), 
            style: 'destructive', 
            onPress: () => {
              if (timerRef.current) clearInterval(timerRef.current);
              stopSound();
              resetWorkoutState();
              allowNavigation.current = true;
              navigation.navigate('Home');
            }
          },
        ]
      );
    }
  };

  const loadData = async () => {
    const routines = await loadRoutines();
    const userSettings = await loadSettings();
    
    const id = routineId || paramsRef.current.routineId;
    const found = routines.find(r => r.id === id);
    
    setSettings(userSettings);
    
    if (found) {
      setRoutine(found);
      // Initialize modified exercises with current values
      initializeModifiedExercises(found);
    } else if (id) {
      Alert.alert('Error', 'Routine not found');
      navigation.goBack();
    }
  };

  const initializeModifiedExercises = (routineData) => {
    const dayIdx = paramsRef.current.dayIndex;
    const day = routineData?.days?.[dayIdx];
    if (!day?.exercises) return;
    
    const initial = {};
    day.exercises.forEach((ex, idx) => {
      initial[idx] = {
        reps: [...(ex.reps || Array(ex.sets || 3).fill(10))],
        weights: [...(ex.weights || Array(ex.sets || 3).fill(0))],
      };
    });
    setModifiedExercises(initial);
  };

  const saveModifications = async () => {
    if (!routine || !hasChanges) return;
    
    const dayIdx = paramsRef.current.dayIndex;
    const updatedDays = [...routine.days];
    const updatedExercises = [...updatedDays[dayIdx].exercises];
    
    Object.keys(modifiedExercises).forEach(exIdx => {
      const idx = parseInt(exIdx);
      if (updatedExercises[idx]) {
        updatedExercises[idx] = {
          ...updatedExercises[idx],
          reps: modifiedExercises[idx].reps,
          weights: modifiedExercises[idx].weights,
        };
      }
    });
    
    updatedDays[dayIdx] = {
      ...updatedDays[dayIdx],
      exercises: updatedExercises,
    };
    
    await updateRoutine(routine.id, { days: updatedDays });
  };

  // Get current reps/weight (from modified state or original)
  const getCurrentReps = () => {
    if (modifiedExercises[currentExerciseIndex]) {
      return modifiedExercises[currentExerciseIndex].reps[currentSetIndex] || 10;
    }
    const day = routine?.days?.[paramsRef.current.dayIndex];
    const currentEx = day?.exercises?.[currentExerciseIndex];
    return currentEx?.reps?.[currentSetIndex] || 10;
  };

  const getCurrentWeight = () => {
    if (modifiedExercises[currentExerciseIndex]) {
      return modifiedExercises[currentExerciseIndex].weights[currentSetIndex] || 0;
    }
    const day = routine?.days?.[paramsRef.current.dayIndex];
    const currentEx = day?.exercises?.[currentExerciseIndex];
    return currentEx?.weights?.[currentSetIndex] || 0;
  };

  // Update reps for current set
  const updateReps = (delta) => {
    const currentReps = getCurrentReps();
    const newReps = Math.max(1, currentReps + delta);
    
    setModifiedExercises(prev => {
      const updated = { ...prev };
      if (!updated[currentExerciseIndex]) {
        const day = routine?.days?.[paramsRef.current.dayIndex];
        const currentEx = day?.exercises?.[currentExerciseIndex];
        updated[currentExerciseIndex] = {
          reps: [...(currentEx?.reps || Array(currentEx?.sets || 3).fill(10))],
          weights: [...(currentEx?.weights || Array(currentEx?.sets || 3).fill(0))],
        };
      }
      updated[currentExerciseIndex].reps[currentSetIndex] = newReps;
      return updated;
    });
    setHasChanges(true);
  };

  // Update weight for current set (step of 0.25)
  const updateWeight = (delta) => {
    const currentWeight = getCurrentWeight();
    const newWeight = Math.max(0, Math.round((currentWeight + delta) * 100) / 100);
    
    setModifiedExercises(prev => {
      const updated = { ...prev };
      if (!updated[currentExerciseIndex]) {
        const day = routine?.days?.[paramsRef.current.dayIndex];
        const currentEx = day?.exercises?.[currentExerciseIndex];
        updated[currentExerciseIndex] = {
          reps: [...(currentEx?.reps || Array(currentEx?.sets || 3).fill(10))],
          weights: [...(currentEx?.weights || Array(currentEx?.sets || 3).fill(0))],
        };
      }
      updated[currentExerciseIndex].weights[currentSetIndex] = newWeight;
      return updated;
    });
    setHasChanges(true);
  };

  const playCountdownSound = () => {
    if (!settings.soundEnabled || !player) return;
    
    try {
      player.volume = settings.soundVolume;
      player.seekTo(0);
      player.play();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const stopSound = () => {
    try {
      if (player) {
        player.pause();
        player.seekTo(0);
      }
    } catch (error) {
      console.log('Error stopping sound:', error);
    }
  };

  const startRest = (betweenExercises = false) => {
    setIsResting(true);
    setIsExerciseRest(betweenExercises);
    setSoundPlayed(false);
    
    const restTime = betweenExercises 
      ? (routine?.restBetweenExercises || 90)
      : (routine?.restBetweenSets || 60);
    
    setRestTimeLeft(restTime);
    
    timerRef.current = setInterval(() => {
      setRestTimeLeft(prev => {
        if (prev <= 8 && prev > 1 && !soundPlayed) {
          playCountdownSound();
        }
        if (prev <= 1) {
          clearInterval(timerRef.current);
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
    if (timerRef.current) clearInterval(timerRef.current);
    stopSound();
    setIsResting(false);
    setIsExerciseRest(false);
    setRestTimeLeft(0);
  };

  const completeSet = () => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    const currentEx = day?.exercises?.[currentExerciseIndex];
    
    if (!currentEx) return;
    
    const totalSets = currentEx.sets || 3;
    
    if (currentSetIndex < totalSets - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
      startRest(false);
    } else {
      if (currentExerciseIndex < day.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetIndex(0);
        startRest(true);
      } else {
        finishWorkout();
      }
    }
  };

  const finishWorkout = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const day = routine?.days?.[paramsRef.current.dayIndex];
    
    const workoutData = {
      routineId: routine?.id,
      routineName: routine?.name,
      dayIndex: paramsRef.current.dayIndex,
      dayName: day?.name,
      exerciseCount: day?.exercises?.length || 0,
    };
    
    await saveLastWorkout(workoutData);
    await addToHistory(workoutData);
    
    setWorkoutComplete(true);
  };

  const handleFinishAndGoHome = async () => {
    if (hasChanges) {
      Alert.alert(
        t('saveChanges', lang) || 'Save Changes?',
        t('saveChangesPrompt', lang) || 'You made changes to reps/weights. Save them?',
        [
          { 
            text: t('discardChanges', lang) || 'Discard',
            style: 'destructive',
            onPress: () => {
              resetWorkoutState();
              allowNavigation.current = true;
              navigation.navigate('Home');
            }
          },
          { 
            text: t('saveChanges', lang) || 'Save',
            onPress: async () => {
              await saveModifications();
              resetWorkoutState();
              allowNavigation.current = true;
              navigation.navigate('Home');
            }
          },
        ]
      );
    } else {
      resetWorkoutState();
      allowNavigation.current = true;
      navigation.navigate('Home');
    }
  };

  const exitWorkout = () => {
    if (workoutStarted && !workoutComplete) {
      showExitConfirmation();
    } else {
      resetWorkoutState();
      allowNavigation.current = true;
      navigation.goBack();
    }
  };

  const getExerciseData = (exerciseId) => {
    return exercises.find(e => e.id === exerciseId);
  };

  const getNextInfo = () => {
    const day = routine?.days?.[paramsRef.current.dayIndex];
    if (!day?.exercises) return null;
    
    const currentEx = day.exercises[currentExerciseIndex];
    const totalSets = currentEx?.sets || 3;
    
    if (currentSetIndex < totalSets - 1) {
      const exerciseData = getExerciseData(currentEx.exerciseId);
      const nextReps = modifiedExercises[currentExerciseIndex]?.reps[currentSetIndex + 1] 
        || currentEx.reps?.[currentSetIndex + 1] || 10;
      const nextWeight = modifiedExercises[currentExerciseIndex]?.weights[currentSetIndex + 1]
        || currentEx.weights?.[currentSetIndex + 1] || 0;
      return {
        exerciseId: currentEx.exerciseId,
        name: exerciseData ? getExerciseName(exerciseData, lang) : 'Next Set',
        set: currentSetIndex + 1,
        reps: nextReps,
        weight: nextWeight,
      };
    }
    
    if (currentExerciseIndex < day.exercises.length - 1) {
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

  // Format weight for display (show decimals only if needed)
  const formatWeight = (weight) => {
    if (weight === 0) return '0';
    if (weight % 1 === 0) return weight.toString();
    return weight.toFixed(2).replace(/\.?0+$/, '');
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
      <View style={[styles.completeContainer, { paddingTop: insets.top }]}>
        <Text style={styles.completeIcon}>🎉</Text>
        <Text style={styles.completeTitle}>{t('workoutComplete', lang)}</Text>
        <Text style={styles.completeRoutine}>{routine.name}</Text>
        <Text style={styles.completeDay}>{day?.name}</Text>
        {hasChanges && (
          <Text style={styles.changesNote}>
            {t('changesDetected', lang) || '* Changes were made to reps/weights'}
          </Text>
        )}
        <TouchableOpacity 
          style={[styles.finishButton, { marginBottom: insets.bottom + spacing.lg }]}
          onPress={handleFinishAndGoHome}
        >
          <Text style={styles.finishButtonText}>{t('finish', lang)}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pre-workout screen
  if (!workoutStarted) {
    return (
      <View style={[styles.preWorkoutContainer, { paddingTop: insets.top }]}>
        <View style={styles.preWorkoutHeader}>
          <TouchableOpacity style={styles.exitButton} onPress={exitWorkout}>
            <Text style={styles.exitButtonText}>{t('back', lang)}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.preWorkoutContent}>
          <Text style={styles.preWorkoutRoutine}>{routine.name}</Text>
          <Text style={styles.preWorkoutDay}>{day?.name}</Text>
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
    );
  }

  // Active workout
  const currentEx = day?.exercises?.[currentExerciseIndex];
  const exerciseData = currentEx ? getExerciseData(currentEx.exerciseId) : null;
  const nextInfo = getNextInfo();
  const currentReps = getCurrentReps();
  const currentWeight = getCurrentWeight();

  // Render thumbnail strip
  const renderThumbnailStrip = () => (
    <View style={styles.thumbnailContainer}>
      <ScrollView
        ref={thumbnailScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbnailScroll}
      >
        {day?.exercises?.map((ex, idx) => {
          const isCurrentExercise = idx === currentExerciseIndex;
          return (
            <View
              key={idx}
              style={[
                styles.thumbnailWrapper,
                isCurrentExercise && styles.thumbnailWrapperActive,
              ]}
            >
              <ExerciseImage
                exerciseId={ex.exerciseId}
                size={50}
                animate={isCurrentExercise}
                animationDuration={1500}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Rest mode - dark theme */}
      {isResting ? (
        <View style={styles.restScreen}>
          <TouchableOpacity style={styles.restCloseButton} onPress={exitWorkout}>
            <Text style={styles.restCloseText}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.restContent}>
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
                  {nextInfo.weight > 0 && ` • ${formatWeight(nextInfo.weight)}kg`}
                </Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.skipButton} onPress={skipRest}>
              <Text style={styles.skipButtonText}>{t('skipRest', lang)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Exercise mode - light theme */
        <View style={styles.exerciseScreen}>
          {/* Thumbnail strip */}
          {renderThumbnailStrip()}
          
          
          {/* Close button */}
          <TouchableOpacity 
            style={[styles.closeWorkoutButton, { bottom: insets.bottom + spacing.md }]} 
            onPress={exitWorkout}
          >
            <Text style={styles.closeWorkoutText}>✕</Text>
          </TouchableOpacity>

          {/* Main content */}
          <View style={styles.exerciseContent}>
            {/* Exercise name */}
            <Text style={styles.exerciseName}>
              {exerciseData ? getExerciseName(exerciseData, lang) : 'Exercise'}
            </Text>
            
            {/* Set indicator */}
            <Text style={styles.setIndicator}>
              {t('set', lang).toUpperCase()} {currentSetIndex + 1} / {currentEx?.sets || 3}
            </Text>

            {/* Exercise Image - large */}
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

            {/* Reps and Weight controls */}
            <View style={styles.controlsRow}>
              {/* Reps control */}
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

            <View style={styles.controlsRow}>
              {/* Weight control */}
              <View style={styles.controlGroup}>
                <Text style={styles.controlLabel}>{t('weight', lang)} (Kg)</Text>
                <View style={styles.controlButtons}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => updateWeight(-1)}
                  >
                    <Text style={styles.controlButtonText}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => updateWeight(-0.25)}
                  >
                    <Text style={styles.controlButtonTextS}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.controlValue}>{formatWeight(currentWeight)}</Text>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => updateWeight(0.25)}
                  >
                    <Text style={styles.controlButtonTextS}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => updateWeight(1)}
                  >
                    <Text style={styles.controlButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Changes indicator */}
            {hasChanges && (
              <Text style={styles.changesIndicator}>
                * {t('unsavedChanges', lang) || 'Unsaved changes'}
              </Text>
            )}
          </View>
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
  
  // Complete screen (dark)
  completeContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: spacing.md,
  },
  completeRoutine: {
    color: colors.textLight,
    fontSize: fontSize.lg,
  },
  completeDay: {
    color: colors.accent,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  changesNote: {
    color: colors.accent,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  finishButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
  },
  finishButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  
  // Pre-workout (dark)
  preWorkoutContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  preWorkoutHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  exitButton: {
    paddingHorizontal: spacing.md,
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
  
  // Rest screen (dark)
  restScreen: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  restCloseButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  restCloseText: {
    color: colors.white,
    fontSize: fontSize.xl,
  },
  restContent: {
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
  
  // Exercise screen (light theme)
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
    color: '#000000',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  setIndicator: {
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
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  
  // Controls row
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    lineHeight: fontSize.xl,
  },
  controlButtonTextS: {
    color: '#FFFFFF',
    fontSize: fontSize.l,
    fontWeight: 'bold',
    lineHeight: fontSize.l,
  },
  controlValue: {
    color: '#000000',
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    minWidth: 80,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  
  // Changes indicator
  changesIndicator: {
    color: colors.accent,
    fontSize: fontSize.xs,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  
  // Close workout button (floating)
  closeWorkoutButton: {
    position: 'relative',
    top: 10,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeWorkoutText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
});

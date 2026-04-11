// Routines Screen - Create and manage workout routines
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Image,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { spacing, borderRadius, fontSize, shadows, fonts } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  availableExercises,
  muscleGroups,
  getAvailableExercisesByMuscle,
  getExerciseName,
  getMuscleGroupName,
  getExerciseById,
} from '../data/exercises';
import { IS_PRO } from '../config';
import { loadRoutines, addRoutine, updateRoutine, deleteRoutine, loadSettings, loadExcludedExercises } from '../storage/storage';
import { t } from '../data/translations';
import ExerciseImage from '../components/ExerciseImage';
import { encodeRoutine, decodeRoutine, isValidRoutineCode, MAX_QR_SIZE } from '../utils/routineCodec';


// Icons
const editIcon = IS_PRO
  ? require('../../assets/icons/edit.png')
  : require('../../assets/icons/edit_f.png');
const editAccentIcon = IS_PRO
  ? require('../../assets/icons/edit_accent.png')
  : require('../../assets/icons/edit_accent_f.png');
const importIcon = require('../../assets/icons/import.png');
const importAccentIcon = require('../../assets/icons/import_accent.png');
const exportIcon = require('../../assets/icons/export.png');
const exportAccentIcon = require('../../assets/icons/export_accent.png');

export default function RoutinesScreen({ navigation, route }) {
  const { width: windowWidth, isLandscape } = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [permission, requestPermission] = useCameraPermissions();
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [showNewRoutineModal, setShowNewRoutineModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  const [showRenameDayModal, setShowRenameDayModal] = useState(false);
  const [showEditRoutineModal, setShowEditRoutineModal] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);
  const [currentMuscleFilter, setCurrentMuscleFilter] = useState(0); // Index in muscleGroups, 0 = all
  const [exerciseSearchText, setExerciseSearchText] = useState(''); // Search filter for "All" tab
  const [settings, setSettings] = useState({ language: 'en' });
  const [dayNameInput, setDayNameInput] = useState('');
  const [excludedExercises, setExcludedExercises] = useState([]);

  // QR Import/Export state
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showImportPreviewModal, setShowImportPreviewModal] = useState(false);
  const [encodedRoutine, setEncodedRoutine] = useState('');
  const [pendingImport, setPendingImport] = useState(null);
  const [importRoutineName, setImportRoutineName] = useState('');
  const [scannerActive, setScannerActive] = useState(true);
  
  // New routine form state
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineDays, setNewRoutineDays] = useState(4);
  const [newRestBetweenSets, setNewRestBetweenSets] = useState('60');
  const [newRestBetweenExercises, setNewRestBetweenExercises] = useState('90');

  // Edit routine form state
  const [editRoutineName, setEditRoutineName] = useState('');
  const [editRestBetweenSets, setEditRestBetweenSets] = useState('60');
  const [editRestBetweenExercises, setEditRestBetweenExercises] = useState('90');

  // Exercise config state
  const [exerciseConfig, setExerciseConfig] = useState({
    exerciseId: null,
    sets: 3,
    reps: [10, 10, 10],
    weights: [0, 0, 0],
  });

  // Raw string inputs for weights (to preserve decimal point while typing)
  const [weightInputs, setWeightInputs] = useState(['0', '0', '0']);
  const [isSubstituting, setIsSubstituting] = useState(false);

  // Number input mini-modal state
  const [numberInputVisible, setNumberInputVisible] = useState(false);
  const [numberInputValue, setNumberInputValue] = useState('');
  const [numberInputType, setNumberInputType] = useState('weight'); // 'weight' or 'reps'
  const [numberInputSetIndex, setNumberInputSetIndex] = useState(0);
  const numberInputRef = useRef(null);

  // Drag state
  const [draggingIndex, setDraggingIndex] = useState(null);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    // Handle deep link from home screen or restore after workout
    const routineIdToRestore = route.params?.routineId || route.params?.selectedRoutineId;
    if (routineIdToRestore) {
      const routine = routines.find(r => r.id === routineIdToRestore);
      if (routine) {
        setSelectedRoutine(routine);
      }
      // Clear params so they don't re-trigger on every routines state change
      navigation.setParams({ routineId: undefined, selectedRoutineId: undefined });
    }
  }, [route.params, routines]);

  // Handle deep link import (homefit://import?importData=...)
  useEffect(() => {
    const data = route.params?.importData;
    if (!data || !IS_PRO) return;

    // Clear the param so it doesn't re-trigger
    navigation.setParams({ importData: undefined });

    if (!isValidRoutineCode(data)) {
      Alert.alert(t('invalidQRCode', lang), t('invalidQRCodeMessage', lang));
      return;
    }

    const decoded = decodeRoutine(data);
    if (!decoded) {
      Alert.alert(t('invalidQRCode', lang), t('invalidQRCodeMessage', lang));
      return;
    }

    let totalExercises = 0;
    decoded.days?.forEach(day => {
      totalExercises += day.exercises?.length || 0;
    });
    decoded.totalExercises = totalExercises;

    setPendingImport(decoded);
    setImportRoutineName(decoded.name || 'Imported Routine');
    setShowImportPreviewModal(true);
  }, [route.params?.importData]);

  const loadData = async () => {
    const data = await loadRoutines();
    const userSettings = await loadSettings();
    const excluded = await loadExcludedExercises();

    setRoutines(data);
    setSettings(userSettings);
    setExcludedExercises(excluded);

    // If a routine is selected, update it with fresh data
    if (selectedRoutine?.id) {
      const updated = data.find(r => r.id === selectedRoutine.id);
      if (updated) {
        setSelectedRoutine(updated);
      }
    }
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

  const openEditRoutineModal = () => {
    if (selectedRoutine) {
      setEditRoutineName(selectedRoutine.name);
      setEditRestBetweenSets(String(selectedRoutine.restBetweenSets || 60));
      setEditRestBetweenExercises(String(selectedRoutine.restBetweenExercises || 90));
      setShowEditRoutineModal(true);
    }
  };

  const handleEditRoutine = async () => {
    if (!editRoutineName.trim()) {
      Alert.alert('Error', t('routineName', lang));
      return;
    }

    if (selectedRoutine) {
      const updated = await updateRoutine(selectedRoutine.id, {
        name: editRoutineName.trim(),
        restBetweenSets: parseInt(editRestBetweenSets) || 60,
        restBetweenExercises: parseInt(editRestBetweenExercises) || 90,
      });

      setSelectedRoutine(updated);
      setRoutines(routines.map(r => r.id === updated.id ? updated : r));
      setShowEditRoutineModal(false);
    }
  };

  const startWorkout = (dayIndex) => {
    if (selectedRoutine) {
      const day = selectedRoutine.days[dayIndex];
      if (!day.exercises || day.exercises.length === 0) {
        Alert.alert('⚠️', t('emptyDayWarning', lang), [{ text: 'OK' }]);
        return;
      }

      // Store the selected routine ID so it can be restored when returning
      navigation.setParams({ selectedRoutineId: selectedRoutine.id });

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
    setExerciseSearchText(''); // Reset search when opening modal
    setShowAddExerciseModal(true);
  };

  const selectExerciseForAdd = (exercise) => {
    if (isSubstituting) {
      // Substitute mode: keep existing sets/reps/weights, only swap exerciseId
      const oldExercise = getExerciseById(exerciseConfig._prevExerciseId);
      const wasTimeBased = oldExercise?.timeBased;
      const isTimeBased = exercise.timeBased;
      setExerciseConfig(prev => {
        const config = { ...prev, exerciseId: exercise.id };
        delete config._prevExerciseId;
        // Reset reps if switching between timeBased and rep-based
        if (wasTimeBased !== isTimeBased) {
          const defaultRep = isTimeBased ? 1 : 10;
          config.reps = prev.reps.map(r => r === 'E' ? 'E' : defaultRep);
        }
        return config;
      });
      setIsSubstituting(false);
    } else {
      // Add mode: reset reps to defaults
      const defaultRep = exercise.timeBased ? 1 : 10;
      setExerciseConfig(prev => ({
        ...prev,
        exerciseId: exercise.id,
        reps: prev.reps.map(r => typeof r === 'number' ? defaultRep : r),
      }));
    }
  };

  const handleSubstitute = () => {
    // Find current exercise's muscle group to pre-filter
    const currentExercise = getExerciseById(exerciseConfig.exerciseId);
    if (currentExercise) {
      const muscleIndex = muscleGroups.findIndex(mg => mg.id === currentExercise.muscleGroup);
      setCurrentMuscleFilter(muscleIndex >= 0 ? muscleIndex + 1 : 0);
    }
    setExerciseSearchText('');
    // Store current exerciseId so we can check timeBased change
    setExerciseConfig(prev => ({ ...prev, exerciseId: null, _prevExerciseId: prev.exerciseId }));
    setIsSubstituting(true);
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

  // Number input mini-modal handlers
  const openNumberInput = (type, index, isAddMode) => {
    setNumberInputType(type);
    setNumberInputSetIndex(index);
    if (type === 'reps') {
      const val = exerciseConfig.reps[index];
      setNumberInputValue(val === 'E' ? '' : String(val || (getExerciseById(exerciseConfig.exerciseId)?.timeBased ? 1 : 10)));
    } else {
      setNumberInputValue(weightInputs[index] || '0');
    }
    setNumberInputVisible(true);
  };

  const saveNumberInput = (isAddMode) => {
    if (numberInputType === 'reps') {
      updateRep(numberInputSetIndex, numberInputValue, isAddMode);
    } else {
      updateWeight(numberInputSetIndex, numberInputValue, isAddMode);
    }
    setNumberInputVisible(false);
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
      const existing = updatedDays[editingDayIndex].exercises[editingExerciseIndex];
      updatedDays[editingDayIndex].exercises[editingExerciseIndex] = {
        ...existing,
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

  const handleRemoveExercise = () => {
    if (selectedRoutine && editingDayIndex !== null && editingExerciseIndex !== null) {
      const exerciseName = exerciseConfig.exerciseId
        ? getExerciseName(getExerciseById(exerciseConfig.exerciseId), lang)
        : '';
      Alert.alert(
        t('delete', lang),
        `${t('confirmDelete', lang)} "${exerciseName}"?`,
        [
          { text: t('cancel', lang), style: 'cancel' },
          {
            text: t('delete', lang),
            style: 'destructive',
            onPress: async () => {
              const updatedDays = [...selectedRoutine.days];
              updatedDays[editingDayIndex].exercises.splice(editingExerciseIndex, 1);

              const updated = await updateRoutine(selectedRoutine.id, { days: updatedDays });
              setSelectedRoutine(updated);
              setRoutines(routines.map(r => r.id === updated.id ? updated : r));
              setShowEditExerciseModal(false);
            },
          },
        ]
      );
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

  // Toggle superset link between two consecutive exercises
  const toggleSuperset = async (dayIndex, exerciseIndex) => {
    const updatedDays = [...selectedRoutine.days];
    const exercises = [...updatedDays[dayIndex].exercises];

    const currentEx = exercises[exerciseIndex];
    const nextEx = exercises[exerciseIndex + 1];

    if (!nextEx) return;

    // Check if they're already in the same superset
    const currentGroup = currentEx.supersetGroup;
    const nextGroup = nextEx.supersetGroup;
    const areLinked = currentGroup && nextGroup && currentGroup === nextGroup;

    if (areLinked) {
      // Unlink: remove superset group from both
      exercises[exerciseIndex] = { ...currentEx, supersetGroup: null };
      exercises[exerciseIndex + 1] = { ...nextEx, supersetGroup: null };
    } else {
      // Link: assign same superset group
      // Find the highest existing group number and use next
      let maxGroup = 0;
      exercises.forEach(ex => {
        if (ex.supersetGroup && ex.supersetGroup > maxGroup) {
          maxGroup = ex.supersetGroup;
        }
      });
      const newGroup = currentGroup || nextGroup || (maxGroup + 1);
      exercises[exerciseIndex] = { ...currentEx, supersetGroup: newGroup };
      exercises[exerciseIndex + 1] = { ...nextEx, supersetGroup: newGroup };
    }

    updatedDays[dayIndex].exercises = exercises;
    const updated = await updateRoutine(selectedRoutine.id, { days: updatedDays });
    setSelectedRoutine(updated);
    setRoutines(routines.map(r => r.id === updated.id ? updated : r));
  };

  // Check if exercise is in a superset with the next exercise
  const isLinkedWithNext = (dayIndex, exerciseIndex) => {
    const exercises = selectedRoutine?.days?.[dayIndex]?.exercises;
    if (!exercises || exerciseIndex >= exercises.length - 1) return false;

    const currentEx = exercises[exerciseIndex];
    const nextEx = exercises[exerciseIndex + 1];

    return currentEx.supersetGroup && nextEx.supersetGroup &&
           currentEx.supersetGroup === nextEx.supersetGroup;
  };

  // Check if exercise is part of any superset
  const isInSuperset = (dayIndex, exerciseIndex) => {
    const exercises = selectedRoutine?.days?.[dayIndex]?.exercises;
    if (!exercises) return false;

    const currentEx = exercises[exerciseIndex];
    if (!currentEx.supersetGroup) return false;

    // Check if any adjacent exercise has the same group
    const prevEx = exercises[exerciseIndex - 1];
    const nextEx = exercises[exerciseIndex + 1];

    return (prevEx?.supersetGroup === currentEx.supersetGroup) ||
           (nextEx?.supersetGroup === currentEx.supersetGroup);
  };

  // Estimate total workout duration for a day (in seconds)
  const estimateDayDuration = (dayIndex) => {
    const day = selectedRoutine?.days?.[dayIndex];
    if (!day?.exercises || day.exercises.length === 0) return 0;

    const restSets = selectedRoutine?.restBetweenSets || 60;
    const restExercises = selectedRoutine?.restBetweenExercises || 90;
    const SEC_PER_REP = 3.5;
    const SEC_EXHAUSTION = 40;

    let totalSeconds = 0;
    const exercises = day.exercises;

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const exData = getExerciseById(ex.exerciseId);
      const sets = ex.sets || 3;
      const repsArray = ex.reps || [];
      const isTimeBased = exData?.timeBased || false;

      // Working time for all sets
      for (let s = 0; s < sets; s++) {
        const rep = repsArray[s] ?? (isTimeBased ? 1 : 10);
        if (rep === 'E') {
          totalSeconds += SEC_EXHAUSTION;
        } else if (isTimeBased) {
          totalSeconds += rep * 60;
        } else {
          totalSeconds += rep * SEC_PER_REP;
        }
      }

      // Rest between sets (sets - 1 rest periods within this exercise)
      if (sets > 1) {
        totalSeconds += (sets - 1) * restSets;
      }

      // Rest between exercises
      if (i < exercises.length - 1) {
        // If linked to next via superset, no rest between them
        if (isLinkedWithNext(dayIndex, i)) {
          // No rest — superset continues
        } else {
          totalSeconds += restExercises;
        }
      }
    }

    return totalSeconds;
  };

  // Format seconds into "~Xh Ym" or "~Ym" string
  const formatEstimatedTime = (seconds) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `~${minutes} ${t('min', lang)}`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `~${h}h ${m} ${t('min', lang)}` : `~${h}h`;
  };

  // Get available exercises (not excluded, tier-filtered)
  const getAvailableExercises = () => {
    return availableExercises.filter(ex => !excludedExercises.includes(ex.id));
  };

  // Filter exercises by muscle group and search text
  const getFilteredExercises = () => {
    const available = getAvailableExercises();
    if (currentMuscleFilter === 0) {
      // In "All" tab, also filter by search text if present
      if (exerciseSearchText.trim()) {
        const searchLower = exerciseSearchText.toLowerCase().trim();
        return available.filter(ex => {
          const name = ex.name?.[lang]?.toLowerCase() || '';
          return name.includes(searchLower);
        });
      }
      return available;
    }
    const muscleId = muscleGroups[currentMuscleFilter - 1]?.id;
    return available.filter(ex => ex.muscleGroup === muscleId);
  };

  // ============ QR EXPORT/IMPORT ============

  // Handle share button press - encode and show QR
  const handleShareRoutine = () => {
    if (!selectedRoutine) return;

    const encoded = encodeRoutine(selectedRoutine);
    if (!encoded) {
      Alert.alert('Error', t('routineTooLarge', lang));
      return;
    }

    if (encoded.length > MAX_QR_SIZE) {
      Alert.alert(t('routineTooLarge', lang), t('routineTooLargeMessage', lang));
      return;
    }

    setEncodedRoutine(encoded);
    setShowQRModal(true);
  };

  // Handle import button press - open scanner
  const handleOpenScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(t('cameraPermission', lang), t('cameraPermissionMessage', lang));
        return;
      }
    }
    setScannerActive(true);
    setShowScannerModal(true);
  };

  // Handle QR code scanned
  const handleBarCodeScanned = ({ data }) => {
    if (!scannerActive) return;
    setScannerActive(false);

    if (!isValidRoutineCode(data)) {
      setShowScannerModal(false);
      Alert.alert(t('invalidQRCode', lang), t('invalidQRCodeMessage', lang));
      return;
    }

    const decoded = decodeRoutine(data);
    if (!decoded) {
      setShowScannerModal(false);
      Alert.alert(t('invalidQRCode', lang), t('invalidQRCodeMessage', lang));
      return;
    }

    // Count total exercises
    let totalExercises = 0;
    decoded.days?.forEach(day => {
      totalExercises += day.exercises?.length || 0;
    });
    decoded.totalExercises = totalExercises;

    setPendingImport(decoded);
    setImportRoutineName(decoded.name || 'Imported Routine');
    setShowScannerModal(false);
    setShowImportPreviewModal(true);
  };

  // Handle import confirmation
  const handleConfirmImport = async () => {
    if (!pendingImport) return;

    // Use the user-edited name or default
    let routineName = importRoutineName.trim() || 'Imported Routine';
    const existingNames = routines.map(r => r.name);
    let counter = 1;
    let finalName = routineName;
    while (existingNames.includes(finalName)) {
      finalName = `${routineName} (${counter})`;
      counter++;
    }

    const newRoutine = {
      ...pendingImport,
      name: finalName,
    };

    // Remove totalExercises (only used for preview)
    delete newRoutine.totalExercises;

    const created = await addRoutine(newRoutine);
    setRoutines([...routines, created]);
    setShowImportPreviewModal(false);
    setPendingImport(null);
    setImportRoutineName('');
    Alert.alert('✓', t('routineImported', lang));
  };

  const renderRoutineList = () => (
    <ScrollView style={styles.content}>
      {routines.length === 0 ? (
        <View style={styles.emptyState}>
          <Image source={require('../../assets/icons/notepad.png')} style={styles.emptyIconImage} />
          <Text style={styles.emptyTitle}>{t('noRoutinesYet', lang)}</Text>
          <TouchableOpacity
            style={styles.accentButton}
            onPress={() => setShowNewRoutineModal(true)}
          >
            <Text style={styles.accentButtonText}>{t('createYourFirst', lang)}</Text>
          </TouchableOpacity>
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
      <TouchableOpacity
        style={styles.discoverButton}
        onPress={() => Linking.openURL(`https://www.aidoru.com/homefit/?lang=${lang}`)}
      >
        <Text style={styles.discoverButtonText}>{t('discoverRoutines', lang)}</Text>
      </TouchableOpacity>
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
                <Image source={editIcon} style={styles.dayEditIconImage} />
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

          {day.exercises && day.exercises.length > 0 && (
            <Text style={styles.dayTimeEstimate}>
              {formatEstimatedTime(estimateDayDuration(dayIndex))} • {day.exercises.length} {t('exercisesCount', lang)}
            </Text>
          )}

          {!day.exercises || day.exercises.length === 0 ? (
            <Text style={styles.noExercises}>{t('noExercisesAdded', lang)}</Text>
          ) : (
            day.exercises.map((ex, exIndex) => {
              const exerciseData = getExerciseById(ex.exerciseId);
              const totalWeight = ex.weights ? ex.weights.reduce((a, b) => a + b, 0) : 0;
              const inSuperset = isInSuperset(dayIndex, exIndex);
              const linkedWithNext = isLinkedWithNext(dayIndex, exIndex);
              const isLastExercise = exIndex === day.exercises.length - 1;

              return (
                <React.Fragment key={exIndex}>
                  <TouchableOpacity
                    style={[
                      styles.exerciseItem,
                      inSuperset && styles.exerciseItemSuperset,
                    ]}
                    onPress={() => openEditExerciseModal(dayIndex, exIndex)}
                  >
                    {/* Superset indicator bar */}
                    {inSuperset && <View style={styles.supersetBar} />}

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
                        {ex.sets} {t('sets', lang).toLowerCase()} • {ex.reps?.[0] === 'E' ? t('toExhaustion', lang) : `${ex.reps?.[0] || 10} ${exerciseData?.timeBased ? t('min', lang) : t('reps', lang).toLowerCase()}`}
                        {totalWeight > 0 && ` • ${ex.weights[0]}${settings.measurementSystem === 'imperial' ? t('lbs', lang) : t('kg', lang)}`}
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

                  {/* Superset link button between exercises */}
                  {!isLastExercise && (
                    <TouchableOpacity
                      style={[
                        styles.supersetLinkButton,
                        linkedWithNext && styles.supersetLinkButtonActive,
                      ]}
                      onPress={() => toggleSuperset(dayIndex, exIndex)}
                    >
                      <Text style={[
                        styles.supersetLinkIcon,
                        linkedWithNext && styles.supersetLinkIconActive,
                      ]}>
                        {linkedWithNext ? '⛓' : '○'}
                      </Text>
                      <Text style={[
                        styles.supersetLinkText,
                        linkedWithNext && styles.supersetLinkTextActive,
                      ]}>
                        {linkedWithNext ? t('inSuperset', lang) : t('linkSuperset', lang)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </React.Fragment>
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
    <>
      <Modal
        visible={isEdit ? showEditExerciseModal : showAddExerciseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => { setIsSubstituting(false); isEdit ? setShowEditExerciseModal(false) : setShowAddExerciseModal(false); }}
      >
        <View style={[styles.modalOverlay, isLandscape && styles.modalOverlayLandscape]}>
          <View style={[styles.modalContent, isLandscape ? styles.modalContentLandscape : { maxHeight: '90%' }]}>
            {/* Title: hidden in landscape config mode (shown in right column instead) */}
            {(!isLandscape || !exerciseConfig.exerciseId) && (
              <Text style={styles.modalTitle}>
                {isSubstituting ? t('substitute', lang) : isEdit ? t('editExercise', lang) : t('addExercise', lang)}
              </Text>
            )}

            {!exerciseConfig.exerciseId ? (
              // Exercise selection (Add mode or Substitute mode)
              <>
                <View style={styles.muscleFilter}>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentMuscleFilter(prev =>
                        prev === 0 ? muscleGroups.length : prev - 1
                      );
                      setExerciseSearchText(''); // Reset search when changing filter
                    }}
                  >
                    <Text style={styles.filterArrow}>◀</Text>
                  </TouchableOpacity>
                  <Text style={styles.filterName}>
                    {currentMuscleFilter === 0
                      ? t('all', lang)
                      : getMuscleGroupName(muscleGroups[currentMuscleFilter - 1], lang)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentMuscleFilter(prev =>
                        prev === muscleGroups.length ? 0 : prev + 1
                      );
                      setExerciseSearchText(''); // Reset search when changing filter
                    }}
                  >
                    <Text style={styles.filterArrow}>▶</Text>
                  </TouchableOpacity>
                </View>

                {/* Search input - only visible in "All" tab */}
                {currentMuscleFilter === 0 && (
                  <TextInput
                    style={styles.exerciseSearchInput}
                    value={exerciseSearchText}
                    onChangeText={setExerciseSearchText}
                    placeholder={t('searchExercises', lang)}
                    placeholderTextColor={colors.textLight}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}

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
            ) : isLandscape ? (
              // Landscape: exercise header + sets/reps on left, buttons on right
              <View style={styles.configLandscapeRow}>
                {/* Left+Center: header, sets, reps */}
                <View style={styles.configMainArea}>
                  {exerciseData && (
                    <View style={styles.selectedExercise}>
                      <ExerciseImage exerciseId={exerciseData.id} size={40} />
                      <Text style={styles.selectedExerciseName}>
                        {getExerciseName(exerciseData, lang)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.configColumnsRow}>
                    {/* Sets (vertical +/−) + Exhaustion */}
                    <View style={styles.configLeftColumn}>
                      <Text style={styles.inputLabel}>{t('sets', lang)}</Text>
                      <TouchableOpacity
                        style={styles.setsButton}
                        onPress={() => updateSetsCount(exerciseConfig.sets + 1)}
                      >
                        <Text style={styles.setsButtonText}>+</Text>
                      </TouchableOpacity>
                      <Text style={styles.setsValue}>{exerciseConfig.sets}</Text>
                      <TouchableOpacity
                        style={styles.setsButton}
                        onPress={() => updateSetsCount(exerciseConfig.sets - 1)}
                      >
                        <Text style={styles.setsButtonText}>−</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.exhaustionToggle, exerciseConfig.reps[0] === 'E' && styles.exhaustionToggleActive, { marginTop: spacing.md }]}
                        onPress={() => {
                          setExerciseConfig(prev => {
                            const isCurrentlyE = prev.reps[0] === 'E';
                            if (isCurrentlyE) {
                              const defaultRep = exerciseData?.timeBased ? 1 : 10;
                              return { ...prev, reps: Array(prev.sets).fill(defaultRep) };
                            } else {
                              return { ...prev, reps: Array(prev.sets).fill('E') };
                            }
                          });
                        }}
                      >
                        <Text style={[styles.exhaustionToggleText, exerciseConfig.reps[0] === 'E' && styles.exhaustionToggleTextActive]}>
                          {t('toExhaustion', lang)}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Set rows (scrollable) */}
                    <ScrollView style={styles.configCenterColumn} showsVerticalScrollIndicator={false}>
                      <Text style={styles.inputLabel}>{exerciseData?.timeBased ? t('min', lang) : t('reps', lang)} & {settings.measurementSystem === 'imperial' ? t('weightLbs', lang) : t('weight', lang)}</Text>
                      {Array.from({ length: exerciseConfig.sets }).map((_, index) => (
                        <View key={index} style={styles.setRow}>
                          <Text style={styles.setNumber}>{index + 1}</Text>
                          <TouchableOpacity
                            style={styles.setInput}
                            onPress={() => exerciseConfig.reps[index] !== 'E' && openNumberInput('reps', index, isAddMode)}
                            activeOpacity={exerciseConfig.reps[index] === 'E' ? 1 : 0.6}
                          >
                            <Text style={styles.setInputLabel}>{exerciseData?.timeBased ? t('min', lang) : t('reps', lang)}</Text>
                            <Text style={[styles.setInputValue, exerciseConfig.reps[index] === 'E' && styles.setInputFieldDisabled]}>
                              {exerciseConfig.reps[index] === 'E' ? '—' : String(exerciseConfig.reps[index] || (exerciseData?.timeBased ? 1 : 10))}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.setInput}
                            onPress={() => openNumberInput('weight', index, isAddMode)}
                            activeOpacity={0.6}
                          >
                            <Text style={styles.setInputLabel}>{settings.measurementSystem === 'imperial' ? t('lbs', lang) : t('kg', lang)}</Text>
                            <Text style={styles.setInputValue}>
                              {weightInputs[index] || '0'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* Right: Title + Action buttons */}
                <View style={styles.configRightColumn}>
                  <Text style={styles.configRightTitle}>
                    {isSubstituting ? t('substitute', lang) : isEdit ? t('editExercise', lang) : t('addExercise', lang)}
                  </Text>
                  {isEdit && exerciseConfig.exerciseId && (
                    <>
                      <TouchableOpacity
                        style={[styles.substituteButton, styles.configRightButton]}
                        onPress={handleSubstitute}
                      >
                        <Text style={styles.substituteButtonText}>{t('substitute', lang)}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.deleteButton, styles.configRightButton]}
                        onPress={handleRemoveExercise}
                      >
                        <Text style={styles.deleteButtonText}>{t('delete', lang)}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity
                    style={[styles.modalCancelButton, styles.configRightButton]}
                    onPress={() => {
                      if (isSubstituting) {
                        setExerciseConfig(prev => {
                          const config = { ...prev, exerciseId: prev._prevExerciseId };
                          delete config._prevExerciseId;
                          return config;
                        });
                        setIsSubstituting(false);
                      } else {
                        isEdit ? setShowEditExerciseModal(false) : setShowAddExerciseModal(false);
                      }
                    }}
                  >
                    <Text style={styles.modalCancelText}>{isSubstituting ? t('back', lang) : t('cancel', lang)}</Text>
                  </TouchableOpacity>
                  {exerciseConfig.exerciseId && (
                    <TouchableOpacity
                      style={[styles.modalCreateButton, styles.configRightButton]}
                      onPress={isEdit ? handleSaveExercise : handleAddExercise}
                    >
                      <Text style={styles.modalCreateText}>{isEdit ? t('save', lang) : t('add', lang)}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              // Portrait: Exercise configuration (both Add and Edit modes)
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

                {/* To Exhaustion toggle */}
                <TouchableOpacity
                  style={[styles.exhaustionToggle, exerciseConfig.reps[0] === 'E' && styles.exhaustionToggleActive]}
                  onPress={() => {
                    setExerciseConfig(prev => {
                      const isCurrentlyE = prev.reps[0] === 'E';
                      if (isCurrentlyE) {
                        // Restore numeric reps
                        const defaultRep = exerciseData?.timeBased ? 1 : 10;
                        return { ...prev, reps: Array(prev.sets).fill(defaultRep) };
                      } else {
                        // Set all to exhaustion
                        return { ...prev, reps: Array(prev.sets).fill('E') };
                      }
                    });
                  }}
                >
                  <Text style={[styles.exhaustionToggleText, exerciseConfig.reps[0] === 'E' && styles.exhaustionToggleTextActive]}>
                    {t('toExhaustion', lang)}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>{exerciseData?.timeBased ? t('min', lang) : t('reps', lang)} & {settings.measurementSystem === 'imperial' ? t('weightLbs', lang) : t('weight', lang)}</Text>
                {Array.from({ length: exerciseConfig.sets }).map((_, index) => (
                  <View key={index} style={styles.setRow}>
                    <Text style={styles.setNumber}>{index + 1}</Text>
                    <TouchableOpacity
                      style={styles.setInput}
                      onPress={() => exerciseConfig.reps[index] !== 'E' && openNumberInput('reps', index, isAddMode)}
                      activeOpacity={exerciseConfig.reps[index] === 'E' ? 1 : 0.6}
                    >
                      <Text style={styles.setInputLabel}>{exerciseData?.timeBased ? t('min', lang) : t('reps', lang)}</Text>
                      <Text style={[styles.setInputValue, exerciseConfig.reps[index] === 'E' && styles.setInputFieldDisabled]}>
                        {exerciseConfig.reps[index] === 'E' ? '—' : String(exerciseConfig.reps[index] || (exerciseData?.timeBased ? 1 : 10))}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.setInput}
                      onPress={() => openNumberInput('weight', index, isAddMode)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.setInputLabel}>{settings.measurementSystem === 'imperial' ? t('lbs', lang) : t('kg', lang)}</Text>
                      <Text style={styles.setInputValue}>
                        {weightInputs[index] || '0'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}

              </ScrollView>
            )}

            {/* Buttons - only shown in portrait or selection phase */}
            {(!isLandscape || !exerciseConfig.exerciseId) && (
            <View style={styles.modalButtonsColumn}>
              {isEdit && exerciseConfig.exerciseId && (
                <View style={styles.editActionRow}>
                  <TouchableOpacity
                    style={styles.substituteButton}
                    onPress={handleSubstitute}
                  >
                    <Text style={styles.substituteButtonText}>{t('substitute', lang)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deleteButton, { flex: 1, marginTop: 0 }]}
                    onPress={handleRemoveExercise}
                  >
                    <Text style={styles.deleteButtonText}>{t('delete', lang)}</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  if (isSubstituting) {
                    setExerciseConfig(prev => {
                      const config = { ...prev, exerciseId: prev._prevExerciseId };
                      delete config._prevExerciseId;
                      return config;
                    });
                    setIsSubstituting(false);
                  } else {
                    isEdit ? setShowEditExerciseModal(false) : setShowAddExerciseModal(false);
                  }
                }}
              >
                <Text style={styles.modalCancelText}>{isSubstituting ? t('back', lang) : t('cancel', lang)}</Text>
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
            )}
          </View>
        </View>
      </Modal>

      {/* Number input mini-modal */}
      <Modal
        visible={numberInputVisible}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setNumberInputVisible(false)}
        onShow={() => setTimeout(() => numberInputRef.current?.focus(), 100)}
      >
        <TouchableOpacity
          style={styles.numberInputOverlay}
          activeOpacity={1}
          onPress={() => setNumberInputVisible(false)}
        >
          <View style={styles.numberInputBox}>
            <TextInput
              ref={numberInputRef}
              style={styles.numberInputField}
              value={numberInputValue}
              onChangeText={setNumberInputValue}
              keyboardType={numberInputType === 'reps' ? 'numeric' : 'decimal-pad'}
              selectTextOnFocus
              onSubmitEditing={() => saveNumberInput(isAddMode)}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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
            <Text style={styles.backButton}>← {t('back', lang)}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitleSmall}>{selectedRoutine.name}</Text>
          <View style={styles.headerActions}>
            {IS_PRO && <TouchableOpacity onPress={handleShareRoutine} style={styles.headerActionButton}>
              <Image source={exportAccentIcon} style={styles.headerActionIconImage} />
            </TouchableOpacity>}
            <TouchableOpacity onPress={openEditRoutineModal} style={styles.headerActionButton}>
              <Image source={editAccentIcon} style={styles.headerActionIconImage} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Routine list header
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Text style={styles.headerTitle}>{t('routines', lang)}</Text>
          <View style={styles.headerButtons}>
            {IS_PRO && <TouchableOpacity
              style={styles.importButton}
              onPress={handleOpenScanner}
            >
              <View style={styles.importButtonContent}>
                <Image source={importAccentIcon} style={styles.importButtonIcon} />
                <Text style={styles.importButtonText}>{t('importRoutine', lang)}</Text>
              </View>
            </TouchableOpacity>}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowNewRoutineModal(true)}
            >
              <Text style={styles.addButtonText}>+{t('newRoutine', lang)}</Text>
            </TouchableOpacity>
          </View>
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

      {/* Edit Routine Modal */}
      <Modal
        visible={showEditRoutineModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditRoutineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('editRoutine', lang) || 'Edit Routine'}</Text>

            <Text style={styles.inputLabel}>{t('routineName', lang)}</Text>
            <TextInput
              style={styles.textInput}
              value={editRoutineName}
              onChangeText={setEditRoutineName}
              placeholder={t('routineNamePlaceholder', lang)}
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.inputLabel}>{t('restBetweenSets', lang)}</Text>
            <TextInput
              style={styles.textInput}
              value={editRestBetweenSets}
              onChangeText={setEditRestBetweenSets}
              keyboardType="numeric"
              placeholder="60"
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.inputLabel}>{t('restBetweenExercises', lang)}</Text>
            <TextInput
              style={styles.textInput}
              value={editRestBetweenExercises}
              onChangeText={setEditRestBetweenExercises}
              keyboardType="numeric"
              placeholder="90"
              placeholderTextColor={colors.textLight}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowEditRoutineModal(false)}
              >
                <Text style={styles.modalCancelText}>{t('cancel', lang)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCreateButton}
                onPress={handleEditRoutine}
              >
                <Text style={styles.modalCreateText}>{t('save', lang)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code Display Modal */}
      <Modal
        visible={showQRModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContent}>
            <Text style={styles.qrModalTitle}>{t('routineShared', lang)}</Text>
            <Text style={styles.qrRoutineName}>{selectedRoutine?.name}</Text>

            <View style={styles.qrContainer}>
              {encodedRoutine ? (
                <QRCode
                  value={encodedRoutine}
                  size={Math.min(windowWidth * 0.6, 300)}
                  backgroundColor={colors.white}
                  color={colors.primary}
                />
              ) : null}
            </View>

            <Text style={styles.qrHint}>{t('scanToImport', lang)}</Text>

            <TouchableOpacity
              style={styles.qrCloseButton}
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.qrCloseButtonText}>{t('close', lang)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Scanner Modal */}
      <Modal
        visible={showScannerModal}
        animationType="slide"
        onRequestClose={() => setShowScannerModal(false)}
      >
        <View style={styles.scannerContainer}>
          <View style={[styles.scannerHeader, { paddingTop: insets.top + spacing.md }]}>
            <TouchableOpacity onPress={() => setShowScannerModal(false)}>
              <Text style={styles.scannerBackButton}>← {t('back', lang)}</Text>
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>{t('scanQRCode', lang)}</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={scannerActive ? handleBarCodeScanned : undefined}
            />
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Import Preview Modal */}
      <Modal
        visible={showImportPreviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowImportPreviewModal(false);
          setPendingImport(null);
          setImportRoutineName('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('importPreview', lang)}</Text>

            {pendingImport && (
              <View style={styles.importPreview}>
                <Text style={styles.inputLabel}>{t('routineName', lang)}</Text>
                <TextInput
                  style={styles.textInput}
                  value={importRoutineName}
                  onChangeText={setImportRoutineName}
                  placeholder={t('routineNamePlaceholder', lang)}
                  placeholderTextColor={colors.textLight}
                  selectTextOnFocus={true}
                />
                <View style={styles.importPreviewItem}>
                  <Text style={styles.importPreviewLabel}>{t('days', lang)}</Text>
                  <Text style={styles.importPreviewValue}>{pendingImport.days?.length || 0}</Text>
                </View>
                <View style={styles.importPreviewItem}>
                  <Text style={styles.importPreviewLabel}>{t('exercisesLabel', lang)}</Text>
                  <Text style={styles.importPreviewValue}>
                    {pendingImport.totalExercises} {t('exercisesTotal', lang)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowImportPreviewModal(false);
                  setPendingImport(null);
                  setImportRoutineName('');
                }}
              >
                <Text style={styles.modalCancelText}>{t('cancel', lang)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCreateButton}
                onPress={handleConfirmImport}
              >
                <Text style={styles.modalCreateText}>{t('importRoutine', lang)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
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
  editButton: {
    fontSize: fontSize.lg,
    padding: spacing.xs,
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
  emptyIconImage: {
    width: '60%',
    maxWidth: 200,
    aspectRatio: 1,
    marginBottom: spacing.md,
    resizeMode: 'contain',
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
  accentButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  accentButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: '#FFFFFF',
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
  discoverButton: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  discoverButtonText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.accent,
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
  dayEditIconImage: {
    width: 16,
    height: 16,
    marginLeft: spacing.xs,
    resizeMode: 'contain',
    opacity: 0.6,
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
  dayTimeEstimate: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.sm,
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
    position: 'relative',
  },
  exerciseItemSuperset: {
    backgroundColor: colors.accent + '14',
    marginLeft: spacing.sm,
    paddingLeft: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  supersetBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.accent,
    borderRadius: 2,
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
  supersetLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    marginVertical: 2,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  supersetLinkButtonActive: {
    backgroundColor: colors.accent + '26',
    borderColor: colors.accent,
    borderStyle: 'solid',
  },
  supersetLinkIcon: {
    fontSize: fontSize.sm,
    marginRight: spacing.xs,
    color: colors.textLight,
  },
  supersetLinkIconActive: {
    color: colors.accent,
  },
  supersetLinkText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  supersetLinkTextActive: {
    fontFamily: fonts.bold,
    color: colors.accent,
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
  modalOverlayLandscape: {
    padding: spacing.sm,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  modalContentLandscape: {
    maxHeight: '95%',
    flex: 1,
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
  modalButtonsColumn: {
    gap: spacing.sm,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  exerciseSearchInput: {
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setsButtonText: {
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg + 2,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  setsValue: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  exhaustionToggle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  exhaustionToggleActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  exhaustionToggleText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  exhaustionToggleTextActive: {
    color: colors.white,
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
  setInputValue: {
    fontFamily: fonts.regular,
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    padding: spacing.xs,
  },
  setInputFieldDisabled: {
    color: colors.textLight,
    opacity: 0.5,
  },
  editActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  substituteButton: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
  },
  substituteButtonText: {
    fontFamily: fonts.bold,
    color: colors.accent,
    fontSize: fontSize.md,
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

  // Landscape config layout
  configLandscapeRow: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.md,
  },
  configMainArea: {
    flex: 1,
  },
  configColumnsRow: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.md,
  },
  configLeftColumn: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  configCenterColumn: {
    flex: 1,
  },
  configRightColumn: {
    width: 115,
    justifyContent: 'flex-start',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  configRightTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  configRightButton: {
    flex: 0,
    marginTop: 0,
  },

  // Header actions
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerActionButton: {
    padding: spacing.xs,
  },
  headerActionIcon: {
    fontSize: fontSize.lg,
  },
  headerActionIconImage: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  importButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accentLight,
  },
  importButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  importButtonIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  importButtonText: {
    fontFamily: fonts.regular,
    color: colors.accentLight,
    fontSize: fontSize.sm,
  },

  // QR Modal styles
  qrModalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  qrModalTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  qrRoutineName: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  qrContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  qrHint: {
    fontFamily: fonts.italic,
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  qrCloseButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
  },
  qrCloseButtonText: {
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: fontSize.md,
  },

  // Scanner styles
  scannerContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.primary,
  },
  scannerBackButton: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.accentLight,
  },
  scannerTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.white,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: colors.accent,
    borderRadius: borderRadius.lg,
    backgroundColor: 'transparent',
  },

  // Import preview styles
  importPreview: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  importPreviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  importPreviewLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  importPreviewValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },

  // Number input mini-modal
  numberInputOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  numberInputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    minWidth: 160,
    alignItems: 'center',
  },
  numberInputField: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    color: '#000000',
    textAlign: 'center',
    minWidth: 120,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingVertical: spacing.sm,
  },
});

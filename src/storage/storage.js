// Local storage for routines, settings, and workout history
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exercises } from '../data/exercises';
import { getAllEquipmentIds } from '../data/equipment';

const KEYS = {
  ROUTINES: 'homefit_routines',
  LAST_WORKOUT: 'homefit_last_workout',
  WORKOUT_HISTORY: 'homefit_history',
  SETTINGS: 'homefit_settings',
  EXCLUDED_EXERCISES: 'homefit_excluded_exercises',
  AVAILABLE_EQUIPMENT: 'homefit_available_equipment',
};

// Default settings
const DEFAULT_SETTINGS = {
  userName: '',
  userHeight: '',  // in cm
  userWeight: '',  // in kg
  language: 'en', // 'en' or 'es'
  soundEnabled: true,
  soundVolume: 1.0, // 0.0 to 1.0
};

// ============ SETTINGS ============

export const loadSettings = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

export const updateSetting = async (key, value) => {
  const settings = await loadSettings();
  settings[key] = value;
  return saveSettings(settings);
};

// ============ AVAILABLE EQUIPMENT ============

export const loadAvailableEquipment = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.AVAILABLE_EQUIPMENT);
    if (data) {
      return JSON.parse(data);
    }
    // Default: all equipment is available
    return getAllEquipmentIds();
  } catch (error) {
    console.error('Error loading available equipment:', error);
    return getAllEquipmentIds();
  }
};

export const saveAvailableEquipment = async (equipmentIds) => {
  try {
    await AsyncStorage.setItem(KEYS.AVAILABLE_EQUIPMENT, JSON.stringify(equipmentIds));
    return true;
  } catch (error) {
    console.error('Error saving available equipment:', error);
    return false;
  }
};

// Calculate which exercises should be excluded based on available equipment
export const calculateExcludedByEquipment = (availableEquipment) => {
  const excluded = [];
  
  for (const exercise of exercises) {
    // Bodyweight exercises are always available
    if (!exercise.equipment || exercise.equipment.length === 0) {
      continue;
    }
    
    // Check if user has ALL required equipment for this exercise
    const hasAllEquipment = exercise.equipment.every(
      eqId => availableEquipment.includes(eqId)
    );
    
    if (!hasAllEquipment) {
      excluded.push(exercise.id);
    }
  }
  
  return excluded;
};

// Update excluded exercises based on equipment change
export const updateExcludedByEquipment = async (newAvailableEquipment) => {
  // Save the new equipment selection
  await saveAvailableEquipment(newAvailableEquipment);
  
  // Calculate which exercises should be excluded
  const shouldBeExcluded = calculateExcludedByEquipment(newAvailableEquipment);
  
  // Save the new excluded list
  await saveExcludedExercises(shouldBeExcluded);
  
  return shouldBeExcluded;
};

// ============ ROUTINES ============

export const saveRoutines = async (routines) => {
  try {
    await AsyncStorage.setItem(KEYS.ROUTINES, JSON.stringify(routines));
    return true;
  } catch (error) {
    console.error('Error saving routines:', error);
    return false;
  }
};

export const loadRoutines = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.ROUTINES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading routines:', error);
    return [];
  }
};

export const addRoutine = async (routine) => {
  const routines = await loadRoutines();
  const newRoutine = {
    ...routine,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  routines.push(newRoutine);
  await saveRoutines(routines);
  return newRoutine;
};

export const updateRoutine = async (routineId, updates) => {
  const routines = await loadRoutines();
  const index = routines.findIndex(r => r.id === routineId);
  if (index !== -1) {
    routines[index] = { ...routines[index], ...updates, updatedAt: new Date().toISOString() };
    await saveRoutines(routines);
    return routines[index];
  }
  return null;
};

export const deleteRoutine = async (routineId) => {
  const routines = await loadRoutines();
  const filtered = routines.filter(r => r.id !== routineId);
  await saveRoutines(filtered);
  return true;
};

// ============ LAST WORKOUT ============

export const saveLastWorkout = async (workoutInfo) => {
  try {
    await AsyncStorage.setItem(KEYS.LAST_WORKOUT, JSON.stringify({
      ...workoutInfo,
      completedAt: new Date().toISOString(),
    }));
    return true;
  } catch (error) {
    console.error('Error saving last workout:', error);
    return false;
  }
};

export const getLastWorkout = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.LAST_WORKOUT);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting last workout:', error);
    return null;
  }
};

// ============ WORKOUT HISTORY ============

export const addToHistory = async (workout) => {
  try {
    const history = await getHistory();
    history.push({
      ...workout,
      completedAt: new Date().toISOString(),
    });
    const trimmed = history.slice(-100);
    await AsyncStorage.setItem(KEYS.WORKOUT_HISTORY, JSON.stringify(trimmed));
    return true;
  } catch (error) {
    console.error('Error adding to history:', error);
    return false;
  }
};

export const getHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.WORKOUT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
};

// ============ EXCLUDED EXERCISES ============

export const loadExcludedExercises = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.EXCLUDED_EXERCISES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading excluded exercises:', error);
    return [];
  }
};

export const saveExcludedExercises = async (excludedIds) => {
  try {
    await AsyncStorage.setItem(KEYS.EXCLUDED_EXERCISES, JSON.stringify(excludedIds));
    return true;
  } catch (error) {
    console.error('Error saving excluded exercises:', error);
    return false;
  }
};

export const toggleExerciseExclusion = async (exerciseId) => {
  const excluded = await loadExcludedExercises();
  const index = excluded.indexOf(exerciseId);
  
  if (index === -1) {
    // Add to excluded
    excluded.push(exerciseId);
  } else {
    // Remove from excluded
    excluded.splice(index, 1);
  }
  
  await saveExcludedExercises(excluded);
  return excluded;
};

// ============ UTILITY ============

export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.ROUTINES, 
      KEYS.LAST_WORKOUT, 
      KEYS.WORKOUT_HISTORY,
      KEYS.EXCLUDED_EXERCISES,
      KEYS.AVAILABLE_EQUIPMENT
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

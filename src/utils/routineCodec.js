// Routine encoder/decoder for QR code sharing
// Format: v1[restSets,restEx(exerciseId|setsData)...][day2]...
// Example: v1[60,90(1|3x10)(2|8;6;4)]
// NOTE: Weights are NOT included in QR codes - each user sets their own weights.

import { getNumericId, getExerciseId } from '../data/exerciseIds';

const FORMAT_VERSION = 'v1';

/**
 * Encode a routine object into a compact string for QR code
 * Weights are excluded - only exercise structure (sets/reps) is shared.
 * @param {Object} routine - The routine object to encode
 * @returns {string} Encoded string
 */
export const encodeRoutine = (routine) => {
  if (!routine || !routine.days) {
    return null;
  }

  const restSets = routine.restBetweenSets || 60;
  const restEx = routine.restBetweenExercises || 90;

  const encodedDays = routine.days.map(day => {
    if (!day.exercises || day.exercises.length === 0) {
      // Empty day: just rest times, no exercises
      return `${restSets},${restEx}`;
    }

    const encodedExercises = day.exercises.map(ex => {
      const numericId = getNumericId(ex.exerciseId);
      if (!numericId) {
        console.warn(`Unknown exercise ID: ${ex.exerciseId}`);
        return null;
      }

      // Encode sets/reps only (no weights)
      const setsData = encodeSets(ex.sets, ex.reps);
      // Include superset group if present
      const supersetPart = ex.supersetGroup ? `|s${ex.supersetGroup}` : '';
      return `(${numericId}|${setsData}${supersetPart})`;
    }).filter(Boolean).join('');

    return `${restSets},${restEx}${encodedExercises}`;
  });

  return `${FORMAT_VERSION}[${encodedDays.join('][')}]`;
};

/**
 * Encode sets data using shorthand notation where possible
 * Weights are NOT included - each user sets their own.
 * @param {number} setCount - Number of sets
 * @param {number[]} reps - Array of reps per set
 * @returns {string} Encoded sets string
 */
const encodeSets = (setCount, reps) => {
  const repsArray = reps || Array(setCount).fill(10);

  // Check if all reps are identical
  const firstRep = repsArray[0] || 10;
  const allIdentical = repsArray.every(r => (r || 10) === firstRep);

  if (allIdentical) {
    // Use shorthand: 3x10
    return `${setCount}x${firstRep}`;
  }

  // Varied reps: 10;8;6
  return repsArray.map(r => r || 10).join(';');
};

/**
 * Decode a compact string back into a routine object
 * Weights are set to zero - each user will set their own.
 * @param {string} code - The encoded string
 * @returns {Object|null} Decoded routine object, or null if invalid
 */
export const decodeRoutine = (code) => {
  if (!code || typeof code !== 'string') {
    return null;
  }

  // Check version
  if (!code.startsWith(FORMAT_VERSION)) {
    console.warn('Unknown format version');
    return null;
  }

  try {
    // Remove version prefix
    const content = code.slice(FORMAT_VERSION.length);

    // Parse days: [day1][day2]...
    const dayMatches = content.match(/\[([^\]]*)\]/g);
    if (!dayMatches || dayMatches.length === 0) {
      return null;
    }

    let restBetweenSets = 60;
    let restBetweenExercises = 90;

    const days = dayMatches.map((dayStr, index) => {
      // Remove brackets
      const dayContent = dayStr.slice(1, -1);

      // Parse rest times at the beginning: 60,90
      const restMatch = dayContent.match(/^(\d+),(\d+)/);
      if (restMatch) {
        restBetweenSets = parseInt(restMatch[1]);
        restBetweenExercises = parseInt(restMatch[2]);
      }

      // Parse exercises: (id|setsData) or (id|setsData|sN) for supersets
      const exerciseMatches = dayContent.match(/\((\d+)\|([^)]+)\)/g);
      const exercises = exerciseMatches ? exerciseMatches.map(exStr => {
        // Remove parentheses and parse
        const inner = exStr.slice(1, -1);
        const parts = inner.split('|');
        const numericIdStr = parts[0];
        const setsData = parts[1];
        const numericId = parseInt(numericIdStr);
        const exerciseId = getExerciseId(numericId);

        if (!exerciseId) {
          console.warn(`Unknown numeric exercise ID: ${numericId}`);
          return null;
        }

        const { sets, reps, weights } = decodeSets(setsData);

        // Parse superset group if present (format: sN where N is group number)
        let supersetGroup = null;
        if (parts[2] && parts[2].startsWith('s')) {
          supersetGroup = parseInt(parts[2].slice(1)) || null;
        }

        return {
          exerciseId,
          sets,
          reps,
          weights,
          supersetGroup,
        };
      }).filter(Boolean) : [];

      return {
        name: `Day ${index + 1}`,
        customName: '',
        exercises,
      };
    });

    return {
      name: 'Imported Routine',
      days,
      restBetweenSets,
      restBetweenExercises,
    };
  } catch (error) {
    console.error('Error decoding routine:', error);
    return null;
  }
};

/**
 * Decode sets data from string
 * Weights are always zero - each user sets their own.
 * @param {string} setsData - Encoded sets string
 * @returns {Object} Object with sets, reps, and weights arrays
 */
const decodeSets = (setsData) => {
  // Check for shorthand: 3x10 or 3xE (exhaustion)
  const shorthandMatch = setsData.match(/^(\d+)x(.+)$/);
  if (shorthandMatch) {
    const setCount = parseInt(shorthandMatch[1]);
    const repVal = shorthandMatch[2];
    const rep = repVal === 'E' ? 'E' : (parseInt(repVal) || 10);

    return {
      sets: setCount,
      reps: Array(setCount).fill(rep),
      weights: Array(setCount).fill(0),
    };
  }

  // Varied reps: 10;8;6 or 10;E;8
  const repsArray = setsData.split(';').map(r => r === 'E' ? 'E' : (parseInt(r) || 10));

  return {
    sets: repsArray.length,
    reps: repsArray,
    weights: Array(repsArray.length).fill(0),
  };
};

/**
 * Validate if a code is a valid routine code
 * @param {string} code - The string to validate
 * @returns {boolean} True if valid format
 */
export const isValidRoutineCode = (code) => {
  if (!code || typeof code !== 'string') {
    return false;
  }

  // Must start with version
  if (!code.startsWith(FORMAT_VERSION)) {
    return false;
  }

  // Must have at least one day
  const dayMatches = code.match(/\[([^\]]*)\]/g);
  if (!dayMatches || dayMatches.length === 0) {
    return false;
  }

  return true;
};

/**
 * Estimate the size of encoded routine in characters
 * @param {Object} routine - The routine to check
 * @returns {number} Estimated character count
 */
export const estimateEncodedSize = (routine) => {
  const encoded = encodeRoutine(routine);
  return encoded ? encoded.length : 0;
};

// Maximum safe size for QR code (using Medium error correction)
export const MAX_QR_SIZE = 2300;

// Routine encoder/decoder for QR code sharing
// Format: v1[restSets,restEx(exerciseId|setsData)...][day2]...
// Example: v1[60,90(1|3x10,80)(2|8,100;6,110;4,120)]

import { getNumericId, getExerciseId } from '../data/exerciseIds';

const FORMAT_VERSION = 'v1';

/**
 * Encode a routine object into a compact string for QR code
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

      const setsData = encodeSets(ex.sets, ex.reps, ex.weights);
      return `(${numericId}|${setsData})`;
    }).filter(Boolean).join('');

    return `${restSets},${restEx}${encodedExercises}`;
  });

  return `${FORMAT_VERSION}[${encodedDays.join('][')}]`;
};

/**
 * Encode sets data using shorthand notation where possible
 * @param {number} setCount - Number of sets
 * @param {number[]} reps - Array of reps per set
 * @param {number[]} weights - Array of weights per set
 * @returns {string} Encoded sets string
 */
const encodeSets = (setCount, reps, weights) => {
  const repsArray = reps || Array(setCount).fill(10);
  const weightsArray = weights || Array(setCount).fill(0);

  // Check if all sets are identical
  const firstRep = repsArray[0] || 10;
  const firstWeight = weightsArray[0] || 0;
  const allIdentical = repsArray.every((r, i) =>
    (r || 10) === firstRep && (weightsArray[i] || 0) === firstWeight
  );

  if (allIdentical) {
    // Use shorthand: 3x10,80 or 3x10 (if weight is 0)
    if (firstWeight === 0) {
      return `${setCount}x${firstRep}`;
    }
    return `${setCount}x${firstRep},${formatWeight(firstWeight)}`;
  }

  // Varied sets: 10,80;8,90;6,100
  return repsArray.map((r, i) => {
    const rep = r || 10;
    const weight = weightsArray[i] || 0;
    if (weight === 0) {
      return `${rep}`;
    }
    return `${rep},${formatWeight(weight)}`;
  }).join(';');
};

/**
 * Format weight value (remove trailing zeros after decimal)
 */
const formatWeight = (weight) => {
  if (Number.isInteger(weight)) {
    return String(weight);
  }
  // Remove trailing zeros
  return String(parseFloat(weight.toFixed(2)));
};

/**
 * Decode a compact string back into a routine object
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

      // Parse exercises: (id|setsData)
      const exerciseMatches = dayContent.match(/\((\d+)\|([^)]+)\)/g);
      const exercises = exerciseMatches ? exerciseMatches.map(exStr => {
        // Remove parentheses and parse
        const inner = exStr.slice(1, -1);
        const [numericIdStr, setsData] = inner.split('|');
        const numericId = parseInt(numericIdStr);
        const exerciseId = getExerciseId(numericId);

        if (!exerciseId) {
          console.warn(`Unknown numeric exercise ID: ${numericId}`);
          return null;
        }

        const { sets, reps, weights } = decodeSets(setsData);

        return {
          exerciseId,
          sets,
          reps,
          weights,
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
 * @param {string} setsData - Encoded sets string
 * @returns {Object} Object with sets, reps, and weights arrays
 */
const decodeSets = (setsData) => {
  // Check for shorthand: 3x10,80 or 3x10
  const shorthandMatch = setsData.match(/^(\d+)x(\d+)(?:,([0-9.]+))?$/);
  if (shorthandMatch) {
    const setCount = parseInt(shorthandMatch[1]);
    const rep = parseInt(shorthandMatch[2]);
    const weight = shorthandMatch[3] ? parseFloat(shorthandMatch[3]) : 0;

    return {
      sets: setCount,
      reps: Array(setCount).fill(rep),
      weights: Array(setCount).fill(weight),
    };
  }

  // Varied sets: 10,80;8,90;6,100 or 10;8;6 (bodyweight)
  const setStrings = setsData.split(';');
  const reps = [];
  const weights = [];

  setStrings.forEach(setStr => {
    const parts = setStr.split(',');
    reps.push(parseInt(parts[0]) || 10);
    weights.push(parts[1] ? parseFloat(parts[1]) : 0);
  });

  return {
    sets: setStrings.length,
    reps,
    weights,
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

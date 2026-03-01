// Routine encoder/decoder for QR code sharing
// v1 format (legacy): v1[restSets,restEx(exerciseId|setsData)...][day2]...
// v2 format: obfuscated structural symbols + hex exercise IDs
// NOTE: Weights are NOT included in QR codes - each user sets their own weights.

import { getNumericId, getExerciseId } from '../data/exerciseIds';

// --- v2 obfuscation tables ---
// Structural symbols → random letter choices (disjoint from hex a-f and reserved v/s/E)
const SYMBOL_TO_LETTERS = {
  '[': ['g', 'h'],
  ']': ['i', 'j'],
  '(': ['k', 'l'],
  ')': ['m', 'n'],
  '|': ['o', 'p'],
  ',': ['q', 'r'],
  ';': ['t', 'u'],
  'x': ['w', 'y', 'z'],
};

// Reverse lookup: letter → symbol
const LETTER_TO_SYMBOL = {};
for (const [symbol, letters] of Object.entries(SYMBOL_TO_LETTERS)) {
  for (const letter of letters) {
    LETTER_TO_SYMBOL[letter] = symbol;
  }
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const obfuscate = (str) =>
  str.replace(/[\[\]()|,;x]/g, ch => pick(SYMBOL_TO_LETTERS[ch]));

const deobfuscate = (str) =>
  str.replace(/[ghijklmnopqrtuwyz]/g, ch => LETTER_TO_SYMBOL[ch] || ch);

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
      return `${restSets},${restEx}`;
    }

    const encodedExercises = day.exercises.map(ex => {
      const numericId = getNumericId(ex.exerciseId);
      if (!numericId) {
        console.warn(`Unknown exercise ID: ${ex.exerciseId}`);
        return null;
      }

      const setsData = encodeSets(ex.sets, ex.reps);
      const supersetPart = ex.supersetGroup ? `|s${ex.supersetGroup}` : '';
      // Hex ID
      return `(${numericId.toString(16)}|${setsData}${supersetPart})`;
    }).filter(Boolean).join('');

    return `${restSets},${restEx}${encodedExercises}`;
  });

  // Build structural string, then obfuscate symbols
  const raw = `[${encodedDays.join('][')}]`;
  return `v2${obfuscate(raw)}`;
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

  const firstRep = repsArray[0] || 10;
  const allIdentical = repsArray.every(r => (r || 10) === firstRep);

  if (allIdentical) {
    return `${setCount}x${firstRep}`;
  }

  return repsArray.map(r => r || 10).join(';');
};

/**
 * Decode a compact string back into a routine object
 * Supports both v1 (legacy) and v2 (obfuscated) formats.
 * @param {string} code - The encoded string
 * @returns {Object|null} Decoded routine object, or null if invalid
 */
export const decodeRoutine = (code) => {
  if (!code || typeof code !== 'string') {
    return null;
  }

  let content;
  let idRadix;

  if (code.startsWith('v2')) {
    // v2: deobfuscate letters → symbols, hex IDs
    content = deobfuscate(code.slice(2));
    idRadix = 16;
  } else if (code.startsWith('v1')) {
    // v1 legacy: plain symbols, decimal IDs
    content = code.slice(2);
    idRadix = 10;
  } else {
    console.warn('Unknown format version');
    return null;
  }

  try {
    const dayMatches = content.match(/\[([^\]]*)\]/g);
    if (!dayMatches || dayMatches.length === 0) {
      return null;
    }

    let restBetweenSets = 60;
    let restBetweenExercises = 90;

    // Exercise ID regex: hex chars for v2, digits for v1
    const idPattern = idRadix === 16 ? '[0-9a-fA-F]+' : '\\d+';

    const days = dayMatches.map((dayStr, index) => {
      const dayContent = dayStr.slice(1, -1);

      const restMatch = dayContent.match(/^(\d+),(\d+)/);
      if (restMatch) {
        restBetweenSets = parseInt(restMatch[1]);
        restBetweenExercises = parseInt(restMatch[2]);
      }

      const exRegex = new RegExp(`\\((${idPattern})\\|([^)]+)\\)`, 'g');
      const exercises = [];
      let exMatch;
      while ((exMatch = exRegex.exec(dayContent)) !== null) {
        const numericId = parseInt(exMatch[1], idRadix);
        const innerAfterId = exMatch[2];
        const parts = innerAfterId.split('|');
        const setsData = parts[0];
        const exerciseId = getExerciseId(numericId);

        if (!exerciseId) {
          console.warn(`Unknown numeric exercise ID: ${numericId}`);
          continue;
        }

        const { sets, reps, weights } = decodeSets(setsData);

        let supersetGroup = null;
        if (parts[1] && parts[1].startsWith('s')) {
          supersetGroup = parseInt(parts[1].slice(1)) || null;
        }

        exercises.push({ exerciseId, sets, reps, weights, supersetGroup });
      }

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

  if (code.startsWith('v2')) {
    // Deobfuscate and check structure
    const content = deobfuscate(code.slice(2));
    const dayMatches = content.match(/\[([^\]]*)\]/g);
    return !!(dayMatches && dayMatches.length > 0);
  }

  if (code.startsWith('v1')) {
    const dayMatches = code.slice(2).match(/\[([^\]]*)\]/g);
    return !!(dayMatches && dayMatches.length > 0);
  }

  return false;
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

// Unit conversion utilities for metric/imperial support

// Conversion constants
export const UNIT_CONVERSIONS = {
  // Weight
  LB_TO_KG: 0.453592,
  KG_TO_LB: 2.20462,

  // Height
  INCH_TO_CM: 2.54,
  CM_TO_INCH: 0.393701,
};

// Weight conversions
export const lbToKg = (lb) => lb * UNIT_CONVERSIONS.LB_TO_KG;
export const kgToLb = (kg) => kg * UNIT_CONVERSIONS.KG_TO_LB;

// Height conversions
export const inchesToCm = (inches) => inches * UNIT_CONVERSIONS.INCH_TO_CM;
export const cmToInches = (cm) => cm * UNIT_CONVERSIONS.CM_TO_INCH;

// Feet + inches to total inches
export const feetInchesToTotalInches = (feet, inches) => (feet * 12) + inches;

// Total inches to feet + inches object
export const totalInchesToFeetInches = (totalInches) => {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

// Feet + inches to cm
export const feetInchesToCm = (feet, inches) => {
  const totalInches = feetInchesToTotalInches(feet, inches);
  return inchesToCm(totalInches);
};

// Cm to feet + inches object
export const cmToFeetInches = (cm) => {
  const totalInches = cmToInches(cm);
  return totalInchesToFeetInches(totalInches);
};

// Format weight for display (removes trailing zeros)
export const formatWeightDisplay = (weight, decimals = 1) => {
  if (weight === 0) return '0';
  const formatted = parseFloat(weight.toFixed(decimals));
  return String(formatted);
};

// Round weight to appropriate increment for each system
export const roundWeight = (weight, system) => {
  if (system === 'imperial') {
    // Round to nearest 0.5 lbs
    return Math.round(weight * 2) / 2;
  }
  // Round to nearest 0.25 kg
  return Math.round(weight * 4) / 4;
};

// Get weight increment for +/- buttons
export const getWeightIncrement = (system) => {
  return system === 'imperial' ? 1 : 1; // 1 lb or 1 kg
};

export const getSmallWeightIncrement = (system) => {
  return system === 'imperial' ? 0.5 : 0.25; // 0.5 lb or 0.25 kg
};

// Convert routine weights between systems
export const convertRoutineWeights = (routine, fromSystem, toSystem) => {
  if (fromSystem === toSystem) return routine;

  const convertFn = fromSystem === 'imperial' ? lbToKg : kgToLb;

  return {
    ...routine,
    days: routine.days.map(day => ({
      ...day,
      exercises: day.exercises.map(ex => ({
        ...ex,
        weights: ex.weights.map(w => {
          const converted = convertFn(w);
          // Round to nearest integer (precision doesn't matter for weights)
          return Math.round(converted);
        }),
      })),
    })),
  };
};

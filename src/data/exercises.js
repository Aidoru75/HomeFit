// 50 Essential Exercises - Bilingual (English/Spanish)

export const muscleGroups = [
  { id: 'chest', name: { en: 'Chest', es: 'Pecho' }, icon: '🫁' },
  { id: 'back', name: { en: 'Back', es: 'Espalda' }, icon: '🔙' },
  { id: 'shoulders', name: { en: 'Shoulders', es: 'Hombros' }, icon: '💪' },
  { id: 'biceps', name: { en: 'Biceps', es: 'Bíceps' }, icon: '💪' },
  { id: 'triceps', name: { en: 'Triceps', es: 'Tríceps' }, icon: '💪' },
  { id: 'quads', name: { en: 'Quadriceps', es: 'Cuádriceps' }, icon: '🦵' },
  { id: 'hamstrings', name: { en: 'Hamstrings', es: 'Isquiotibiales' }, icon: '🦵' },
  { id: 'glutes', name: { en: 'Glutes', es: 'Glúteos' }, icon: '🍑' },
  { id: 'calves', name: { en: 'Calves', es: 'Gemelos' }, icon: '🦵' },
  { id: 'core', name: { en: 'Core', es: 'Core' }, icon: '🎯' },
];

export const exercises = [
  // CHEST (5)
  {
    id: 'bench_press',
    name: { en: 'Barbell Bench Press', es: 'Press de Banca con Barra' },
    muscleGroup: 'chest',
    equipment: ['straight_bar', 'bench', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Classic chest builder. Lie flat, lower bar to chest, press up.',
      es: 'Clásico constructor de pecho. Acostado, baja la barra al pecho, empuja hacia arriba.',
    },
  },
  {
    id: 'incline_press',
    name: { en: 'Barbell Incline Press', es: 'Press Inclinado con Barra' },
    muscleGroup: 'chest',
    equipment: ['straight_bar', 'bench', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Upper chest focus. Bench at 30-45° incline.',
      es: 'Enfoque en pecho superior. Banco a 30-45° de inclinación.',
    },
  },
  {
    id: 'dumbbell_flyes',
    name: { en: 'Dumbbell Flyes', es: 'Aperturas con Mancuernas' },
    muscleGroup: 'chest',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Chest isolation. Arms wide, slight bend in elbows, squeeze together.',
      es: 'Aislamiento de pecho. Brazos abiertos, ligera flexión de codos, aprieta.',
    },
  },
  {
    id: 'cable_crossover',
    name: { en: 'Cable Crossover (High)', es: 'Cruce de Cables (Alto)' },
    muscleGroup: 'chest',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'High pulley chest isolation. Pull handles down and together.',
      es: 'Aislamiento de pecho con polea alta. Tira las manijas hacia abajo y júntalas.',
    },
  },
  {
    id: 'pec_deck',
    name: { en: 'Pec Deck / Butterfly', es: 'Pec Deck / Mariposa' },
    muscleGroup: 'chest',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'Machine chest isolation. Squeeze arms together in front.',
      es: 'Aislamiento de pecho en máquina. Junta los brazos al frente.',
    },
  },

  // BACK (7)
  {
    id: 'pullups',
    name: { en: 'Pull-Ups', es: 'Dominadas' },
    muscleGroup: 'back',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'King of back exercises. Wide grip, pull chin over bar.',
      es: 'Rey de los ejercicios de espalda. Agarre ancho, sube la barbilla sobre la barra.',
    },
  },
  {
    id: 'lat_pulldown',
    name: { en: 'Lat Pulldown (Wide)', es: 'Jalón al Pecho (Ancho)' },
    muscleGroup: 'back',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'Lat builder. Pull bar to upper chest, squeeze lats.',
      es: 'Constructor de dorsales. Tira la barra al pecho superior, aprieta los dorsales.',
    },
  },
  {
    id: 'seated_cable_row',
    name: { en: 'Seated Cable Row', es: 'Remo Sentado en Polea' },
    muscleGroup: 'back',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'Mid-back thickness. Pull handle to abdomen, squeeze shoulder blades.',
      es: 'Grosor de espalda media. Tira el agarre al abdomen, aprieta las escápulas.',
    },
  },
  {
    id: 'face_pulls',
    name: { en: 'Face Pulls', es: 'Tirón a la Cara' },
    muscleGroup: 'back',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'Rear delts and upper back. Pull rope to face, elbows high.',
      es: 'Deltoides posterior y espalda alta. Tira la cuerda a la cara, codos altos.',
    },
  },
  {
    id: 'barbell_row',
    name: { en: 'Barbell Bent-Over Row', es: 'Remo con Barra Inclinado' },
    muscleGroup: 'back',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Back mass builder. Hinge forward, pull bar to lower chest.',
      es: 'Constructor de masa de espalda. Inclínate, tira la barra al pecho bajo.',
    },
  },
  {
    id: 'dumbbell_row',
    name: { en: 'Dumbbell Single-Arm Row', es: 'Remo con Mancuerna a Una Mano' },
    muscleGroup: 'back',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Unilateral back work. One hand on bench, row to hip.',
      es: 'Trabajo unilateral de espalda. Una mano en el banco, rema hacia la cadera.',
    },
  },
  {
    id: 'deadlift',
    name: { en: 'Deadlift', es: 'Peso Muerto' },
    muscleGroup: 'back',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Full body pull. Hinge at hips, keep back straight, stand up.',
      es: 'Tirón de cuerpo completo. Bisagra en caderas, espalda recta, ponte de pie.',
    },
  },

  // SHOULDERS (5)
  {
    id: 'overhead_press',
    name: { en: 'Barbell Overhead Press', es: 'Press Militar con Barra' },
    muscleGroup: 'shoulders',
    equipment: ['straight_bar', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Shoulder strength. Press bar from shoulders to overhead.',
      es: 'Fuerza de hombros. Empuja la barra desde los hombros hacia arriba.',
    },
  },
  {
    id: 'db_shoulder_press',
    name: { en: 'Dumbbell Shoulder Press', es: 'Press de Hombros con Mancuernas' },
    muscleGroup: 'shoulders',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Seated or standing. Press dumbbells from shoulders up.',
      es: 'Sentado o de pie. Empuja las mancuernas desde los hombros hacia arriba.',
    },
  },
  {
    id: 'lateral_raise',
    name: { en: 'Dumbbell Lateral Raise', es: 'Elevaciones Laterales con Mancuernas' },
    muscleGroup: 'shoulders',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Side delt isolation. Raise arms to sides, slight bend in elbows.',
      es: 'Aislamiento de deltoides lateral. Eleva los brazos a los lados, ligera flexión.',
    },
  },
  {
    id: 'rear_delt_fly',
    name: { en: 'Dumbbell Rear Delt Fly', es: 'Aperturas Posteriores con Mancuernas' },
    muscleGroup: 'shoulders',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Rear delt isolation. Bent over, raise arms to sides.',
      es: 'Aislamiento de deltoides posterior. Inclinado, eleva los brazos a los lados.',
    },
  },
  {
    id: 'cable_lateral_raise',
    name: { en: 'Cable Lateral Raise', es: 'Elevación Lateral en Polea' },
    muscleGroup: 'shoulders',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'Constant tension lateral raise. Low pulley, raise to side.',
      es: 'Elevación lateral con tensión constante. Polea baja, eleva al lado.',
    },
  },

  // BICEPS (5)
  {
    id: 'barbell_curl',
    name: { en: 'Barbell Curl', es: 'Curl con Barra' },
    muscleGroup: 'biceps',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Classic bicep builder. Curl bar from thighs to shoulders.',
      es: 'Clásico constructor de bíceps. Curl desde los muslos hasta los hombros.',
    },
  },
  {
    id: 'ez_bar_curl',
    name: { en: 'EZ Bar Curl', es: 'Curl con Barra Z' },
    muscleGroup: 'biceps',
    equipment: ['ez_bar'],
    weightType: 'barbell',
    description: {
      en: 'Wrist-friendly curls. Angled grip reduces strain.',
      es: 'Curls amigables con la muñeca. El agarre angular reduce la tensión.',
    },
  },
  {
    id: 'preacher_curl',
    name: { en: 'EZ Bar Preacher Curl', es: 'Curl en Banco Scott con Barra Z' },
    muscleGroup: 'biceps',
    equipment: ['ez_bar', 'multigym'],
    weightType: 'barbell',
    description: {
      en: 'Strict bicep isolation. Arms on preacher pad, curl up.',
      es: 'Aislamiento estricto de bíceps. Brazos en el banco Scott, haz curl.',
    },
  },
  {
    id: 'hammer_curl',
    name: { en: 'Dumbbell Hammer Curl', es: 'Curl Martillo con Mancuernas' },
    muscleGroup: 'biceps',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Biceps and forearms. Neutral grip curl.',
      es: 'Bíceps y antebrazos. Curl con agarre neutro.',
    },
  },
  {
    id: 'cable_curl',
    name: { en: 'Cable Curl (Rope)', es: 'Curl en Polea (Cuerda)' },
    muscleGroup: 'biceps',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'Constant tension curls. Low pulley with rope attachment.',
      es: 'Curls con tensión constante. Polea baja con accesorio de cuerda.',
    },
  },

  // TRICEPS (5)
  {
    id: 'close_grip_bench',
    name: { en: 'Close-Grip Bench Press', es: 'Press de Banca Agarre Cerrado' },
    muscleGroup: 'triceps',
    equipment: ['straight_bar', 'bench', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Tricep mass builder. Narrow grip bench press.',
      es: 'Constructor de masa de tríceps. Press de banca con agarre cerrado.',
    },
  },
  {
    id: 'skull_crushers',
    name: { en: 'Barbell Skull Crushers', es: 'Rompecráneos con Barra' },
    muscleGroup: 'triceps',
    equipment: ['ez_bar', 'bench'],
    weightType: 'barbell',
    description: {
      en: 'Lying tricep extension. Lower bar to forehead, extend up.',
      es: 'Extensión de tríceps acostado. Baja la barra a la frente, extiende.',
    },
  },
  {
    id: 'rope_pushdown',
    name: { en: 'Cable Pushdown (Rope)', es: 'Empuje en Polea (Cuerda)' },
    muscleGroup: 'triceps',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'Tricep isolation. High pulley, push rope down, spread at bottom.',
      es: 'Aislamiento de tríceps. Polea alta, empuja la cuerda, separa abajo.',
    },
  },
  {
    id: 'db_french_press',
    name: { en: 'Dumbbell French press', es: 'French press con mancuerna' },
    muscleGroup: 'triceps',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'Long head tricep focus. Extend overhead.',
      es: 'Enfoque en cabeza larga del tríceps. Extiende sobre la cabeza.',
    },
  },
  {
    id: 'dips',
    name: { en: 'Dips (Tricep Focus)', es: 'Fondos (Enfoque Tríceps)' },
    muscleGroup: 'triceps',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Compound tricep builder. Upright torso, elbows back.',
      es: 'Constructor compuesto de tríceps. Torso erguido, codos hacia atrás.',
    },
  },

  // QUADRICEPS (6)
  {
    id: 'back_squat',
    name: { en: 'Barbell Back Squat', es: 'Sentadilla con Barra' },
    muscleGroup: 'quads',
    equipment: ['straight_bar', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'King of leg exercises. Bar on upper back, squat deep.',
      es: 'Rey de los ejercicios de pierna. Barra en espalda alta, sentadilla profunda.',
    },
  },
  {
    id: 'front_squat',
    name: { en: 'Barbell Front Squat', es: 'Sentadilla Frontal con Barra' },
    muscleGroup: 'quads',
    equipment: ['straight_bar', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Quad-dominant squat. Bar on front delts, upright torso.',
      es: 'Sentadilla dominante de cuádriceps. Barra en deltoides frontales, torso erguido.',
    },
  },
  {
    id: 'goblet_squat',
    name: { en: 'Goblet Squat', es: 'Sentadilla Goblet' },
    muscleGroup: 'quads',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Beginner-friendly squat. Hold dumbbell at chest.',
      es: 'Sentadilla para principiantes. Sostén la mancuerna en el pecho.',
    },
  },
  {
    id: 'lunges',
    name: { en: 'Dumbbell Lunges', es: 'Zancadas con Mancuernas' },
    muscleGroup: 'quads',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Unilateral leg work. Step forward, lower back knee.',
      es: 'Trabajo unilateral de pierna. Da un paso, baja la rodilla trasera.',
    },
  },
  {
    id: 'bulgarian_split_squat',
    name: { en: 'Bulgarian Split Squat', es: 'Sentadilla Búlgara' },
    muscleGroup: 'quads',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Single leg squat. Rear foot elevated on bench.',
      es: 'Sentadilla a una pierna. Pie trasero elevado en el banco.',
    },
  },
  {
    id: 'leg_extension',
    name: { en: 'Leg Extension', es: 'Extensión de Piernas' },
    muscleGroup: 'quads',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'Quad isolation. Extend legs against resistance.',
      es: 'Aislamiento de cuádriceps. Extiende las piernas contra resistencia.',
    },
  },

  // HAMSTRINGS (4)
  {
    id: 'romanian_deadlift',
    name: { en: 'Romanian Deadlift', es: 'Peso Muerto Rumano' },
    muscleGroup: 'hamstrings',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Hamstring stretch and strength. Hinge with slight knee bend.',
      es: 'Estiramiento y fuerza de isquiotibiales. Bisagra con ligera flexión de rodilla.',
    },
  },
  {
    id: 'lying_leg_curl',
    name: { en: 'Lying Leg Curl', es: 'Curl de Piernas Acostado' },
    muscleGroup: 'hamstrings',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'Hamstring isolation. Curl heels to glutes.',
      es: 'Aislamiento de isquiotibiales. Lleva los talones a los glúteos.',
    },
  },
  {
    id: 'good_mornings',
    name: { en: 'Good Mornings', es: 'Buenos Días' },
    muscleGroup: 'hamstrings',
    equipment: ['straight_bar', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Posterior chain. Bar on back, hinge forward.',
      es: 'Cadena posterior. Barra en la espalda, inclínate hacia adelante.',
    },
  },
  {
    id: 'cable_pull_through',
    name: { en: 'Cable Pull-Through', es: 'Tirón de Cable entre Piernas' },
    muscleGroup: 'hamstrings',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'Hip hinge pattern. Low pulley between legs, thrust forward.',
      es: 'Patrón de bisagra de cadera. Polea baja entre piernas, empuja hacia adelante.',
    },
  },

  // GLUTES (4)
  {
    id: 'hip_thrust',
    name: { en: 'Barbell Hip Thrust', es: 'Empuje de Cadera con Barra' },
    muscleGroup: 'glutes',
    equipment: ['straight_bar', 'bench'],
    weightType: 'barbell',
    description: {
      en: 'Best glute builder. Back on bench, thrust hips up.',
      es: 'Mejor constructor de glúteos. Espalda en banco, empuja las caderas hacia arriba.',
    },
  },
  {
    id: 'cable_kickback',
    name: { en: 'Cable Kickback', es: 'Patada Trasera en Polea' },
    muscleGroup: 'glutes',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'Glute isolation. Ankle strap, kick leg back.',
      es: 'Aislamiento de glúteos. Correa de tobillo, patea la pierna hacia atrás.',
    },
  },
  {
    id: 'sumo_deadlift',
    name: { en: 'Sumo Deadlift', es: 'Peso Muerto Sumo' },
    muscleGroup: 'glutes',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Wide stance deadlift. More glute and adductor focus.',
      es: 'Peso muerto con postura ancha. Más enfoque en glúteos y aductores.',
    },
  },
  {
    id: 'glute_bridge',
    name: { en: 'Glute Bridge', es: 'Puente de Glúteos' },
    muscleGroup: 'glutes',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Floor-based hip thrust. Shoulders on floor, bridge up.',
      es: 'Empuje de cadera en el suelo. Hombros en el suelo, eleva en puente.',
    },
  },

  // CALVES (2)
  {
    id: 'standing_calf_raise',
    name: { en: 'Standing Calf Raise', es: 'Elevación de Talones de Pie' },
    muscleGroup: 'calves',
    equipment: ['straight_bar', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Calf builder. Rise onto toes, squeeze at top.',
      es: 'Constructor de gemelos. Elévate sobre los dedos, aprieta arriba.',
    },
  },
  {
    id: 'seated_calf_raise',
    name: { en: 'Seated Calf Raise', es: 'Elevación de Talones Sentado' },
    muscleGroup: 'calves',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Soleus focus. Seated, weight on knees, raise heels.',
      es: 'Enfoque en sóleo. Sentado, peso en rodillas, eleva los talones.',
    },
  },

  // CORE (7)
  {
    id: 'hanging_leg_raise',
    name: { en: 'Hanging Leg Raise', es: 'Elevación de Piernas Colgado' },
    muscleGroup: 'core',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Lower ab focus. Hang from bar, raise legs.',
      es: 'Enfoque en abdominales bajos. Cuélgate de la barra, eleva las piernas.',
    },
  },
  {
    id: 'cable_crunch',
    name: { en: 'Cable Crunch', es: 'Crunch en Polea' },
    muscleGroup: 'core',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'Weighted abs. Kneel, crunch down against resistance.',
      es: 'Abdominales con peso. Arrodillado, crunch contra resistencia.',
    },
  },
  {
    id: 'cable_woodchop',
    name: { en: 'Cable Woodchop', es: 'Leñador en Polea' },
    muscleGroup: 'core',
    equipment: ['multigym'],
    weightType: 'machine',
    description: {
      en: 'Rotational core. Pull cable diagonally across body.',
      es: 'Core rotacional. Tira el cable diagonalmente a través del cuerpo.',
    },
  },
  {
    id: 'plank',
    name: { en: 'Plank', es: 'Plancha' },
    muscleGroup: 'core',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Core stability. Hold push-up position on forearms.',
      es: 'Estabilidad del core. Mantén posición de flexión sobre antebrazos.',
    },
  },
  {
    id: 'russian_twist',
    name: { en: 'Russian Twist', es: 'Giro Ruso' },
    muscleGroup: 'core',
    equipment: ['plates'],
    weightType: 'plate',
    description: {
      en: 'Oblique work. Seated, rotate torso side to side.',
      es: 'Trabajo de oblicuos. Sentado, rota el torso de lado a lado.',
    },
  },
  {
    id: 'ab_rollout',
    name: { en: 'Ab Rollout', es: 'Rueda Abdominal' },
    muscleGroup: 'core',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Advanced core. Roll barbell out and back.',
      es: 'Core avanzado. Rueda la barra hacia adelante y atrás.',
    },
  },
  {
    id: 'hyperextension',
    name: { en: 'Hyperextension', es: 'Hiperextensión' },
    muscleGroup: 'core',
    equipment: ['bench'],
    weightType: 'bodyweight',
    description: {
      en: 'Lower back. Face down on decline bench, extend up.',
      es: 'Espalda baja. Boca abajo en banco declinado, extiende hacia arriba.',
    },
  },
];

// Helper: Get exercises by muscle group
export const getExercisesByMuscle = (muscleId) => {
  return exercises.filter(ex => ex.muscleGroup === muscleId);
};

// Helper: Get exercise by ID
export const getExerciseById = (id) => {
  return exercises.find(ex => ex.id === id);
};

// Helper: Get muscle group by ID
export const getMuscleGroupById = (id) => {
  return muscleGroups.find(mg => mg.id === id);
};

// Helper: Get localized exercise name
export const getExerciseName = (exercise, lang = 'en') => {
  if (!exercise) return '';
  return exercise.name[lang] || exercise.name.en;
};

// Helper: Get localized muscle group name
export const getMuscleGroupName = (muscleGroup, lang = 'en') => {
  if (!muscleGroup) return '';
  if (typeof muscleGroup === 'string') {
    const mg = getMuscleGroupById(muscleGroup);
    return mg ? mg.name[lang] || mg.name.en : muscleGroup;
  }
  return muscleGroup.name[lang] || muscleGroup.name.en;
};

// Helper: Get localized description
export const getExerciseDescription = (exercise, lang = 'en') => {
  if (!exercise) return '';
  return exercise.description[lang] || exercise.description.en;
};

// 199 Exercises - Complete Catalog - Bilingual (English/Spanish)

export const muscleGroups = [
  { id: 'chest', name: { en: 'Chest', es: 'Pecho' }, icon: '🫁' },
  { id: 'back', name: { en: 'Back', es: 'Espalda' }, icon: '🔙' },
  { id: 'shoulders', name: { en: 'Shoulders', es: 'Hombros' }, icon: '💪' },
  { id: 'biceps', name: { en: 'Biceps', es: 'Bíceps' }, icon: '💪' },
  { id: 'triceps', name: { en: 'Triceps', es: 'Tríceps' }, icon: '💪' },
  { id: 'forearms', name: { en: 'Forearms', es: 'Antebrazos' }, icon: '💪' },
  { id: 'quads', name: { en: 'Quadriceps', es: 'Cuádriceps' }, icon: '🦵' },
  { id: 'hamstrings', name: { en: 'Hamstrings', es: 'Isquiotibiales' }, icon: '🦵' },
  { id: 'glutes', name: { en: 'Glutes', es: 'Glúteos' }, icon: '🍑' },
  { id: 'calves', name: { en: 'Calves', es: 'Gemelos' }, icon: '🦵' },
  { id: 'core', name: { en: 'Core', es: 'Core' }, icon: '🎯' },
];

export const exercises = [
  // ============================================
  // CHEST
  // ============================================
  {
    id: 'bench_press',
    name: { en: 'Barbell Bench Press', es: 'Press de Banca con Barra' },
    muscleGroup: 'chest',
    equipment: ['straight_bar', 'bench', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'The king of chest exercises. Lie flat on a bench, grip the bar slightly wider than shoulder-width, lower it to mid-chest, then press up powerfully while keeping your feet firmly planted.',
      es: 'El rey de los ejercicios de pecho. Acuéstate en un banco, agarra la barra un poco más ancho que los hombros, bájala al pecho medio, luego empuja con fuerza manteniendo los pies firmes.',
    },
  },
  {
    id: 'incline_press',
    name: { en: 'Barbell Incline Press', es: 'Press Inclinado con Barra' },
    muscleGroup: 'chest',
    equipment: ['straight_bar', 'bench', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Targets the upper chest with the bench set at 30-45 degrees. Lower the bar to your upper chest just below the collarbone, then press up while maintaining tight shoulder blades.',
      es: 'Trabaja el pecho superior con el banco a 30-45 grados. Baja la barra al pecho superior justo debajo de la clavícula, luego empuja manteniendo las escápulas apretadas.',
    },
  },
  {
    id: 'decline_press',
    name: { en: 'Barbell Decline Press', es: 'Press Declinado con Barra' },
    muscleGroup: 'chest',
    equipment: ['straight_bar', 'bench', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Emphasizes the lower chest fibers with the bench declined 15-30 degrees. Secure your legs, lower the bar to your lower chest, then press up maintaining control throughout.',
      es: 'Enfatiza las fibras inferiores del pecho con el banco declinado 15-30 grados. Asegura las piernas, baja la barra al pecho bajo, luego empuja manteniendo control.',
    },
  },
  {
    id: 'db_bench_press',
    name: { en: 'Dumbbell Bench Press', es: 'Press de Banca con Mancuernas' },
    muscleGroup: 'chest',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Allows greater range of motion than barbell. Press dumbbells from chest level with palms facing forward, bring them together at the top, then lower with control for a deep stretch.',
      es: 'Permite mayor rango de movimiento que la barra. Empuja las mancuernas desde el pecho con palmas al frente, júntalas arriba, luego baja con control para un estiramiento profundo.',
    },
  },
  {
    id: 'db_incline_press',
    name: { en: 'Dumbbell Incline Press', es: 'Press Inclinado con Mancuernas' },
    muscleGroup: 'chest',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Develops the upper chest with independent arm movement. Set bench at 30-45 degrees, press dumbbells up and slightly inward, squeezing at the top before lowering.',
      es: 'Desarrolla el pecho superior con movimiento independiente de brazos. Banco a 30-45 grados, empuja las mancuernas arriba y ligeramente adentro, apretando arriba antes de bajar.',
    },
  },
  {
    id: 'db_decline_press',
    name: { en: 'Dumbbell Decline Press', es: 'Press Declinado con Mancuernas' },
    muscleGroup: 'chest',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Targets lower chest with dumbbells for balanced development. On a declined bench, press dumbbells up while keeping elbows at 45 degrees, focus on squeezing the chest at the top.',
      es: 'Trabaja el pecho inferior con mancuernas para desarrollo equilibrado. En banco declinado, empuja las mancuernas manteniendo codos a 45 grados, enfócate en apretar el pecho arriba.',
    },
  },
  {
    id: 'dumbbell_flyes',
    name: { en: 'Dumbbell Flyes', es: 'Aperturas con Mancuernas' },
    muscleGroup: 'chest',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Isolation exercise for chest stretch and contraction. With a slight elbow bend, lower dumbbells in a wide arc until you feel a stretch, then squeeze them back together over your chest.',
      es: 'Ejercicio de aislamiento para estirar y contraer el pecho. Con codos ligeramente flexionados, baja las mancuernas en arco amplio hasta sentir estiramiento, luego apriétalas sobre el pecho.',
    },
  },
  {
    id: 'incline_dumbbell_flyes',
    name: { en: 'Incline Dumbbell Flyes', es: 'Aperturas Inclinadas con Mancuernas' },
    muscleGroup: 'chest',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Isolates the upper chest with a stretching motion. On an inclined bench, open arms wide with slight elbow bend, feel the upper chest stretch, then bring dumbbells together.',
      es: 'Aísla el pecho superior con movimiento de estiramiento. En banco inclinado, abre los brazos con codos ligeramente flexionados, siente el estiramiento del pecho superior, luego junta las mancuernas.',
    },
  },
  {
    id: 'decline_dumbbell_flyes',
    name: { en: 'Decline Dumbbell Flyes', es: 'Aperturas Declinadas con Mancuernas' },
    muscleGroup: 'chest',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Focuses on lower chest fibers through isolation. On a declined bench, perform the fly motion with controlled tempo, emphasizing the stretch at the bottom and squeeze at the top.',
      es: 'Se enfoca en las fibras inferiores del pecho mediante aislamiento. En banco declinado, realiza el movimiento de apertura con tempo controlado, enfatizando el estiramiento abajo y contracción arriba.',
    },
  },
  {
    id: 'cable_crossover_high',
    name: { en: 'Cable Crossover (High)', es: 'Cruce de Cables (Alto)' },
    muscleGroup: 'chest',
    equipment: ['high_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Constant tension chest isolation from high pulleys. Step forward, pull handles down and across your body in an arc, crossing at the bottom while squeezing your lower chest intensely.',
      es: 'Aislamiento de pecho con tensión constante desde poleas altas. Da un paso adelante, tira los mangos hacia abajo y cruza en arco, cruzando abajo mientras aprietas intensamente el pecho inferior.',
    },
  },
  {
    id: 'cable_crossover_low',
    name: { en: 'Cable Crossover (Low to High)', es: 'Cruce de Cables (Bajo a Alto)' },
    muscleGroup: 'chest',
    equipment: ['low_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Targets upper chest with upward cable motion. From low pulleys, bring handles up and together in front of your face, focusing on contracting the upper chest fibers throughout.',
      es: 'Trabaja el pecho superior con movimiento de cable ascendente. Desde poleas bajas, lleva los mangos arriba y júntalos frente a la cara, enfocándote en contraer las fibras del pecho superior.',
    },
  },
  {
    id: 'cable_flyes_mid',
    name: { en: 'Cable Flyes (Mid)', es: 'Aperturas en Polea (Media)' },
    muscleGroup: 'chest',
    equipment: ['mid_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Mid-level cable fly for overall chest development. With pulleys at chest height, bring handles together in front maintaining slight elbow bend, squeezing hard at the center.',
      es: 'Apertura con polea media para desarrollo general del pecho. Con poleas a altura del pecho, junta los mangos al frente manteniendo codos ligeramente flexionados, apretando fuerte en el centro.',
    },
  },
  {
    id: 'pec_deck',
    name: { en: 'Pec Deck / Butterfly', es: 'Pec Deck / Mariposa' },
    muscleGroup: 'chest',
    equipment: ['pec_deck_station'],
    weightType: 'machine',
    description: {
      en: 'Machine-based chest isolation with guided movement path. Sit with back flat, bring padded arms together in front of your chest, hold the squeeze for a second, then return with control.',
      es: 'Aislamiento de pecho en máquina con trayectoria guiada. Siéntate con espalda plana, junta los brazos acolchados frente al pecho, mantén la contracción un segundo, luego regresa con control.',
    },
  },
  {
    id: 'chest_press',
    name: { en: 'Chest Press', es: 'Press de Pecho' },
    muscleGroup: 'chest',
    equipment: ['pec_deck_station'],
    weightType: 'machine',
    description: {
      en: 'Sit on the chest press machine, back flat, feet firm. Grip handles at chest height, elbows bent 90°. Exhale, press forward smoothly to near-straight arms, squeezing chest. Inhale, return slowly with control.',
      es: 'Siéntate en la máquina de press de pecho, espalda plana, pies firmes. Agarra las manijas a la altura del pecho, codos en 90°. Exhala, empuja hacia adelante hasta casi extender brazos, apretando pecho. Inhala, regresa lento con control.',
    },
  },
  {
    id: 'push_ups',
    name: { en: 'Push-Ups', es: 'Flexiones' },
    muscleGroup: 'chest',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Fundamental bodyweight chest exercise. Hands shoulder-width apart, lower your body until chest nearly touches the ground, then push up while keeping core tight and body in a straight line.',
      es: 'Ejercicio fundamental de pecho con peso corporal. Manos a la anchura de hombros, baja el cuerpo hasta casi tocar el suelo con el pecho, luego empuja manteniendo el core apretado.',
    },
  },
  {
    id: 'incline_push_ups',
    name: { en: 'Incline Push-Ups', es: 'Flexiones Inclinadas' },
    muscleGroup: 'chest',
    equipment: ['bench'],
    weightType: 'bodyweight',
    description: {
      en: 'Easier push-up variation with hands elevated on a bench. Great for beginners or as a finisher, this targets the lower chest while reducing the load compared to standard push-ups.',
      es: 'Variación más fácil de flexión con manos elevadas en un banco. Ideal para principiantes o como finalizador, trabaja el pecho inferior reduciendo la carga comparado con flexiones estándar.',
    },
  },
  {
    id: 'decline_push_ups',
    name: { en: 'Decline Push-Ups', es: 'Flexiones Declinadas' },
    muscleGroup: 'chest',
    equipment: ['bench'],
    weightType: 'bodyweight',
    description: {
      en: 'Advanced push-up with feet elevated on a bench. This shifts more weight to your upper body and emphasizes the upper chest and front shoulders, increasing overall difficulty significantly.',
      es: 'Flexión avanzada con pies elevados en un banco. Esto traslada más peso al torso superior y enfatiza el pecho superior y hombros frontales, aumentando significativamente la dificultad.',
    },
  },
  {
    id: 'dips_chest',
    name: { en: 'Dips (Chest Focus)', es: 'Fondos (Enfoque Pecho)' },
    muscleGroup: 'chest',
    equipment: ['dip_belt', 'rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Compound movement for lower chest when performed with forward lean. Keep torso tilted forward, lower until shoulders are below elbows, then push up maintaining the chest-focused position.',
      es: 'Movimiento compuesto para pecho inferior realizado con inclinación hacia adelante. Mantén el torso inclinado, baja hasta que los hombros estén bajo los codos, luego empuja manteniendo la posición.',
    },
  },
  {
    id: 'svend_press',
    name: { en: 'Svend Press', es: 'Press Svend' },
    muscleGroup: 'chest',
    equipment: ['plates'],
    weightType: 'plate',
    description: {
      en: 'Unique chest isolation using plate pressure. Press two plates together at chest level, extend arms forward while squeezing plates hard, then bring back to chest maintaining constant inward pressure.',
      es: 'Aislamiento único de pecho usando presión de discos. Presiona dos discos juntos a nivel del pecho, extiende brazos hacia adelante apretando fuerte, luego regresa manteniendo presión constante.',
    },
  },
  {
    id: 'pullover_chest',
    name: { en: 'Pullover (Chest Focus)', es: 'Pullover (Enfoque Pecho)' },
    muscleGroup: 'chest',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Stretches and works the chest through a long range of motion. Lie across a bench, lower dumbbell behind head with slight elbow bend, then pull over using chest muscles to starting position.',
      es: 'Estira y trabaja el pecho con amplio rango de movimiento. Acuéstate cruzado en un banco, baja la mancuerna detrás de la cabeza con codos flexionados, luego tira usando los músculos del pecho.',
    },
  },

  // ============================================
  // BACK
  // ============================================
  {
    id: 'pullups_wide',
    name: { en: 'Pull-Ups (Wide Grip)', es: 'Dominadas (Agarre Ancho)' },
    muscleGroup: 'back',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Classic back builder with wide overhand grip. Hang with arms fully extended, pull yourself up until chin clears the bar, focusing on driving elbows down and squeezing your lats.',
      es: 'Clásico constructor de espalda con agarre ancho pronado. Cuélgate con brazos extendidos, sube hasta que la barbilla pase la barra, enfocándote en llevar los codos abajo y apretar dorsales.',
    },
  },
  {
    id: 'pullups_close',
    name: { en: 'Pull-Ups (Close Grip)', es: 'Dominadas (Agarre Cerrado)' },
    muscleGroup: 'back',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Variation emphasizing the lower lats and biceps. With hands close together, pull up while keeping elbows close to your body, squeezing your back muscles hard at the top.',
      es: 'Variación que enfatiza dorsales inferiores y bíceps. Con manos juntas, sube manteniendo los codos cerca del cuerpo, apretando fuerte los músculos de la espalda en la parte superior.',
    },
  },
  {
    id: 'chinups',
    name: { en: 'Chin-Ups (Supinated)', es: 'Dominadas Supinas' },
    muscleGroup: 'back',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Underhand grip pull-up that heavily involves biceps. Grip the bar with palms facing you, pull up leading with your chest, lower with control to get a full stretch in lats and biceps.',
      es: 'Dominada con agarre supino que involucra mucho los bíceps. Agarra la barra con palmas hacia ti, sube liderando con el pecho, baja con control para estirar completamente dorsales y bíceps.',
    },
  },
  {
    id: 'weighted_pullups',
    name: { en: 'Weighted Pull-Ups', es: 'Dominadas con Peso' },
    muscleGroup: 'back',
    equipment: ['rack', 'dip_belt'],
    weightType: 'bodyweight',
    description: {
      en: 'Advanced pull-up progression with added resistance. Attach weight to a dip belt, perform pull-ups with strict form, focusing on controlled negatives to maximize back development and strength.',
      es: 'Progresión avanzada de dominadas con resistencia añadida. Añade peso con un cinturón de dip, realiza dominadas con forma estricta, enfocándote en negativas controladas para maximizar desarrollo.',
    },
  },
  {
    id: 'band_assisted_pullups',
    name: { en: 'Band-Assisted Pull-Ups', es: 'Dominadas Asistidas con Banda' },
    muscleGroup: 'back',
    equipment: ['rack', 'resistance_band'],
    weightType: 'bodyweight',
    description: {
      en: 'Regression for building pull-up strength. Loop a resistance band over the bar, place knee or foot in it, then perform pull-ups with the band providing assistance at the bottom.',
      es: 'Regresión para construir fuerza de dominadas. Engancha una banda en la barra, coloca rodilla o pie en ella, luego haz dominadas con la banda proporcionando asistencia en la parte inferior.',
    },
  },
  {
    id: 'lat_pulldown_wide',
    name: { en: 'Lat Pulldown (Wide)', es: 'Jalón al Pecho (Ancho)' },
    muscleGroup: 'back',
    equipment: ['high_pulley', 'lat_bar'],
    weightType: 'machine',
    description: {
      en: 'Machine alternative to wide-grip pull-ups. Sit with thighs secured, grip the bar wide, pull down to upper chest while squeezing shoulder blades together, then return with controlled tempo.',
      es: 'Alternativa en máquina a dominadas con agarre ancho. Siéntate con muslos asegurados, agarra la barra ancho, tira al pecho superior apretando escápulas, luego regresa con tempo controlado.',
    },
  },
  {
    id: 'lat_pulldown_close',
    name: { en: 'Lat Pulldown (Close/Neutral)', es: 'Jalón al Pecho (Cerrado/Neutro)' },
    muscleGroup: 'back',
    equipment: ['high_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Close-grip variation targeting lower lats. Using a V-bar or close-grip attachment, pull to your sternum while leaning slightly back, focusing on a strong lat contraction at the bottom.',
      es: 'Variación con agarre cerrado que trabaja dorsales inferiores. Usando barra V o agarre cerrado, tira al esternón inclinándote ligeramente atrás, enfocándote en fuerte contracción de dorsales.',
    },
  },
  {
    id: 'lat_pulldown_reverse',
    name: { en: 'Lat Pulldown (Reverse Grip)', es: 'Jalón al Pecho (Agarre Inverso)' },
    muscleGroup: 'back',
    equipment: ['high_pulley', 'lat_bar'],
    weightType: 'machine',
    description: {
      en: 'Underhand grip pulldown for lower lat emphasis. Grip the bar with palms facing you, pull down to your upper chest, squeezing your lats and biceps at the bottom of each repetition.',
      es: 'Jalón con agarre supino para énfasis en dorsales inferiores. Agarra la barra con palmas hacia ti, tira hacia el pecho superior, apretando dorsales y bíceps en la parte inferior.',
    },
  },
  {
    id: 'behind_neck_pulldown',
    name: { en: 'Behind-the-neck lat Pulldown', es: 'Jalón trasnuca' },
    muscleGroup: 'back',
    equipment: ['high_pulley', 'lat_bar'],
    weightType: 'machine',
    description: {
      en: 'Sit with thighs secured, grip the bar wide, pull down to beehind the neck, then return with controlled tempo.',
      es: 'Siéntate con los muslos sujetos, agarra la barra con las manos separadas, tira hacia abajo hasta detrás del cuello y luego regresa con un tempo controlado.',
    },
  },
  {
    id: 'seated_cable_row',
    name: { en: 'Seated Cable Row', es: 'Remo Sentado en Polea' },
    muscleGroup: 'back',
    equipment: ['low_pulley', 'v_bar'],
    weightType: 'machine',
    description: {
      en: 'Builds mid-back thickness with constant tension. Sit with feet braced, pull handle to lower chest while squeezing shoulder blades together, extend arms fully to stretch lats between reps.',
      es: 'Construye grosor de espalda media con tensión constante. Siéntate con pies apoyados, tira el agarre al pecho bajo apretando escápulas, extiende brazos completamente para estirar dorsales.',
    },
  },
  {
    id: 'seated_cable_row_wide',
    name: { en: 'Seated Cable Row (Wide)', es: 'Remo Sentado en Polea (Ancho)' },
    muscleGroup: 'back',
    equipment: ['low_pulley', 'lat_bar'],
    weightType: 'machine',
    description: {
      en: 'Wide grip variation targeting rear delts and upper back. Pull the wide bar to your upper abdomen with elbows flared out, focusing on squeezing your shoulder blades together.',
      es: 'Variación con agarre ancho que trabaja deltoides posteriores y espalda alta. Tira la barra ancha al abdomen superior con codos afuera, enfocándote en apretar las escápulas juntas.',
    },
  },
  {
    id: 'face_pulls',
    name: { en: 'Face Pulls', es: 'Tirón a la Cara' },
    muscleGroup: 'back',
    equipment: ['high_pulley', 'rope'],
    weightType: 'machine',
    description: {
      en: 'Essential for rear delts and upper back health. Pull the rope to your face with elbows high, externally rotate at the end position, squeezing rear delts and upper back muscles.',
      es: 'Esencial para deltoides posteriores y salud de espalda alta. Tira la cuerda a la cara con codos altos, rota externamente al final, apretando deltoides posteriores y músculos de espalda alta.',
    },
  },
  {
    id: 'single_arm_cable_row',
    name: { en: 'Single-Arm Cable Row', es: 'Remo Unilateral en Polea' },
    muscleGroup: 'back',
    equipment: ['low_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Unilateral rowing for balanced back development. Stand or kneel, pull the handle to your hip while rotating your torso slightly, focusing on a full stretch and strong contraction.',
      es: 'Remo unilateral para desarrollo equilibrado de espalda. De pie o arrodillado, tira el mango a la cadera rotando ligeramente el torso, enfocándote en estiramiento completo y contracción fuerte.',
    },
  },
  {
    id: 'barbell_row',
    name: { en: 'Barbell Bent-Over Row', es: 'Remo con Barra Inclinado' },
    muscleGroup: 'back',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Fundamental mass builder for the entire back. Hinge forward with flat back, pull bar to lower chest or upper abdomen, squeeze shoulder blades together, then lower with control.',
      es: 'Constructor fundamental de masa para toda la espalda. Inclínate con espalda plana, tira la barra al pecho bajo o abdomen superior, aprieta escápulas, luego baja con control.',
    },
  },
  {
    id: 'barbell_row_underhand',
    name: { en: 'Barbell Bent-Over Row (Underhand)', es: 'Remo con Barra (Agarre Supino)' },
    muscleGroup: 'back',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Supinated grip row emphasizing lower lats and biceps. Same hip-hinge position as standard rows, but with palms facing up, pull to your lower chest for maximum lat engagement.',
      es: 'Remo con agarre supino que enfatiza dorsales inferiores y bíceps. Misma posición de bisagra que remos estándar, pero con palmas arriba, tira al pecho bajo para máximo trabajo de dorsales.',
    },
  },
  {
    id: 'pendlay_row',
    name: { en: 'Barbell Pendlay Row', es: 'Remo Pendlay con Barra' },
    muscleGroup: 'back',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Explosive rowing variation with bar starting from the floor. Keep torso parallel to ground, explosively row the bar to your chest, then lower it completely to the floor between each rep.',
      es: 'Variación explosiva de remo con barra comenzando desde el suelo. Mantén torso paralelo al suelo, rema explosivamente al pecho, luego baja completamente al suelo entre cada repetición.',
    },
  },
  {
    id: 'dumbbell_row',
    name: { en: 'Dumbbell Single-Arm Row', es: 'Remo con Mancuerna a Una Mano' },
    muscleGroup: 'back',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Unilateral back exercise allowing full range of motion. Support yourself on a bench, row the dumbbell to your hip, focusing on driving your elbow back and squeezing your lat at the top.',
      es: 'Ejercicio unilateral de espalda permitiendo rango completo de movimiento. Apóyate en un banco, rema la mancuerna a la cadera, enfocándote en llevar el codo atrás y apretar el dorsal.',
    },
  },
  {
    id: 'db_bent_over_row',
    name: { en: 'Dumbbell Bent-Over Row', es: 'Remo Inclinado con Mancuernas' },
    muscleGroup: 'back',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Bilateral dumbbell row for back thickness. Hinge forward holding two dumbbells, row both to your hips simultaneously, squeeze your back at the top, then lower with controlled tempo.',
      es: 'Remo bilateral con mancuernas para grosor de espalda. Inclínate sosteniendo dos mancuernas, rema ambas a las caderas simultáneamente, aprieta la espalda arriba, luego baja con tempo controlado.',
    },
  },
  {
    id: 'pullover_back',
    name: { en: 'Dumbbell Pullover (Back Focus)', es: 'Pullover con Mancuerna (Enfoque Espalda)' },
    muscleGroup: 'back',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Stretches and works the lats through a unique angle. Lie across a bench, keep arms straighter than chest version, lower dumbbell behind head, pull back over using your lats primarily.',
      es: 'Estira y trabaja los dorsales desde un ángulo único. Acuéstate cruzado en un banco, mantén brazos más rectos que la versión de pecho, baja la mancuerna detrás, tira usando principalmente dorsales.',
    },
  },
  {
    id: 'tbar_row',
    name: { en: 'T-Bar Row (Landmine)', es: 'Remo en T (Landmine)' },
    muscleGroup: 'back',
    equipment: ['straight_bar', 'single_handle'],
    weightType: 'barbell',
    description: {
      en: 'Powerful mid-back builder using landmine setup. Straddle the bar, grip the handle attachment, row toward your chest while keeping your torso stable, squeezing hard at the top.',
      es: 'Poderoso constructor de espalda media usando configuración landmine. A horcajadas sobre la barra, agarra el accesorio, rema hacia el pecho manteniendo torso estable, apretando fuerte arriba.',
    },
  },
  {
    id: 'deadlift',
    name: { en: 'Deadlift', es: 'Peso Muerto' },
    muscleGroup: 'back',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'The ultimate full-body pulling movement. With flat back, grip bar outside knees, drive through heels to stand up, keeping bar close to body throughout, then reverse with control.',
      es: 'El movimiento de tirón de cuerpo completo definitivo. Con espalda plana, agarra la barra fuera de las rodillas, empuja con talones para pararte, manteniendo barra cerca del cuerpo.',
    },
  },
  {
    id: 'romanian_deadlift_barbell',
    name: { en: 'Romanian Deadlift (Barbell)', es: 'Peso Muerto Rumano (Barra)' },
    muscleGroup: 'back',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Hip hinge focusing on posterior chain. Start standing, push hips back while lowering bar along your legs, feel the hamstring stretch, then drive hips forward maintaining flat back.',
      es: 'Bisagra de cadera enfocada en cadena posterior. Comienza de pie, empuja caderas atrás bajando la barra por las piernas, siente el estiramiento de isquios, luego empuja caderas adelante.',
    },
  },
  {
    id: 'romanian_deadlift_dumbbell',
    name: { en: 'Dumbbell Romanian Deadlift', es: 'Peso Muerto Rumano con Mancuernas' },
    muscleGroup: 'back',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Dumbbell variation allowing natural arm path. Hold dumbbells in front of thighs, hinge at hips keeping back flat, lower until you feel hamstring stretch, then return to standing.',
      es: 'Variación con mancuernas permitiendo trayectoria natural de brazos. Sostén mancuernas frente a los muslos, haz bisagra en caderas con espalda plana, baja hasta sentir estiramiento de isquios.',
    },
  },
  {
    id: 'good_mornings',
    name: { en: 'Good Mornings', es: 'Buenos Días' },
    muscleGroup: 'back',
    equipment: ['straight_bar', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Posterior chain exercise with bar on upper back. With bar positioned like a squat, bow forward by pushing hips back, keep back flat, lower until torso is near parallel, then return upright.',
      es: 'Ejercicio de cadena posterior con barra en espalda alta. Con barra posicionada como sentadilla, inclínate empujando caderas atrás, mantén espalda plana, baja hasta casi paralelo, luego regresa.',
    },
  },
  {
    id: 'hyperextension',
    name: { en: 'Hyperextensions (on bench)', es: 'Hiperextensiones (en banco)' },
    muscleGroup: 'back',
    equipment: ['bench'],
    weightType: 'bodyweight',
    description: {
      en: 'Lower back strengthening on a decline bench. Position yourself face down with hips at edge, lower upper body toward floor, then raise up by contracting lower back and glutes.',
      es: 'Fortalecimiento de espalda baja en banco declinado. Posiciónate boca abajo con caderas en el borde, baja el torso hacia el suelo, luego sube contrayendo espalda baja y glúteos.',
    },
  },
  {
    id: 'shrugs_barbell',
    name: { en: 'Shrugs (Barbell)', es: 'Encogimientos (Barra)' },
    muscleGroup: 'back',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Trap builder using heavy barbell loads. Hold bar at arms length, elevate shoulders straight up toward ears, squeeze traps hard at the top, then lower with control without rolling shoulders.',
      es: 'Constructor de trapecios usando cargas pesadas de barra. Sostén la barra con brazos extendidos, eleva hombros hacia las orejas, aprieta trapecios arriba, luego baja con control.',
    },
  },
  {
    id: 'shrugs_dumbbell',
    name: { en: 'Shrugs (Dumbbell)', es: 'Encogimientos (Mancuernas)' },
    muscleGroup: 'back',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Trap isolation with dumbbells at your sides. Stand holding dumbbells, shrug shoulders up as high as possible, hold the contraction briefly, then lower slowly to maximize time under tension.',
      es: 'Aislamiento de trapecios con mancuernas a los lados. De pie sosteniendo mancuernas, encoge los hombros lo más alto posible, mantén la contracción brevemente, luego baja lento.',
    },
  },
  {
    id: 'cable_shrugs',
    name: { en: 'Cable Shrugs', es: 'Encogimientos en Polea' },
    muscleGroup: 'back',
    equipment: ['low_pulley'],
    weightType: 'machine',
    description: {
      en: 'Constant tension shrug variation using cables. Stand between low pulleys or facing one, shrug shoulders up while keeping arms straight, focus on peak contraction, then lower with resistance.',
      es: 'Variación de encogimiento con tensión constante usando poleas. De pie entre poleas bajas o frente a una, encoge hombros manteniendo brazos rectos, enfócate en contracción máxima.',
    },
  },

  // ============================================
  // SHOULDERS
  // ============================================
  {
    id: 'overhead_press_standing',
    name: { en: 'Barbell Overhead Press (Standing)', es: 'Press Militar de Pie' },
    muscleGroup: 'shoulders',
    equipment: ['straight_bar', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Fundamental shoulder strength builder. Start with bar at collarbone, press overhead while keeping core tight, lock out arms at top, then lower back to starting position under control.',
      es: 'Constructor fundamental de fuerza de hombros. Comienza con barra en clavícula, empuja sobre la cabeza manteniendo core apretado, bloquea brazos arriba, luego baja con control.',
    },
  },
  {
    id: 'overhead_press_seated',
    name: { en: 'Barbell Overhead Press (Seated)', es: 'Press Militar Sentado' },
    muscleGroup: 'shoulders',
    equipment: ['straight_bar', 'bench', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Strict overhead pressing without leg drive. Sit with back supported, press bar from shoulders to full lockout overhead, this isolates shoulders more by eliminating leg momentum.',
      es: 'Press sobre cabeza estricto sin impulso de piernas. Siéntate con espalda apoyada, empuja la barra desde hombros hasta bloqueo completo, esto aísla más los hombros eliminando impulso.',
    },
  },
  {
    id: 'push_press',
    name: { en: 'Barbell Push Press', es: 'Push Press con Barra' },
    muscleGroup: 'shoulders',
    equipment: ['straight_bar', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Explosive overhead press using leg drive. Dip slightly at knees, then explosively drive up while pressing bar overhead, this allows handling heavier weights than strict pressing.',
      es: 'Press sobre cabeza explosivo usando impulso de piernas. Flexiona ligeramente las rodillas, luego impulsa explosivamente mientras empujas la barra arriba, permite manejar pesos más pesados.',
    },
  },
  {
    id: 'behind_neck_press',
    name: { en: 'Barbell Behind-Neck Press', es: 'Press Tras Nuca con Barra' },
    muscleGroup: 'shoulders',
    equipment: ['straight_bar', 'bench', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Advanced shoulder press lowering bar behind head. Requires good shoulder mobility, lower bar to base of neck, press up to lockout, use lighter weight and control to protect joints.',
      es: 'Press de hombros avanzado bajando barra detrás de la cabeza. Requiere buena movilidad de hombros, baja la barra a la base del cuello, empuja hasta bloqueo, usa peso ligero y control.',
    },
  },
  {
    id: 'db_shoulder_press_seated',
    name: { en: 'Dumbbell Shoulder Press (Seated)', es: 'Press de Hombros con Mancuernas (Sentado)' },
    muscleGroup: 'shoulders',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Seated pressing allowing independent arm movement. Press dumbbells from shoulder height to overhead, bring them slightly together at top, lower with control for full shoulder development.',
      es: 'Press sentado permitiendo movimiento independiente de brazos. Empuja mancuernas desde altura de hombros arriba, júntalas ligeramente arriba, baja con control para desarrollo completo.',
    },
  },
  {
    id: 'db_shoulder_press_standing',
    name: { en: 'Dumbbell Shoulder Press (Standing)', es: 'Press de Hombros con Mancuernas (De Pie)' },
    muscleGroup: 'shoulders',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Standing overhead press engaging more stabilizers. Press dumbbells overhead while maintaining core stability, this variation builds functional strength and challenges balance throughout.',
      es: 'Press sobre cabeza de pie involucrando más estabilizadores. Empuja mancuernas arriba manteniendo estabilidad del core, esta variación construye fuerza funcional y desafía el equilibrio.',
    },
  },
  {
    id: 'arnold_press',
    name: { en: 'Arnold Press', es: 'Press Arnold' },
    muscleGroup: 'shoulders',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Rotational press hitting all three delt heads. Start with palms facing you at chest, rotate and press up so palms face forward at top, reverse the motion on the way down.',
      es: 'Press rotacional que trabaja las tres cabezas del deltoides. Comienza con palmas hacia ti en el pecho, rota y empuja para que las palmas miren adelante arriba, invierte al bajar.',
    },
  },
  {
    id: 'lateral_raise',
    name: { en: 'Dumbbell Lateral Raise', es: 'Elevaciones Laterales con Mancuernas' },
    muscleGroup: 'shoulders',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Primary side delt isolation exercise. Raise dumbbells out to sides with slight elbow bend, lift until arms are parallel to floor, lower with control, avoid swinging or using momentum.',
      es: 'Ejercicio principal de aislamiento de deltoides lateral. Eleva mancuernas a los lados con codos ligeramente flexionados, sube hasta brazos paralelos al suelo, baja con control.',
    },
  },
  {
    id: 'front_raise',
    name: { en: 'Dumbbell Front Raise', es: 'Elevaciones Frontales con Mancuernas' },
    muscleGroup: 'shoulders',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Isolation for anterior deltoids. Raise dumbbells in front of body to shoulder height, keep arms straight with slight elbow bend, lower under control, alternate arms or lift both.',
      es: 'Aislamiento para deltoides anterior. Eleva mancuernas frente al cuerpo hasta altura de hombros, mantén brazos rectos con ligera flexión, baja con control, alterna o levanta ambos.',
    },
  },
  {
    id: 'rear_delt_fly_bent',
    name: { en: 'Dumbbell Rear Delt Fly (Bent Over)', es: 'Aperturas Posteriores (Inclinado)' },
    muscleGroup: 'shoulders',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Bent-over fly targeting posterior deltoids. Hinge forward at hips, raise dumbbells out to sides leading with elbows, squeeze rear delts at top, lower with control.',
      es: 'Apertura inclinada que trabaja deltoides posteriores. Inclínate desde las caderas, eleva mancuernas a los lados liderando con codos, aprieta deltoides posteriores arriba, baja con control.',
    },
  },
  {
    id: 'rear_delt_fly_incline',
    name: { en: 'Dumbbell Rear Delt Fly (Incline)', es: 'Aperturas Posteriores (En Banco Inclinado)' },
    muscleGroup: 'shoulders',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Chest-supported rear delt isolation. Lie face down on incline bench, perform fly motion focusing on rear delts, the bench support eliminates momentum and lower back strain.',
      es: 'Aislamiento de deltoides posterior con pecho apoyado. Acuéstate boca abajo en banco inclinado, realiza movimiento de apertura enfocándote en deltoides posteriores, el banco elimina impulso.',
    },
  },
  {
    id: 'cable_lateral_raise',
    name: { en: 'Cable Lateral Raise', es: 'Elevación Lateral en Polea' },
    muscleGroup: 'shoulders',
    equipment: ['low_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Constant tension lateral raise with cable. Stand sideways to low pulley, raise arm out to side against resistance, the cable provides tension throughout the entire range of motion.',
      es: 'Elevación lateral con tensión constante usando polea. De pie lateral a polea baja, eleva el brazo al lado contra resistencia, el cable proporciona tensión durante todo el rango.',
    },
  },
  {
    id: 'cable_front_raise',
    name: { en: 'Cable Front Raise', es: 'Elevación Frontal en Polea' },
    muscleGroup: 'shoulders',
    equipment: ['low_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Cable version of front raises for constant tension. Face away from low pulley, raise handle in front to shoulder height, the cable ensures resistance even at the bottom.',
      es: 'Versión con cable de elevaciones frontales para tensión constante. De espaldas a polea baja, eleva el mango al frente hasta altura de hombros, el cable asegura resistencia incluso abajo.',
    },
  },
  {
    id: 'cable_rear_delt_fly',
    name: { en: 'Cable Rear Delt Fly', es: 'Aperturas Posteriores en Polea' },
    muscleGroup: 'shoulders',
    equipment: ['high_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Rear delt isolation using cables for constant tension. Using high pulleys or rope, pull apart to engage rear delts, hold the squeeze, return with control maintaining tension.',
      es: 'Aislamiento de deltoides posterior usando cables para tensión constante. Usando poleas altas o cuerda, separa para activar deltoides posteriores, mantén la contracción, regresa con control.',
    },
  },
  {
    id: 'face_pulls_shoulders',
    name: { en: 'Face Pulls (Shoulders)', es: 'Tirón a la Cara (Hombros)' },
    muscleGroup: 'shoulders',
    equipment: ['high_pulley', 'rope'],
    weightType: 'machine',
    description: {
      en: 'Excellent for rear delt and rotator cuff health. Pull rope toward face with elbows high, externally rotate hands at end position, essential for shoulder stability and posture.',
      es: 'Excelente para deltoides posterior y salud del manguito rotador. Tira la cuerda hacia la cara con codos altos, rota externamente las manos al final, esencial para estabilidad y postura.',
    },
  },
  {
    id: 'upright_row_barbell',
    name: { en: 'Upright Row (Barbell)', es: 'Remo al Mentón (Barra)' },
    muscleGroup: 'shoulders',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Compound movement for traps and lateral delts. Pull bar up close to body leading with elbows, raise until elbows are at shoulder height, lower with control, use moderate grip width.',
      es: 'Movimiento compuesto para trapecios y deltoides laterales. Tira la barra cerca del cuerpo liderando con codos, sube hasta que los codos estén a altura de hombros, baja con control.',
    },
  },
  {
    id: 'upright_row_dumbbell',
    name: { en: 'Upright Row (Dumbbells)', es: 'Remo al Mentón (Mancuernas)' },
    muscleGroup: 'shoulders',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Dumbbell version allowing more natural arm path. Pull dumbbells up along body with elbows leading, this variation is often more comfortable for those with shoulder mobility limitations.',
      es: 'Versión con mancuernas permitiendo trayectoria más natural de brazos. Tira las mancuernas hacia arriba con codos liderando, esta variación es más cómoda para quienes tienen limitaciones.',
    },
  },
  {
    id: 'upright_row_cable',
    name: { en: 'Upright Row (Cable)', es: 'Remo al Mentón (Polea)' },
    muscleGroup: 'shoulders',
    equipment: ['low_pulley', 'lat_bar'],
    weightType: 'machine',
    description: {
      en: 'Cable upright row for constant tension throughout. Using low pulley with bar attachment, pull up leading with elbows, the cable maintains resistance through the entire range.',
      es: 'Remo al mentón con cable para tensión constante. Usando polea baja con barra, tira hacia arriba liderando con codos, el cable mantiene resistencia durante todo el rango.',
    },
  },
  {
    id: 'plate_front_raise',
    name: { en: 'Plate Front Raise', es: 'Elevación Frontal con Disco' },
    muscleGroup: 'shoulders',
    equipment: ['plates'],
    weightType: 'plate',
    description: {
      en: 'Front raise variation using a weight plate. Hold plate with both hands at sides, raise in front to eye level or overhead, the wider grip engages shoulders differently than dumbbells.',
      es: 'Variación de elevación frontal usando un disco. Sostén el disco con ambas manos a los lados, eleva al frente hasta nivel de ojos o arriba, el agarre más ancho activa los hombros diferente.',
    },
  },
  {
    id: 'bus_drivers',
    name: { en: 'Bus Drivers', es: 'Conductores de Bus' },
    muscleGroup: 'shoulders',
    equipment: ['plates'],
    weightType: 'plate',
    description: {
      en: 'Rotational shoulder exercise with a plate. Hold plate extended in front, rotate it like turning a steering wheel, this challenges all parts of the shoulder through multiple planes.',
      es: 'Ejercicio rotacional de hombros con disco. Sostén el disco extendido al frente, rótalo como girando un volante, esto desafía todas las partes del hombro en múltiples planos.',
    },
  },
  {
    id: 'band_pull_aparts',
    name: { en: 'Band Pull-Aparts', es: 'Separaciones con Banda' },
    muscleGroup: 'shoulders',
    equipment: ['resistance_band'],
    weightType: 'bodyweight',
    description: {
      en: 'Great warm-up and rear delt exercise with band. Hold band at arms length in front, pull apart until band touches chest, squeeze rear delts, excellent for shoulder health and posture.',
      es: 'Excelente calentamiento y ejercicio de deltoides posterior con banda. Sostén la banda con brazos extendidos, separa hasta que toque el pecho, aprieta deltoides posteriores, ideal para postura.',
    },
  },
  {
    id: 'barbell_high_pull',
    name: { en: 'Barbell High Pull', es: 'Tirón Alto con Barra' },
    muscleGroup: 'shoulders',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Explosive movement for traps and shoulders. Similar to upright row but with more hip drive and explosive pulling, raise bar to upper chest level with elbows high, builds power and size.',
      es: 'Movimiento explosivo para trapecios y hombros. Similar al remo al mentón pero con más impulso de cadera y tirón explosivo, sube la barra al pecho alto con codos arriba, construye potencia.',
    },
  },

  // ============================================
  // BICEPS
  // ============================================
  {
    id: 'barbell_curl_standing',
    name: { en: 'Barbell Curl (Standing)', es: 'Curl con Barra (De Pie)' },
    muscleGroup: 'biceps',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Classic mass builder for biceps. Stand with shoulder-width grip, curl bar to shoulders keeping elbows stationary at sides, lower with control, avoid swinging or using back momentum.',
      es: 'Clásico constructor de masa para bíceps. De pie con agarre a anchura de hombros, curl hacia los hombros manteniendo codos fijos a los lados, baja con control, evita balanceo o impulso.',
    },
  },
  {
    id: 'barbell_curl_wide',
    name: { en: 'Barbell Curl (Wide Grip)', es: 'Curl con Barra (Agarre Ancho)' },
    muscleGroup: 'biceps',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Wide grip emphasizes the inner bicep head. Grip bar wider than shoulder width, perform curls focusing on the short head of the biceps, this builds inner arm thickness.',
      es: 'El agarre ancho enfatiza la cabeza interna del bíceps. Agarra la barra más ancho que los hombros, realiza curls enfocándote en la cabeza corta del bíceps, esto construye grosor interno.',
    },
  },
  {
    id: 'barbell_curl_close',
    name: { en: 'Barbell Curl (Close Grip)', es: 'Curl con Barra (Agarre Cerrado)' },
    muscleGroup: 'biceps',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Close grip targets the outer bicep head. Grip bar narrower than shoulder width, curl while keeping elbows close to body, this variation develops the bicep peak and long head.',
      es: 'El agarre cerrado trabaja la cabeza externa del bíceps. Agarra la barra más cerrado que los hombros, haz curl manteniendo codos cerca del cuerpo, esto desarrolla el pico del bíceps.',
    },
  },
  {
    id: 'ez_bar_curl',
    name: { en: 'EZ Bar Curl', es: 'Curl con Barra Z' },
    muscleGroup: 'biceps',
    equipment: ['ez_bar'],
    weightType: 'barbell',
    description: {
      en: 'Wrist-friendly curl using angled EZ bar. The camber reduces wrist strain while still effectively targeting biceps, curl with controlled tempo, squeeze at the top of each rep.',
      es: 'Curl amigable con las muñecas usando barra Z angulada. La curvatura reduce tensión en muñecas mientras trabaja efectivamente los bíceps, curl con tempo controlado, aprieta arriba.',
    },
  },
  {
    id: 'ez_bar_curl_wide',
    name: { en: 'EZ Bar Curl (Wide Grip)', es: 'Curl con Barra Z (Agarre Ancho)' },
    muscleGroup: 'biceps',
    equipment: ['ez_bar'],
    weightType: 'barbell',
    description: {
      en: 'Wide grip EZ curl for inner bicep emphasis. Use the outer angled grips on the EZ bar, this reduces wrist strain while targeting the short head of the biceps effectively.',
      es: 'Curl con barra Z con agarre ancho para énfasis interno. Usa los agarres angulados externos de la barra Z, esto reduce tensión en muñecas mientras trabaja la cabeza corta del bíceps.',
    },
  },
  {
    id: 'ez_bar_preacher_curl',
    name: { en: 'EZ Bar Preacher Curl', es: 'Curl en Banco Scott con Barra Z' },
    muscleGroup: 'biceps',
    equipment: ['ez_bar', 'preacher_pad'],
    weightType: 'barbell',
    description: {
      en: 'Strict bicep isolation eliminating momentum. Rest arms on preacher pad, curl bar up squeezing biceps, lower fully to stretch, the pad prevents cheating and isolates completely.',
      es: 'Aislamiento estricto de bíceps eliminando impulso. Apoya brazos en el pad, curl subiendo y apretando bíceps, baja completamente para estirar, el pad previene trampa y aísla completamente.',
    },
  },
  {
    id: 'db_curl_standing',
    name: { en: 'Dumbbell Curl (Standing)', es: 'Curl con Mancuernas (De Pie)' },
    muscleGroup: 'biceps',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Versatile bicep curl allowing supination. Curl dumbbells while rotating wrists from neutral to supinated position, this engages the bicep fully and allows natural arm movement.',
      es: 'Curl de bíceps versátil permitiendo supinación. Curl con mancuernas rotando muñecas de posición neutra a supinada, esto activa completamente el bíceps y permite trayectoria natural.',
    },
  },
  {
    id: 'db_curl_seated',
    name: { en: 'Dumbbell Curl (Seated)', es: 'Curl con Mancuernas (Sentado)' },
    muscleGroup: 'biceps',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Seated curl reducing momentum and cheating. Sit on bench with back straight, curl dumbbells with strict form, being seated prevents body swing and forces biceps to work harder.',
      es: 'Curl sentado reduciendo impulso y trampa. Siéntate en banco con espalda recta, curl con mancuernas con forma estricta, estar sentado previene balanceo y fuerza los bíceps a trabajar más.',
    },
  },
  {
    id: 'db_curl_incline',
    name: { en: 'Dumbbell Curl (Incline)', es: 'Curl con Mancuernas (Inclinado)' },
    muscleGroup: 'biceps',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Incline curl for maximum bicep stretch. Lie back on incline bench, let arms hang straight down, curl up while keeping upper arms stationary, the stretch at the bottom is intense.',
      es: 'Curl inclinado para máximo estiramiento de bíceps. Recuéstate en banco inclinado, deja brazos colgando, curl manteniendo brazos superiores fijos, el estiramiento abajo es intenso.',
    },
  },
  {
    id: 'hammer_curl',
    name: { en: 'Dumbbell Hammer Curl', es: 'Curl Martillo con Mancuernas' },
    muscleGroup: 'biceps',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Neutral grip curl for brachialis and forearms. Keep palms facing each other throughout, curl to shoulders, this builds arm thickness and strengthens the forearms significantly.',
      es: 'Curl con agarre neutro para braquial y antebrazos. Mantén palmas enfrentadas durante todo el movimiento, curl a los hombros, esto construye grosor de brazos y fortalece antebrazos.',
    },
  },
  {
    id: 'concentration_curl',
    name: { en: 'Dumbbell Concentration Curl', es: 'Curl Concentrado con Mancuerna' },
    muscleGroup: 'biceps',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Maximum isolation for bicep peak. Sit with elbow braced against inner thigh, curl dumbbell to shoulder, squeeze hard at top, excellent for mind-muscle connection and peak development.',
      es: 'Máximo aislamiento para el pico del bíceps. Siéntate con codo apoyado en muslo interno, curl hacia el hombro, aprieta fuerte arriba, excelente para conexión mente-músculo.',
    },
  },
  {
    id: 'db_preacher_curl',
    name: { en: 'Dumbbell Preacher Curl', es: 'Curl en Banco Scott con Mancuerna' },
    muscleGroup: 'biceps',
    equipment: ['dumbbells', 'preacher_pad'],
    weightType: 'dumbbell',
    description: {
      en: 'Unilateral preacher curl for balanced development. One arm at a time on preacher pad, allows full focus on each bicep, eliminates strength imbalances between arms effectively.',
      es: 'Curl en banco scott unilateral para desarrollo equilibrado. Un brazo a la vez en el pad, permite enfoque completo en cada bíceps, elimina desequilibrios de fuerza entre brazos.',
    },
  },
  {
    id: 'zottman_curl',
    name: { en: 'Dumbbell Zottman Curl', es: 'Curl Zottman con Mancuernas' },
    muscleGroup: 'biceps',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Compound curl working biceps and forearms together. Curl up with supinated grip, rotate to pronated at top, lower with palms down, works biceps going up and forearms going down.',
      es: 'Curl compuesto trabajando bíceps y antebrazos juntos. Curl con agarre supino, rota a pronado arriba, baja con palmas abajo, trabaja bíceps al subir y antebrazos al bajar.',
    },
  },
  {
    id: 'cable_curl_bar',
    name: { en: 'Cable Curl (Straight Bar)', es: 'Curl en Polea (Barra Recta)' },
    muscleGroup: 'biceps',
    equipment: ['low_pulley', 'lat_bar'],
    weightType: 'machine',
    description: {
      en: 'Constant tension bicep curl using cable. Using low pulley with bar, curl up while keeping elbows stationary, the cable provides resistance throughout entire range including bottom.',
      es: 'Curl de bíceps con tensión constante usando cable. Usando polea baja con barra, curl manteniendo codos fijos, el cable proporciona resistencia durante todo el rango incluyendo abajo.',
    },
  },
  {
    id: 'cable_curl_rope',
    name: { en: 'Cable Curl (Rope - Hammer)', es: 'Curl en Polea (Cuerda - Martillo)' },
    muscleGroup: 'biceps',
    equipment: ['low_pulley', 'rope'],
    weightType: 'machine',
    description: {
      en: 'Neutral grip cable curl using rope attachment. Curl rope up keeping neutral grip, split ends apart at top for extra contraction, excellent for brachialis and forearm development.',
      es: 'Curl con cable con agarre neutro usando cuerda. Curl con cuerda manteniendo agarre neutro, separa los extremos arriba para contracción extra, excelente para braquial y antebrazos.',
    },
  },
  {
    id: 'cable_curl_single',
    name: { en: 'Cable Curl (Single Arm)', es: 'Curl en Polea (Un Brazo)' },
    muscleGroup: 'biceps',
    equipment: ['low_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Unilateral cable curl for isolation and balance. Stand sideways to low pulley, curl single handle while keeping elbow fixed, excellent for addressing strength imbalances between arms.',
      es: 'Curl unilateral con cable para aislamiento y equilibrio. De pie lateral a polea baja, curl con un mango manteniendo codo fijo, excelente para corregir desequilibrios de fuerza.',
    },
  },
  {
    id: 'cable_high_curl',
    name: { en: 'Cable High Curl', es: 'Curl Alto en Polea' },
    muscleGroup: 'biceps',
    equipment: ['high_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Bicep curl from high pulley position. Stand between high pulleys, curl handles toward your head, excellent for hitting biceps from a unique angle and creating a strong peak contraction.',
      es: 'Curl de bíceps desde posición de polea alta. De pie entre poleas altas, curl hacia la cabeza, excelente para trabajar bíceps desde un ángulo único y crear fuerte contracción de pico.',
    },
  },
  {
    id: 'cable_preacher_curl',
    name: { en: 'Cable Preacher Curl', es: 'Curl en Banco Scott con Polea' },
    muscleGroup: 'biceps',
    equipment: ['low_pulley', 'preacher_pad'],
    weightType: 'machine',
    description: {
      en: 'Preacher curl with constant cable tension. Position preacher pad facing low pulley, curl keeping upper arms on pad, the cable ensures tension throughout the entire movement.',
      es: 'Curl en banco scott con tensión constante de cable. Posiciona el pad frente a polea baja, curl manteniendo brazos en el pad, el cable asegura tensión durante todo el movimiento.',
    },
  },
  {
    id: 'drag_curl',
    name: { en: 'Drag Curl (Barbell)', es: 'Curl Arrastrado (Barra)' },
    muscleGroup: 'biceps',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Unique curl dragging bar up the body. Keep bar in contact with body as you curl, pull elbows back as bar rises, this emphasizes the bicep peak and long head significantly.',
      es: 'Curl único arrastrando la barra por el cuerpo. Mantén la barra en contacto con el cuerpo mientras subes, lleva codos atrás, esto enfatiza significativamente el pico y cabeza larga.',
    },
  },
  {
    id: 'chinups_biceps',
    name: { en: 'Chin-Ups (Bicep Focus)', es: 'Dominadas Supinas (Enfoque Bíceps)' },
    muscleGroup: 'biceps',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Underhand pull-up emphasizing bicep engagement. Grip bar with palms facing you, pull up focusing on bicep contraction rather than back, excellent compound movement for arm size.',
      es: 'Dominada supina enfatizando activación de bíceps. Agarra la barra con palmas hacia ti, sube enfocándote en contracción de bíceps más que espalda, excelente movimiento compuesto.',
    },
  },
  {
    id: 'band_curl',
    name: { en: 'Band Curl', es: 'Curl con Banda' },
    muscleGroup: 'biceps',
    equipment: ['resistance_band'],
    weightType: 'bodyweight',
    description: {
      en: 'Bicep curl using resistance band. Stand on band, curl handles up, the increasing tension at top provides unique resistance curve, great for home workouts or travel training.',
      es: 'Curl de bíceps usando banda de resistencia. Párate sobre la banda, curl hacia arriba, la tensión creciente arriba proporciona curva de resistencia única, ideal para entrenar en casa.',
    },
  },

  // ============================================
  // TRICEPS
  // ============================================
  {
    id: 'close_grip_bench',
    name: { en: 'Close-Grip Bench Press', es: 'Press de Banca Agarre Cerrado' },
    muscleGroup: 'triceps',
    equipment: ['straight_bar', 'bench', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Compound tricep builder with heavy loads. Grip bar shoulder-width or slightly narrower, lower to lower chest, press up focusing on tricep contraction, keep elbows closer to body.',
      es: 'Constructor compuesto de tríceps con cargas pesadas. Agarra la barra a anchura de hombros o más cerrado, baja al pecho bajo, empuja enfocándote en contracción de tríceps.',
    },
  },
  {
    id: 'skull_crushers',
    name: { en: 'Barbell Skull Crushers', es: 'Rompecráneos con Barra' },
    muscleGroup: 'triceps',
    equipment: ['ez_bar', 'bench'],
    weightType: 'barbell',
    description: {
      en: 'Lying tricep extension targeting all three heads. Lower bar to forehead or just behind head, extend arms fully, keep upper arms stationary throughout for maximum isolation.',
      es: 'Extensión de tríceps acostado que trabaja las tres cabezas. Baja la barra a la frente o detrás de la cabeza, extiende brazos completamente, mantén brazos superiores fijos.',
    },
  },
  {
    id: 'db_skull_crushers',
    name: { en: 'Dumbbell Skull Crushers', es: 'Rompecráneos con Mancuernas' },
    muscleGroup: 'triceps',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Dumbbell version allowing independent arm movement. Lower dumbbells to sides of head, extend fully, the dumbbell variation allows addressing imbalances and provides different feel.',
      es: 'Versión con mancuernas permitiendo movimiento independiente. Baja mancuernas a los lados de la cabeza, extiende completamente, la variación con mancuernas permite corregir desequilibrios.',
    },
  },
  {
    id: 'db_overhead_extension_two',
    name: { en: 'Dumbbell Overhead Extension (Two Hands)', es: 'Extensión sobre Cabeza (Dos Manos)' },
    muscleGroup: 'triceps',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Overhead tricep extension holding one dumbbell with both hands. Lower dumbbell behind head, extend up fully, the stretched position at bottom emphasizes the long head.',
      es: 'Extensión de tríceps sobre cabeza sosteniendo una mancuerna con ambas manos. Baja la mancuerna detrás de la cabeza, extiende completamente, la posición estirada enfatiza la cabeza larga.',
    },
  },
  {
    id: 'db_overhead_extension_single',
    name: { en: 'Dumbbell Overhead Extension (Single Arm)', es: 'Extensión sobre Cabeza (Un Brazo)' },
    muscleGroup: 'triceps',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Single-arm overhead extension for balanced development. Extend one arm overhead, lower dumbbell behind head, extend fully, allows full focus on each tricep independently.',
      es: 'Extensión sobre cabeza a un brazo para desarrollo equilibrado. Extiende un brazo arriba, baja mancuerna detrás de la cabeza, extiende completamente, permite enfoque en cada tríceps.',
    },
  },
  {
    id: 'db_kickback',
    name: { en: 'Dumbbell Kickback', es: 'Patada Trasera con Mancuerna' },
    muscleGroup: 'triceps',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Isolation exercise for tricep contraction. Hinge forward, keep upper arm parallel to floor, extend forearm back and squeeze at top, focus on peak contraction rather than weight.',
      es: 'Ejercicio de aislamiento para contracción del tríceps. Inclínate hacia adelante, mantén brazo superior paralelo al suelo, extiende antebrazo atrás y aprieta arriba.',
    },
  },
  {
    id: 'cable_pushdown_rope',
    name: { en: 'Cable Pushdown (Rope)', es: 'Empuje en Polea (Cuerda)' },
    muscleGroup: 'triceps',
    equipment: ['high_pulley', 'rope'],
    weightType: 'machine',
    description: {
      en: 'Classic tricep isolation with rope attachment. Push rope down while keeping elbows at sides, split the rope apart at bottom for extra contraction, return with control.',
      es: 'Aislamiento clásico de tríceps con cuerda. Empuja la cuerda hacia abajo manteniendo codos a los lados, separa la cuerda abajo para contracción extra, regresa con control.',
    },
  },
  {
    id: 'cable_pushdown_bar',
    name: { en: 'Cable Pushdown (Straight Bar)', es: 'Empuje en Polea (Barra Recta)' },
    muscleGroup: 'triceps',
    equipment: ['high_pulley', 'lat_bar'],
    weightType: 'machine',
    description: {
      en: 'Straight bar pushdown for heavy tricep work. Using bar attachment, push down until arms are fully extended, keep elbows pinned to sides, allows heavier loads than rope.',
      es: 'Empuje con barra recta para trabajo pesado de tríceps. Usando accesorio de barra, empuja hasta extensión completa de brazos, mantén codos fijos a los lados.',
    },
  },
  {
    id: 'cable_pushdown_vbar',
    name: { en: 'Cable Pushdown (V-Bar/Handle)', es: 'Empuje en Polea (Barra V/Mango)' },
    muscleGroup: 'triceps',
    equipment: ['high_pulley', 'v_bar'],
    weightType: 'machine',
    description: {
      en: 'V-bar pushdown for comfortable wrist position. The angled grip of V-bar is easier on wrists while still providing effective tricep isolation, push down and squeeze at bottom.',
      es: 'Empuje con barra V para posición cómoda de muñecas. El agarre angular de la barra V es más cómodo mientras proporciona aislamiento efectivo de tríceps, empuja y aprieta abajo.',
    },
  },
  {
    id: 'cable_pushdown_reverse',
    name: { en: 'Cable Pushdown (Reverse Grip)', es: 'Empuje en Polea (Agarre Inverso)' },
    muscleGroup: 'triceps',
    equipment: ['high_pulley', 'lat_bar'],
    weightType: 'machine',
    description: {
      en: 'Underhand grip pushdown for medial head emphasis. Grip bar with palms up, push down focusing on tricep contraction, this variation shifts emphasis to the medial tricep head.',
      es: 'Empuje con agarre supino para énfasis en cabeza medial. Agarra la barra con palmas arriba, empuja enfocándote en contracción de tríceps, esta variación enfatiza la cabeza medial.',
    },
  },
  {
    id: 'cable_overhead_extension_rope',
    name: { en: 'Cable Overhead Extension (Rope)', es: 'Extensión sobre Cabeza en Polea (Cuerda)' },
    muscleGroup: 'triceps',
    equipment: ['low_pulley', 'rope'],
    weightType: 'machine',
    description: {
      en: 'Overhead cable extension for long head emphasis. Face away from low pulley, extend rope overhead, the stretched position at bottom maximally targets the tricep long head.',
      es: 'Extensión sobre cabeza con cable para énfasis en cabeza larga. De espaldas a polea baja, extiende la cuerda sobre la cabeza, la posición estirada trabaja máximamente la cabeza larga.',
    },
  },
  {
    id: 'cable_overhead_extension_single',
    name: { en: 'Cable Overhead Extension (Single Arm)', es: 'Extensión sobre Cabeza en Polea (Un Brazo)' },
    muscleGroup: 'triceps',
    equipment: ['low_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Unilateral overhead extension for balanced triceps. Single arm allows full focus on each tricep, extend fully overhead while keeping upper arm stationary, great for imbalances.',
      es: 'Extensión sobre cabeza unilateral para tríceps equilibrados. Un brazo permite enfoque completo en cada tríceps, extiende completamente manteniendo brazo superior fijo.',
    },
  },
  {
    id: 'cable_kickback',
    name: { en: 'Cable Kickback', es: 'Patada Trasera en Polea' },
    muscleGroup: 'triceps',
    equipment: ['low_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Cable version of kickbacks for constant tension. Hinge forward, extend arm back against cable resistance, the cable maintains tension throughout entire range of motion.',
      es: 'Versión con cable de patadas traseras para tensión constante. Inclínate hacia adelante, extiende el brazo atrás contra la resistencia del cable, el cable mantiene tensión durante todo.',
    },
  },
  {
    id: 'dips_triceps',
    name: { en: 'Dips (Tricep Focus)', es: 'Fondos (Enfoque Tríceps)' },
    muscleGroup: 'triceps',
    equipment: ['dip_belt', 'rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Compound tricep builder with upright torso. Keep body vertical, lower until upper arms are parallel to floor, push up focusing on tricep contraction, elbows close to body.',
      es: 'Constructor compuesto de tríceps con torso erguido. Mantén el cuerpo vertical, baja hasta que brazos estén paralelos al suelo, empuja enfocándote en contracción de tríceps.',
    },
  },
  {
    id: 'bench_dips',
    name: { en: 'Bench Dips', es: 'Fondos en Banco' },
    muscleGroup: 'triceps',
    equipment: ['bench'],
    weightType: 'bodyweight',
    description: {
      en: 'Bodyweight tricep exercise using a bench. Hands on bench behind you, lower body by bending elbows, push back up, feet can be elevated on another bench to increase difficulty.',
      es: 'Ejercicio de tríceps con peso corporal usando un banco. Manos en el banco detrás de ti, baja el cuerpo flexionando codos, empuja hacia arriba, pies pueden elevarse para más dificultad.',
    },
  },
  {
    id: 'diamond_push_ups',
    name: { en: 'Diamond Push-Ups', es: 'Flexiones Diamante' },
    muscleGroup: 'triceps',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Close-hand push-up for tricep emphasis. Form a diamond shape with hands under chest, lower body keeping elbows close to sides, push up focusing on tricep contraction.',
      es: 'Flexión con manos juntas para énfasis en tríceps. Forma un diamante con las manos bajo el pecho, baja manteniendo codos cerca de los lados, empuja enfocándote en tríceps.',
    },
  },
  {
    id: 'band_pushdown',
    name: { en: 'Band Pushdown', es: 'Empuje con Banda' },
    muscleGroup: 'triceps',
    equipment: ['resistance_band'],
    weightType: 'bodyweight',
    description: {
      en: 'Tricep pushdown using resistance band. Anchor band overhead, push down keeping elbows at sides, the increasing resistance at bottom provides unique tension curve for development.',
      es: 'Empuje de tríceps usando banda de resistencia. Ancla la banda arriba, empuja manteniendo codos a los lados, la resistencia creciente abajo proporciona curva de tensión única.',
    },
  },

  // ============================================
  // FOREARMS
  // ============================================
  {
    id: 'barbell_wrist_curl',
    name: { en: 'Barbell Wrist Curl', es: 'Curl de Muñeca con Barra' },
    muscleGroup: 'forearms',
    equipment: ['straight_bar', 'bench'],
    weightType: 'barbell',
    description: {
      en: 'Primary forearm flexor builder. Rest forearms on bench with wrists hanging over edge, curl bar up using only wrist movement, lower fully to stretch forearm flexors completely.',
      es: 'Constructor principal de flexores del antebrazo. Apoya antebrazos en banco con muñecas colgando, curl solo con movimiento de muñecas, baja completamente para estirar los flexores.',
    },
  },
  {
    id: 'barbell_reverse_wrist_curl',
    name: { en: 'Barbell Reverse Wrist Curl', es: 'Curl de Muñeca Inverso con Barra' },
    muscleGroup: 'forearms',
    equipment: ['straight_bar', 'bench'],
    weightType: 'barbell',
    description: {
      en: 'Targets forearm extensors. Forearms on bench with palms facing down, extend wrists upward against resistance, this builds the top of the forearm for balanced development.',
      es: 'Trabaja los extensores del antebrazo. Antebrazos en banco con palmas hacia abajo, extiende las muñecas hacia arriba contra resistencia, esto construye la parte superior del antebrazo.',
    },
  },
  {
    id: 'db_wrist_curl',
    name: { en: 'Dumbbell Wrist Curl', es: 'Curl de Muñeca con Mancuernas' },
    muscleGroup: 'forearms',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Dumbbell version allowing independent wrist work. Can be done one arm at a time for better focus, rest forearm on thigh or bench, curl dumbbell up using wrist flexion only.',
      es: 'Versión con mancuernas permitiendo trabajo independiente. Puede hacerse un brazo a la vez para mejor enfoque, apoya antebrazo en muslo o banco, curl usando solo flexión de muñeca.',
    },
  },
  {
    id: 'db_reverse_wrist_curl',
    name: { en: 'Dumbbell Reverse Wrist Curl', es: 'Curl de Muñeca Inverso con Mancuernas' },
    muscleGroup: 'forearms',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Reverse curl with dumbbells for extensor development. Palm down grip, extend wrist up, lower with control, the dumbbell version allows unilateral work and natural wrist movement.',
      es: 'Curl inverso con mancuernas para desarrollo de extensores. Agarre con palma abajo, extiende muñeca arriba, baja con control, la versión con mancuernas permite trabajo unilateral.',
    },
  },
  {
    id: 'farmers_walk',
    name: { en: "Farmer's Walk", es: 'Paseo del Granjero' },
    muscleGroup: 'forearms',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Loaded carry for grip strength and overall conditioning. Hold heavy dumbbells at sides, walk with good posture, builds crushing grip strength and challenges entire body stabilization.',
      es: 'Cargada para fuerza de agarre y acondicionamiento general. Sostén mancuernas pesadas a los lados, camina con buena postura, construye fuerza de agarre y desafía estabilización corporal.',
    },
  },
  {
    id: 'plate_pinch_hold',
    name: { en: 'Plate Pinch Hold', es: 'Agarre de Disco' },
    muscleGroup: 'forearms',
    equipment: ['plates'],
    weightType: 'plate',
    description: {
      en: 'Grip exercise pinching weight plates together. Pinch two plates smooth sides out, hold at side for time, this specifically targets the pinching grip strength of fingers and thumb.',
      es: 'Ejercicio de agarre presionando discos juntos. Presiona dos discos con lados lisos afuera, sostén al lado por tiempo, esto trabaja específicamente la fuerza de agarre de pellizco.',
    },
  },
  {
    id: 'dead_hang',
    name: { en: 'Dead Hang', es: 'Colgado Pasivo' },
    muscleGroup: 'forearms',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Simple but effective grip endurance builder. Hang from pull-up bar with full bodyweight, work on increasing hang time, also great for shoulder health and spinal decompression.',
      es: 'Constructor simple pero efectivo de resistencia de agarre. Cuélgate de la barra con peso corporal completo, trabaja en aumentar el tiempo, también excelente para salud de hombros.',
    },
  },
  {
    id: 'towel_pullups',
    name: { en: 'Towel Pull-Ups', es: 'Dominadas con Toalla' },
    muscleGroup: 'forearms',
    equipment: ['rack', 'towel'],
    weightType: 'bodyweight',
    description: {
      en: 'Pull-ups gripping towels for extreme grip work. Drape towels over bar, grip towels and perform pull-ups, the unstable grip dramatically increases forearm and grip strength demands.',
      es: 'Dominadas agarrando toallas para trabajo extremo de agarre. Coloca toallas sobre la barra, agarra las toallas y haz dominadas, el agarre inestable aumenta demandas de antebrazos.',
    },
  },
  {
    id: 'cable_wrist_curl',
    name: { en: 'Cable Wrist Curl', es: 'Curl de Muñeca en Polea' },
    muscleGroup: 'forearms',
    equipment: ['low_pulley'],
    weightType: 'machine',
    description: {
      en: 'Constant tension wrist curl using cable. Kneel facing low pulley, curl wrist up against cable resistance, the cable provides smooth resistance through entire range of movement.',
      es: 'Curl de muñeca con tensión constante usando cable. Arrodíllate frente a polea baja, curl de muñeca contra resistencia del cable, el cable proporciona resistencia suave durante todo el rango.',
    },
  },
  {
    id: 'reverse_curl_barbell',
    name: { en: 'Reverse Curl (Barbell)', es: 'Curl Inverso (Barra)' },
    muscleGroup: 'forearms',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Overhand grip curl for brachioradialis and forearm extensors. Curl with palms facing down, this shifts emphasis from biceps to forearm muscles, use lighter weight than regular curls.',
      es: 'Curl con agarre prono para braquiorradial y extensores. Curl con palmas hacia abajo, esto traslada énfasis de bíceps a músculos del antebrazo, usa menos peso que curls regulares.',
    },
  },
  {
    id: 'reverse_curl_ez',
    name: { en: 'Reverse Curl (EZ Bar)', es: 'Curl Inverso (Barra Z)' },
    muscleGroup: 'forearms',
    equipment: ['ez_bar'],
    weightType: 'barbell',
    description: {
      en: 'Reverse curl with EZ bar for wrist comfort. The angled grip reduces wrist strain while targeting forearm extensors and brachioradialis, curl up and lower with controlled tempo.',
      es: 'Curl inverso con barra Z para comodidad de muñeca. El agarre angular reduce tensión en muñecas mientras trabaja extensores del antebrazo y braquiorradial, curl y baja con tempo controlado.',
    },
  },

  // ============================================
  // QUADRICEPS
  // ============================================
  {
    id: 'back_squat',
    name: { en: 'Barbell Back Squat', es: 'Sentadilla con Barra' },
    muscleGroup: 'quads',
    equipment: ['straight_bar', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'The king of leg exercises. Bar on upper back, squat down until thighs are parallel or below, drive up through heels, builds massive quad strength and overall lower body development.',
      es: 'El rey de los ejercicios de piernas. Barra en espalda alta, baja hasta que muslos estén paralelos o más, sube empujando con talones, construye fuerza masiva de cuádriceps.',
    },
  },
  {
    id: 'front_squat',
    name: { en: 'Barbell Front Squat', es: 'Sentadilla Frontal con Barra' },
    muscleGroup: 'quads',
    equipment: ['straight_bar', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Quad-dominant squat with bar in front position. Bar rests on front delts, requires upright torso, this shifts emphasis more to quadriceps while being easier on the lower back.',
      es: 'Sentadilla dominante de cuádriceps con barra al frente. La barra descansa en deltoides frontales, requiere torso erguido, esto enfatiza más los cuádriceps siendo más fácil para espalda.',
    },
  },
  {
    id: 'box_squat',
    name: { en: 'Barbell Box Squat', es: 'Sentadilla en Caja con Barra' },
    muscleGroup: 'quads',
    equipment: ['straight_bar', 'rack', 'bench'],
    weightType: 'barbell',
    description: {
      en: 'Squat to a box for consistent depth and power development. Sit back onto box, pause briefly, explode up, excellent for teaching proper squat mechanics and building starting strength.',
      es: 'Sentadilla a una caja para profundidad consistente y desarrollo de potencia. Siéntate en la caja, pausa brevemente, explota hacia arriba, excelente para enseñar mecánica correcta.',
    },
  },
  {
    id: 'pause_squat',
    name: { en: 'Barbell Pause Squat', es: 'Sentadilla con Pausa' },
    muscleGroup: 'quads',
    equipment: ['straight_bar', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Squat with pause at bottom position. Hold bottom position for two to three seconds before driving up, eliminates stretch reflex and builds tremendous strength out of the hole.',
      es: 'Sentadilla con pausa en posición inferior. Mantén la posición baja dos a tres segundos antes de subir, elimina el reflejo de estiramiento y construye fuerza tremenda desde abajo.',
    },
  },
  {
    id: 'goblet_squat',
    name: { en: 'Goblet Squat', es: 'Sentadilla Goblet' },
    muscleGroup: 'quads',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Beginner-friendly squat holding dumbbell at chest. Hold dumbbell vertically against chest, squat deep keeping torso upright, excellent for learning squat form and building foundation.',
      es: 'Sentadilla amigable para principiantes sosteniendo mancuerna en el pecho. Sostén mancuerna vertical contra el pecho, sentadilla profunda con torso erguido, excelente para aprender técnica.',
    },
  },
  {
    id: 'dumbbell_squat',
    name: { en: 'Dumbbell Squat', es: 'Sentadilla con Mancuernas' },
    muscleGroup: 'quads',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Squat holding dumbbells at sides. Hold dumbbells at arms length by sides, squat down with good form, useful when barbell is unavailable or for higher rep leg work.',
      es: 'Sentadilla sosteniendo mancuernas a los lados. Sostén mancuernas con brazos extendidos a los lados, sentadilla con buena forma, útil cuando no hay barra o para trabajo de más reps.',
    },
  },
  {
    id: 'lunges_forward',
    name: { en: 'Dumbbell Lunges (Forward)', es: 'Zancadas Frontales con Mancuernas' },
    muscleGroup: 'quads',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Forward stepping lunge for quad and glute development. Step forward, lower back knee toward floor, push back to start, alternating legs, excellent unilateral leg exercise.',
      es: 'Zancada hacia adelante para desarrollo de cuádriceps y glúteos. Da un paso adelante, baja la rodilla trasera hacia el suelo, empuja para regresar, alternando piernas.',
    },
  },
  {
    id: 'lunges_reverse',
    name: { en: 'Dumbbell Lunges (Reverse)', es: 'Zancadas Inversas con Mancuernas' },
    muscleGroup: 'quads',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Backward stepping lunge easier on knees. Step backward into lunge position, lower until back knee nearly touches floor, return to start, generally more knee-friendly than forward lunges.',
      es: 'Zancada hacia atrás más fácil para las rodillas. Da un paso atrás a posición de zancada, baja hasta que rodilla trasera casi toque el suelo, regresa, más amigable para rodillas.',
    },
  },
  {
    id: 'lunges_walking',
    name: { en: 'Dumbbell Lunges (Walking)', es: 'Zancadas Caminando con Mancuernas' },
    muscleGroup: 'quads',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Continuous walking lunges for endurance and size. Lunge forward, bring back leg through to next lunge, continue walking pattern, builds leg endurance and functional strength.',
      es: 'Zancadas caminando continuas para resistencia y tamaño. Zancada hacia adelante, trae la pierna trasera a la siguiente zancada, continúa caminando, construye resistencia y fuerza funcional.',
    },
  },
  {
    id: 'barbell_lunges',
    name: { en: 'Barbell Lunges', es: 'Zancadas con Barra' },
    muscleGroup: 'quads',
    equipment: ['straight_bar', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Lunges with barbell for heavier loading. Bar on upper back like squat position, perform forward or reverse lunges, allows heavier weights than dumbbells for strength development.',
      es: 'Zancadas con barra para mayor carga. Barra en espalda alta como posición de sentadilla, realiza zancadas frontales o inversas, permite pesos más pesados que mancuernas.',
    },
  },
  {
    id: 'bulgarian_split_squat_db',
    name: { en: 'Dumbbell Bulgarian Split Squat', es: 'Sentadilla Búlgara con Mancuernas' },
    muscleGroup: 'quads',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Single-leg squat with rear foot elevated on bench. Holding dumbbells, lower until front thigh is parallel, excellent for quad development and addressing leg strength imbalances.',
      es: 'Sentadilla a una pierna con pie trasero elevado en banco. Sosteniendo mancuernas, baja hasta que muslo frontal esté paralelo, excelente para desarrollo de cuádriceps y desequilibrios.',
    },
  },
  {
    id: 'bulgarian_split_squat_bb',
    name: { en: 'Barbell Bulgarian Split Squat', es: 'Sentadilla Búlgara con Barra' },
    muscleGroup: 'quads',
    equipment: ['straight_bar', 'rack', 'bench'],
    weightType: 'barbell',
    description: {
      en: 'Barbell loaded Bulgarian split squat for serious leg development. Bar on back, rear foot on bench, squat down on front leg, allows heavier loading than dumbbell version.',
      es: 'Sentadilla búlgara con barra para desarrollo serio de piernas. Barra en la espalda, pie trasero en banco, sentadilla con pierna frontal, permite mayor carga que versión con mancuernas.',
    },
  },
  {
    id: 'step_ups',
    name: { en: 'Dumbbell Step-Ups', es: 'Step-Ups con Mancuernas' },
    muscleGroup: 'quads',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Functional unilateral leg exercise stepping onto a platform. Drive through heel of elevated foot to step up, lower with control, builds single-leg strength and balance.',
      es: 'Ejercicio funcional unilateral subiendo a una plataforma. Empuja con el talón del pie elevado para subir, baja con control, construye fuerza de una pierna y equilibrio.',
    },
  },
  {
    id: 'leg_extension',
    name: { en: 'Leg Extension', es: 'Extensión de Piernas' },
    muscleGroup: 'quads',
    equipment: ['leg_extension_station'],
    weightType: 'machine',
    description: {
      en: 'Isolation exercise targeting quadriceps directly. Sit with knees at edge of pad, extend legs fully, squeeze quads at top, lower with control, excellent for quad isolation and definition.',
      es: 'Ejercicio de aislamiento que trabaja los cuádriceps directamente. Siéntate con rodillas en el borde del pad, extiende piernas completamente, aprieta arriba, baja con control.',
    },
  },
  {
    id: 'leg_press',
    name: { en: 'Leg Press', es: 'Prensa de Piernas' },
    muscleGroup: 'quads',
    equipment: ['leg_press_station'],
    weightType: 'machine',
    description: {
      en: 'Machine compound movement for heavy quad loading. Press platform away by extending legs, lower with control, foot placement affects muscle emphasis, allows very heavy weights safely.',
      es: 'Movimiento compuesto en máquina para carga pesada de cuádriceps. Empuja la plataforma extendiendo piernas, baja con control, la posición de pies afecta el énfasis muscular.',
    },
  },
  {
    id: 'sissy_squat',
    name: { en: 'Sissy Squat', es: 'Sentadilla Sissy' },
    muscleGroup: 'quads',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Advanced quad isolation with unique body angle. Hold support, lean back while bending knees, lower until quads are fully stretched, intense rectus femoris emphasis at extreme stretch.',
      es: 'Aislamiento avanzado de cuádriceps con ángulo corporal único. Sostén un soporte, inclínate atrás mientras flexionas rodillas, baja hasta estirar completamente, énfasis intenso en recto femoral.',
    },
  },
  {
    id: 'wall_sit',
    name: { en: 'Wall Sit', es: 'Sentadilla en Pared' },
    muscleGroup: 'quads',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Isometric quad exercise against a wall. Slide down wall until thighs are parallel to floor, hold position, builds quad endurance and mental toughness through static contraction.',
      es: 'Ejercicio isométrico de cuádriceps contra una pared. Deslízate hasta que los muslos estén paralelos al suelo, mantén la posición, construye resistencia de cuádriceps y fortaleza mental.',
    },
  },
  {
    id: 'band_squat',
    name: { en: 'Band Squat', es: 'Sentadilla con Banda' },
    muscleGroup: 'quads',
    equipment: ['resistance_band'],
    weightType: 'bodyweight',
    description: {
      en: 'Squat with resistance band for added tension. Stand on band with handles at shoulders, squat down, the band adds resistance especially at the top of the movement.',
      es: 'Sentadilla con banda de resistencia para tensión adicional. Párate sobre la banda con mangos en hombros, haz sentadilla, la banda añade resistencia especialmente arriba del movimiento.',
    },
  },

  // ============================================
  // HAMSTRINGS
  // ============================================
  {
    id: 'rdl_barbell',
    name: { en: 'Romanian Deadlift (Barbell)', es: 'Peso Muerto Rumano (Barra)' },
    muscleGroup: 'hamstrings',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Primary hamstring builder through hip hinge. Keep slight knee bend, push hips back lowering bar along legs, feel hamstring stretch, return by driving hips forward, maintain flat back.',
      es: 'Constructor principal de isquiotibiales mediante bisagra de cadera. Mantén ligera flexión de rodilla, empuja caderas atrás bajando la barra, siente el estiramiento, regresa empujando caderas.',
    },
  },
  {
    id: 'rdl_dumbbell',
    name: { en: 'Romanian Deadlift (Dumbbell)', es: 'Peso Muerto Rumano (Mancuernas)' },
    muscleGroup: 'hamstrings',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Dumbbell RDL allowing natural arm path. Hold dumbbells in front of thighs, hinge at hips keeping back flat, lower until hamstrings are stretched, return to standing position.',
      es: 'RDL con mancuernas permitiendo trayectoria natural de brazos. Sostén mancuernas frente a los muslos, haz bisagra en caderas con espalda plana, baja hasta estirar isquiotibiales.',
    },
  },
  {
    id: 'stiff_leg_deadlift',
    name: { en: 'Stiff-Leg Deadlift', es: 'Peso Muerto con Piernas Rígidas' },
    muscleGroup: 'hamstrings',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Deadlift variation with minimal knee bend for maximum hamstring stretch. Keep legs nearly straight, hinge forward lowering bar, feel extreme hamstring stretch, return maintaining flat back.',
      es: 'Variación de peso muerto con mínima flexión de rodilla para máximo estiramiento. Mantén piernas casi rectas, inclínate bajando la barra, siente estiramiento extremo de isquiotibiales.',
    },
  },
  {
    id: 'single_leg_rdl',
    name: { en: 'Single-Leg Romanian Deadlift', es: 'Peso Muerto Rumano a Una Pierna' },
    muscleGroup: 'hamstrings',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Unilateral RDL for balance and hamstring development. Stand on one leg, hinge forward while extending other leg back, lower until torso is parallel, return maintaining balance.',
      es: 'RDL unilateral para equilibrio y desarrollo de isquiotibiales. De pie en una pierna, inclínate extendiendo la otra pierna atrás, baja hasta torso paralelo, regresa manteniendo equilibrio.',
    },
  },
  {
    id: 'good_mornings_hamstrings',
    name: { en: 'Good Mornings', es: 'Buenos Días' },
    muscleGroup: 'hamstrings',
    equipment: ['straight_bar', 'rack'],
    weightType: 'barbell',
    description: {
      en: 'Posterior chain exercise emphasizing hamstrings. Bar on upper back, bow forward by pushing hips back, feel hamstring stretch, return to upright position maintaining flat back throughout.',
      es: 'Ejercicio de cadena posterior enfatizando isquiotibiales. Barra en espalda alta, inclínate empujando caderas atrás, siente el estiramiento de isquios, regresa erguido con espalda plana.',
    },
  },
  {
    id: 'leg_curl',
    name: { en: 'Leg Curl', es: 'Curl de Piernas' },
    muscleGroup: 'hamstrings',
    equipment: ['leg_curl_station'],
    weightType: 'machine',
    description: {
      en: 'Machine isolation for hamstring knee flexion. Curl heels toward glutes, squeeze hamstrings at top, lower with control, keeps hips stable for strict isolation.',
      es: 'Aislamiento en máquina para flexión de rodilla de isquiotibiales. Curl de talones hacia glúteos, aprieta isquios arriba, baja con control, mantiene caderas estables.',
    },
  },
  {
    id: 'seated_leg_curl',
    name: { en: 'Seated Leg Curl', es: 'Curl de Piernas Sentado' },
    muscleGroup: 'hamstrings',
    equipment: ['leg_curl_station'],
    weightType: 'machine',
    description: {
      en: 'Seated version of leg curl machine. Sit with pad above ankles, curl legs down and back, the seated position provides different hamstring stretch than lying version.',
      es: 'Versión sentada de la máquina de curl de piernas. Siéntate con pad sobre los tobillos, curl de piernas hacia abajo y atrás, la posición sentada proporciona diferente estiramiento.',
    },
  },
  {
    id: 'cable_pull_through',
    name: { en: 'Cable Pull-Through', es: 'Tirón de Cable entre Piernas' },
    muscleGroup: 'hamstrings',
    equipment: ['low_pulley', 'rope'],
    weightType: 'machine',
    description: {
      en: 'Hip hinge with constant cable tension. Face away from low pulley, rope between legs, hinge forward then thrust hips to stand, excellent hip hinge pattern practice with resistance.',
      es: 'Bisagra de cadera con tensión constante de cable. De espaldas a polea baja, cuerda entre piernas, inclínate y empuja caderas para pararte, excelente práctica de bisagra con resistencia.',
    },
  },
  {
    id: 'nordic_curl',
    name: { en: 'Nordic Curl (Assisted)', es: 'Curl Nórdico (Asistido)' },
    muscleGroup: 'hamstrings',
    equipment: ['bench'],
    weightType: 'bodyweight',
    description: {
      en: 'Advanced eccentric hamstring exercise. Kneel with ankles secured, lower body forward under control, use hands to assist back up, builds incredible hamstring strength and injury resistance.',
      es: 'Ejercicio excéntrico avanzado de isquiotibiales. Arrodíllate con tobillos asegurados, baja el cuerpo hacia adelante con control, usa manos para asistir al subir, construye fuerza increíble.',
    },
  },
  {
    id: 'glute_ham_raise',
    name: { en: 'Glute-Ham Raise (on bench)', es: 'Elevación Glúteo-Isquio (en banco)' },
    muscleGroup: 'hamstrings',
    equipment: ['bench'],
    weightType: 'bodyweight',
    description: {
      en: 'Challenging hamstring and glute exercise. Position on decline bench face down, lower upper body then curl back up using hamstrings and glutes, extremely demanding posterior chain movement.',
      es: 'Ejercicio desafiante de isquiotibiales y glúteos. Posiciónate en banco declinado boca abajo, baja el torso y sube usando isquios y glúteos, movimiento muy exigente de cadena posterior.',
    },
  },
  {
    id: 'band_leg_curl',
    name: { en: 'Band Leg Curl', es: 'Curl de Piernas con Banda' },
    muscleGroup: 'hamstrings',
    equipment: ['resistance_band'],
    weightType: 'bodyweight',
    description: {
      en: 'Hamstring curl using resistance band. Lie face down with band around ankles, curl heels toward glutes, great for home workouts or as a warm-up before heavier hamstring work.',
      es: 'Curl de isquiotibiales usando banda de resistencia. Boca abajo con banda en tobillos, curl de talones hacia glúteos, ideal para entrenar en casa o como calentamiento antes de trabajo pesado.',
    },
  },

  // ============================================
  // GLUTES
  // ============================================
  {
    id: 'hip_thrust_barbell',
    name: { en: 'Barbell Hip Thrust', es: 'Empuje de Cadera con Barra' },
    muscleGroup: 'glutes',
    equipment: ['straight_bar', 'bench'],
    weightType: 'barbell',
    description: {
      en: 'Primary glute builder with heavy loading potential. Back against bench, bar across hips, drive hips up squeezing glutes hard at top, lower with control, builds strong powerful glutes.',
      es: 'Constructor principal de glúteos con potencial de carga pesada. Espalda contra banco, barra en caderas, empuja caderas arriba apretando glúteos fuerte, baja con control.',
    },
  },
  {
    id: 'hip_thrust_dumbbell',
    name: { en: 'Dumbbell Hip Thrust', es: 'Empuje de Cadera con Mancuerna' },
    muscleGroup: 'glutes',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Hip thrust with dumbbell for lighter loading. Place dumbbell on hips, perform hip thrust movement, good for beginners or higher rep glute work without need for barbell setup.',
      es: 'Empuje de cadera con mancuerna para carga más ligera. Coloca mancuerna en caderas, realiza el movimiento de empuje, bueno para principiantes o trabajo de más repeticiones.',
    },
  },
  {
    id: 'single_leg_hip_thrust',
    name: { en: 'Single-Leg Hip Thrust', es: 'Empuje de Cadera a Una Pierna' },
    muscleGroup: 'glutes',
    equipment: ['bench'],
    weightType: 'bodyweight',
    description: {
      en: 'Unilateral hip thrust for balanced glute development. One foot planted, other leg extended or bent, thrust hips up using single leg, excellent for addressing glute imbalances.',
      es: 'Empuje de cadera unilateral para desarrollo equilibrado de glúteos. Un pie plantado, otra pierna extendida o flexionada, empuja con una pierna, excelente para desequilibrios.',
    },
  },
  {
    id: 'glute_bridge_barbell',
    name: { en: 'Barbell Glute Bridge', es: 'Puente de Glúteos con Barra' },
    muscleGroup: 'glutes',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Floor-based glute exercise with barbell loading. Lie on floor, bar across hips, bridge up squeezing glutes at top, easier setup than hip thrusts while still building strong glutes.',
      es: 'Ejercicio de glúteos en el suelo con carga de barra. Acuéstate en el suelo, barra en caderas, eleva en puente apretando glúteos arriba, configuración más fácil que empujes de cadera.',
    },
  },
  {
    id: 'glute_bridge_dumbbell',
    name: { en: 'Dumbbell Glute Bridge', es: 'Puente de Glúteos con Mancuerna' },
    muscleGroup: 'glutes',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Simple glute bridge with dumbbell on hips. Lie on floor, place dumbbell on lower abdomen, bridge up squeezing glutes, great starting exercise for glute activation and development.',
      es: 'Puente de glúteos simple con mancuerna en caderas. Acuéstate en el suelo, coloca mancuerna en abdomen bajo, eleva apretando glúteos, excelente ejercicio inicial para activación.',
    },
  },
  {
    id: 'cable_kickback_glutes',
    name: { en: 'Cable Kickback', es: 'Patada Trasera en Polea' },
    muscleGroup: 'glutes',
    equipment: ['low_pulley', 'ankle_strap'],
    weightType: 'machine',
    description: {
      en: 'Glute isolation using cable and ankle strap. Attach strap to ankle, face low pulley, kick leg back squeezing glute at top, constant tension throughout entire range of motion.',
      es: 'Aislamiento de glúteos usando cable y correa de tobillo. Conecta la correa al tobillo, de frente a polea baja, patea hacia atrás apretando glúteo arriba, tensión constante.',
    },
  },
  {
    id: 'cable_pull_through_glutes',
    name: { en: 'Cable Pull-Through', es: 'Tirón de Cable entre Piernas' },
    muscleGroup: 'glutes',
    equipment: ['low_pulley', 'rope'],
    weightType: 'machine',
    description: {
      en: 'Hip hinge for glutes with cable resistance. Face away from low pulley, rope between legs, hinge and thrust hips forward, excellent glute activation with constant cable tension.',
      es: 'Bisagra de cadera para glúteos con resistencia de cable. De espaldas a polea baja, cuerda entre piernas, inclínate y empuja caderas adelante, excelente activación con tensión constante.',
    },
  },
  {
    id: 'sumo_deadlift',
    name: { en: 'Sumo Deadlift', es: 'Peso Muerto Sumo' },
    muscleGroup: 'glutes',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Wide stance deadlift emphasizing glutes and adductors. Feet wide, toes pointed out, grip inside legs, drive through heels to stand, keeps torso more upright than conventional deadlift.',
      es: 'Peso muerto con postura ancha enfatizando glúteos y aductores. Pies anchos, puntas afuera, agarre dentro de piernas, empuja con talones para pararte, torso más erguido.',
    },
  },
  {
    id: 'sumo_squat',
    name: { en: 'Sumo Squat', es: 'Sentadilla Sumo' },
    muscleGroup: 'glutes',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Wide stance squat for inner thighs and glutes. Hold dumbbell between legs, squat with wide stance and toes pointed out, emphasizes glutes and adductors more than standard squat.',
      es: 'Sentadilla con postura ancha para muslos internos y glúteos. Sostén mancuerna entre piernas, sentadilla con postura ancha y puntas afuera, enfatiza glúteos y aductores.',
    },
  },
  {
    id: 'rdl_glutes',
    name: { en: 'Romanian Deadlift', es: 'Peso Muerto Rumano' },
    muscleGroup: 'glutes',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Hip hinge building both hamstrings and glutes. Keep slight knee bend, push hips back lowering bar, squeeze glutes to return to standing, essential posterior chain movement.',
      es: 'Bisagra de cadera construyendo isquiotibiales y glúteos. Mantén ligera flexión de rodilla, empuja caderas atrás bajando la barra, aprieta glúteos para regresar, movimiento esencial.',
    },
  },
  {
    id: 'step_ups_glutes',
    name: { en: 'Step-Ups (Glute Focus)', es: 'Step-Ups (Enfoque Glúteos)' },
    muscleGroup: 'glutes',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Step-up emphasizing glute drive. Use higher box, drive through heel of elevated foot, focus on squeezing glute at top, lean slightly forward to increase glute activation.',
      es: 'Step-up enfatizando impulso de glúteos. Usa caja más alta, empuja con talón del pie elevado, enfócate en apretar glúteo arriba, inclínate ligeramente para aumentar activación.',
    },
  },
  {
    id: 'lateral_band_walk',
    name: { en: 'Lateral Band Walk', es: 'Caminata Lateral con Banda' },
    muscleGroup: 'glutes',
    equipment: ['resistance_band'],
    weightType: 'bodyweight',
    description: {
      en: 'Side-stepping with band for glute medius activation. Band around thighs or ankles, step sideways maintaining tension, excellent for glute activation warm-up and hip stability.',
      es: 'Pasos laterales con banda para activación del glúteo medio. Banda alrededor de muslos o tobillos, paso lateral manteniendo tensión, excelente para calentamiento y estabilidad.',
    },
  },
  {
    id: 'clamshells',
    name: { en: 'Clamshells', es: 'Conchas' },
    muscleGroup: 'glutes',
    equipment: ['resistance_band'],
    weightType: 'bodyweight',
    description: {
      en: 'Side-lying hip external rotation for glute medius. Lie on side with knees bent, rotate top knee open against band resistance, excellent for targeting the often weak glute medius.',
      es: 'Rotación externa de cadera acostado de lado para glúteo medio. Acuéstate de lado con rodillas flexionadas, rota la rodilla superior contra resistencia, excelente para el glúteo medio.',
    },
  },
  {
    id: 'donkey_kicks',
    name: { en: 'Donkey Kicks', es: 'Patadas de Burro' },
    muscleGroup: 'glutes',
    equipment: ['ankle_strap'],
    weightType: 'bodyweight',
    description: {
      en: 'Quadruped glute kickback movement. On hands and knees, kick one leg back and up, squeeze glute at top, can be done with bodyweight or ankle strap attached to cable.',
      es: 'Movimiento de patada de glúteos en cuadrupedia. A cuatro patas, patea una pierna atrás y arriba, aprieta glúteo arriba, puede hacerse con peso corporal o correa de tobillo.',
    },
  },
  {
    id: 'fire_hydrants',
    name: { en: 'Fire Hydrants', es: 'Hidrantes' },
    muscleGroup: 'glutes',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Hip abduction on hands and knees targeting glute medius. Lift bent knee out to side while maintaining stable hips, squeeze outer glute, return with control, builds hip stability.',
      es: 'Abducción de cadera a cuatro patas trabajando glúteo medio. Levanta rodilla flexionada hacia el lado manteniendo caderas estables, aprieta glúteo externo, regresa con control.',
    },
  },
  {
    id: 'frog_pumps',
    name: { en: 'Frog Pumps', es: 'Bombeos de Rana' },
    muscleGroup: 'glutes',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Glute bridge variation with feet together. Lie on back, soles of feet together knees out, perform bridge movement, unique angle targets glutes differently than standard bridges.',
      es: 'Variación de puente de glúteos con pies juntos. Acuéstate boca arriba, plantas de pies juntas rodillas afuera, realiza movimiento de puente, ángulo único trabaja glúteos diferente.',
    },
  },

  // ============================================
  // CALVES
  // ============================================
  {
    id: 'standing_calf_raise_barbell',
    name: { en: 'Standing Calf Raise (Barbell)', es: 'Elevación de Talones de Pie (Barra)' },
    muscleGroup: 'calves',
    equipment: ['straight_bar', 'rack', 'plates'],
    weightType: 'barbell',
    description: {
      en: 'Heavy loaded calf raise with barbell. Bar on back, stand on elevated surface for range of motion, rise onto toes, squeeze calves at top, lower heels below platform for stretch.',
      es: 'Elevación de talones con carga pesada de barra. Barra en espalda, de pie en superficie elevada, sube a las puntas, aprieta gemelos arriba, baja talones bajo la plataforma.',
    },
  },
  {
    id: 'standing_calf_raise_dumbbell',
    name: { en: 'Standing Calf Raise (Dumbbell)', es: 'Elevación de Talones de Pie (Mancuernas)' },
    muscleGroup: 'calves',
    equipment: ['dumbbells', 'plates'],
    weightType: 'dumbbell',
    description: {
      en: 'Calf raise holding dumbbells for added resistance. Stand on elevated edge, hold dumbbells at sides, rise up on toes, lower heels below platform, works the gastrocnemius muscle.',
      es: 'Elevación de talones sosteniendo mancuernas para resistencia adicional. De pie en borde elevado, sostén mancuernas a los lados, sube a las puntas, baja talones bajo la plataforma.',
    },
  },
  {
    id: 'standing_calf_raise_single',
    name: { en: 'Standing Calf Raise (Single Leg)', es: 'Elevación de Talones a Una Pierna' },
    muscleGroup: 'calves',
    equipment: ['dumbbells', 'plates'],
    weightType: 'dumbbell',
    description: {
      en: 'Unilateral calf raise for balanced development. Stand on one foot on elevated surface, hold dumbbell for resistance, allows full focus on each calf independently for even growth.',
      es: 'Elevación de talón unilateral para desarrollo equilibrado. De pie en un pie en superficie elevada, sostén mancuerna, permite enfoque completo en cada gemelo independientemente.',
    },
  },
  {
    id: 'seated_calf_raise',
    name: { en: 'Seated Calf Raise', es: 'Elevación de Talones Sentado' },
    muscleGroup: 'calves',
    equipment: ['dumbbells', 'bench'],
    weightType: 'dumbbell',
    description: {
      en: 'Seated calf raise targeting the soleus muscle. Sit with weight on knees, perform calf raise movement, the bent knee position shifts emphasis to the soleus rather than gastrocnemius.',
      es: 'Elevación de talón sentado trabajando el sóleo. Siéntate con peso en las rodillas, realiza el movimiento de elevación, la posición de rodilla flexionada traslada énfasis al sóleo.',
    },
  },
  {
    id: 'leg_press_calf_raise',
    name: { en: 'Leg Press Calf Raise', es: 'Elevación de Talones en Prensa' },
    muscleGroup: 'calves',
    equipment: ['leg_press_station'],
    weightType: 'machine',
    description: {
      en: 'Calf raise using leg press machine. Position toes on bottom of platform, press through toes to extend calves, allows heavy loading with machine support for safe calf training.',
      es: 'Elevación de talones usando la prensa de piernas. Posiciona puntas en la parte baja de la plataforma, empuja con puntas para extender gemelos, permite carga pesada con soporte.',
    },
  },
  {
    id: 'donkey_calf_raise',
    name: { en: 'Donkey Calf Raise', es: 'Elevación de Talones Burro' },
    muscleGroup: 'calves',
    equipment: ['dip_belt', 'rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Classic calf exercise with torso bent forward. Hinge forward, weight on hips via belt, perform calf raises, the angled position provides excellent stretch and contraction for calves.',
      es: 'Ejercicio clásico de gemelos con torso inclinado hacia adelante. Inclínate hacia adelante, peso en caderas vía cinturón, eleva talones, la posición angulada proporciona excelente estiramiento.',
    },
  },
  {
    id: 'jump_rope',
    name: { en: 'Jump Rope', es: 'Saltar la Cuerda' },
    muscleGroup: 'calves',
    equipment: ['jump_rope'],
    weightType: 'bodyweight',
    description: {
      en: 'Cardio exercise that builds calf endurance. Jump continuously on balls of feet, excellent for calf conditioning, footwork, coordination, and cardiovascular fitness simultaneously.',
      es: 'Ejercicio cardiovascular que construye resistencia de gemelos. Salta continuamente en las puntas de los pies, excelente para acondicionamiento de gemelos, coordinación y cardio.',
    },
  },
  {
    id: 'calf_raise_bodyweight',
    name: { en: 'Calf Raise (Bodyweight)', es: 'Elevación de Talones (Peso Corporal)' },
    muscleGroup: 'calves',
    equipment: ['plates'],
    weightType: 'bodyweight',
    description: {
      en: 'Simple bodyweight calf raise for beginners. Stand on elevated edge, rise onto toes, lower heels below platform for full stretch, can do high reps for calf endurance and burn.',
      es: 'Elevación simple de talones con peso corporal para principiantes. De pie en borde elevado, sube a las puntas, baja talones para estiramiento completo, muchas reps para resistencia.',
    },
  },

  // ============================================
  // CORE
  // ============================================
  {
    id: 'wheel_crunches',
    name: { en: 'Wheel Crunches', es: 'Abdominales con Rueda' },
    muscleGroup: 'core',
    equipment: ['abs_wheel'],
    weightType: 'bodyweight',
    description: {
      en: 'Kneel and grip the wheel. Roll it forward, extending your body while keeping your core tight. Stop before your hips sag, then use your abs to pull back to the start.',
      es: 'Arrodíllate y sujeta la rueda. Rueda hacia adelante, extendiendo el cuerpo con el core activo. Detente antes de arquear la espalda y usa los abdominales para volver.',
    },
  },{
    id: 'crunches',
    name: { en: 'Crunches', es: 'Abdominales' },
    muscleGroup: 'core',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Basic abdominal exercise for upper abs. Lie on back with knees bent, curl shoulders toward hips contracting abs, lower with control, focus on abdominal contraction not neck pulling.',
      es: 'Ejercicio abdominal básico para abdominales superiores. Acuéstate con rodillas flexionadas, eleva hombros hacia caderas contrayendo abdominales, baja con control.',
    },
  },
  {
    id: 'reverse_crunches',
    name: { en: 'Reverse Crunches', es: 'Abdominales Invertidos' },
    muscleGroup: 'core',
    equipment: ['bench'],
    weightType: 'bodyweight',
    description: {
      en: 'Lower ab focus by lifting hips. Lie on back, lift knees toward chest curling hips off floor, lower with control, targets lower portion of rectus abdominis effectively.',
      es: 'Enfoque en abdominales bajos levantando caderas. Acuéstate boca arriba, levanta rodillas hacia el pecho elevando caderas del suelo, baja con control, trabaja porción inferior del recto.',
    },
  },
  {
    id: 'bicycle_crunches',
    name: { en: 'Bicycle Crunches', es: 'Abdominales Bicicleta' },
    muscleGroup: 'core',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Rotational crunch for abs and obliques. Lie on back, bring opposite elbow to knee while extending other leg, alternate sides in cycling motion, excellent for oblique development.',
      es: 'Crunch rotacional para abdominales y oblicuos. Acuéstate boca arriba, lleva codo opuesto a rodilla mientras extiendes la otra pierna, alterna lados en movimiento de ciclismo.',
    },
  },
  {
    id: 'sit_ups',
    name: { en: 'Sit-Ups', es: 'Sit-Ups' },
    muscleGroup: 'core',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Full range abdominal movement. Lie on back, sit all the way up touching toes or knees, lower with control, involves hip flexors more than crunches but builds overall core strength.',
      es: 'Movimiento abdominal de rango completo. Acuéstate boca arriba, siéntate completamente tocando dedos o rodillas, baja con control, involucra más flexores de cadera.',
    },
  },
  {
    id: 'decline_sit_ups',
    name: { en: 'Decline Sit-Ups', es: 'Sit-Ups Declinados' },
    muscleGroup: 'core',
    equipment: ['bench'],
    weightType: 'bodyweight',
    description: {
      en: 'Sit-ups on decline bench for increased difficulty. Hook feet under pads, lower back down bench, sit up contracting abs, the decline increases resistance and range of motion.',
      es: 'Sit-ups en banco declinado para mayor dificultad. Engancha pies bajo los pads, baja la espalda por el banco, siéntate contrayendo abdominales, la declinación aumenta resistencia.',
    },
  },
  {
    id: 'weighted_decline_sit_ups',
    name: { en: 'Weighted Decline Sit-Ups', es: 'Sit-Ups Declinados con Peso' },
    muscleGroup: 'core',
    equipment: ['bench', 'plates'],
    weightType: 'plate',
    description: {
      en: 'Decline sit-up with added weight for strength building. Hold plate against chest, perform decline sit-up, the added resistance builds abdominal strength beyond bodyweight.',
      es: 'Sit-up declinado con peso adicional para construir fuerza. Sostén disco contra el pecho, realiza sit-up declinado, la resistencia adicional construye fuerza abdominal.',
    },
  },
  {
    id: 'hanging_leg_raise',
    name: { en: 'Hanging Leg Raise', es: 'Elevación de Piernas Colgado' },
    muscleGroup: 'core',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Advanced lower ab exercise hanging from bar. Hang from pull-up bar, raise straight legs to horizontal or higher, lower with control, demands significant core strength and control.',
      es: 'Ejercicio avanzado de abdominales bajos colgado de barra. Cuélgate de la barra, eleva piernas rectas a horizontal o más, baja con control, demanda fuerza y control significativo.',
    },
  },
  {
    id: 'hanging_knee_raise',
    name: { en: 'Hanging Knee Raise', es: 'Elevación de Rodillas Colgado' },
    muscleGroup: 'core',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Easier regression of hanging leg raise. Hang from bar, bring knees up toward chest, lower with control, builds toward full leg raises while still effectively targeting lower abs.',
      es: 'Regresión más fácil de elevación de piernas colgado. Cuélgate de la barra, lleva rodillas hacia el pecho, baja con control, progresa hacia elevaciones completas.',
    },
  },
  {
    id: 'hanging_oblique_knee_raise',
    name: { en: 'Hanging Oblique Knee Raise', es: 'Elevación Oblicua de Rodillas Colgado' },
    muscleGroup: 'core',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Hanging knee raise with rotation for obliques. Hang from bar, raise knees up and to one side, alternate sides, the rotation emphasizes oblique muscles along with lower abs.',
      es: 'Elevación de rodillas colgado con rotación para oblicuos. Cuélgate de la barra, eleva rodillas hacia un lado, alterna lados, la rotación enfatiza oblicuos y abdominales bajos.',
    },
  },
  {
    id: 'toes_to_bar',
    name: { en: 'Toes to Bar', es: 'Dedos a la Barra' },
    muscleGroup: 'core',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Advanced hanging ab exercise bringing toes to bar. Hang from bar, swing legs up to touch bar with toes, requires significant core strength, hip flexor flexibility, and control.',
      es: 'Ejercicio abdominal avanzado colgado llevando dedos a la barra. Cuélgate de la barra, balancea piernas para tocar la barra con los dedos, requiere fuerza y flexibilidad.',
    },
  },
  {
    id: 'windshield_wipers',
    name: { en: 'Windshield Wipers', es: 'Limpiaparabrisas' },
    muscleGroup: 'core',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Rotational hanging movement for obliques. Hang from bar, raise legs straight up, rotate them side to side like windshield wipers, extremely challenging oblique and core exercise.',
      es: 'Movimiento rotacional colgado para oblicuos. Cuélgate de la barra, eleva piernas rectas, rótalas de lado a lado como limpiaparabrisas, ejercicio extremadamente desafiante.',
    },
  },
  {
    id: 'cable_crunch',
    name: { en: 'Cable Crunch (Kneeling)', es: 'Crunch en Polea (Arrodillado)' },
    muscleGroup: 'core',
    equipment: ['high_pulley', 'rope'],
    weightType: 'machine',
    description: {
      en: 'Weighted crunch using cable for progressive resistance. Kneel facing away from high pulley, crunch down contracting abs against cable resistance, allows heavy loading for ab strength.',
      es: 'Crunch con peso usando cable para resistencia progresiva. Arrodíllate de espaldas a polea alta, crunch contrayendo abdominales contra resistencia del cable, permite carga pesada.',
    },
  },
  {
    id: 'cable_woodchop_high',
    name: { en: 'Cable Woodchop (High to Low)', es: 'Leñador en Polea (Alto a Bajo)' },
    muscleGroup: 'core',
    equipment: ['high_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Rotational core exercise from high to low. Pull cable diagonally across body from high to low, rotating through core, excellent for building rotational power and oblique strength.',
      es: 'Ejercicio rotacional de core de alto a bajo. Tira el cable diagonalmente a través del cuerpo de alto a bajo, rotando el core, excelente para potencia rotacional y fuerza de oblicuos.',
    },
  },
  {
    id: 'cable_woodchop_low',
    name: { en: 'Cable Woodchop (Low to High)', es: 'Leñador en Polea (Bajo a Alto)' },
    muscleGroup: 'core',
    equipment: ['low_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Rotational movement from low to high position. Pull cable diagonally upward across body, rotating through core, works obliques and rotational muscles from a different angle.',
      es: 'Movimiento rotacional de posición baja a alta. Tira el cable diagonalmente hacia arriba a través del cuerpo, rotando el core, trabaja oblicuos desde otro ángulo.',
    },
  },
  {
    id: 'pallof_press',
    name: { en: 'Cable Pallof Press', es: 'Press Pallof en Polea' },
    muscleGroup: 'core',
    equipment: ['mid_pulley', 'single_handle'],
    weightType: 'machine',
    description: {
      en: 'Anti-rotation exercise for core stability. Stand perpendicular to cable, press handle straight out resisting rotation, return to chest, builds crucial rotational stability for sports.',
      es: 'Ejercicio anti-rotación para estabilidad del core. De pie perpendicular al cable, empuja el mango hacia afuera resistiendo rotación, regresa al pecho, construye estabilidad rotacional.',
    },
  },
  {
    id: 'plank',
    name: { en: 'Plank', es: 'Plancha' },
    muscleGroup: 'core',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Foundational core stability exercise. Hold push-up position on forearms, keep body straight from head to heels, brace core tightly, builds isometric strength and endurance.',
      es: 'Ejercicio fundamental de estabilidad del core. Mantén posición de flexión sobre antebrazos, cuerpo recto de cabeza a talones, aprieta el core fuertemente, construye fuerza isométrica.',
    },
  },
  {
    id: 'side_plank',
    name: { en: 'Side Plank', es: 'Plancha Lateral' },
    muscleGroup: 'core',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Lateral core stability exercise targeting obliques. Support body on one forearm and side of foot, keep body straight, hold position, builds lateral core strength and hip stability.',
      es: 'Ejercicio de estabilidad lateral del core trabajando oblicuos. Apoya el cuerpo en un antebrazo y lado del pie, mantén cuerpo recto, sostén la posición, construye fuerza lateral.',
    },
  },
  {
    id: 'weighted_plank',
    name: { en: 'Weighted Plank', es: 'Plancha con Peso' },
    muscleGroup: 'core',
    equipment: ['plates'],
    weightType: 'plate',
    description: {
      en: 'Plank with added weight for increased difficulty. Place plate on upper back, hold plank position, the added load increases the demand on core muscles for greater strength gains.',
      es: 'Plancha con peso añadido para mayor dificultad. Coloca disco en espalda alta, mantén posición de plancha, la carga adicional aumenta la demanda en músculos del core.',
    },
  },
  {
    id: 'mountain_climbers',
    name: { en: 'Mountain Climbers', es: 'Escaladores' },
    muscleGroup: 'core',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Dynamic plank variation with running motion. In push-up position, rapidly alternate driving knees toward chest, excellent for core stability while elevating heart rate for cardio.',
      es: 'Variación dinámica de plancha con movimiento de carrera. En posición de flexión, alterna rápidamente llevando rodillas al pecho, excelente para estabilidad del core y cardio.',
    },
  },
  {
    id: 'dead_bug',
    name: { en: 'Dead Bug', es: 'Bicho Muerto' },
    muscleGroup: 'core',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Anti-extension exercise for core stability. Lie on back, extend opposite arm and leg while keeping lower back pressed to floor, builds coordination and deep core stability.',
      es: 'Ejercicio anti-extensión para estabilidad del core. Acuéstate boca arriba, extiende brazo y pierna opuestos manteniendo espalda baja pegada al suelo, construye coordinación.',
    },
  },
  {
    id: 'bird_dog',
    name: { en: 'Bird Dog', es: 'Perro Pájaro' },
    muscleGroup: 'core',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Quadruped stability exercise for back and core. On hands and knees, extend opposite arm and leg while maintaining stable spine, excellent for lower back health and coordination.',
      es: 'Ejercicio de estabilidad en cuadrupedia para espalda y core. A cuatro patas, extiende brazo y pierna opuestos manteniendo columna estable, excelente para salud lumbar.',
    },
  },
  {
    id: 'ab_rollout',
    name: { en: 'Ab Rollout (Barbell)', es: 'Rueda Abdominal (Barra)' },
    muscleGroup: 'core',
    equipment: ['straight_bar'],
    weightType: 'barbell',
    description: {
      en: 'Advanced core exercise rolling barbell out. Kneel with hands on barbell, roll out extending body, pull back using abs, extremely demanding anti-extension core exercise.',
      es: 'Ejercicio avanzado de core rodando la barra hacia afuera. Arrodíllate con manos en la barra, rueda extendiendo el cuerpo, regresa usando abdominales, ejercicio anti-extensión exigente.',
    },
  },
  {
    id: 'russian_twist',
    name: { en: 'Russian Twist', es: 'Giro Ruso' },
    muscleGroup: 'core',
    equipment: ['plates'],
    weightType: 'plate',
    description: {
      en: 'Seated rotation exercise for obliques. Sit with torso at 45 degrees, rotate side to side touching weight to floor each side, excellent for building rotational strength.',
      es: 'Ejercicio de rotación sentado para oblicuos. Siéntate con torso a 45 grados, rota de lado a lado tocando peso al suelo en cada lado, excelente para fuerza rotacional.',
    },
  },
  {
    id: 'v_ups',
    name: { en: 'V-Ups', es: 'V-Ups' },
    muscleGroup: 'core',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Full body crunch forming a V shape. Lie flat, simultaneously raise legs and torso to touch toes at top, lower with control, works entire rectus abdominis intensely.',
      es: 'Crunch de cuerpo completo formando una V. Acuéstate plano, simultáneamente eleva piernas y torso para tocar dedos arriba, baja con control, trabaja intensamente todo el recto.',
    },
  },
  {
    id: 'l_sit_hold',
    name: { en: 'L-Sit Hold', es: 'Aguante en L' },
    muscleGroup: 'core',
    equipment: ['rack'],
    weightType: 'bodyweight',
    description: {
      en: 'Isometric hold with legs extended in front. Support body on hands with legs straight out parallel to floor, extremely challenging core and hip flexor exercise requiring strength.',
      es: 'Aguante isométrico con piernas extendidas al frente. Apoya el cuerpo en manos con piernas rectas paralelas al suelo, ejercicio extremadamente desafiante de core y flexores.',
    },
  },
  {
    id: 'hyperextension_core',
    name: { en: 'Hyperextension (Lower Back)', es: 'Hiperextensión (Espalda Baja)' },
    muscleGroup: 'core',
    equipment: ['bench'],
    weightType: 'bodyweight',
    description: {
      en: 'Lower back strengthening on decline bench. Position face down, lower upper body toward floor, raise up by contracting lower back muscles, builds erector spinae strength for back health.',
      es: 'Fortalecimiento de espalda baja en banco declinado. Posiciónate boca abajo, baja el torso hacia el suelo, sube contrayendo músculos de espalda baja, construye fuerza de erectores.',
    },
  },
  {
    id: 'superman',
    name: { en: 'Superman', es: 'Superman' },
    muscleGroup: 'core',
    equipment: [],
    weightType: 'bodyweight',
    description: {
      en: 'Floor exercise for lower back and glutes. Lie face down, simultaneously raise arms and legs off floor, hold briefly squeezing lower back and glutes, lower with control.',
      es: 'Ejercicio en el suelo para espalda baja y glúteos. Acuéstate boca abajo, simultáneamente eleva brazos y piernas del suelo, mantén brevemente apretando espalda baja y glúteos.',
    },
  },
  {
    id: 'suitcase_carry',
    name: { en: 'Suitcase Carry', es: 'Cargada de Maleta' },
    muscleGroup: 'core',
    equipment: ['dumbbells'],
    weightType: 'dumbbell',
    description: {
      en: 'Unilateral loaded carry for core and grip. Hold heavy dumbbell in one hand, walk while maintaining upright posture, challenges obliques and lateral core stabilizers intensely.',
      es: 'Cargada unilateral para core y agarre. Sostén una mancuerna pesada en una mano, camina manteniendo postura erguida, desafía intensamente los oblicuos y estabilizadores laterales.',
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

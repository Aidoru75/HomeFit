// Your Home Gym Equipment Inventory
import { IS_PRO } from '../config';

export const equipment = {
  // Cable Pulley System
  highPulley: {
    id: 'high_pulley',
    name: { en: 'High Pulley', es: 'Polea Alta', fr: 'Poulie Haute', 'pt-BR': 'Polia Alta' },
    type: 'cable',
    pro: true,
  },
  midPulley: {
    id: 'mid_pulley',
    name: { en: 'Mid Pulley', es: 'Polea Media', fr: 'Poulie Milieu', 'pt-BR': 'Polia Média' },
    type: 'cable',
    pro: true,
  },
  lowPulley: {
    id: 'low_pulley',
    name: { en: 'Low Pulley', es: 'Polea Baja', fr: 'Poulie Basse', 'pt-BR': 'Polia Baixa' },
    type: 'cable',
    pro: true,
  },

  // Machine Stations
  legExtensionStation: {
    id: 'leg_extension_station',
    name: { en: 'Leg Extension Station', es: 'Estación de Extensión de Piernas', fr: 'Station de Leg Extension', 'pt-BR': 'Estação de Extensão de Pernas' },
    type: 'machine',
    pro: true,
  },
  legCurlStation: {
    id: 'leg_curl_station',
    name: { en: 'Leg Curl Station (seated or lying)', es: 'Estación de Curl de Piernas (sentado o tumbado)', fr: 'Station de Leg Curl (assis ou allongé)', 'pt-BR': 'Estação de Rosca Femoral (sentado ou deitado)' },
    type: 'machine',
    pro: true,
  },
  standingLegCurlStation: {
    id: 'standing_leg_curl_station',
    name: { en: 'Standing Leg Curl Station', es: 'Estación de Curl de Piernas Parado', fr: 'Station de Leg Curl Debout', 'pt-BR': 'Estação de Rosca Femoral em Pé' },
    type: 'machine',
    pro: true,
  },
  legPressStation: {
    id: 'leg_press_station',
    name: { en: 'Leg Press Station', es: 'Prensa de Piernas', fr: 'Presse à Cuisses', 'pt-BR': 'Cadeira de Leg Press' },
    type: 'machine',
    pro: true,
  },
  squatStation: {
    id: 'squat_station',
    name: { en: 'Hack Squat Station', es: 'Estación de Sentadillas', fr: 'Station de Hack Squat', 'pt-BR': 'Estação de Hack Squat' },
    type: 'machine',
    pro: true,
  },
  pecDeckStation: {
    id: 'pec_deck_station',
    name: { en: 'Pec Deck Station', es: 'Estación Pec Deck', fr: 'Station Pec Deck', 'pt-BR': 'Estação Pec Deck' },
    type: 'machine',
    pro: true,
  },
  chestPressStation: {
    id: 'chest_press_station',
    name: { en: 'Chest Press Station', es: 'Estación de Prensa de Pecho', fr: 'Station de Développé Poitrine', 'pt-BR': 'Estação de Supino na Máquina' },
    type: 'machine',
    pro: true,
  },
  latStation: {
    id: 'lat_station',
    name: { en: 'Lat Machine', es: 'Máquina de Jalón', fr: 'Poulie Dorsaux', 'pt-BR': 'Pulley Costas' },
    type: 'machine',
    pro: true,
  },
  calfStation: {
    id: 'calf_station',
    name: { en: 'Calf Machine', es: 'Máquina de Pantorrillas', fr: 'Machine à Mollets', 'pt-BR': 'Máquina de Panturrilhas' },
    type: 'machine',
    pro: true,
  },
  ghdMachine: {
    id: 'ghd_machine',
    name: { en: 'GHD Machine', es: 'Máquina GHD', fr: 'Machine GHD', 'pt-BR': 'Máquina GHD' },
    type: 'machine',
    pro: true,
  },
  treadmill: {
    id: 'treadmill',
    name: { en: 'Treadmill', es: 'Cinta de Correr', fr: 'Tapis de Course', 'pt-BR': 'Esteira' },
    type: 'machine',
    pro: true,
  },
  stationaryBike: {
    id: 'stationary_bike',
    name: { en: 'Stationary Bike', es: 'Bicicleta Estática', fr: 'Vélo Stationnaire', 'pt-BR': 'Bicicleta Ergométrica' },
    type: 'machine',
    pro: true,
  },
  stepper: {
    id: 'stepper',
    name: { en: 'Stepper / Elliptical', es: 'Stepper / Elíptica', fr: 'Stepper / Elliptique', 'pt-BR': 'Stepper / Elíptico' },
    type: 'machine',
    pro: true,
  },
  rowingMachine: {
    id: 'rowing_machine',
    name: { en: 'Rowing Machine', es: 'Máquina de Remo', fr: 'Rameur', 'pt-BR': 'Remo Ergométrico' },
    type: 'machine',
    pro: true,
  },
  reverseFlyMachine: {
    id: 'reverse_fly_machine',
    name: { en: 'Reverse Fly Machine', es: 'Máquina de Aperturas Inversas', fr: 'Machine à Écarté Inversé', 'pt-BR': 'Máquina de Crucifixo Invertido' },
    type: 'machine',
    pro: true,
  },
  hipAbductorAdductor: {
    id: 'hip_abductor_adductor',
    name: { en: 'Hip Abductor/Adductor Machine', es: 'Máquina de Abductores/Aductores', fr: 'Machine Abducteurs/Adducteurs', 'pt-BR': 'Máquina de Abdução/Adução' },
    type: 'machine',
    pro: true,
  },

  // Racks and Benches
  rack: {
    id: 'rack',
    name: { en: 'Squat Rack', es: 'Rack de Sentadillas', fr: 'Rack à Squat', 'pt-BR': 'Rack de Agachamento' },
    type: 'rack',
    pro: false,
  },
  pullupRack: {
    id: 'pullup_rack',
    name: { en: 'Pull-up Rack', es: 'Rack de Dominadas', fr: 'Barre de Traction', 'pt-BR': 'Barra de Tração' },
    type: 'rack',
    pro: false,
  },
  flatBench: {
    id: 'flat_bench',
    name: { en: 'Flat Bench', es: 'Banco Horizontal', fr: 'Banc Plat', 'pt-BR': 'Banco Reto' },
    type: 'flat_bench',
    pro: false,
  },
  inclineBench: {
    id: 'incline_bench',
    name: { en: 'Incline Bench', es: 'Banco Inclinado', fr: 'Banc Incliné', 'pt-BR': 'Banco Inclinado' },
    type: 'flat_bench',
    pro: false,
  },
  declineBench: {
    id: 'decline_bench',
    name: { en: 'Decline Bench', es: 'Banco Declinado', fr: 'Banc Décliné', 'pt-BR': 'Banco Declinado' },
    type: 'flat_bench',
    pro: false,
  },
  uprightBench: {
    id: 'upright_bench',
    name: { en: 'Upright Bench', es: 'Banco Recto', fr: 'Banc Droit', 'pt-BR': 'Banco com Apoio Lombar' },
    type: 'flat_bench',
    pro: false,
  },
  preacherPad: {
    id: 'preacher_pad',
    name: { en: 'Preacher Pad', es: 'Banco Scott', fr: 'Pupitre Scott', 'pt-BR': 'Banco Scott' },
    type: 'flat_bench',
    pro: true,
  },
  parallels: {
    id: 'parallels',
    name: { en: 'Parallel Bars', es: 'Barras Paralelas', fr: 'Barres Parallèles', 'pt-BR': 'Barras Paralelas' },
    type: 'flat_bench',
    pro: false,
  },

  // Barbells
  straightBar: {
    id: 'straight_bar',
    name: { en: 'Straight Barbell', es: 'Barra Recta', fr: 'Barre Droite', 'pt-BR': 'Barra Reta' },
    type: 'barbell',
    pro: false,
  },
  ezBar: {
    id: 'ez_bar',
    name: { en: 'EZ Curl Bar', es: 'Barra Z', fr: 'Barre EZ', 'pt-BR': 'Barra EZ' },
    type: 'barbell',
    pro: false,
  },
  neutralBar: {
    id: 'neutral_bar',
    name: { en: 'Neutral Grip Bar', es: 'Barra de Agarre Neutro', fr: 'Barre à Prise Neutre', 'pt-BR': 'Barra de Pegada Neutra' },
    type: 'barbell',
    pro: true,
  },

  // Dumbbells
  dumbbells: {
    id: 'dumbbells',
    name: { en: 'Dumbbells', es: 'Mancuernas', fr: 'Haltères', 'pt-BR': 'Halteres' },
    type: 'dumbbell',
    pro: false,
  },

  // Kettlebells
  kettlebells: {
    id: 'kettlebells',
    name: { en: 'Kettlebells', es: 'Pesas rusas', fr: 'Kettlebells', 'pt-BR': 'Kettlebells' },
    type: 'kettlebell',
    pro: true,
  },

  // Weight Plates
  plates: {
    id: 'plates',
    name: { en: 'Weight Plates', es: 'Discos de Peso', fr: 'Disques', 'pt-BR': 'Anilhas' },
    type: 'plates',
    pro: false,
  },

  // Cable Attachments
  latBar: {
    id: 'lat_bar',
    name: { en: 'Lat Pulldown Bar', es: 'Barra de Jalón', fr: 'Barre de Tirage Dorsaux', 'pt-BR': 'Barra de Puxada' },
    type: 'cableattachs',
    pro: true,
  },
  rope: {
    id: 'rope',
    name: { en: 'Tricep Rope', es: 'Cuerda para Tríceps', fr: 'Corde Triceps', 'pt-BR': 'Corda para Tríceps' },
    type: 'cableattachs',
    pro: true,
  },
  singleRope: {
    id: 'single_rope',
    name: { en: 'Single Tricep Rope', es: 'Cuerda de Tríceps Individual', fr: 'Corde Triceps Simple', 'pt-BR': 'Corda para Tríceps Individual' },
    type: 'cableattachs',
    pro: true,
  },
  singleHandle: {
    id: 'single_handle',
    name: { en: 'Single Cable Handle', es: 'Mango de Cable', fr: 'Poignée de Câble', 'pt-BR': 'Puxador de Cabo' },
    type: 'cableattachs',
    pro: true,
  },
  neutralBarAttachment: {
    id: 'neutral_bar_attachment',
    name: { en: 'Neutral Grip Bar Attachment', es: 'Agarre de Barra Neutro', fr: 'Barre à Prise Neutre (attache)', 'pt-BR': 'Barra de Pegada Neutra (encaixe)' },
    type: 'cableattachs',
    pro: true,
  },
  straightBarAttachment: {
    id: 'straight_bar_attachment',
    name: { en: 'Straight Bar Attachment', es: 'Agarre de Polea Recto', fr: 'Barre Droite (poulie)', 'pt-BR': 'Barra Reta (cabo)' },
    type: 'cableattachs',
    pro: true,
  },
  curvedBarAttachment: {
    id: 'curved_bar_attachment',
    name: { en: 'Curved Bar Attachment', es: 'Agarre de Polea Curvado', fr: 'Barre Courbée (poulie)', 'pt-BR': 'Barra Curvada (cabo)' },
    type: 'cableattachs',
    pro: true,
  },
  vBar: {
    id: 'v_bar',
    name: { en: 'V-Bar Handle', es: 'Barra V', fr: 'Poignée en V', 'pt-BR': 'Puxador V' },
    type: 'cableattachs',
    pro: true,
  },
  rowingHandle: {
    id: 'rowing_handle',
    name: { en: 'Rowing Handle', es: 'Agarre de Remo', fr: 'Poignée de Rowing', 'pt-BR': 'Puxador de Remada' },
    type: 'cableattachs',
    pro: true,
  },
  ankleStrap: {
    id: 'ankle_strap',
    name: { en: 'Ankle Strap', es: 'Correa de Tobillo', fr: 'Sangle Cheville', 'pt-BR': 'Tornozeleira' },
    type: 'cableattachs',
    pro: true,
  },

  // Other Accessories


  absWheel: {
    id: 'abs_wheel',
    name: { en: 'Abs Wheel', es: 'Rueda de Abdominales', fr: 'Roue Abdominale', 'pt-BR': 'Roda Abdominal' },
    type: 'accessory',
    pro: false,
  },
  StepPlatform: {
    id: 'step_platform',
    name: { en: 'Step Platform', es: 'Plataforma de Step', fr: 'Plateforme de Step', 'pt-BR': 'Step' },
    type: 'accessory',
    pro: false,
  },
  dipBelt: {
    id: 'dip_belt',
    name: { en: 'Dip Belt + Chain', es: 'Cinturón de Fondos + Cadena', fr: 'Ceinture de Dips + Chaîne', 'pt-BR': 'Cinto de Dips + Corrente' },
    type: 'accessory',
    pro: false,
  },
  resistanceBand: {
    id: 'resistance_band',
    name: { en: 'Resistance Bands', es: 'Bandas de Resistencia', fr: 'Élastiques de Résistance', 'pt-BR': 'Faixas Elásticas' },
    type: 'accessory',
    pro: false,
  },
  towel: {
    id: 'towel',
    name: { en: 'Towel', es: 'Toalla', fr: 'Serviette', 'pt-BR': 'Toalha' },
    type: 'accessory',
    pro: false,
  },
  jumpRope: {
    id: 'jump_rope',
    name: { en: 'Jump Rope', es: 'Cuerda de Saltar', fr: 'Corde à Sauter', 'pt-BR': 'Corda de Pular' },
    type: 'accessory',
    pro: false,
  },
  ball: {
    id: 'ball',
    name: { en: 'Exercise Ball', es: 'Pelota de Pilates', fr: 'Ballon de Gym', 'pt-BR': 'Bola de Pilates' },
    type: 'accessory',
    pro: true,
  },
};

// Equipment categories for UI grouping
export const equipmentCategories = {
  freeWeights: {
    id: 'freeWeights',
    name: { en: 'Free Weights', es: 'Pesos Libres', fr: 'Poids Libres', 'pt-BR': 'Pesos Livres' },
    equipmentIds: ['straight_bar', 'ez_bar', 'neutral_bar', 'dumbbells', 'plates', 'kettlebells'],
  },
  racksAndBenches: {
    id: 'racksAndBenches',
    name: { en: 'Racks & Benches', es: 'Racks y Bancos', fr: 'Racks et Bancs', 'pt-BR': 'Racks e Bancos' },
    equipmentIds: ['rack', 'pullup_rack', 'flat_bench', 'incline_bench', 'decline_bench', 'upright_bench', 'preacher_pad', 'parallels' ],
  },
  cableMachine: {
    id: 'cableMachine',
    name: { en: 'Cable Machine', es: 'Máquina de Poleas', fr: 'Machine à Câbles', 'pt-BR': 'Máquina de Cabos' },
    equipmentIds: ['high_pulley', 'mid_pulley', 'low_pulley'],
  },
  machineStations: {
    id: 'machineStations',
    name: { en: 'Machine Stations', es: 'Estaciones de Máquinas', fr: 'Stations de Machines', 'pt-BR': 'Estações de Máquinas' },
    equipmentIds: ['leg_extension_station', 'leg_curl_station', 'standing_leg_curl_station', 'leg_press_station', 'squat_station', 'pec_deck_station', 'chest_press_station', 'lat_station', 'calf_station', 'ghd_machine', 'hip_abductor_adductor', 'treadmill', 'stationary_bike', 'stepper', 'rowing_machine', 'reverse_fly_machine'],
  },
  cableAttachments: {
    id: 'cableAttachments',
    name: { en: 'Cable Attachments', es: 'Accesorios de Polea', fr: 'Accessoires de Câble', 'pt-BR': 'Acessórios de Cabo' },
    equipmentIds: ['lat_bar', 'rope', 'single_rope', 'single_handle', 'straight_bar_attachment', 'curved_bar_attachment', 'neutral_bar_attachment' , 'v_bar', 'rowing_handle', 'ankle_strap'],
  },
  accessories: {
    id: 'accessories',
    name: { en: 'Other Accessories', es: 'Otros Accesorios', fr: 'Autres Accessoires', 'pt-BR': 'Outros Acessórios' },
    equipmentIds: ['dip_belt', 'step_platform', 'resistance_band', 'towel', 'jump_rope', 'ball', 'abs_wheel' ],
  },
};

// Helper: Get equipment by ID
export const getEquipmentById = (equipmentId) => {
  return Object.values(equipment).find(eq => eq.id === equipmentId);
};

// Helper: Get localized equipment name by ID
export const getEquipmentName = (equipmentId, lang = 'en') => {
  const eq = getEquipmentById(equipmentId);
  if (!eq) return equipmentId; // Fallback to ID if not found
  return eq.name[lang] || eq.name.en || equipmentId;
};

// Helper: Get all equipment IDs
export const getAllEquipmentIds = () => {
  return Object.values(equipment).map(eq => eq.id);
};

// Helper: Get localized category name
export const getCategoryName = (category, lang = 'en') => {
  return category.name[lang] || category.name.en;
};

// Helper: Get cable machine weights (same weight stack for all pulleys)
export const getCableWeights = () => {
  const weights = [];
  for (let w = 3.6; w <= 68; w += 4.6) {
    weights.push(Math.round(w * 10) / 10);
  }
  return weights;
};

// Backwards compatibility alias
export const getMultigymWeights = getCableWeights;

// Tier helpers
export const isProEquipment = (equipmentId) => {
  const eq = getEquipmentById(equipmentId);
  return eq?.pro === true;
};

export const isProExercise = (exercise) => {
  if (!exercise?.equipment || exercise.equipment.length === 0) return false;
  // An exercise is PRO-only if ANY required slot has no free alternative
  // (i.e. every alternative in that slot is PRO equipment)
  return exercise.equipment.some(item =>
    Array.isArray(item)
      ? item.every(alt => isProEquipment(alt))
      : isProEquipment(item)
  );
};

export const getVisibleCategories = () => {
  if (IS_PRO) return equipmentCategories;
  const filtered = {};
  for (const [key, category] of Object.entries(equipmentCategories)) {
    const visibleIds = category.equipmentIds.filter(id => !isProEquipment(id));
    if (visibleIds.length > 0) {
      filtered[key] = { ...category, equipmentIds: visibleIds };
    }
  }
  return filtered;
};

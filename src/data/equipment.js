// Your Home Gym Equipment Inventory
import { IS_PRO } from '../config';

export const equipment = {
  // Cable Pulley System
  highPulley: {
    id: 'high_pulley',
    name: { en: 'High Pulley', es: 'Polea Alta' },
    type: 'cable',
    pro: true,
  },
  midPulley: {
    id: 'mid_pulley',
    name: { en: 'Mid Pulley', es: 'Polea Media' },
    type: 'cable',
    pro: true,
  },
  lowPulley: {
    id: 'low_pulley',
    name: { en: 'Low Pulley', es: 'Polea Baja' },
    type: 'cable',
    pro: true,
  },
  
  // Machine Stations
  legExtensionStation: {
    id: 'leg_extension_station',
    name: { en: 'Leg Extension Station', es: 'Estación de Extensión de Piernas' },
    type: 'machine',
    pro: true,
  },
  legCurlStation: {
    id: 'leg_curl_station',
    name: { en: 'Leg Curl Station', es: 'Estación de Curl de Piernas' },
    type: 'machine',
    pro: true,
  },
  lyingLegCurlStation: {
    id: 'lying_leg_curl_station',
    name: { en: 'Lying Leg Curl Station', es: 'Estación de Curl de Piernas Acostado' },
    type: 'machine',
    pro: true,
  },
  standingLegCurlStation: {
    id: 'standing_leg_curl_station',
    name: { en: 'Standing Leg Curl Station', es: 'Estación de Curl de Piernas Parado' },
    type: 'machine',
    pro: true,
  },
  legPressStation: {
    id: 'leg_press_station',
    name: { en: 'Leg Press Station', es: 'Prensa de Piernas' },
    type: 'machine',
    pro: true,
  },
  pecDeckStation: {
    id: 'pec_deck_station',
    name: { en: 'Pec Deck Station', es: 'Estación Pec Deck' },
    type: 'machine',
    pro: true,
  },
  chestPressStation: {
    id: 'chest_press_station',
    name: { en: 'Chest Press Station', es: 'Estación de Prensa de Pecho' },
    type: 'machine',
    pro: true,
  },
  latStation: {
    id: 'lat_station',
    name: { en: 'Lat Machine', es: 'Máquina de Jalón' },
    type: 'machine',
    pro: true,
  },
  calfStation: {
    id: 'calf_station',
    name: { en: 'Calf Machine', es: 'Máquina de Pantorrillas' },
    type: 'machine',
    pro: true,
  },
  ghdMachine: {
    id: 'ghd_machine',
    name: { en: 'GHD Machine', es: 'Máquina GHD' },
    type: 'machine',
    pro: true,
  },
  treadmill: {
    id: 'treadmill',
    name: { en: 'Treadmill', es: 'Cinta de Correr' },
    type: 'machine',
    pro: true,
  },
  stationaryBike: {
    id: 'stationary_bike',
    name: { en: 'Stationary Bike', es: 'Bicicleta Estática' },
    type: 'machine',
    pro: true,
  },
  
  // Racks and Benches
  rack: {
    id: 'rack',
    name: { en: 'Squat Rack', es: 'Rack de Sentadillas' },
    type: 'rack',
    pro: false,
  },
  pullupRack: {
    id: 'pullup_rack',
    name: { en: 'Pull-up Rack', es: 'Rack de Dominadas' },
    type: 'rack',
    pro: false,
  },
  flatBench: {
    id: 'flat_bench',
    name: { en: 'Flat Bench', es: 'Banco Horizontal' },
    type: 'flat_bench',
    pro: false,
  },
  inclineBench: {
    id: 'incline_bench',
    name: { en: 'Incline Bench', es: 'Banco Inclinado' },
    type: 'flat_bench',
    pro: false,
  },
  declineBench: {
    id: 'decline_bench',
    name: { en: 'Decline Bench', es: 'Banco Declinado' },
    type: 'flat_bench',
    pro: false,
  },
  uprightBench: {
    id: 'upright_bench',
    name: { en: 'Upright Bench', es: 'Banco Recto' },
    type: 'flat_bench',
    pro: false,
  },
  preacherPad: {
    id: 'preacher_pad',
    name: { en: 'Preacher Pad', es: 'Banco Scott' },
    type: 'flat_bench',
    pro: true,
  },
  parallels: {
    id: 'parallels',
    name: { en: 'Parallel Bars', es: 'Barras Paralelas' },
    type: 'flat_bench',
    pro: false,
  },
  
  // Barbells
  straightBar: {
    id: 'straight_bar',
    name: { en: 'Straight Barbell', es: 'Barra Recta' },
    type: 'barbell',
    pro: false,
  },
  ezBar: {
    id: 'ez_bar',
    name: { en: 'EZ Curl Bar', es: 'Barra Z' },
    type: 'barbell',
    pro: false,
  },
  neutralBar: {
    id: 'neutral_bar',
    name: { en: 'Neutral Grip Bar', es: 'Barra de Agarre Neutro' },
    type: 'barbell',
    pro: true,
  },
  
  // Dumbbells
  dumbbells: {
    id: 'dumbbells',
    name: { en: 'Dumbbells', es: 'Mancuernas' },
    type: 'dumbbell',
    pro: false,
  },

  // Kettlebells
  kettlebells: {
    id: 'kettlebells',
    name: { en: 'Kettlebells', es: 'Pesas rusas' },
    type: 'kettlebell',
    pro: true,
  },
  
  // Weight Plates
  plates: {
    id: 'plates',
    name: { en: 'Weight Plates', es: 'Discos de Peso' },
    type: 'plates',
    pro: false,
  },
  
  // Cable Attachments
  latBar: {
    id: 'lat_bar',
    name: { en: 'Lat Pulldown Bar', es: 'Barra de Jalón' },
    type: 'cableattachs',
    pro: true,
  },
  rope: {
    id: 'rope',
    name: { en: 'Tricep Rope', es: 'Cuerda para Tríceps' },
    type: 'cableattachs',
    pro: true,
  },
  singleRope: {
    id: 'single_rope',
    name: { en: 'Single Tricep Rope', es: 'Cuerda de Tríceps Individual' },
    type: 'cableattachs',
    pro: true,
  },
  singleHandle: {
    id: 'single_handle',
    name: { en: 'Single Cable Handle', es: 'Mango de Cable' },
    type: 'cableattachs',
    pro: true,
  },
  straightBarAttachment: {
    id: 'straight_bar_attachment',
    name: { en: 'Straight or Curved Bar Attachment', es: 'Agarre de polea Recto o Curvado' },
    type: 'cableattachs',
    pro: true,
  },
  vBar: {
    id: 'v_bar',
    name: { en: 'V-Bar Handle', es: 'Barra V' },
    type: 'cableattachs',
    pro: true,
  },
  rowingHandle: {
    id: 'rowing_handle',
    name: { en: 'Rowing Handle', es: 'Agarre de Remo' },
    type: 'cableattachs',
    pro: true,
  },
  ankleStrap: {
    id: 'ankle_strap',
    name: { en: 'Ankle Strap', es: 'Correa de Tobillo' },
    type: 'cableattachs',
    pro: true,
  },

  // Other Accessories

  
  absWheel: {
    id: 'abs_wheel',
    name: { en: 'Abs Wheel', es: 'Rueda de Abdominales' },
    type: 'accessory',
    pro: false,
  },
  dipBelt: {
    id: 'dip_belt',
    name: { en: 'Dip Belt + Chain', es: 'Cinturón de Fondos + Cadena' },
    type: 'accessory',
    pro: false,
  },
  landmineHandle: {
    id: 'landmine_handle',
    name: { en: 'Landmine Handle', es: 'Mango de Landmine' },
    type: 'accessory',
    pro: true,
  },
  resistanceBand: {
    id: 'resistance_band',
    name: { en: 'Resistance Band', es: 'Banda de Resistencia' },
    type: 'accessory',
    pro: false,
  },
  towel: {
    id: 'towel',
    name: { en: 'Towel', es: 'Toalla' },
    type: 'accessory',
    pro: false,
  },
  jumpRope: {
    id: 'jump_rope',
    name: { en: 'Jump Rope', es: 'Cuerda de Saltar' },
    type: 'accessory',
    pro: false,
  },
  ball: {
    id: 'ball',
    name: { en: 'Exercise Ball', es: 'Balón de Ejercicio' },
    type: 'accessory',
    pro: true,
  },
};

// Equipment categories for UI grouping
export const equipmentCategories = {
  freeWeights: {
    id: 'freeWeights',
    name: { en: 'Free Weights', es: 'Pesos Libres' },
    equipmentIds: ['straight_bar', 'ez_bar', 'neutral_bar', 'dumbbells', 'plates', 'kettlebells'],
  },
  racksAndBenches: {
    id: 'racksAndBenches',
    name: { en: 'Racks & Benches', es: 'Racks y Bancos' },
    equipmentIds: ['rack', 'pullup_rack', 'flat_bench', 'incline_bench', 'decline_bench', 'upright_bench', 'preacher_pad', 'parallels' ],
  },
  cableMachine: {
    id: 'cableMachine',
    name: { en: 'Cable Machine', es: 'Máquina de Poleas' },
    equipmentIds: ['high_pulley', 'mid_pulley', 'low_pulley'],
  },
  machineStations: {
    id: 'machineStations',
    name: { en: 'Machine Stations', es: 'Estaciones de Máquinas' },
    equipmentIds: ['leg_extension_station', 'leg_curl_station', 'lying_leg_curl_station', 'standing_leg_curl_station', 'leg_press_station', 'pec_deck_station', 'chest_press_station', 'lat_station', 'calf_station', 'ghd_machine', 'treadmill', 'stationary_bike'],
  },
  cableAttachments: {
    id: 'cableAttachments',
    name: { en: 'Cable Attachments', es: 'Accesorios de Polea' },
    equipmentIds: ['lat_bar', 'rope', 'single_rope', 'single_handle', 'straight_bar_attachment', 'v_bar', 'rowing_handle', 'ankle_strap'],
  },
  accessories: {
    id: 'accessories',
    name: { en: 'Other Accessories', es: 'Otros Accesorios' },
    equipmentIds: ['dip_belt', 'resistance_band', 'towel', 'jump_rope', 'ball', 'abs_wheel' ],
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
  return exercise.equipment.some(eqId => isProEquipment(eqId));
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

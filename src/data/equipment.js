// Your Home Gym Equipment Inventory

export const equipment = {
  // Cable Pulley System
  highPulley: {
    id: 'high_pulley',
    name: { en: 'High Pulley', es: 'Polea Alta' },
    type: 'cable',
    weightRange: { min: 3.6, max: 68, increment: 4.6 },
  },
  midPulley: {
    id: 'mid_pulley',
    name: { en: 'Mid Pulley', es: 'Polea Media' },
    type: 'cable',
    weightRange: { min: 3.6, max: 68, increment: 4.6 },
  },
  lowPulley: {
    id: 'low_pulley',
    name: { en: 'Low Pulley', es: 'Polea Baja' },
    type: 'cable',
    weightRange: { min: 3.6, max: 68, increment: 4.6 },
  },
  
  // Machine Stations
  legExtensionStation: {
    id: 'leg_extension_station',
    name: { en: 'Leg Extension Station', es: 'Estación de Extensión de Piernas' },
    type: 'machine',
  },
  legCurlStation: {
    id: 'leg_curl_station',
    name: { en: 'Leg Curl Station', es: 'Estación de Curl de Piernas' },
    type: 'machine',
  },
  legPressStation: {
    id: 'leg_press_station',
    name: { en: 'Leg Press Station', es: 'Prensa de Piernas' },
    type: 'machine',
  },
  pecDeckStation: {
    id: 'pec_deck_station',
    name: { en: 'Pec Deck Station', es: 'Estación de Pecho' },
    type: 'machine',
  },
  preacherPad: {
    id: 'preacher_pad',
    name: { en: 'Preacher Pad', es: 'Banco Scott' },
    type: 'machine',
  },
  
  // Racks and Benches
  rack: {
    id: 'rack',
    name: { en: 'Squat Rack', es: 'Rack de Sentadillas' },
    type: 'rack',
    features: ['j_hooks', 'safety_arms', 'pullup_bar'],
  },
  bench: {
    id: 'bench',
    name: { en: 'Adjustable Bench', es: 'Banco Ajustable' },
    type: 'bench',
    positions: ['flat', 'incline', 'decline'],
    hasLegRoller: true,
  },
  
  // Barbells
  straightBar: {
    id: 'straight_bar',
    name: { en: 'Straight Barbell', es: 'Barra Recta' },
    type: 'barbell',
    weight: 10,
  },
  ezBar: {
    id: 'ez_bar',
    name: { en: 'EZ Curl Bar', es: 'Barra Z' },
    type: 'barbell',
    weight: 10,
  },
  
  // Dumbbells
  dumbbells: {
    id: 'dumbbells',
    name: { en: 'Dumbbells', es: 'Mancuernas' },
    type: 'dumbbell',
    handleWeight: 5,
    quantity: 2,
  },
  
  // Weight Plates
  plates: {
    id: 'plates',
    name: { en: 'Weight Plates', es: 'Discos de Peso' },
    type: 'plates',
    inventory: [
      { weight: 15, quantity: 2 },
      { weight: 10, quantity: 4 },
      { weight: 5, quantity: 4 },
      { weight: 2.5, quantity: 4 },
      { weight: 1.25, quantity: 4 },
    ],
  },
  
  // Cable Attachments & Accessories
  latBar: {
    id: 'lat_bar',
    name: { en: 'Lat Pulldown Bar', es: 'Barra de Jalón' },
    type: 'accessory',
  },
  rope: {
    id: 'rope',
    name: { en: 'Tricep Rope', es: 'Cuerda para Tríceps' },
    type: 'accessory',
  },
  singleHandle: {
    id: 'single_handle',
    name: { en: 'Single Cable Handle', es: 'Mango de Cable' },
    type: 'accessory',
  },
  straightBarAttachment: {
    id: 'straight_bar_attachment',
    name: { en: 'Straight Bar Attachment', es: 'Accesorio de Barra Recta' },
    type: 'accessory',
  },
  ankleStrap: {
    id: 'ankle_strap',
    name: { en: 'Ankle Strap', es: 'Correa de Tobillo' },
    type: 'accessory',
  },
  dipBelt: {
    id: 'dip_belt',
    name: { en: 'Dip Belt + Chain', es: 'Cinturón de Fondos + Cadena' },
    type: 'accessory',
  },
  liftingBelt: {
    id: 'lifting_belt',
    name: { en: 'Lifting Belt', es: 'Cinturón de Levantamiento' },
    type: 'accessory',
  },
  vBar: {
    id: 'v_bar',
    name: { en: 'V-Bar Handle', es: 'Barra V' },
    type: 'accessory',
  },
  resistanceBand: {
    id: 'resistance_band',
    name: { en: 'Resistance Band', es: 'Banda de Resistencia' },
    type: 'accessory',
  },
  towel: {
    id: 'towel',
    name: { en: 'Towel', es: 'Toalla' },
    type: 'accessory',
  },
  jumpRope: {
    id: 'jump_rope',
    name: { en: 'Jump Rope', es: 'Cuerda de Saltar' },
    type: 'accessory',
  },
};

// Equipment categories for UI grouping
export const equipmentCategories = {
  freeWeights: {
    id: 'freeWeights',
    name: { en: 'Free Weights', es: 'Pesos Libres' },
    icon: '🏋️',
    equipmentIds: ['straight_bar', 'ez_bar', 'dumbbells', 'plates'],
  },
  racksAndBenches: {
    id: 'racksAndBenches',
    name: { en: 'Racks & Benches', es: 'Racks y Bancos' },
    icon: '🪑',
    equipmentIds: ['rack', 'bench'],
  },
  cableMachine: {
    id: 'cableMachine',
    name: { en: 'Cable Machine', es: 'Máquina de Poleas' },
    icon: '🔗',
    equipmentIds: ['high_pulley', 'mid_pulley', 'low_pulley'],
  },
  machineStations: {
    id: 'machineStations',
    name: { en: 'Machine Stations', es: 'Estaciones de Máquinas' },
    icon: '⚙️',
    equipmentIds: ['leg_extension_station', 'leg_curl_station', 'leg_press_station', 'pec_deck_station', 'preacher_pad'],
  },
  cableAttachments: {
    id: 'cableAttachments',
    name: { en: 'Cable Attachments', es: 'Accesorios de Polea' },
    icon: '🔧',
    equipmentIds: ['lat_bar', 'rope', 'single_handle', 'straight_bar_attachment', 'v_bar', 'ankle_strap'],
  },
  accessories: {
    id: 'accessories',
    name: { en: 'Accessories', es: 'Accesorios' },
    icon: '🎒',
    equipmentIds: ['dip_belt', 'lifting_belt', 'resistance_band', 'towel', 'jump_rope'],
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

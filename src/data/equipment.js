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
    weightRange: { min: 3.6, max: 68, increment: 4.6 },
  },
  legCurlStation: {
    id: 'leg_curl_station',
    name: { en: 'Leg Curl Station', es: 'Estación de Curl de Piernas' },
    type: 'machine',
    weightRange: { min: 3.6, max: 68, increment: 4.6 },
  },
  pecDeckStation: {
    id: 'pec_deck_station',
    name: { en: 'Pec Deck Station', es: 'Estación de Pecho' },
    type: 'machine',
    weightRange: { min: 3.6, max: 68, increment: 4.6 },
  },
  preacherPad: {
    id: 'preacher_pad',
    name: { en: 'Preacher Pad', es: 'Pad de Preacher' },
    type: 'accessory',
  },
  
  // Racks and Benches
  rack: {
    id: 'rack',
    name: { en: 'Squat Rack', es: 'Soporte para Sentadillas' },
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
    name: { en: 'Weight Plates', es: 'Platos de Peso' },
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
    name: { en: 'Lat Pulldown Bar', es: 'Barra de tracción de polea' },
    type: 'accessory',
  },
  vBar: {
    id: 'v_bar',
    name: { en: 'V-Bar Handle', es: 'Barra V' },
    type: 'accessory',
  },
  rope: {
    id: 'rope',
    name: { en: 'Tricep Rope', es: 'Cuerda para tríceps' },
    type: 'accessory',
  },
  singleHandle: {
    id: 'single_handle',
    name: { en: 'Single Cable Handle', es: 'Mango de Cable Único' },
    type: 'accessory',
  },
  straightBarAttachment: {
    id: 'straight_bar_attachment',
    name: { en: 'Straight Bar Attachment', es: 'Accesorio de Barra Recta' },
    type: 'accessory',
  },
  ankleStrap: {
    id: 'ankle_strap',
    name: { en: 'Ankle Strap', es: 'Banda para tobillo' },
    type: 'accessory',
  },
  dipBelt: {
    id: 'dip_belt',
    name: { en: 'Dip Belt + Chain', es: 'Cinturón de Dip + Cadena' },
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
  resistanceBands: {
    id: 'resistance_bands',
    name: { en: 'Resistance Bands', es: 'Bandas de Resistencia' },
    type: 'accessory',
  },
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

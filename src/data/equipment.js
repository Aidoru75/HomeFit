// Your Home Gym Equipment Inventory

export const equipment = {
  multigym: {
    id: 'multigym',
    name: 'Behumax Multigym 450 Pro',
    type: 'machine',
    weightRange: { min: 3.6, max: 68, increment: 4.6 },
    stations: ['high_pulley', 'mid_pulley', 'low_pulley', 'pec_deck', 'leg_extension', 'leg_curl', 'leg_press', 'preacher_pad'],
  },
  rack: {
    id: 'rack',
    name: 'Squat Rack',
    type: 'rack',
    features: ['j_hooks', 'safety_arms', 'pullup_bar'],
  },
  bench: {
    id: 'bench',
    name: 'Adjustable Bench',
    type: 'bench',
    positions: ['flat', 'incline', 'decline'],
    hasLegRoller: true,
  },
  straightBar: {
    id: 'straight_bar',
    name: 'Straight Barbell',
    type: 'barbell',
    weight: 10,
  },
  ezBar: {
    id: 'ez_bar',
    name: 'EZ Curl Bar',
    type: 'barbell',
    weight: 10,
  },
  dumbbells: {
    id: 'dumbbells',
    name: 'Adjustable Dumbbells',
    type: 'dumbbell',
    handleWeight: 5,
    quantity: 2,
  },
  plates: {
    id: 'plates',
    name: 'Weight Plates',
    type: 'plates',
    inventory: [
      { weight: 15, quantity: 2 },
      { weight: 10, quantity: 4 },
      { weight: 5, quantity: 4 },
      { weight: 2.5, quantity: 4 },
      { weight: 1.25, quantity: 4 },
    ],
  },
  accessories: {
    latBar: { id: 'lat_bar', name: 'Lat Pulldown Bar' },
    rope: { id: 'rope', name: 'Tricep Rope' },
    singleHandle: { id: 'single_handle', name: 'Single Cable Handle' },
    ankleStrap: { id: 'ankle_strap', name: 'Ankle Strap' },
    dipBelt: { id: 'dip_belt', name: 'Dip Belt + Chain' },
    liftingBelt: { id: 'lifting_belt', name: 'Weightlifting Belt' },
    resistanceBands: { id: 'bands', name: 'Resistance Bands' },
  },
};

export const getMultigymWeights = () => {
  const weights = [];
  for (let w = 3.6; w <= 68; w += 4.6) {
    weights.push(Math.round(w * 10) / 10);
  }
  return weights;
};

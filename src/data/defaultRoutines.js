// Default starter routines - seeded on first launch
// Weights are all 0 - the user sets their own after reviewing.

// Helper to build an exercise entry
const ex = (exerciseId, sets, reps, supersetGroup = null) => ({
  exerciseId,
  sets,
  reps: Array(sets).fill(reps),
  weights: Array(sets).fill(0),
  supersetGroup,
});

// ============================================
// FREE TIER ROUTINES
// ============================================

export const defaultRoutinesFree = [
  // ------------------------------------------
  // STRENGTH (Beginner) - 3 days, Full Body
  // ------------------------------------------
  {
    id: 'default_free_str_beg',
    name: 'Strength (Beginner)',
    restBetweenSets: 120,
    restBetweenExercises: 150,
    createdAt: '2025-01-01T00:00:00.000Z',
    days: [
      {
        name: 'Day 1', customName: '',
        exercises: [
          ex('back_squat', 4, 5),
          ex('bench_press', 4, 5),
          ex('barbell_row', 4, 5),
          ex('standing_calf_raise_barbell', 3, 10),
          ex('plank', 3, 1),
        ],
      },
      {
        name: 'Day 2', customName: '',
        exercises: [
          ex('deadlift', 4, 5),
          ex('overhead_press_standing', 4, 5),
          ex('chinups', 4, 5),
          ex('barbell_curl_standing', 3, 8, 1),
          ex('close_grip_bench', 3, 8, 1),
        ],
      },
      {
        name: 'Day 3', customName: '',
        exercises: [
          ex('front_squat', 4, 5),
          ex('incline_press', 4, 5),
          ex('pendlay_row', 4, 5),
          ex('standing_calf_raise_dumbbell', 3, 10),
          ex('hanging_knee_raise', 3, 12),
        ],
      },
    ],
  },

  // ------------------------------------------
  // STRENGTH (Intermediate) - 4 days, Upper/Lower
  // ------------------------------------------
  {
    id: 'default_free_str_int',
    name: 'Strength (Intermediate)',
    restBetweenSets: 120,
    restBetweenExercises: 180,
    createdAt: '2025-01-01T00:00:00.000Z',
    days: [
      {
        name: 'Day 1', customName: 'Upper Heavy',
        exercises: [
          ex('bench_press', 5, 5),
          ex('barbell_row', 5, 5),
          ex('overhead_press_standing', 4, 5),
          ex('pullups_wide', 4, 5),
          ex('shrugs_barbell', 3, 8),
        ],
      },
      {
        name: 'Day 2', customName: 'Lower Heavy',
        exercises: [
          ex('back_squat', 5, 5),
          ex('deadlift', 4, 3),
          ex('front_squat', 3, 5),
          ex('rdl_barbell', 3, 6),
          ex('standing_calf_raise_barbell', 4, 10),
          ex('hanging_leg_raise', 3, 10),
        ],
      },
      {
        name: 'Day 3', customName: 'Upper Moderate',
        exercises: [
          ex('incline_press', 4, 6),
          ex('chinups', 4, 6),
          ex('push_press', 4, 5),
          ex('dumbbell_row', 4, 8),
          ex('ez_bar_curl', 3, 8, 1),
          ex('skull_crushers', 3, 8, 1),
        ],
      },
      {
        name: 'Day 4', customName: 'Lower Moderate',
        exercises: [
          ex('pause_squat', 4, 5),
          ex('sumo_deadlift', 4, 5),
          ex('bulgarian_split_squat_bb', 3, 6),
          ex('good_mornings', 3, 8),
          ex('standing_calf_raise_dumbbell', 4, 12),
          ex('decline_sit_ups', 3, 12),
        ],
      },
    ],
  },

  // ------------------------------------------
  // MASS (Beginner) - 3 days, Full Body
  // ------------------------------------------
  {
    id: 'default_free_mass_beg',
    name: 'Mass (Beginner)',
    restBetweenSets: 90,
    restBetweenExercises: 120,
    createdAt: '2025-01-01T00:00:00.000Z',
    days: [
      {
        name: 'Day 1', customName: '',
        exercises: [
          ex('back_squat', 3, 10),
          ex('bench_press', 3, 10),
          ex('barbell_row', 3, 10),
          ex('lateral_raise', 3, 12, 1),
          ex('rear_delt_fly_bent', 3, 12, 1),
          ex('standing_calf_raise_barbell', 3, 15),
          ex('hanging_knee_raise', 3, 12),
        ],
      },
      {
        name: 'Day 2', customName: '',
        exercises: [
          ex('deadlift', 3, 8),
          ex('db_incline_press', 3, 10),
          ex('pullups_wide', 3, 8),
          ex('db_shoulder_press_standing', 3, 10),
          ex('db_curl_standing', 3, 12, 1),
          ex('skull_crushers', 3, 12, 1),
          ex('russian_twist', 3, 15),
        ],
      },
      {
        name: 'Day 3', customName: '',
        exercises: [
          ex('goblet_squat', 3, 12),
          ex('dumbbell_flyes', 3, 12),
          ex('dumbbell_row', 3, 10),
          ex('arnold_press', 3, 10),
          ex('rdl_dumbbell', 3, 10),
          ex('standing_calf_raise_dumbbell', 3, 15),
          ex('bicycle_crunches', 3, 15),
        ],
      },
    ],
  },

  // ------------------------------------------
  // MASS (Intermediate) - 4 days, Upper/Lower
  // ------------------------------------------
  {
    id: 'default_free_mass_int',
    name: 'Mass (Intermediate)',
    restBetweenSets: 90,
    restBetweenExercises: 120,
    createdAt: '2025-01-01T00:00:00.000Z',
    days: [
      {
        name: 'Day 1', customName: 'Upper A',
        exercises: [
          ex('bench_press', 4, 10),
          ex('barbell_row', 4, 10),
          ex('db_shoulder_press_seated', 3, 10),
          ex('incline_dumbbell_flyes', 3, 12),
          ex('ez_bar_curl', 3, 12, 1),
          ex('db_overhead_extension_two', 3, 12, 1),
          ex('lateral_raise', 3, 15),
        ],
      },
      {
        name: 'Day 2', customName: 'Lower A',
        exercises: [
          ex('back_squat', 4, 10),
          ex('rdl_barbell', 3, 10),
          ex('lunges_walking', 3, 12),
          ex('hip_thrust_barbell', 3, 12),
          ex('standing_calf_raise_barbell', 4, 15),
          ex('hanging_leg_raise', 3, 12),
        ],
      },
      {
        name: 'Day 3', customName: 'Upper B',
        exercises: [
          ex('overhead_press_standing', 4, 8),
          ex('chinups', 4, 8),
          ex('db_incline_press', 3, 10),
          ex('db_bent_over_row', 3, 10),
          ex('hammer_curl', 3, 12, 1),
          ex('skull_crushers', 3, 12, 1),
          ex('rear_delt_fly_incline', 3, 15),
        ],
      },
      {
        name: 'Day 4', customName: 'Lower B',
        exercises: [
          ex('deadlift', 4, 6),
          ex('front_squat', 3, 10),
          ex('bulgarian_split_squat_db', 3, 10),
          ex('rdl_dumbbell', 3, 10),
          ex('seated_calf_raise', 4, 15),
          ex('ab_rollout', 3, 12),
        ],
      },
    ],
  },

  // ------------------------------------------
  // HYPERTROPHY (Beginner) - 3 days, Full Body
  // ------------------------------------------
  {
    id: 'default_free_hyp_beg',
    name: 'Hypertrophy (Beginner)',
    restBetweenSets: 60,
    restBetweenExercises: 90,
    createdAt: '2025-01-01T00:00:00.000Z',
    days: [
      {
        name: 'Day 1', customName: '',
        exercises: [
          ex('db_bench_press', 3, 12),
          ex('dumbbell_row', 3, 12),
          ex('goblet_squat', 3, 15),
          ex('lateral_raise', 3, 15, 1),
          ex('rear_delt_fly_bent', 3, 15, 1),
          ex('db_curl_standing', 3, 12),
          ex('calf_raise_bodyweight', 3, 20),
          ex('crunches', 3, 20),
        ],
      },
      {
        name: 'Day 2', customName: '',
        exercises: [
          ex('db_incline_press', 3, 12),
          ex('db_bent_over_row', 3, 12),
          ex('lunges_forward', 3, 12),
          ex('arnold_press', 3, 12),
          ex('concentration_curl', 3, 12, 1),
          ex('db_kickback', 3, 12, 1),
          ex('standing_calf_raise_dumbbell', 3, 15),
          ex('bicycle_crunches', 3, 20),
        ],
      },
      {
        name: 'Day 3', customName: '',
        exercises: [
          ex('dumbbell_flyes', 3, 15),
          ex('chinups', 3, 10),
          ex('dumbbell_squat', 3, 15),
          ex('front_raise', 3, 15),
          ex('hammer_curl', 3, 12, 1),
          ex('bench_dips', 3, 15, 1),
          ex('standing_calf_raise_single', 3, 15),
          ex('reverse_crunches', 3, 15),
        ],
      },
    ],
  },

  // ------------------------------------------
  // HYPERTROPHY (Intermediate) - 4 days, Push/Pull/Legs/Arms
  // ------------------------------------------
  {
    id: 'default_free_hyp_int',
    name: 'Hypertrophy (Intermediate)',
    restBetweenSets: 60,
    restBetweenExercises: 90,
    createdAt: '2025-01-01T00:00:00.000Z',
    days: [
      {
        name: 'Day 1', customName: 'Push',
        exercises: [
          ex('bench_press', 4, 10),
          ex('db_incline_press', 3, 12),
          ex('dumbbell_flyes', 3, 15),
          ex('overhead_press_standing', 3, 10),
          ex('lateral_raise', 4, 15, 1),
          ex('front_raise', 3, 15, 1),
          ex('diamond_push_ups', 3, 12),
          ex('hanging_knee_raise', 3, 12),
        ],
      },
      {
        name: 'Day 2', customName: 'Pull',
        exercises: [
          ex('barbell_row', 4, 10),
          ex('pullups_wide', 3, 10),
          ex('dumbbell_row', 3, 12),
          ex('rear_delt_fly_incline', 3, 15, 1),
          ex('band_pull_aparts', 3, 15, 1),
          ex('shrugs_dumbbell', 3, 12),
          ex('hyperextension', 3, 12),
        ],
      },
      {
        name: 'Day 3', customName: 'Legs',
        exercises: [
          ex('back_squat', 4, 10),
          ex('rdl_barbell', 3, 10),
          ex('lunges_walking', 3, 12),
          ex('hip_thrust_barbell', 3, 12),
          ex('goblet_squat', 3, 15),
          ex('standing_calf_raise_barbell', 4, 15),
          ex('decline_sit_ups', 3, 15),
        ],
      },
      {
        name: 'Day 4', customName: 'Arms',
        exercises: [
          ex('ez_bar_curl', 3, 12, 1),
          ex('skull_crushers', 3, 12, 1),
          ex('db_curl_incline', 3, 12, 2),
          ex('db_overhead_extension_two', 3, 12, 2),
          ex('hammer_curl', 3, 12),
          ex('db_kickback', 3, 15),
          ex('barbell_wrist_curl', 3, 15),
          ex('russian_twist', 3, 15),
        ],
      },
    ],
  },
];

// ============================================
// PRO TIER ROUTINES
// ============================================

export const defaultRoutinesPro = [
  // ------------------------------------------
  // STRENGTH (Beginner) - 3 days, Full Body
  // ------------------------------------------
  {
    id: 'default_pro_str_beg',
    name: 'Strength (Beginner)',
    restBetweenSets: 120,
    restBetweenExercises: 150,
    createdAt: '2025-01-01T00:00:00.000Z',
    days: [
      {
        name: 'Day 1', customName: '',
        exercises: [
          ex('back_squat', 4, 5),
          ex('bench_press', 4, 5),
          ex('barbell_row', 4, 5),
          ex('leg_curl', 3, 8),
          ex('cable_crunch', 3, 12),
        ],
      },
      {
        name: 'Day 2', customName: '',
        exercises: [
          ex('deadlift', 4, 5),
          ex('overhead_press_standing', 4, 5),
          ex('lat_pulldown_wide', 4, 6),
          ex('leg_extension', 3, 8),
          ex('standing_calf_raise_machine', 3, 10),
        ],
      },
      {
        name: 'Day 3', customName: '',
        exercises: [
          ex('front_squat', 4, 5),
          ex('incline_press', 4, 5),
          ex('seated_cable_row', 4, 6),
          ex('cable_curl_bar', 3, 8, 1),
          ex('cable_pushdown_bar', 3, 8, 1),
        ],
      },
    ],
  },

  // ------------------------------------------
  // STRENGTH (Intermediate) - 4 days, Upper/Lower
  // ------------------------------------------
  {
    id: 'default_pro_str_int',
    name: 'Strength (Intermediate)',
    restBetweenSets: 120,
    restBetweenExercises: 180,
    createdAt: '2025-01-01T00:00:00.000Z',
    days: [
      {
        name: 'Day 1', customName: 'Upper Heavy',
        exercises: [
          ex('bench_press', 5, 5),
          ex('barbell_row', 5, 5),
          ex('overhead_press_standing', 4, 5),
          ex('pullups_wide', 4, 5),
          ex('shrugs_barbell', 3, 6),
          ex('face_pulls', 3, 10),
        ],
      },
      {
        name: 'Day 2', customName: 'Lower Heavy',
        exercises: [
          ex('back_squat', 5, 5),
          ex('deadlift', 4, 3),
          ex('leg_press', 3, 6),
          ex('leg_curl', 3, 6),
          ex('standing_calf_raise_machine', 4, 10),
          ex('hanging_leg_raise', 3, 10),
        ],
      },
      {
        name: 'Day 3', customName: 'Upper Moderate',
        exercises: [
          ex('incline_press', 4, 6),
          ex('lat_pulldown_close', 4, 6),
          ex('push_press', 4, 5),
          ex('tbar_row', 4, 8),
          ex('cable_curl_bar', 3, 8, 1),
          ex('cable_pushdown_rope', 3, 8, 1),
        ],
      },
      {
        name: 'Day 4', customName: 'Lower Moderate',
        exercises: [
          ex('pause_squat', 4, 5),
          ex('sumo_deadlift', 4, 5),
          ex('squat', 3, 6),
          ex('seated_leg_curl', 3, 8, 1),
          ex('leg_extension', 3, 8, 1),
          ex('leg_press_calf_raise', 4, 12),
        ],
      },
    ],
  },

  // ------------------------------------------
  // MASS (Beginner) - 3 days, Full Body
  // ------------------------------------------
  {
    id: 'default_pro_mass_beg',
    name: 'Mass (Beginner)',
    restBetweenSets: 90,
    restBetweenExercises: 120,
    createdAt: '2025-01-01T00:00:00.000Z',
    days: [
      {
        name: 'Day 1', customName: '',
        exercises: [
          ex('back_squat', 3, 10),
          ex('bench_press', 3, 10),
          ex('lat_pulldown_wide', 3, 10),
          ex('db_shoulder_press_standing', 3, 10),
          ex('cable_curl_bar', 3, 12, 1),
          ex('cable_pushdown_rope', 3, 12, 1),
          ex('cable_crunch', 3, 15),
        ],
      },
      {
        name: 'Day 2', customName: '',
        exercises: [
          ex('leg_press', 3, 10),
          ex('db_incline_press', 3, 10),
          ex('seated_cable_row', 3, 10),
          ex('lateral_raise', 3, 12),
          ex('leg_curl', 3, 12, 1),
          ex('leg_extension', 3, 12, 1),
          ex('standing_calf_raise_machine', 3, 15),
        ],
      },
      {
        name: 'Day 3', customName: '',
        exercises: [
          ex('deadlift', 3, 8),
          ex('chest_press', 3, 10),
          ex('chinups', 3, 8),
          ex('cable_lateral_raise', 3, 12),
          ex('face_pulls', 3, 12),
          ex('hanging_knee_raise', 3, 12),
        ],
      },
    ],
  },

  // ------------------------------------------
  // MASS (Intermediate) - 4 days, Upper/Lower
  // ------------------------------------------
  {
    id: 'default_pro_mass_int',
    name: 'Mass (Intermediate)',
    restBetweenSets: 90,
    restBetweenExercises: 120,
    createdAt: '2025-01-01T00:00:00.000Z',
    days: [
      {
        name: 'Day 1', customName: 'Upper A',
        exercises: [
          ex('bench_press', 4, 10),
          ex('seated_cable_row', 4, 10),
          ex('db_shoulder_press_seated', 3, 10),
          ex('cable_crossover_low', 3, 12),
          ex('cable_curl_bar', 3, 12, 1),
          ex('cable_pushdown_vbar', 3, 12, 1),
          ex('cable_lateral_raise', 3, 15),
        ],
      },
      {
        name: 'Day 2', customName: 'Lower A',
        exercises: [
          ex('back_squat', 4, 10),
          ex('leg_curl', 3, 10),
          ex('leg_press', 3, 12),
          ex('hip_thrust_barbell', 3, 10),
          ex('leg_extension', 3, 12),
          ex('standing_calf_raise_machine', 4, 15),
          ex('cable_crunch', 3, 15),
        ],
      },
      {
        name: 'Day 3', customName: 'Upper B',
        exercises: [
          ex('overhead_press_standing', 4, 8),
          ex('lat_pulldown_wide', 4, 10),
          ex('db_incline_press', 3, 10),
          ex('single_arm_cable_row', 3, 10),
          ex('hammer_curl', 3, 12, 1),
          ex('cable_overhead_extension_rope', 3, 12, 1),
          ex('face_pulls', 3, 15),
        ],
      },
      {
        name: 'Day 4', customName: 'Lower B',
        exercises: [
          ex('deadlift', 4, 6),
          ex('squat', 3, 10),
          ex('seated_leg_curl', 3, 10),
          ex('kb_lunge', 3, 10),
          ex('cable_pull_through_glutes', 3, 12),
          ex('leg_press_calf_raise', 4, 15),
          ex('pallof_press', 3, 12),
        ],
      },
    ],
  },

  // ------------------------------------------
  // HYPERTROPHY (Beginner) - 3 days, Full Body
  // ------------------------------------------
  {
    id: 'default_pro_hyp_beg',
    name: 'Hypertrophy (Beginner)',
    restBetweenSets: 60,
    restBetweenExercises: 90,
    createdAt: '2025-01-01T00:00:00.000Z',
    days: [
      {
        name: 'Day 1', customName: '',
        exercises: [
          ex('chest_press', 3, 12),
          ex('lat_pulldown_wide', 3, 12),
          ex('leg_press', 3, 15),
          ex('cable_lateral_raise', 3, 15),
          ex('cable_curl_single', 3, 12, 1),
          ex('cable_pushdown_rope', 3, 12, 1),
          ex('standing_calf_raise_machine', 3, 15),
          ex('cable_crunch', 3, 15),
        ],
      },
      {
        name: 'Day 2', customName: '',
        exercises: [
          ex('db_incline_press', 3, 12),
          ex('seated_cable_row', 3, 12),
          ex('goblet_squat', 3, 15),
          ex('arnold_press', 3, 12),
          ex('leg_curl', 3, 12, 1),
          ex('leg_extension', 3, 12, 1),
          ex('leg_press_calf_raise', 3, 15),
          ex('hanging_knee_raise', 3, 12),
        ],
      },
      {
        name: 'Day 3', customName: '',
        exercises: [
          ex('pec_deck', 3, 15),
          ex('lat_pulldown_reverse', 3, 12),
          ex('kb_goblet_squat', 3, 15),
          ex('face_pulls_shoulders', 3, 15),
          ex('ez_bar_curl', 3, 12, 1),
          ex('cable_kickback', 3, 12, 1),
          ex('squat_calf_raise', 3, 15),
          ex('ball_crunch', 3, 15),
        ],
      },
    ],
  },

  // ------------------------------------------
  // HYPERTROPHY (Intermediate) - 4 days, Push/Pull/Legs/Arms
  // ------------------------------------------
  {
    id: 'default_pro_hyp_int',
    name: 'Hypertrophy (Intermediate)',
    restBetweenSets: 60,
    restBetweenExercises: 90,
    createdAt: '2025-01-01T00:00:00.000Z',
    days: [
      {
        name: 'Day 1', customName: 'Push',
        exercises: [
          ex('bench_press', 4, 10),
          ex('db_incline_press', 3, 12),
          ex('cable_crossover_high', 3, 15),
          ex('overhead_press_standing', 3, 10),
          ex('cable_lateral_raise', 4, 15, 1),
          ex('cable_front_raise', 3, 15, 1),
          ex('cable_pushdown_rope', 3, 12),
          ex('cable_overhead_extension_rope', 3, 12),
        ],
      },
      {
        name: 'Day 2', customName: 'Pull',
        exercises: [
          ex('barbell_row', 4, 10),
          ex('lat_pulldown_wide', 3, 12),
          ex('single_arm_cable_row', 3, 12),
          ex('cable_rear_delt_fly', 3, 15, 1),
          ex('face_pulls', 3, 15, 1),
          ex('cable_curl_bar', 3, 12),
          ex('cable_high_curl', 3, 12),
          ex('cable_shrugs', 3, 12),
        ],
      },
      {
        name: 'Day 3', customName: 'Legs',
        exercises: [
          ex('back_squat', 4, 10),
          ex('squat', 3, 12),
          ex('seated_leg_curl', 3, 12, 1),
          ex('leg_extension', 3, 15, 1),
          ex('hip_thrust_barbell', 3, 12),
          ex('kb_swing', 3, 15),
          ex('standing_calf_raise_machine', 4, 15),
          ex('cable_woodchop_high', 3, 12),
        ],
      },
      {
        name: 'Day 4', customName: 'Arms',
        exercises: [
          ex('ez_bar_curl', 3, 12, 1),
          ex('cable_pushdown_vbar', 3, 12, 1),
          ex('cable_curl_rope', 3, 12, 2),
          ex('cable_overhead_extension_single', 3, 12, 2),
          ex('db_preacher_curl', 3, 12),
          ex('dips_triceps', 3, 12),
          ex('cable_wrist_curl', 3, 15),
          ex('pallof_press', 3, 12),
        ],
      },
    ],
  },
];

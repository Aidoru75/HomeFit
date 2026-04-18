// ExerciseImage Component - Displays exercise images with cross-fade animation
import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { useTheme } from '../context/ThemeContext';

/*
  IMAGE NAMING CONVENTION:

  Place exercise images in: assets/exercises/

  Naming format: {exercise_id}_{position}.png

  Where:
  - exercise_id: The ID from exercises.js (e.g., "bench_press", "deadlift")
  - position: "start", "end", or optionally "mid" / "mid1", "mid2", ...

  All images should be 700x700 pixels, transparent background PNG.
  If images don't exist for an exercise, a placeholder will be shown.

  Animation modes:
  1. 2-frame (default): start ↔ end
  2. Symmetric (_mid): start → mid → end → mid → start
     Use for exercises where the movement reverses (e.g., twists).
  3. Sequential (_mid1, _mid2, ...): start → mid1 → mid2 → ... → end → start
     Use for non-symmetrical exercises (e.g., Zottman curl) where the
     return path differs from the forward path. Add as many _midN as needed.
     _mid1 takes priority over _mid (they cannot coexist for the same exercise).
*/

// Map of available exercise images — add entries here as you create PNGs
const exerciseImages = {

  // ############################################
  // FREE EXERCISES (Home Gym Equipment Only)
  // ############################################

  // ============================================
  // CHEST
  // ============================================
  bench_press_start: require('../../assets/exercises/bench_press_start.png'),
  bench_press_end: require('../../assets/exercises/bench_press_end.png'),
  incline_press_start: require('../../assets/exercises/incline_press_start.png'),
  incline_press_end: require('../../assets/exercises/incline_press_end.png'),
  decline_press_start: require('../../assets/exercises/decline_press_start.png'),
  decline_press_end: require('../../assets/exercises/decline_press_end.png'),
  db_bench_press_start: require('../../assets/exercises/db_bench_press_start.png'),
  db_bench_press_end: require('../../assets/exercises/db_bench_press_end.png'),
  db_incline_press_start: require('../../assets/exercises/db_incline_press_start.png'),
  db_incline_press_end: require('../../assets/exercises/db_incline_press_end.png'),
  db_decline_press_start: require('../../assets/exercises/db_decline_press_start.png'),
  db_decline_press_end: require('../../assets/exercises/db_decline_press_end.png'),
  dumbbell_flyes_start: require('../../assets/exercises/dumbbell_flyes_start.png'),
  dumbbell_flyes_end: require('../../assets/exercises/dumbbell_flyes_end.png'),
  incline_dumbbell_flyes_start: require('../../assets/exercises/incline_dumbbell_flyes_start.png'),
  incline_dumbbell_flyes_end: require('../../assets/exercises/incline_dumbbell_flyes_end.png'),
  decline_dumbbell_flyes_start: require('../../assets/exercises/decline_dumbbell_flyes_start.png'),
  decline_dumbbell_flyes_end: require('../../assets/exercises/decline_dumbbell_flyes_end.png'),
  push_ups_start: require('../../assets/exercises/push_ups_start.png'),
  push_ups_end: require('../../assets/exercises/push_ups_end.png'),
  incline_push_ups_start: require('../../assets/exercises/incline_push_ups_start.png'),
  incline_push_ups_end: require('../../assets/exercises/incline_push_ups_end.png'),
  decline_push_ups_start: require('../../assets/exercises/decline_push_ups_start.png'),
  decline_push_ups_end: require('../../assets/exercises/decline_push_ups_end.png'),
  svend_press_start: require('../../assets/exercises/svend_press_start.png'),
  svend_press_end: require('../../assets/exercises/svend_press_end.png'),
  pullover_chest_start: require('../../assets/exercises/pullover_chest_start.png'),
  pullover_chest_end: require('../../assets/exercises/pullover_chest_end.png'),
  dips_chest_start: require('../../assets/exercises/dips_start.png'),
  dips_chest_end: require('../../assets/exercises/dips_end.png'),

  // ============================================
  // BACK
  // ============================================
  pullups_wide_start: require('../../assets/exercises/pullups_wide_start.png'),
  pullups_wide_end: require('../../assets/exercises/pullups_wide_end.png'),
  pullups_close_start: require('../../assets/exercises/pullups_close_start.png'),
  pullups_close_end: require('../../assets/exercises/pullups_close_end.png'),
  chinups_start: require('../../assets/exercises/chinups_start.png'),
  chinups_end: require('../../assets/exercises/chinups_end.png'),
  band_assisted_pullups_start: require('../../assets/exercises/band_assisted_pullups_start.png'),
  band_assisted_pullups_end: require('../../assets/exercises/band_assisted_pullups_end.png'),
  barbell_row_start: require('../../assets/exercises/barbell_row_start.png'),
  barbell_row_end: require('../../assets/exercises/barbell_row_end.png'),
  barbell_row_underhand_start: require('../../assets/exercises/barbell_row_underhand_start.png'),
  barbell_row_underhand_end: require('../../assets/exercises/barbell_row_underhand_end.png'),
  pendlay_row_start: require('../../assets/exercises/pendlay_row_start.png'),
  pendlay_row_end: require('../../assets/exercises/pendlay_row_end.png'),
  dumbbell_row_start: require('../../assets/exercises/dumbbell_row_start.png'),
  dumbbell_row_end: require('../../assets/exercises/dumbbell_row_end.png'),
  db_bent_over_row_start: require('../../assets/exercises/db_bent_over_row_start.png'),
  db_bent_over_row_end: require('../../assets/exercises/db_bent_over_row_end.png'),
  pullover_back_start: require('../../assets/exercises/pullover_chest_start.png'),
  pullover_back_end: require('../../assets/exercises/pullover_chest_end.png'),
  tbar_row_start: require('../../assets/exercises/tbar_row_start.png'),
  tbar_row_end: require('../../assets/exercises/tbar_row_end.png'),
  deadlift_start: require('../../assets/exercises/deadlift_start.png'),
  deadlift_end: require('../../assets/exercises/deadlift_end.png'),
  romanian_deadlift_barbell_start: require('../../assets/exercises/romanian_deadlift_barbell_start.png'),
  romanian_deadlift_barbell_end: require('../../assets/exercises/romanian_deadlift_barbell_end.png'),
  romanian_deadlift_dumbbell_start: require('../../assets/exercises/romanian_deadlift_dumbbell_start.png'),
  romanian_deadlift_dumbbell_end: require('../../assets/exercises/romanian_deadlift_dumbbell_end.png'),
  good_mornings_start: require('../../assets/exercises/good_mornings_start.png'),
  good_mornings_end: require('../../assets/exercises/good_mornings_end.png'),
  hyperextension_start: require('../../assets/exercises/hyperextension_start.png'),
  hyperextension_end: require('../../assets/exercises/hyperextension_end.png'),
  shrugs_barbell_start: require('../../assets/exercises/shrugs_barbell_start.png'),
  shrugs_barbell_end: require('../../assets/exercises/shrugs_barbell_end.png'),
  shrugs_dumbbell_start: require('../../assets/exercises/shrugs_dumbbell_start.png'),
  shrugs_dumbbell_end: require('../../assets/exercises/shrugs_dumbbell_end.png'),

  // ============================================
  // SHOULDERS
  // ============================================
  overhead_press_standing_start: require('../../assets/exercises/overhead_press_standing_start.png'),
  overhead_press_standing_end: require('../../assets/exercises/overhead_press_standing_end.png'),
  overhead_press_seated_start: require('../../assets/exercises/overhead_press_seated_start.png'),
  overhead_press_seated_end: require('../../assets/exercises/overhead_press_seated_end.png'),
  push_press_start: require('../../assets/exercises/push_press_start.png'),
  push_press_end: require('../../assets/exercises/push_press_end.png'),
  behind_neck_press_start: require('../../assets/exercises/behind_neck_press_start.png'),
  behind_neck_press_end: require('../../assets/exercises/behind_neck_press_end.png'),
  db_shoulder_press_seated_start: require('../../assets/exercises/db_shoulder_press_seated_start.png'),
  db_shoulder_press_seated_end: require('../../assets/exercises/db_shoulder_press_seated_end.png'),
  db_shoulder_press_standing_start: require('../../assets/exercises/db_shoulder_press_standing_start.png'),
  db_shoulder_press_standing_end: require('../../assets/exercises/db_shoulder_press_standing_end.png'),
  arnold_press_start: require('../../assets/exercises/arnold_press_start.png'),
  arnold_press_end: require('../../assets/exercises/arnold_press_end.png'),
  lateral_raise_start: require('../../assets/exercises/lateral_raise_start.png'),
  lateral_raise_end: require('../../assets/exercises/lateral_raise_end.png'),
  front_raise_start: require('../../assets/exercises/front_raise_start.png'),
  front_raise_end: require('../../assets/exercises/front_raise_end.png'),
  rear_delt_fly_bent_start: require('../../assets/exercises/rear_delt_fly_bent_start.png'),
  rear_delt_fly_bent_end: require('../../assets/exercises/rear_delt_fly_bent_end.png'),
  rear_delt_fly_incline_start: require('../../assets/exercises/rear_delt_fly_incline_start.png'),
  rear_delt_fly_incline_end: require('../../assets/exercises/rear_delt_fly_incline_end.png'),
  upright_row_barbell_start: require('../../assets/exercises/upright_row_barbell_start.png'),
  upright_row_barbell_end: require('../../assets/exercises/upright_row_barbell_end.png'),
  upright_row_dumbbell_start: require('../../assets/exercises/upright_row_dumbbell_start.png'),
  upright_row_dumbbell_end: require('../../assets/exercises/upright_row_dumbbell_end.png'),
  plate_front_raise_start: require('../../assets/exercises/plate_front_raise_start.png'),
  plate_front_raise_end: require('../../assets/exercises/plate_front_raise_end.png'),
  bus_drivers_start: require('../../assets/exercises/bus_drivers_start.png'),
  bus_drivers_end: require('../../assets/exercises/bus_drivers_end.png'),
  band_pull_aparts_start: require('../../assets/exercises/band_pull_aparts_start.png'),
  band_pull_aparts_end: require('../../assets/exercises/band_pull_aparts_end.png'),
  barbell_high_pull_start: require('../../assets/exercises/barbell_high_pull_start.png'),
  barbell_high_pull_end: require('../../assets/exercises/barbell_high_pull_end.png'),

  // ============================================
  // BICEPS
  // ============================================
  barbell_curl_standing_start: require('../../assets/exercises/barbell_curl_standing_start.png'),
  barbell_curl_standing_end: require('../../assets/exercises/barbell_curl_standing_end.png'),
  barbell_curl_wide_start: require('../../assets/exercises/barbell_curl_wide_start.png'),
  barbell_curl_wide_end: require('../../assets/exercises/barbell_curl_wide_end.png'),
  barbell_curl_close_start: require('../../assets/exercises/barbell_curl_close_start.png'),
  barbell_curl_close_end: require('../../assets/exercises/barbell_curl_close_end.png'),
  ez_bar_curl_start: require('../../assets/exercises/ez_bar_curl_start.png'),
  ez_bar_curl_end: require('../../assets/exercises/ez_bar_curl_end.png'),
  ez_bar_curl_wide_start: require('../../assets/exercises/ez_bar_curl_wide_start.png'),
  ez_bar_curl_wide_end: require('../../assets/exercises/ez_bar_curl_wide_end.png'),
  db_curl_standing_start: require('../../assets/exercises/db_curl_standing_start.png'),
  db_curl_standing_end: require('../../assets/exercises/db_curl_standing_end.png'),
  db_curl_seated_start: require('../../assets/exercises/db_curl_seated_start.png'),
  db_curl_seated_end: require('../../assets/exercises/db_curl_seated_end.png'),
  db_curl_incline_start: require('../../assets/exercises/db_curl_incline_start.png'),
  db_curl_incline_end: require('../../assets/exercises/db_curl_incline_end.png'),
  hammer_curl_start: require('../../assets/exercises/hammer_curl_start.png'),
  hammer_curl_end: require('../../assets/exercises/hammer_curl_end.png'),
  concentration_curl_start: require('../../assets/exercises/concentration_curl_start.png'),
  concentration_curl_end: require('../../assets/exercises/concentration_curl_end.png'),
  zottman_curl_start: require('../../assets/exercises/zottman_curl_start.png'),
  zottman_curl_mid1: require('../../assets/exercises/zottman_curl_mid1.png'),
  zottman_curl_mid2: require('../../assets/exercises/zottman_curl_mid2.png'),
  zottman_curl_end: require('../../assets/exercises/zottman_curl_end.png'),
  drag_curl_start: require('../../assets/exercises/drag_curl_start.png'),
  drag_curl_mid: require('../../assets/exercises/drag_curl_mid.png'),
  drag_curl_end: require('../../assets/exercises/drag_curl_end.png'),
  chinups_biceps_start: require('../../assets/exercises/chinups_start.png'),
  chinups_biceps_end: require('../../assets/exercises/chinups_end.png'),
  band_curl_start: require('../../assets/exercises/band_curl_start.png'),
  band_curl_end: require('../../assets/exercises/band_curl_end.png'),

  // ============================================
  // TRICEPS
  // ============================================
  close_grip_bench_start: require('../../assets/exercises/close_grip_bench_start.png'),
  close_grip_bench_end: require('../../assets/exercises/close_grip_bench_end.png'),
  skull_crushers_start: require('../../assets/exercises/skull_crushers_start.png'),
  skull_crushers_end: require('../../assets/exercises/skull_crushers_end.png'),
  db_skull_crushers_start: require('../../assets/exercises/db_skull_crushers_start.png'),
  db_skull_crushers_end: require('../../assets/exercises/db_skull_crushers_end.png'),
  db_overhead_extension_two_start: require('../../assets/exercises/db_overhead_extension_two_start.png'),
  db_overhead_extension_two_end: require('../../assets/exercises/db_overhead_extension_two_end.png'),
  db_overhead_extension_single_start: require('../../assets/exercises/db_overhead_extension_single_start.png'),
  db_overhead_extension_single_end: require('../../assets/exercises/db_overhead_extension_single_end.png'),
  db_kickback_start: require('../../assets/exercises/db_kickback_start.png'),
  db_kickback_end: require('../../assets/exercises/db_kickback_end.png'),
  bench_dips_start: require('../../assets/exercises/bench_dips_start.png'),
  bench_dips_end: require('../../assets/exercises/bench_dips_end.png'),
  dips_triceps_start: require('../../assets/exercises/dips_start.png'),
  dips_triceps_end: require('../../assets/exercises/dips_end.png'),
  diamond_push_ups_start: require('../../assets/exercises/diamond_push_ups_start.png'),
  diamond_push_ups_end: require('../../assets/exercises/diamond_push_ups_end.png'),
  band_pushdown_start: require('../../assets/exercises/band_pushdown_start.png'),
  band_pushdown_end: require('../../assets/exercises/band_pushdown_end.png'),

  // ============================================
  // FOREARMS
  // ============================================
  barbell_wrist_curl_start: require('../../assets/exercises/barbell_wrist_curl_start.png'),
  barbell_wrist_curl_end: require('../../assets/exercises/barbell_wrist_curl_end.png'),
  barbell_reverse_wrist_curl_start: require('../../assets/exercises/barbell_reverse_wrist_curl_start.png'),
  barbell_reverse_wrist_curl_end: require('../../assets/exercises/barbell_reverse_wrist_curl_end.png'),
  db_wrist_curl_start: require('../../assets/exercises/db_wrist_curl_start.png'),
  db_wrist_curl_end: require('../../assets/exercises/db_wrist_curl_end.png'),
  db_reverse_wrist_curl_start: require('../../assets/exercises/db_reverse_wrist_curl_start.png'),
  db_reverse_wrist_curl_end: require('../../assets/exercises/db_reverse_wrist_curl_end.png'),
  farmers_walk_start: require('../../assets/exercises/farmers_walk_start.png'),
  farmers_walk_end: require('../../assets/exercises/farmers_walk_end.png'),
  plate_pinch_hold_start: require('../../assets/exercises/plate_pinch_hold_start.png'),
  plate_pinch_hold_end: require('../../assets/exercises/plate_pinch_hold_start.png'),
  dead_hang_start: require('../../assets/exercises/dead_hang_start.png'),
  dead_hang_end: require('../../assets/exercises/dead_hang_start.png'),
  towel_pullups_start: require('../../assets/exercises/towel_pullups_start.png'),
  towel_pullups_end: require('../../assets/exercises/towel_pullups_end.png'),
  reverse_curl_barbell_start: require('../../assets/exercises/reverse_curl_barbell_start.png'),
  reverse_curl_barbell_end: require('../../assets/exercises/reverse_curl_barbell_end.png'),
  reverse_curl_ez_start: require('../../assets/exercises/reverse_curl_barbell_start.png'),
  reverse_curl_ez_end: require('../../assets/exercises/reverse_curl_barbell_end.png'),

  // ============================================
  // QUADRICEPS
  // ============================================
  back_squat_start: require('../../assets/exercises/back_squat_start.png'),
  back_squat_end: require('../../assets/exercises/back_squat_end.png'),
  front_squat_start: require('../../assets/exercises/front_squat_start.png'),
  front_squat_end: require('../../assets/exercises/front_squat_end.png'),
  box_squat_start: require('../../assets/exercises/box_squat_start.png'),
  box_squat_end: require('../../assets/exercises/box_squat_end.png'),
  pause_squat_start: require('../../assets/exercises/back_squat_end.png'),
  pause_squat_end: require('../../assets/exercises/back_squat_start.png'),
  goblet_squat_start: require('../../assets/exercises/goblet_squat_start.png'),
  goblet_squat_end: require('../../assets/exercises/goblet_squat_end.png'),
  dumbbell_squat_start: require('../../assets/exercises/dumbbell_squat_start.png'),
  dumbbell_squat_end: require('../../assets/exercises/dumbbell_squat_end.png'),
  lunges_forward_start: require('../../assets/exercises/lunges_forward_start.png'),
  lunges_forward_end: require('../../assets/exercises/lunges_forward_end.png'),
  lunges_reverse_start: require('../../assets/exercises/lunges_reverse_start.png'),
  lunges_reverse_end: require('../../assets/exercises/lunges_reverse_end.png'),
  lunges_walking_start: require('../../assets/exercises/lunges_walking_start.png'),
  lunges_walking_mid: require('../../assets/exercises/lunges_walking_mid.png'),
  lunges_walking_end: require('../../assets/exercises/lunges_walking_end.png'),
  barbell_lunges_start: require('../../assets/exercises/barbell_lunges_start.png'),
  barbell_lunges_end: require('../../assets/exercises/barbell_lunges_end.png'),
  barbell_static_lunges_start: require('../../assets/exercises/barbell_static_lunges_start.png'),
  barbell_static_lunges_end: require('../../assets/exercises/barbell_static_lunges_end.png'),
  bulgarian_split_squat_db_start: require('../../assets/exercises/bulgarian_split_squat_db_start.png'),
  bulgarian_split_squat_db_end: require('../../assets/exercises/bulgarian_split_squat_db_end.png'),
  bulgarian_split_squat_bb_start: require('../../assets/exercises/bulgarian_split_squat_bb_start.png'),
  bulgarian_split_squat_bb_end: require('../../assets/exercises/bulgarian_split_squat_bb_end.png'),
  step_ups_start: require('../../assets/exercises/step_ups_start.png'),
  step_ups_end: require('../../assets/exercises/step_ups_end.png'),
  sissy_squat_start: require('../../assets/exercises/sissy_squat_start.png'),
  sissy_squat_end: require('../../assets/exercises/sissy_squat_end.png'),
  wall_sit_start: require('../../assets/exercises/wall_sit_start.png'),
  wall_sit_end: require('../../assets/exercises/wall_sit_start.png'),
  band_squat_start: require('../../assets/exercises/band_squat_start.png'),
  band_squat_end: require('../../assets/exercises/band_squat_end.png'),

  // ============================================
  // HAMSTRINGS
  // ============================================
  rdl_barbell_start: require('../../assets/exercises/romanian_deadlift_barbell_start.png'),
  rdl_barbell_end: require('../../assets/exercises/romanian_deadlift_barbell_end.png'),
  rdl_dumbbell_start: require('../../assets/exercises/romanian_deadlift_dumbbell_start.png'),
  rdl_dumbbell_end: require('../../assets/exercises/romanian_deadlift_dumbbell_end.png'),
  stiff_leg_deadlift_start: require('../../assets/exercises/romanian_deadlift_barbell_start.png'),
  stiff_leg_deadlift_end: require('../../assets/exercises/romanian_deadlift_barbell_end.png'),
  single_leg_rdl_start: require('../../assets/exercises/single_leg_rdl_start.png'),
  single_leg_rdl_end: require('../../assets/exercises/single_leg_rdl_end.png'),
  good_mornings_hamstrings_start: require('../../assets/exercises/good_mornings_start.png'),
  good_mornings_hamstrings_end: require('../../assets/exercises/good_mornings_end.png'),
  hamstring_bridge_start: require('../../assets/exercises/hamstring_bridge_start.png'),
  hamstring_bridge_end: require('../../assets/exercises/hamstring_bridge_start.png'),
  glute_ham_raise_start: require('../../assets/exercises/glute_ham_raise_start.png'),
  glute_ham_raise_end: require('../../assets/exercises/glute_ham_raise_end.png'),
  band_leg_curl_start: require('../../assets/exercises/band_leg_curl_start.png'),
  band_leg_curl_end: require('../../assets/exercises/band_leg_curl_end.png'),

  // ============================================
  // GLUTES
  // ============================================
  hip_thrust_barbell_start: require('../../assets/exercises/hip_thrust_barbell_start.png'),
  hip_thrust_barbell_end: require('../../assets/exercises/hip_thrust_barbell_end.png'),
  hip_thrust_dumbbell_start: require('../../assets/exercises/hip_thrust_dumbbell_start.png'),
  hip_thrust_dumbbell_end: require('../../assets/exercises/hip_thrust_dumbbell_end.png'),
  single_leg_hip_thrust_start: require('../../assets/exercises/single_leg_hip_thrust_start.png'),
  single_leg_hip_thrust_end: require('../../assets/exercises/single_leg_hip_thrust_end.png'),
  glute_bridge_barbell_start: require('../../assets/exercises/glute_bridge_barbell_start.png'),
  glute_bridge_barbell_end: require('../../assets/exercises/glute_bridge_barbell_end.png'),
  glute_bridge_dumbbell_start: require('../../assets/exercises/glute_bridge_dumbbell_start.png'),
  glute_bridge_dumbbell_end: require('../../assets/exercises/glute_bridge_dumbbell_end.png'),
  sumo_deadlift_start: require('../../assets/exercises/sumo_deadlift_start.png'),
  sumo_deadlift_end: require('../../assets/exercises/sumo_deadlift_end.png'),
  sumo_squat_start: require('../../assets/exercises/sumo_squat_start.png'),
  sumo_squat_end: require('../../assets/exercises/sumo_squat_end.png'),
  db_sumo_squat_start: require('../../assets/exercises/db_sumo_squat_start.png'),
  db_sumo_squat_end: require('../../assets/exercises/db_sumo_squat_end.png'),
  rdl_glutes_start: require('../../assets/exercises/romanian_deadlift_barbell_start.png'),
  rdl_glutes_end: require('../../assets/exercises/romanian_deadlift_barbell_end.png'),
  step_ups_glutes_start: require('../../assets/exercises/step_ups_start.png'),
  step_ups_glutes_end: require('../../assets/exercises/step_ups_end.png'),
  lateral_band_walk_start: require('../../assets/exercises/lateral_band_walk_start.png'),
  lateral_band_walk_end: require('../../assets/exercises/lateral_band_walk_end.png'),
  clamshells_start: require('../../assets/exercises/clamshells_start.png'),
  clamshells_end: require('../../assets/exercises/clamshells_end.png'),
  donkey_kicks_start: require('../../assets/exercises/donkey_kicks_start.png'),
  donkey_kicks_end: require('../../assets/exercises/donkey_kicks_end.png'),
  fire_hydrants_start: require('../../assets/exercises/fire_hydrants_start.png'),
  fire_hydrants_end: require('../../assets/exercises/fire_hydrants_end.png'),
  frog_bridge_start: require('../../assets/exercises/frog_bridge_start.png'),
  frog_bridge_end: require('../../assets/exercises/frog_bridge_end.png'),

  // ============================================
  // CALVES
  // ============================================
  standing_calf_raise_barbell_start: require('../../assets/exercises/standing_calf_raise_barbell_start.png'),
  standing_calf_raise_barbell_end: require('../../assets/exercises/standing_calf_raise_barbell_end.png'),
  standing_calf_raise_dumbbell_start: require('../../assets/exercises/standing_calf_raise_dumbbell_start.png'),
  standing_calf_raise_dumbbell_end: require('../../assets/exercises/standing_calf_raise_dumbbell_end.png'),
  standing_calf_raise_single_start: require('../../assets/exercises/standing_calf_raise_single_start.png'),
  standing_calf_raise_single_end: require('../../assets/exercises/standing_calf_raise_single_end.png'),
  seated_calf_raise_start: require('../../assets/exercises/seated_calf_raise_start.png'),
  seated_calf_raise_end: require('../../assets/exercises/seated_calf_raise_end.png'),
  donkey_calf_raise_start: require('../../assets/exercises/donkey_calf_raise_start.png'),
  donkey_calf_raise_end: require('../../assets/exercises/donkey_calf_raise_end.png'),
  jump_rope_start: require('../../assets/exercises/jump_rope_start.png'),
  jump_rope_end: require('../../assets/exercises/jump_rope_end.png'),
  calf_raise_bodyweight_start: require('../../assets/exercises/calf_raise_bodyweight_start.png'),
  calf_raise_bodyweight_end: require('../../assets/exercises/calf_raise_bodyweight_end.png'),
  running_start: require('../../assets/exercises/running_start.png'),
  running_end: require('../../assets/exercises/running_end.png'),

  // ============================================
  // CORE
  // ============================================
  wheel_crunches_start: require('../../assets/exercises/wheel_crunches_start.png'),
  wheel_crunches_end: require('../../assets/exercises/wheel_crunches_end.png'),
  crunches_start: require('../../assets/exercises/crunches_start.png'),
  crunches_end: require('../../assets/exercises/crunches_end.png'),
  reverse_crunches_start: require('../../assets/exercises/reverse_crunches_start.png'),
  reverse_crunches_end: require('../../assets/exercises/reverse_crunches_end.png'),
  lying_leg_raise_start: require('../../assets/exercises/lying_leg_raise_start.png'),
  lying_leg_raise_end: require('../../assets/exercises/lying_leg_raise_end.png'),
  bicycle_crunches_start: require('../../assets/exercises/bicycle_crunches_start.png'),
  bicycle_crunches_end: require('../../assets/exercises/bicycle_crunches_end.png'),
  sit_ups_start: require('../../assets/exercises/sit_ups_start.png'),
  sit_ups_end: require('../../assets/exercises/sit_ups_end.png'),
  decline_sit_ups_start: require('../../assets/exercises/decline_sit_ups_start.png'),
  decline_sit_ups_end: require('../../assets/exercises/decline_sit_ups_end.png'),
  hanging_leg_raise_start: require('../../assets/exercises/hanging_leg_raise_start.png'),
  hanging_leg_raise_end: require('../../assets/exercises/hanging_leg_raise_end.png'),
  hanging_knee_raise_start: require('../../assets/exercises/hanging_knee_raise_start.png'),
  hanging_knee_raise_end: require('../../assets/exercises/hanging_knee_raise_end.png'),
  hanging_oblique_knee_raise_start: require('../../assets/exercises/hanging_oblique_knee_raise_start.png'),
  hanging_oblique_knee_raise_end: require('../../assets/exercises/hanging_oblique_knee_raise_end.png'),
  toes_to_bar_start: require('../../assets/exercises/toes_to_bar_start.png'),
  toes_to_bar_end: require('../../assets/exercises/toes_to_bar_end.png'),
  windshield_wipers_start: require('../../assets/exercises/windshield_wipers_start.png'),
  windshield_wipers_end: require('../../assets/exercises/windshield_wipers_end.png'),
  plank_start: require('../../assets/exercises/plank_start.png'),
  plank_end: require('../../assets/exercises/plank_start.png'),
  side_plank_start: require('../../assets/exercises/side_plank_start.png'),
  side_plank_end: require('../../assets/exercises/side_plank_start.png'),
  mountain_climbers_start: require('../../assets/exercises/mountain_climbers_start.png'),
  mountain_climbers_end: require('../../assets/exercises/mountain_climbers_end.png'),
  dead_bug_start: require('../../assets/exercises/dead_bug_start.png'),
  dead_bug_end: require('../../assets/exercises/dead_bug_end.png'),
  bird_dog_start: require('../../assets/exercises/bird_dog_start.png'),
  bird_dog_end: require('../../assets/exercises/bird_dog_end.png'),
  ab_rollout_start: require('../../assets/exercises/ab_rollout_start.png'),
  ab_rollout_end: require('../../assets/exercises/ab_rollout_end.png'),
  russian_twist_start: require('../../assets/exercises/russian_twist_start.png'),
  russian_twist_end: require('../../assets/exercises/russian_twist_end.png'),
  v_ups_start: require('../../assets/exercises/v_ups_start.png'),
  v_ups_end: require('../../assets/exercises/v_ups_end.png'),
  l_sit_hold_start: require('../../assets/exercises/l_sit_hold_start.png'),
  l_sit_hold_end: require('../../assets/exercises/l_sit_hold_start.png'),
  hyperextension_core_start: require('../../assets/exercises/hyperextension_core_start.png'),
  hyperextension_core_end: require('../../assets/exercises/hyperextension_core_end.png'),
  superman_start: require('../../assets/exercises/superman_start.png'),
  superman_end: require('../../assets/exercises/superman_end.png'),
  db_side_bend_start: require('../../assets/exercises/db_side_bend_start.png'),
  db_side_bend_end: require('../../assets/exercises/db_side_bend_end.png'),

  // ############################################
  // PRO EXERCISES (Gym/Cable/Machine Equipment)
  // ############################################

  // ============================================
  // CHEST
  // ============================================
  cable_crossover_high_start: require('../../assets/exercises/cable_crossover_high_start.png'),
  cable_crossover_high_end: require('../../assets/exercises/cable_crossover_high_end.png'),
  cable_crossover_low_start: require('../../assets/exercises/cable_crossover_low_start.png'),
  cable_crossover_low_end: require('../../assets/exercises/cable_crossover_low_end.png'),
  cable_flyes_mid_start: require('../../assets/exercises/cable_flyes_mid_start.png'),
  cable_flyes_mid_end: require('../../assets/exercises/cable_flyes_mid_end.png'),
  pec_deck_start: require('../../assets/exercises/pec_deck_start.png'),
  pec_deck_end: require('../../assets/exercises/pec_deck_end.png'),
  chest_press_start: require('../../assets/exercises/chest_press_start.png'),
  chest_press_end: require('../../assets/exercises/chest_press_end.png'),
  neutral_bench_press_start: require('../../assets/exercises/neutral_bench_press_start.png'),
  neutral_bench_press_end: require('../../assets/exercises/neutral_bench_press_end.png'),

  // ============================================
  // BACK
  // ============================================
  lat_pulldown_wide_start: require('../../assets/exercises/lat_pulldown_wide_start.png'),
  lat_pulldown_wide_end: require('../../assets/exercises/lat_pulldown_wide_end.png'),
  lat_pulldown_close_start: require('../../assets/exercises/lat_pulldown_close_start.png'),
  lat_pulldown_close_end: require('../../assets/exercises/lat_pulldown_close_end.png'),
  lat_pulldown_reverse_start: require('../../assets/exercises/lat_pulldown_reverse_start.png'),
  lat_pulldown_reverse_end: require('../../assets/exercises/lat_pulldown_reverse_end.png'),
  behind_neck_pulldown_start: require('../../assets/exercises/behind_neck_pulldown_start.png'),
  behind_neck_pulldown_end: require('../../assets/exercises/behind_neck_pulldown_end.png'),
  seated_cable_row_start: require('../../assets/exercises/seated_cable_row_start.png'),
  seated_cable_row_end: require('../../assets/exercises/seated_cable_row_end.png'),
  seated_cable_row_wide_start: require('../../assets/exercises/seated_cable_row_wide_start.png'),
  seated_cable_row_wide_end: require('../../assets/exercises/seated_cable_row_wide_end.png'),
  face_pulls_start: require('../../assets/exercises/face_pulls_start.png'),
  face_pulls_end: require('../../assets/exercises/face_pulls_end.png'),
  single_arm_cable_row_start: require('../../assets/exercises/single_arm_cable_row_start.png'),
  single_arm_cable_row_end: require('../../assets/exercises/single_arm_cable_row_end.png'),
  cable_shrugs_start: require('../../assets/exercises/cable_shrugs_start.png'),
  cable_shrugs_end: require('../../assets/exercises/cable_shrugs_end.png'),
  neutral_cable_row_start: require('../../assets/exercises/neutral_cable_row_start.png'),
  neutral_cable_row_end: require('../../assets/exercises/neutral_cable_row_end.png'),

  // ============================================
  // SHOULDERS
  // ============================================
  cable_lateral_raise_start: require('../../assets/exercises/cable_lateral_raise_start.png'),
  cable_lateral_raise_end: require('../../assets/exercises/cable_lateral_raise_end.png'),
  cable_front_raise_start: require('../../assets/exercises/cable_front_raise_start.png'),
  cable_front_raise_end: require('../../assets/exercises/cable_front_raise_end.png'),
  cable_rear_delt_fly_start: require('../../assets/exercises/cable_rear_delt_fly_start.png'),
  cable_rear_delt_fly_end: require('../../assets/exercises/cable_rear_delt_fly_end.png'),
  face_pulls_shoulders_start: require('../../assets/exercises/face_pulls_start.png'),
  face_pulls_shoulders_end: require('../../assets/exercises/face_pulls_end.png'),
  upright_row_cable_start: require('../../assets/exercises/upright_row_cable_start.png'),
  upright_row_cable_end: require('../../assets/exercises/upright_row_cable_end.png'),
  reverse_fly_start: require('../../assets/exercises/reverse_fly_start.png'),
  reverse_fly_end: require('../../assets/exercises/reverse_fly_end.png'),
  neutral_overhead_press_start: require('../../assets/exercises/neutral_overhead_press_start.png'),
  neutral_overhead_press_end: require('../../assets/exercises/neutral_overhead_press_end.png'),

  // ============================================
  // BICEPS
  // ============================================
  ez_bar_preacher_curl_start: require('../../assets/exercises/ez_bar_preacher_curl_start.png'),
  ez_bar_preacher_curl_end: require('../../assets/exercises/ez_bar_preacher_curl_end.png'),
  db_preacher_curl_start: require('../../assets/exercises/db_preacher_curl_start.png'),
  db_preacher_curl_end: require('../../assets/exercises/db_preacher_curl_end.png'),
  cable_curl_bar_start: require('../../assets/exercises/cable_curl_bar_start.png'),
  cable_curl_bar_end: require('../../assets/exercises/cable_curl_bar_end.png'),
  cable_curl_rope_start: require('../../assets/exercises/cable_curl_rope_start.png'),
  cable_curl_rope_end: require('../../assets/exercises/cable_curl_rope_end.png'),
  cable_curl_single_start: require('../../assets/exercises/cable_curl_single_start.png'),
  cable_curl_single_end: require('../../assets/exercises/cable_curl_single_end.png'),
  cable_high_curl_start: require('../../assets/exercises/cable_high_curl_start.png'),
  cable_high_curl_end: require('../../assets/exercises/cable_high_curl_end.png'),
  cable_preacher_curl_start: require('../../assets/exercises/cable_preacher_curl_start.png'),
  cable_preacher_curl_end: require('../../assets/exercises/cable_preacher_curl_end.png'),
  neutral_curl_start: require('../../assets/exercises/neutral_curl_start.png'),
  neutral_curl_end: require('../../assets/exercises/neutral_curl_end.png'),

  // ============================================
  // TRICEPS
  // ============================================
  cable_pushdown_rope_start: require('../../assets/exercises/cable_pushdown_rope_start.png'),
  cable_pushdown_rope_end: require('../../assets/exercises/cable_pushdown_rope_end.png'),
  cable_pushdown_bar_start: require('../../assets/exercises/cable_pushdown_bar_start.png'),
  cable_pushdown_bar_end: require('../../assets/exercises/cable_pushdown_bar_end.png'),
  cable_pushdown_vbar_start: require('../../assets/exercises/cable_pushdown_vbar_start.png'),
  cable_pushdown_vbar_end: require('../../assets/exercises/cable_pushdown_vbar_end.png'),
  cable_pushdown_reverse_start: require('../../assets/exercises/cable_pushdown_reverse_start.png'),
  cable_pushdown_reverse_end: require('../../assets/exercises/cable_pushdown_reverse_end.png'),
  cable_overhead_extension_rope_start: require('../../assets/exercises/cable_overhead_extension_rope_start.png'),
  cable_overhead_extension_rope_end: require('../../assets/exercises/cable_overhead_extension_rope_end.png'),
  cable_overhead_extension_single_start: require('../../assets/exercises/cable_overhead_extension_single_start.png'),
  cable_overhead_extension_single_end: require('../../assets/exercises/cable_overhead_extension_single_end.png'),
  cable_kickback_start: require('../../assets/exercises/cable_kickback_start.png'),
  cable_kickback_end: require('../../assets/exercises/cable_kickback_end.png'),
  neutral_skull_crushers_start: require('../../assets/exercises/neutral_skull_crushers_start.png'),
  neutral_skull_crushers_end: require('../../assets/exercises/neutral_skull_crushers_end.png'),

  // ============================================
  // FOREARMS
  // ============================================
  cable_wrist_curl_start: require('../../assets/exercises/cable_wrist_curl_start.png'),
  cable_wrist_curl_end: require('../../assets/exercises/cable_wrist_curl_end.png'),

  // ============================================
  // QUADRICEPS
  // ============================================
  leg_extension_start: require('../../assets/exercises/leg_extension_start.png'),
  leg_extension_end: require('../../assets/exercises/leg_extension_end.png'),
  leg_press_start: require('../../assets/exercises/leg_press_start.png'),
  leg_press_end: require('../../assets/exercises/leg_press_end.png'),
  squat_start: require('../../assets/exercises/squat_start.png'),
  squat_end: require('../../assets/exercises/squat_end.png'),

  // ============================================
  // HAMSTRINGS
  // ============================================
  leg_curl_start: require('../../assets/exercises/leg_curl_start.png'),
  leg_curl_end: require('../../assets/exercises/leg_curl_end.png'),
  seated_leg_curl_start: require('../../assets/exercises/seated_leg_curl_start.png'),
  seated_leg_curl_end: require('../../assets/exercises/seated_leg_curl_end.png'),
  cable_pull_through_start: require('../../assets/exercises/cable_pull_through_start.png'),
  cable_pull_through_end: require('../../assets/exercises/cable_pull_through_end.png'),

  // ============================================
  // GLUTES
  // ============================================
  cable_kickback_glutes_start: require('../../assets/exercises/cable_kickback_glutes_start.png'),
  cable_kickback_glutes_end: require('../../assets/exercises/cable_kickback_glutes_end.png'),
  cable_pull_through_glutes_start: require('../../assets/exercises/cable_pull_through_glutes_start.png'),
  cable_pull_through_glutes_end: require('../../assets/exercises/cable_pull_through_glutes_end.png'),
  hip_abduction_start: require('../../assets/exercises/hip_abduction_start.png'),
  hip_abduction_end: require('../../assets/exercises/hip_abduction_end.png'),
  hip_adduction_start: require('../../assets/exercises/hip_adduction_start.png'),
  hip_adduction_end: require('../../assets/exercises/hip_adduction_end.png'),

  // ============================================
  // CALVES
  // ============================================
  standing_calf_raise_machine_start: require('../../assets/exercises/standing_calf_raise_machine_start.png'),
  standing_calf_raise_machine_end: require('../../assets/exercises/standing_calf_raise_machine_end.png'),
  leg_press_calf_raise_start: require('../../assets/exercises/leg_press_calf_raise_start.png'),
  leg_press_calf_raise_end: require('../../assets/exercises/leg_press_calf_raise_end.png'),
  squat_calf_raise_start: require('../../assets/exercises/squat_calf_raise_start.png'),
  squat_calf_raise_end: require('../../assets/exercises/squat_calf_raise_end.png'),

  // ============================================
  // CORE
  // ============================================
  cable_crunch_start: require('../../assets/exercises/cable_crunch_start.png'),
  cable_crunch_end: require('../../assets/exercises/cable_crunch_end.png'),
  cable_woodchop_high_start: require('../../assets/exercises/cable_woodchop_high_start.png'),
  cable_woodchop_high_end: require('../../assets/exercises/cable_woodchop_high_end.png'),
  cable_woodchop_low_start: require('../../assets/exercises/cable_woodchop_low_start.png'),
  cable_woodchop_low_end: require('../../assets/exercises/cable_woodchop_low_end.png'),
  pallof_press_start: require('../../assets/exercises/pallof_press_start.png'),
  pallof_press_end: require('../../assets/exercises/pallof_press_end.png'),

  // ============================================
  // CARDIO
  // ============================================
  treadmill_running_start: require('../../assets/exercises/treadmill_running_start.png'),
  treadmill_running_end: require('../../assets/exercises/treadmill_running_end.png'),
  stationary_bike_start: require('../../assets/exercises/stationary_bike_start.png'),
  stationary_bike_end: require('../../assets/exercises/stationary_bike_end.png'),
  stepper_start: require('../../assets/exercises/stepper_start.png'),
  stepper_end: require('../../assets/exercises/stepper_end.png'),
  rowing_start: require('../../assets/exercises/rowing_start.png'),
  rowing_end: require('../../assets/exercises/rowing_end.png'),
  burpees_start: require('../../assets/exercises/burpees_start.png'),
  burpees_mid1: require('../../assets/exercises/burpees_flex.png'),
  burpees_mid2: require('../../assets/exercises/burpees_start.png'),
  burpees_mid3: require('../../assets/exercises/burpees_mid.png'),
  burpees_mid4: require('../../assets/exercises/burpees_end.png'),
  burpees_end: require('../../assets/exercises/burpees_mid.png'),
  jumping_jacks_start: require('../../assets/exercises/jumping_jacks_start.png'),
  jumping_jacks_end: require('../../assets/exercises/jumping_jacks_end.png'),

  // ============================================
  // KETTLEBELL
  // ============================================
  kb_swing_start: require('../../assets/exercises/kb_swing_start.png'),
  kb_swing_end: require('../../assets/exercises/kb_swing_end.png'),
  kb_goblet_squat_start: require('../../assets/exercises/kb_goblet_squat_start.png'),
  kb_goblet_squat_end: require('../../assets/exercises/kb_goblet_squat_end.png'),
  kb_deadlift_start: require('../../assets/exercises/kb_deadlift_start.png'),
  kb_deadlift_end: require('../../assets/exercises/kb_deadlift_end.png'),
  kb_press_start: require('../../assets/exercises/kb_press_start.png'),
  kb_press_end: require('../../assets/exercises/kb_press_end.png'),
  kb_row_start: require('../../assets/exercises/kb_row_start.png'),
  kb_row_end: require('../../assets/exercises/kb_row_end.png'),
  kb_clean_start: require('../../assets/exercises/kb_clean_start.png'),
  kb_clean_end: require('../../assets/exercises/kb_clean_end.png'),
  kb_snatch_start: require('../../assets/exercises/kb_clean_start.png'),
  kb_snatch_end: require('../../assets/exercises/kb_clean_end.png'),
  turkish_getup_start: require('../../assets/exercises/turkish_getup_start.png'),
  turkish_getup_mid1: require('../../assets/exercises/turkish_getup_mid1.png'),
  turkish_getup_mid2: require('../../assets/exercises/turkish_getup_mid2.png'),
  turkish_getup_mid3: require('../../assets/exercises/turkish_getup_mid3.png'),
  turkish_getup_mid4: require('../../assets/exercises/turkish_getup_end.png'),
  turkish_getup_mid5: require('../../assets/exercises/turkish_getup_mid3.png'),
  turkish_getup_mid6: require('../../assets/exercises/turkish_getup_mid2.png'),
  turkish_getup_end: require('../../assets/exercises/turkish_getup_mid1.png'),
  kb_lunge_start: require('../../assets/exercises/kb_lunge_start.png'),
  kb_lunge_end: require('../../assets/exercises/kb_lunge_end.png'),
  kb_windmill_start: require('../../assets/exercises/kb_windmill_start.png'),
  kb_windmill_end: require('../../assets/exercises/kb_windmill_end.png'),

  // ============================================
  // EXERCISE BALL
  // ============================================
  ball_wall_squat_start: require('../../assets/exercises/ball_wall_squat_start.png'),
  ball_wall_squat_end: require('../../assets/exercises/ball_wall_squat_end.png'),
  ball_hamstring_curl_start: require('../../assets/exercises/ball_hamstring_curl_start.png'),
  ball_hamstring_curl_end: require('../../assets/exercises/ball_hamstring_curl_end.png'),
  ball_crunch_start: require('../../assets/exercises/ball_crunch_start.png'),
  ball_crunch_end: require('../../assets/exercises/ball_crunch_end.png'),
  ball_pike_start: require('../../assets/exercises/ball_pike_start.png'),
  ball_pike_end: require('../../assets/exercises/ball_pike_end.png'),
  ball_back_extension_start: require('../../assets/exercises/ball_back_extension_start.png'),
  ball_back_extension_end: require('../../assets/exercises/ball_back_extension_end.png'),
  ball_plank_start: require('../../assets/exercises/ball_plank_start.png'),
  ball_plank_end: require('../../assets/exercises/ball_plank_start.png'),
  ball_russian_twist_start: require('../../assets/exercises/ball_russian_twist_start.png'),
  ball_russian_twist_mid: require('../../assets/exercises/ball_russian_twist_mid.png'),
  ball_russian_twist_end: require('../../assets/exercises/ball_russian_twist_end.png'),
  ball_pass_start: require('../../assets/exercises/ball_pass_start.png'),
  ball_pass_mid: require('../../assets/exercises/ball_pass_mid.png'),
  ball_pass_end: require('../../assets/exercises/ball_pass_end.png'),
};

// Placeholder image (create this file or it will show a colored box)
let placeholderImage = null;
try {
  placeholderImage = require('../../assets/exercises/placeholder.jpg');
} catch (e) {
  // Placeholder doesn't exist, will use colored box
}

const ExerciseImage = ({
  exerciseId,
  size = 200,
  animate = true,
  showEndImage = false, // Show only the end position (for thumbnails)
  animationDuration = 2000, // Duration of each image display in ms
  crossFadeDuration = 500,   // Duration of cross-fade in ms
  style,
  backgroundColor,          // Match the container's background color (for transparent PNG crossfade)
}) => {
  const { colors } = useTheme();
  const overlayBg = backgroundColor ?? colors.background;
  const startImage = exerciseImages[`${exerciseId}_start`];
  const endImage   = exerciseImages[`${exerciseId}_end`];
  const midImage   = exerciseImages[`${exerciseId}_mid`];
  const hasImages = startImage && endImage && startImage !== endImage;
  const hasEndImage = !!endImage;
  const hasStartImage = !!startImage;

  // Check for sequential frames (_mid1, _mid2, ...)
  const seqMids = [];
  if (hasImages) {
    let i = 1;
    while (exerciseImages[`${exerciseId}_mid${i}`]) {
      seqMids.push(exerciseImages[`${exerciseId}_mid${i}`]);
      i++;
    }
  }
  const isSequential = seqMids.length > 0;
  const hasMid = !isSequential && hasImages && !!midImage;

  // Unified opacity array for overlay layers:
  //   sequential: mids + end + start_copy = seqMids.length + 2
  //   symmetric:  mid + end = 2
  //   2-frame:    end = 1
  const overlayCount = isSequential ? seqMids.length + 2 : hasMid ? 2 : 1;
  const opacitiesRef = useRef(Array.from({ length: overlayCount }, () => new Animated.Value(0)));
  if (opacitiesRef.current.length !== overlayCount) {
    opacitiesRef.current = Array.from({ length: overlayCount }, () => new Animated.Value(0));
  }
  const opacities = opacitiesRef.current;
  const stepRef = useRef(0);

  // Reset when exercise changes
  useEffect(() => {
    opacities.forEach(o => { o.stopAnimation(); o.setValue(0); });
    stepRef.current = 0;
  }, [exerciseId]);

  useEffect(() => {
    if (!animate || !hasImages || showEndImage) return;

    if (isSequential) {
      // Sequential N-frame: start → mid1 → mid2 → ... → end → (back to start)
      // Layers bottom→top: start(1) | mid1(0) | mid2(0) | ... | end(0) | start_copy(0)
      // Fade in overlays one by one. When start_copy reaches 1,
      // instant-reset all to 0 — invisible because bottom start = top start_copy.
      const cycle = () => {
        const idx = stepRef.current;
        if (idx === 0) {
          // Reset all overlays before starting a new cycle.
          // Visually invisible: bottom start layer always shows through.
          opacities.forEach(o => o.setValue(0));
        }
        Animated.timing(opacities[idx], {
          toValue: 1, duration: crossFadeDuration, useNativeDriver: true,
        }).start();
        stepRef.current = (idx + 1) % opacities.length;
      };
      const interval = setInterval(cycle, animationDuration);
      return () => clearInterval(interval);
    } else if (hasMid) {
      // Symmetric 3-frame cycle: start → mid → end → mid → start
      // Step 0: fade mid in, Step 1: fade end in, Step 2: fade end out, Step 3: fade mid out
      const cycle = () => {
        const step = stepRef.current;
        if (step === 0) {
          Animated.timing(opacities[0], { toValue: 1, duration: crossFadeDuration, useNativeDriver: true }).start();
        } else if (step === 1) {
          Animated.timing(opacities[1], { toValue: 1, duration: crossFadeDuration, useNativeDriver: true }).start();
        } else if (step === 2) {
          Animated.timing(opacities[1], { toValue: 0, duration: crossFadeDuration, useNativeDriver: true }).start();
        } else {
          Animated.timing(opacities[0], { toValue: 0, duration: crossFadeDuration, useNativeDriver: true }).start();
        }
        stepRef.current = (step + 1) % 4;
      };
      const interval = setInterval(cycle, animationDuration);
      return () => clearInterval(interval);
    } else {
      // 2-frame cycle: start ↔ end
      const toggle = () => {
        const showing = stepRef.current === 0;
        Animated.timing(opacities[0], {
          toValue: showing ? 1 : 0,
          duration: crossFadeDuration,
          useNativeDriver: true,
        }).start();
        stepRef.current = showing ? 1 : 0;
      };
      const interval = setInterval(toggle, animationDuration);
      return () => clearInterval(interval);
    }
  }, [animate, hasImages, isSequential, hasMid, showEndImage, animationDuration, crossFadeDuration]);

  // If showEndImage is true, just show the end image statically
  if (showEndImage) {
    // Prefer end image, fallback to start image
    const imageToShow = endImage || startImage;
    
    if (imageToShow) {
      return (
        <View style={[styles.container, { width: size, height: size }, style]}>
          <Image
            source={imageToShow}
            style={[styles.image, { width: size, height: size }]}
            resizeMode="contain"
          />
        </View>
      );
    }
    
    // Fallback to placeholder
    if (placeholderImage) {
      return (
        <View style={[styles.container, { width: size, height: size }, style]}>
          <Image
            source={placeholderImage}
            style={[styles.image, { width: size, height: size }]}
            resizeMode="contain"
          />
        </View>
      );
    }
    
    // Fallback colored box
    return (
      <View style={[styles.smallPlaceholder, { width: size, height: size }, style]}>
        <View style={styles.smallIcon} />
      </View>
    );
  }

  // If no images available, show placeholder
  if (!hasStartImage && !hasEndImage) {
    if (placeholderImage) {
      return (
        <View style={[styles.container, { width: size, height: size }, style]}>
          <Image
            source={placeholderImage}
            style={[styles.image, { width: size, height: size }]}
            resizeMode="contain"
          />
        </View>
      );
    }
    
    // Fallback colored box with icon
    return (
      <View style={[
        styles.placeholder, 
        { width: size, height: size },
        style
      ]}>
        <View style={styles.placeholderInner}>
          {/* Simple dumbbell icon representation */}
          <View style={styles.placeholderIcon}>
            <View style={styles.dumbbellBar} />
            <View style={[styles.dumbbellWeight, styles.dumbbellLeft]} />
            <View style={[styles.dumbbellWeight, styles.dumbbellRight]} />
          </View>
        </View>
      </View>
    );
  }

  // Layered cross-fade: start (bottom) → overlays (mid/end on top)
  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor: overlayBg }, style]}>
      <Image
        source={startImage}
        style={[styles.image, styles.stackedImage, { width: size, height: size }]}
        resizeMode="contain"
      />
      {isSequential && seqMids.map((src, i) => (
        <Animated.View
          key={i}
          style={[styles.stackedImage, { width: size, height: size, opacity: opacities[i], backgroundColor: overlayBg }]}
          renderToHardwareTextureAndroid
          shouldRasterizeIOS
        >
          <Image source={src} style={[styles.image, { width: size, height: size }]} resizeMode="contain" />
        </Animated.View>
      ))}
      {hasMid && (
        <Animated.View
          style={[styles.stackedImage, { width: size, height: size, opacity: opacities[0], backgroundColor: overlayBg }]}
          renderToHardwareTextureAndroid
          shouldRasterizeIOS
        >
          <Image source={midImage} style={[styles.image, { width: size, height: size }]} resizeMode="contain" />
        </Animated.View>
      )}
      <Animated.View
        style={[
          styles.stackedImage,
          { width: size, height: size, opacity: opacities[isSequential ? seqMids.length : hasMid ? 1 : 0], backgroundColor: overlayBg }
        ]}
        renderToHardwareTextureAndroid
        shouldRasterizeIOS
      >
        <Image source={endImage} style={[styles.image, { width: size, height: size }]} resizeMode="contain" />
      </Animated.View>
      {isSequential && (
        <Animated.View
          style={[styles.stackedImage, { width: size, height: size, opacity: opacities[seqMids.length + 1], backgroundColor: overlayBg }]}
          renderToHardwareTextureAndroid
          shouldRasterizeIOS
        >
          <Image source={startImage} style={[styles.image, { width: size, height: size }]} resizeMode="contain" />
        </Animated.View>
      )}
    </View>
  );
};

// Static version without animation (for lists, etc.)
export const ExerciseImageStatic = ({ exerciseId, size = 60, style, preferEnd = false }) => {
  const startImage = exerciseImages[`${exerciseId}_start`];
  const endImage   = exerciseImages[`${exerciseId}_end`];

  // Choose which image to show
  const imageToShow = preferEnd ? (endImage || startImage) : (startImage || endImage);

  if (!imageToShow) {
    if (placeholderImage) {
      return (
        <Image
          source={placeholderImage}
          style={[styles.image, { width: size, height: size }, style]}
          resizeMode="contain"
        />
      );
    }

    return (
      <View style={[styles.smallPlaceholder, { width: size, height: size }, style]}>
        <View style={styles.smallIcon} />
      </View>
    );
  }

  return (
    <Image
      source={imageToShow}
      style={[styles.image, { width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    borderRadius: 8,
  },
  stackedImage: {
    position: 'absolute',
  },
  placeholder: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    position: 'relative',
    width: 60,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dumbbellBar: {
    width: 50,
    height: 6,
    backgroundColor: colors.textLight,
    borderRadius: 3,
  },
  dumbbellWeight: {
    position: 'absolute',
    width: 12,
    height: 24,
    backgroundColor: colors.textLight,
    borderRadius: 2,
  },
  dumbbellLeft: {
    left: 0,
  },
  dumbbellRight: {
    right: 0,
  },
  smallPlaceholder: {
    backgroundColor: colors.background,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallIcon: {
    width: '50%',
    height: '50%',
    backgroundColor: colors.border,
    borderRadius: 4,
  },
});

export default ExerciseImage;

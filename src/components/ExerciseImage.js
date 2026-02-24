// ExerciseImage Component - Displays exercise images with cross-fade animation
import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme';

/*
  IMAGE NAMING CONVENTION:

  Place exercise images in: assets/exercises/

  Naming format: {exercise_id}_{position}.jpg

  Where:
  - exercise_id: The ID from exercises.js (e.g., "bench_press", "deadlift")
  - position: "start", "end", or optionally "mid" / "mid1", "mid2", ...

  All images should be 700x700 pixels.
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

// Map of available exercise images
// Add entries here as you create images
const exerciseImages = {

  // ############################################
  // FREE EXERCISES (Home Gym Equipment Only)
  // ############################################

  // ============================================
  // CHEST
  // ============================================
  bench_press_start: require('../../assets/exercises/bench_press_start.jpg'),
  bench_press_end: require('../../assets/exercises/bench_press_end.jpg'),
  incline_press_start: require('../../assets/exercises/incline_press_start.jpg'),
  incline_press_end: require('../../assets/exercises/incline_press_end.jpg'),
  decline_press_start: require('../../assets/exercises/decline_press_start.jpg'),
  decline_press_end: require('../../assets/exercises/decline_press_end.jpg'),
  db_bench_press_start: require('../../assets/exercises/db_bench_press_start.jpg'),
  db_bench_press_end: require('../../assets/exercises/db_bench_press_end.jpg'),
  db_incline_press_start: require('../../assets/exercises/db_incline_press_start.jpg'),
  db_incline_press_end: require('../../assets/exercises/db_incline_press_end.jpg'),
  db_decline_press_start: require('../../assets/exercises/db_decline_press_start.jpg'),
  db_decline_press_end: require('../../assets/exercises/db_decline_press_end.jpg'),
  dumbbell_flyes_start: require('../../assets/exercises/dumbbell_flyes_start.jpg'),
  dumbbell_flyes_end: require('../../assets/exercises/dumbbell_flyes_end.jpg'),
  incline_dumbbell_flyes_start: require('../../assets/exercises/incline_dumbbell_flyes_start.jpg'),
  incline_dumbbell_flyes_end: require('../../assets/exercises/incline_dumbbell_flyes_end.jpg'),
  decline_dumbbell_flyes_start: require('../../assets/exercises/decline_dumbbell_flyes_start.jpg'),
  decline_dumbbell_flyes_end: require('../../assets/exercises/decline_dumbbell_flyes_end.jpg'),
  push_ups_start: require('../../assets/exercises/push_ups_start.jpg'),
  push_ups_end: require('../../assets/exercises/push_ups_end.jpg'),
  incline_push_ups_start: require('../../assets/exercises/incline_push_ups_start.jpg'),
  incline_push_ups_end: require('../../assets/exercises/incline_push_ups_end.jpg'),
  decline_push_ups_start: require('../../assets/exercises/decline_push_ups_start.jpg'),
  decline_push_ups_end: require('../../assets/exercises/decline_push_ups_end.jpg'),
  svend_press_start: require('../../assets/exercises/svend_press_start.jpg'),
  svend_press_end: require('../../assets/exercises/svend_press_end.jpg'),
  pullover_chest_start: require('../../assets/exercises/pullover_chest_start.jpg'),
  pullover_chest_end: require('../../assets/exercises/pullover_chest_end.jpg'),

  // ============================================
  // BACK
  // ============================================
  pullups_wide_start: require('../../assets/exercises/pullups_wide_start.jpg'),
  pullups_wide_end: require('../../assets/exercises/pullups_wide_end.jpg'),
  pullups_close_start: require('../../assets/exercises/pullups_close_start.jpg'),
  pullups_close_end: require('../../assets/exercises/pullups_close_end.jpg'),
  weighted_pullups_start: require('../../assets/exercises/weighted_pullups_start.jpg'),
  weighted_pullups_end: require('../../assets/exercises/weighted_pullups_end.jpg'),
  chinups_start: require('../../assets/exercises/chinups_start.jpg'),
  chinups_end: require('../../assets/exercises/chinups_end.jpg'),
  band_assisted_pullups_start: require('../../assets/exercises/band_assisted_pullups_start.jpg'),
  band_assisted_pullups_end: require('../../assets/exercises/band_assisted_pullups_end.jpg'),
  barbell_row_start: require('../../assets/exercises/barbell_row_start.jpg'),
  barbell_row_end: require('../../assets/exercises/barbell_row_end.jpg'),
  barbell_row_underhand_start: require('../../assets/exercises/barbell_row_underhand_start.jpg'),
  barbell_row_underhand_end: require('../../assets/exercises/barbell_row_underhand_end.jpg'),
  pendlay_row_start: require('../../assets/exercises/pendlay_row_start.jpg'),
  pendlay_row_end: require('../../assets/exercises/pendlay_row_end.jpg'),
  dumbbell_row_start: require('../../assets/exercises/dumbbell_row_start.jpg'),
  dumbbell_row_end: require('../../assets/exercises/dumbbell_row_end.jpg'),
  db_bent_over_row_start: require('../../assets/exercises/db_bent_over_row_start.jpg'),
  db_bent_over_row_end: require('../../assets/exercises/db_bent_over_row_end.jpg'),
  pullover_back_start: require('../../assets/exercises/pullover_chest_start.jpg'),
  pullover_back_end: require('../../assets/exercises/pullover_chest_end.jpg'),
  tbar_row_start: require('../../assets/exercises/tbar_row_start.jpg'),
  tbar_row_end: require('../../assets/exercises/tbar_row_end.jpg'),
  deadlift_start: require('../../assets/exercises/deadlift_start.jpg'),
  deadlift_end: require('../../assets/exercises/deadlift_end.jpg'),
  romanian_deadlift_barbell_start: require('../../assets/exercises/romanian_deadlift_barbell_start.jpg'),
  romanian_deadlift_barbell_end: require('../../assets/exercises/romanian_deadlift_barbell_end.jpg'),
  romanian_deadlift_dumbbell_start: require('../../assets/exercises/romanian_deadlift_dumbbell_start.jpg'),
  romanian_deadlift_dumbbell_end: require('../../assets/exercises/romanian_deadlift_dumbbell_end.jpg'),
  good_mornings_start: require('../../assets/exercises/good_mornings_start.jpg'),
  good_mornings_end: require('../../assets/exercises/good_mornings_end.jpg'),
  hyperextension_start: require('../../assets/exercises/hyperextension_start.jpg'),
  hyperextension_end: require('../../assets/exercises/hyperextension_end.jpg'),
  shrugs_barbell_start: require('../../assets/exercises/shrugs_barbell_start.jpg'),
  shrugs_barbell_end: require('../../assets/exercises/shrugs_barbell_end.jpg'),
  shrugs_dumbbell_start: require('../../assets/exercises/shrugs_dumbbell_start.jpg'),
  shrugs_dumbbell_end: require('../../assets/exercises/shrugs_dumbbell_end.jpg'),

  // ============================================
  // SHOULDERS
  // ============================================
  overhead_press_standing_start: require('../../assets/exercises/overhead_press_standing_start.jpg'),
  overhead_press_standing_end: require('../../assets/exercises/overhead_press_standing_end.jpg'),
  overhead_press_seated_start: require('../../assets/exercises/overhead_press_seated_start.jpg'),
  overhead_press_seated_end: require('../../assets/exercises/overhead_press_seated_end.jpg'),
  push_press_start: require('../../assets/exercises/push_press_start.jpg'),
  push_press_end: require('../../assets/exercises/push_press_end.jpg'),
  behind_neck_press_start: require('../../assets/exercises/behind_neck_press_start.jpg'),
  behind_neck_press_end: require('../../assets/exercises/behind_neck_press_end.jpg'),
  db_shoulder_press_seated_start: require('../../assets/exercises/db_shoulder_press_seated_start.jpg'),
  db_shoulder_press_seated_end: require('../../assets/exercises/db_shoulder_press_seated_end.jpg'),
  db_shoulder_press_standing_start: require('../../assets/exercises/db_shoulder_press_standing_start.jpg'),
  db_shoulder_press_standing_end: require('../../assets/exercises/db_shoulder_press_standing_end.jpg'),
  arnold_press_start: require('../../assets/exercises/arnold_press_start.jpg'),
  arnold_press_end: require('../../assets/exercises/arnold_press_end.jpg'),
  lateral_raise_start: require('../../assets/exercises/lateral_raise_start.jpg'),
  lateral_raise_end: require('../../assets/exercises/lateral_raise_end.jpg'),
  front_raise_start: require('../../assets/exercises/front_raise_start.jpg'),
  front_raise_end: require('../../assets/exercises/front_raise_end.jpg'),
  rear_delt_fly_bent_start: require('../../assets/exercises/rear_delt_fly_bent_start.jpg'),
  rear_delt_fly_bent_end: require('../../assets/exercises/rear_delt_fly_bent_end.jpg'),
  rear_delt_fly_incline_start: require('../../assets/exercises/rear_delt_fly_incline_start.jpg'),
  rear_delt_fly_incline_end: require('../../assets/exercises/rear_delt_fly_incline_end.jpg'),
  upright_row_barbell_start: require('../../assets/exercises/upright_row_barbell_start.jpg'),
  upright_row_barbell_end: require('../../assets/exercises/upright_row_barbell_end.jpg'),
  upright_row_dumbbell_start: require('../../assets/exercises/upright_row_dumbbell_start.jpg'),
  upright_row_dumbbell_end: require('../../assets/exercises/upright_row_dumbbell_end.jpg'),
  plate_front_raise_start: require('../../assets/exercises/plate_front_raise_start.jpg'),
  plate_front_raise_end: require('../../assets/exercises/plate_front_raise_end.jpg'),
  bus_drivers_start: require('../../assets/exercises/bus_drivers_start.jpg'),
  bus_drivers_end: require('../../assets/exercises/bus_drivers_end.jpg'),
  band_pull_aparts_start: require('../../assets/exercises/band_pull_aparts_start.jpg'),
  band_pull_aparts_end: require('../../assets/exercises/band_pull_aparts_end.jpg'),
  barbell_high_pull_start: require('../../assets/exercises/barbell_high_pull_start.jpg'),
  barbell_high_pull_end: require('../../assets/exercises/barbell_high_pull_end.jpg'),

  // ============================================
  // BICEPS
  // ============================================
  barbell_curl_standing_start: require('../../assets/exercises/barbell_curl_standing_start.jpg'),
  barbell_curl_standing_end: require('../../assets/exercises/barbell_curl_standing_end.jpg'),
  barbell_curl_wide_start: require('../../assets/exercises/barbell_curl_wide_start.jpg'),
  barbell_curl_wide_end: require('../../assets/exercises/barbell_curl_wide_end.jpg'),
  barbell_curl_close_start: require('../../assets/exercises/barbell_curl_close_start.jpg'),
  barbell_curl_close_end: require('../../assets/exercises/barbell_curl_close_end.jpg'),
  ez_bar_curl_start: require('../../assets/exercises/ez_bar_curl_start.jpg'),
  ez_bar_curl_end: require('../../assets/exercises/ez_bar_curl_end.jpg'),
  ez_bar_curl_wide_start: require('../../assets/exercises/ez_bar_curl_wide_start.jpg'),
  ez_bar_curl_wide_end: require('../../assets/exercises/ez_bar_curl_wide_end.jpg'),
  db_curl_standing_start: require('../../assets/exercises/db_curl_standing_start.jpg'),
  db_curl_standing_end: require('../../assets/exercises/db_curl_standing_end.jpg'),
  db_curl_seated_start: require('../../assets/exercises/db_curl_seated_start.jpg'),
  db_curl_seated_end: require('../../assets/exercises/db_curl_seated_end.jpg'),
  db_curl_incline_start: require('../../assets/exercises/db_curl_incline_start.jpg'),
  db_curl_incline_end: require('../../assets/exercises/db_curl_incline_end.jpg'),
  hammer_curl_start: require('../../assets/exercises/hammer_curl_start.jpg'),
  hammer_curl_end: require('../../assets/exercises/hammer_curl_end.jpg'),
  concentration_curl_start: require('../../assets/exercises/concentration_curl_start.jpg'),
  concentration_curl_end: require('../../assets/exercises/concentration_curl_end.jpg'),
  zottman_curl_start: require('../../assets/exercises/zottman_curl_start.jpg'),
  zottman_curl_mid1: require('../../assets/exercises/zottman_curl_mid1.jpg'),
  zottman_curl_mid2: require('../../assets/exercises/zottman_curl_mid2.jpg'),
  zottman_curl_end: require('../../assets/exercises/zottman_curl_end.jpg'),
  drag_curl_start: require('../../assets/exercises/drag_curl_start.jpg'),
  drag_curl_end: require('../../assets/exercises/drag_curl_end.jpg'),
  chinups_biceps_start: require('../../assets/exercises/chinups_biceps_start.jpg'),
  chinups_biceps_end: require('../../assets/exercises/chinups_biceps_end.jpg'),
  band_curl_start: require('../../assets/exercises/band_curl_start.jpg'),
  band_curl_end: require('../../assets/exercises/band_curl_end.jpg'),

  // ============================================
  // TRICEPS
  // ============================================
  close_grip_bench_start: require('../../assets/exercises/close_grip_bench_start.jpg'),
  close_grip_bench_end: require('../../assets/exercises/close_grip_bench_end.jpg'),
  skull_crushers_start: require('../../assets/exercises/skull_crushers_start.jpg'),
  skull_crushers_end: require('../../assets/exercises/skull_crushers_end.jpg'),
  db_skull_crushers_start: require('../../assets/exercises/db_skull_crushers_start.jpg'),
  db_skull_crushers_end: require('../../assets/exercises/db_skull_crushers_end.jpg'),
  db_overhead_extension_two_start: require('../../assets/exercises/db_overhead_extension_two_start.jpg'),
  db_overhead_extension_two_end: require('../../assets/exercises/db_overhead_extension_two_end.jpg'),
  db_overhead_extension_single_start: require('../../assets/exercises/db_overhead_extension_single_start.jpg'),
  db_overhead_extension_single_end: require('../../assets/exercises/db_overhead_extension_single_end.jpg'),
  db_kickback_start: require('../../assets/exercises/db_kickback_start.jpg'),
  db_kickback_end: require('../../assets/exercises/db_kickback_end.jpg'),
  bench_dips_start: require('../../assets/exercises/bench_dips_start.jpg'),
  bench_dips_end: require('../../assets/exercises/bench_dips_end.jpg'),
  diamond_push_ups_start: require('../../assets/exercises/diamond_push_ups_start.jpg'),
  diamond_push_ups_end: require('../../assets/exercises/diamond_push_ups_end.jpg'),
  band_pushdown_start: require('../../assets/exercises/band_pushdown_start.jpg'),
  band_pushdown_end: require('../../assets/exercises/band_pushdown_end.jpg'),

  // ============================================
  // FOREARMS
  // ============================================
  barbell_wrist_curl_start: require('../../assets/exercises/barbell_wrist_curl_start.jpg'),
  barbell_wrist_curl_end: require('../../assets/exercises/barbell_wrist_curl_end.jpg'),
  barbell_reverse_wrist_curl_start: require('../../assets/exercises/barbell_reverse_wrist_curl_start.jpg'),
  barbell_reverse_wrist_curl_end: require('../../assets/exercises/barbell_reverse_wrist_curl_end.jpg'),
  db_wrist_curl_start: require('../../assets/exercises/db_wrist_curl_start.jpg'),
  db_wrist_curl_end: require('../../assets/exercises/db_wrist_curl_end.jpg'),
  db_reverse_wrist_curl_start: require('../../assets/exercises/db_reverse_wrist_curl_start.jpg'),
  db_reverse_wrist_curl_end: require('../../assets/exercises/db_reverse_wrist_curl_end.jpg'),
  farmers_walk_start: require('../../assets/exercises/farmers_walk_start.jpg'),
  farmers_walk_end: require('../../assets/exercises/farmers_walk_end.jpg'),
  plate_pinch_hold_start: require('../../assets/exercises/plate_pinch_hold_start.jpg'),
  plate_pinch_hold_end: require('../../assets/exercises/plate_pinch_hold_start.jpg'),
  dead_hang_start: require('../../assets/exercises/dead_hang_start.jpg'),
  dead_hang_end: require('../../assets/exercises/dead_hang_start.jpg'),
  towel_pullups_start: require('../../assets/exercises/towel_pullups_start.jpg'),
  towel_pullups_end: require('../../assets/exercises/towel_pullups_end.jpg'),
  reverse_curl_barbell_start: require('../../assets/exercises/reverse_curl_barbell_start.jpg'),
  reverse_curl_barbell_end: require('../../assets/exercises/reverse_curl_barbell_end.jpg'),
  reverse_curl_ez_start: require('../../assets/exercises/reverse_curl_barbell_start.jpg'),
  reverse_curl_ez_end: require('../../assets/exercises/reverse_curl_barbell_end.jpg'),

  // ============================================
  // QUADRICEPS
  // ============================================
  back_squat_start: require('../../assets/exercises/back_squat_start.jpg'),
  back_squat_end: require('../../assets/exercises/back_squat_end.jpg'),
  front_squat_start: require('../../assets/exercises/front_squat_start.jpg'),
  front_squat_end: require('../../assets/exercises/front_squat_end.jpg'),
  box_squat_start: require('../../assets/exercises/box_squat_start.jpg'),
  box_squat_end: require('../../assets/exercises/box_squat_end.jpg'),
  pause_squat_start: require('../../assets/exercises/pause_squat_start.jpg'),
  pause_squat_end: require('../../assets/exercises/pause_squat_end.jpg'),
  goblet_squat_start: require('../../assets/exercises/goblet_squat_start.jpg'),
  goblet_squat_end: require('../../assets/exercises/goblet_squat_end.jpg'),
  dumbbell_squat_start: require('../../assets/exercises/dumbbell_squat_start.jpg'),
  dumbbell_squat_end: require('../../assets/exercises/dumbbell_squat_end.jpg'),
  db_sumo_squat_start: require('../../assets/exercises/db_sumo_squat_start.jpg'),
  db_sumo_squat_end: require('../../assets/exercises/db_sumo_squat_end.jpg'),
  lunges_forward_start: require('../../assets/exercises/lunges_forward_start.jpg'),
  lunges_forward_end: require('../../assets/exercises/lunges_forward_end.jpg'),
  lunges_reverse_start: require('../../assets/exercises/lunges_reverse_start.jpg'),
  lunges_reverse_end: require('../../assets/exercises/lunges_reverse_end.jpg'),
  lunges_walking_start: require('../../assets/exercises/lunges_walking_start.jpg'),
  lunges_walking_end: require('../../assets/exercises/lunges_walking_end.jpg'),
  barbell_lunges_start: require('../../assets/exercises/barbell_lunges_start.jpg'),
  barbell_lunges_end: require('../../assets/exercises/barbell_lunges_end.jpg'),
  barbell_static_lunges_start: require('../../assets/exercises/barbell_static_lunges_start.jpg'),
  barbell_static_lunges_end: require('../../assets/exercises/barbell_static_lunges_end.jpg'),
  bulgarian_split_squat_db_start: require('../../assets/exercises/bulgarian_split_squat_db_start.jpg'),
  bulgarian_split_squat_db_end: require('../../assets/exercises/bulgarian_split_squat_db_end.jpg'),
  bulgarian_split_squat_bb_start: require('../../assets/exercises/bulgarian_split_squat_bb_start.jpg'),
  bulgarian_split_squat_bb_end: require('../../assets/exercises/bulgarian_split_squat_bb_end.jpg'),
  step_ups_start: require('../../assets/exercises/step_ups_start.jpg'),
  step_ups_end: require('../../assets/exercises/step_ups_end.jpg'),
  sissy_squat_start: require('../../assets/exercises/sissy_squat_start.jpg'),
  sissy_squat_end: require('../../assets/exercises/sissy_squat_end.jpg'),
  wall_sit_start: require('../../assets/exercises/wall_sit_start.jpg'),
  wall_sit_end: require('../../assets/exercises/wall_sit_start.jpg'),
  band_squat_start: require('../../assets/exercises/band_squat_start.jpg'),
  band_squat_end: require('../../assets/exercises/band_squat_end.jpg'),

  // ============================================
  // HAMSTRINGS
  // ============================================
  rdl_barbell_start: require('../../assets/exercises/deadlift_start.jpg'),
  rdl_barbell_end: require('../../assets/exercises/deadlift_end.jpg'),
  rdl_dumbbell_start: require('../../assets/exercises/rdl_dumbbell_start.jpg'),
  rdl_dumbbell_end: require('../../assets/exercises/rdl_dumbbell_end.jpg'),
  stiff_leg_deadlift_start: require('../../assets/exercises/stiff_leg_deadlift_start.jpg'),
  stiff_leg_deadlift_end: require('../../assets/exercises/stiff_leg_deadlift_end.jpg'),
  single_leg_rdl_start: require('../../assets/exercises/single_leg_rdl_start.jpg'),
  single_leg_rdl_end: require('../../assets/exercises/single_leg_rdl_end.jpg'),
  good_mornings_hamstrings_start: require('../../assets/exercises/good_mornings_hamstrings_start.jpg'),
  good_mornings_hamstrings_end: require('../../assets/exercises/good_mornings_hamstrings_end.jpg'),
  hamstring_bridge_start: require('../../assets/exercises/hamstring_bridge_start.jpg'),
  hamstring_bridge_end: require('../../assets/exercises/hamstring_bridge_start.jpg'),
  glute_ham_raise_start: require('../../assets/exercises/glute_ham_raise_start.jpg'),
  glute_ham_raise_end: require('../../assets/exercises/glute_ham_raise_end.jpg'),
  band_leg_curl_start: require('../../assets/exercises/band_leg_curl_start.jpg'),
  band_leg_curl_end: require('../../assets/exercises/band_leg_curl_end.jpg'),

  // ============================================
  // GLUTES
  // ============================================
  hip_thrust_barbell_start: require('../../assets/exercises/hip_thrust_barbell_start.jpg'),
  hip_thrust_barbell_end: require('../../assets/exercises/hip_thrust_barbell_end.jpg'),
  hip_thrust_dumbbell_start: require('../../assets/exercises/hip_thrust_dumbbell_start.jpg'),
  hip_thrust_dumbbell_end: require('../../assets/exercises/hip_thrust_dumbbell_end.jpg'),
  single_leg_hip_thrust_start: require('../../assets/exercises/single_leg_hip_thrust_start.jpg'),
  single_leg_hip_thrust_end: require('../../assets/exercises/single_leg_hip_thrust_end.jpg'),
  glute_bridge_barbell_start: require('../../assets/exercises/glute_bridge_barbell_start.jpg'),
  glute_bridge_barbell_end: require('../../assets/exercises/glute_bridge_barbell_end.jpg'),
  glute_bridge_dumbbell_start: require('../../assets/exercises/glute_bridge_dumbbell_start.jpg'),
  glute_bridge_dumbbell_end: require('../../assets/exercises/glute_bridge_dumbbell_end.jpg'),
  sumo_deadlift_start: require('../../assets/exercises/sumo_deadlift_start.jpg'),
  sumo_deadlift_end: require('../../assets/exercises/sumo_deadlift_end.jpg'),
  sumo_squat_start: require('../../assets/exercises/sumo_squat_start.jpg'),
  sumo_squat_end: require('../../assets/exercises/sumo_squat_end.jpg'),
  rdl_glutes_start: require('../../assets/exercises/rdl_glutes_start.jpg'),
  rdl_glutes_end: require('../../assets/exercises/rdl_glutes_end.jpg'),
  step_ups_glutes_start: require('../../assets/exercises/step_ups_glutes_start.jpg'),
  step_ups_glutes_end: require('../../assets/exercises/step_ups_glutes_end.jpg'),
  lateral_band_walk_start: require('../../assets/exercises/lateral_band_walk_start.jpg'),
  lateral_band_walk_end: require('../../assets/exercises/lateral_band_walk_end.jpg'),
  clamshells_start: require('../../assets/exercises/clamshells_start.jpg'),
  clamshells_end: require('../../assets/exercises/clamshells_end.jpg'),
  donkey_kicks_start: require('../../assets/exercises/donkey_kicks_start.jpg'),
  donkey_kicks_end: require('../../assets/exercises/donkey_kicks_end.jpg'),
  fire_hydrants_start: require('../../assets/exercises/fire_hydrants_start.jpg'),
  fire_hydrants_end: require('../../assets/exercises/fire_hydrants_end.jpg'),
  frog_bridge_start: require('../../assets/exercises/frog_bridge_start.jpg'),
  frog_bridge_end: require('../../assets/exercises/frog_bridge_end.jpg'),

  // ============================================
  // CALVES
  // ============================================
  standing_calf_raise_barbell_start: require('../../assets/exercises/standing_calf_raise_barbell_start.jpg'),
  standing_calf_raise_barbell_end: require('../../assets/exercises/standing_calf_raise_barbell_end.jpg'),
  standing_calf_raise_dumbbell_start: require('../../assets/exercises/standing_calf_raise_dumbbell_start.jpg'),
  standing_calf_raise_dumbbell_end: require('../../assets/exercises/standing_calf_raise_dumbbell_end.jpg'),
  standing_calf_raise_single_start: require('../../assets/exercises/standing_calf_raise_single_start.jpg'),
  standing_calf_raise_single_end: require('../../assets/exercises/standing_calf_raise_single_end.jpg'),
  seated_calf_raise_start: require('../../assets/exercises/seated_calf_raise_start.jpg'),
  seated_calf_raise_end: require('../../assets/exercises/seated_calf_raise_end.jpg'),
  donkey_calf_raise_start: require('../../assets/exercises/donkey_calf_raise_start.jpg'),
  donkey_calf_raise_end: require('../../assets/exercises/donkey_calf_raise_end.jpg'),
  jump_rope_start: require('../../assets/exercises/jump_rope_start.jpg'),
  jump_rope_end: require('../../assets/exercises/jump_rope_end.jpg'),
  calf_raise_bodyweight_start: require('../../assets/exercises/calf_raise_bodyweight_start.jpg'),
  calf_raise_bodyweight_end: require('../../assets/exercises/calf_raise_bodyweight_end.jpg'),
  running_start: require('../../assets/exercises/running_start.jpg'),
  running_end: require('../../assets/exercises/running_end.jpg'),

  // ============================================
  // CORE
  // ============================================
  wheel_crunches_start: require('../../assets/exercises/wheel_crunches_start.jpg'),
  wheel_crunches_end: require('../../assets/exercises/wheel_crunches_end.jpg'),
  crunches_start: require('../../assets/exercises/crunches_start.jpg'),
  crunches_end: require('../../assets/exercises/crunches_end.jpg'),
  reverse_crunches_start: require('../../assets/exercises/reverse_crunches_start.jpg'),
  reverse_crunches_end: require('../../assets/exercises/reverse_crunches_end.jpg'),
  bicycle_crunches_start: require('../../assets/exercises/bicycle_crunches_start.jpg'),
  bicycle_crunches_end: require('../../assets/exercises/bicycle_crunches_end.jpg'),
  sit_ups_start: require('../../assets/exercises/sit_ups_start.jpg'),
  sit_ups_end: require('../../assets/exercises/sit_ups_end.jpg'),
  decline_sit_ups_start: require('../../assets/exercises/decline_sit_ups_start.jpg'),
  decline_sit_ups_end: require('../../assets/exercises/decline_sit_ups_end.jpg'),
  weighted_decline_sit_ups_start: require('../../assets/exercises/weighted_decline_sit_ups_start.jpg'),
  weighted_decline_sit_ups_end: require('../../assets/exercises/weighted_decline_sit_ups_end.jpg'),
  hanging_leg_raise_start: require('../../assets/exercises/hanging_leg_raise_start.jpg'),
  hanging_leg_raise_end: require('../../assets/exercises/hanging_leg_raise_end.jpg'),
  hanging_knee_raise_start: require('../../assets/exercises/hanging_knee_raise_start.jpg'),
  hanging_knee_raise_end: require('../../assets/exercises/hanging_knee_raise_end.jpg'),
  hanging_oblique_knee_raise_start: require('../../assets/exercises/hanging_oblique_knee_raise_start.jpg'),
  hanging_oblique_knee_raise_end: require('../../assets/exercises/hanging_oblique_knee_raise_end.jpg'),
  toes_to_bar_start: require('../../assets/exercises/toes_to_bar_start.jpg'),
  toes_to_bar_end: require('../../assets/exercises/toes_to_bar_end.jpg'),
  windshield_wipers_start: require('../../assets/exercises/windshield_wipers_start.jpg'),
  windshield_wipers_end: require('../../assets/exercises/windshield_wipers_end.jpg'),
  plank_start: require('../../assets/exercises/plank_start.jpg'),
  plank_end: require('../../assets/exercises/plank_start.jpg'),
  side_plank_start: require('../../assets/exercises/side_plank_start.jpg'),
  side_plank_end: require('../../assets/exercises/side_plank_start.jpg'),
  weighted_plank_start: require('../../assets/exercises/weighted_plank_start.jpg'),
  weighted_plank_end: require('../../assets/exercises/weighted_plank_start.jpg'),
  mountain_climbers_start: require('../../assets/exercises/mountain_climbers_start.jpg'),
  mountain_climbers_end: require('../../assets/exercises/mountain_climbers_end.jpg'),
  dead_bug_start: require('../../assets/exercises/dead_bug_start.jpg'),
  dead_bug_end: require('../../assets/exercises/dead_bug_end.jpg'),
  bird_dog_start: require('../../assets/exercises/bird_dog_start.jpg'),
  bird_dog_end: require('../../assets/exercises/bird_dog_end.jpg'),
  ab_rollout_start: require('../../assets/exercises/ab_rollout_start.jpg'),
  ab_rollout_end: require('../../assets/exercises/ab_rollout_end.jpg'),
  russian_twist_start: require('../../assets/exercises/russian_twist_start.jpg'),
  russian_twist_end: require('../../assets/exercises/russian_twist_end.jpg'),
  v_ups_start: require('../../assets/exercises/v_ups_start.jpg'),
  v_ups_end: require('../../assets/exercises/v_ups_end.jpg'),
  l_sit_hold_start: require('../../assets/exercises/l_sit_hold_start.jpg'),
  l_sit_hold_end: require('../../assets/exercises/l_sit_hold_start.jpg'),
  hyperextension_core_start: require('../../assets/exercises/hyperextension_core_start.jpg'),
  hyperextension_core_end: require('../../assets/exercises/hyperextension_core_end.jpg'),
  superman_start: require('../../assets/exercises/superman_start.jpg'),
  superman_end: require('../../assets/exercises/superman_end.jpg'),
  db_side_bend_start: require('../../assets/exercises/db_side_bend_start.jpg'),
  db_side_bend_end: require('../../assets/exercises/db_side_bend_end.jpg'),

  // ############################################
  // PRO EXERCISES (Gym/Cable/Machine Equipment)
  // ############################################

  // ============================================
  // CHEST
  // ============================================
  cable_crossover_high_start: require('../../assets/exercises/cable_crossover_high_start.jpg'),
  cable_crossover_high_end: require('../../assets/exercises/cable_crossover_high_end.jpg'),
  cable_crossover_low_start: require('../../assets/exercises/cable_crossover_low_start.jpg'),
  cable_crossover_low_end: require('../../assets/exercises/cable_crossover_low_end.jpg'),
  cable_flyes_mid_start: require('../../assets/exercises/cable_flyes_mid_start.jpg'),
  cable_flyes_mid_end: require('../../assets/exercises/cable_flyes_mid_end.jpg'),
  pec_deck_start: require('../../assets/exercises/pec_deck_start.jpg'),
  pec_deck_end: require('../../assets/exercises/pec_deck_end.jpg'),
  chest_press_start: require('../../assets/exercises/chest_press_start.jpg'),
  chest_press_end: require('../../assets/exercises/chest_press_end.jpg'),
  dips_chest_start: require('../../assets/exercises/dips_chest_start.jpg'),
  dips_chest_end: require('../../assets/exercises/dips_chest_end.jpg'),
  weighted_dips_start: require('../../assets/exercises/weighted_dips_start.jpg'),
  weighted_dips_end: require('../../assets/exercises/weighted_dips_end.jpg'),

  // ============================================
  // BACK
  // ============================================
  lat_pulldown_wide_start: require('../../assets/exercises/lat_pulldown_wide_start.jpg'),
  lat_pulldown_wide_end: require('../../assets/exercises/lat_pulldown_wide_end.jpg'),
  lat_pulldown_close_start: require('../../assets/exercises/lat_pulldown_close_start.jpg'),
  lat_pulldown_close_end: require('../../assets/exercises/lat_pulldown_close_end.jpg'),
  lat_pulldown_reverse_start: require('../../assets/exercises/lat_pulldown_reverse_start.jpg'),
  lat_pulldown_reverse_end: require('../../assets/exercises/lat_pulldown_reverse_end.jpg'),
  behind_neck_pulldown_start: require('../../assets/exercises/behind_neck_pulldown_start.jpg'),
  behind_neck_pulldown_end: require('../../assets/exercises/behind_neck_pulldown_end.jpg'),
  seated_cable_row_start: require('../../assets/exercises/seated_cable_row_start.jpg'),
  seated_cable_row_end: require('../../assets/exercises/seated_cable_row_end.jpg'),
  seated_cable_row_wide_start: require('../../assets/exercises/seated_cable_wide_row_start.jpg'),
  seated_cable_row_wide_end: require('../../assets/exercises/seated_cable_wide_row_end.jpg'),
  face_pulls_start: require('../../assets/exercises/face_pulls_start.jpg'),
  face_pulls_end: require('../../assets/exercises/face_pulls_end.jpg'),
  single_arm_cable_row_start: require('../../assets/exercises/single_arm_cable_row_start.jpg'),
  single_arm_cable_row_end: require('../../assets/exercises/single_arm_cable_row_end.jpg'),
  cable_shrugs_start: require('../../assets/exercises/cable_shrugs_start.jpg'),
  cable_shrugs_end: require('../../assets/exercises/cable_shrugs_end.jpg'),

  // ============================================
  // SHOULDERS
  // ============================================
  cable_lateral_raise_start: require('../../assets/exercises/cable_lateral_raise_start.jpg'),
  cable_lateral_raise_end: require('../../assets/exercises/cable_lateral_raise_end.jpg'),
  cable_front_raise_start: require('../../assets/exercises/cable_front_raise_start.jpg'),
  cable_front_raise_end: require('../../assets/exercises/cable_front_raise_end.jpg'),
  cable_rear_delt_fly_start: require('../../assets/exercises/cable_rear_delt_fly_start.jpg'),
  cable_rear_delt_fly_end: require('../../assets/exercises/cable_rear_delt_fly_end.jpg'),
  face_pulls_shoulders_start: require('../../assets/exercises/face_pulls_start.jpg'),
  face_pulls_shoulders_end: require('../../assets/exercises/face_pulls_end.jpg'),
  upright_row_cable_start: require('../../assets/exercises/upright_row_cable_start.jpg'),
  upright_row_cable_end: require('../../assets/exercises/upright_row_cable_end.jpg'),
  reverse_fly_start: require('../../assets/exercises/reverse_fly_start.jpg'),
  reverse_fly_end: require('../../assets/exercises/reverse_fly_end.jpg'),

  // ============================================
  // BICEPS
  // ============================================
  ez_bar_preacher_curl_start: require('../../assets/exercises/ez_bar_preacher_curl_start.jpg'),
  ez_bar_preacher_curl_end: require('../../assets/exercises/ez_bar_preacher_curl_end.jpg'),
  db_preacher_curl_start: require('../../assets/exercises/db_preacher_curl_start.jpg'),
  db_preacher_curl_end: require('../../assets/exercises/db_preacher_curl_end.jpg'),
  cable_curl_bar_start: require('../../assets/exercises/cable_curl_bar_start.jpg'),
  cable_curl_bar_end: require('../../assets/exercises/cable_curl_bar_end.jpg'),
  cable_curl_rope_start: require('../../assets/exercises/cable_curl_rope_start.jpg'),
  cable_curl_rope_end: require('../../assets/exercises/cable_curl_rope_end.jpg'),
  cable_curl_single_start: require('../../assets/exercises/cable_curl_single_start.jpg'),
  cable_curl_single_end: require('../../assets/exercises/cable_curl_single_end.jpg'),
  cable_high_curl_start: require('../../assets/exercises/cable_high_curl_start.jpg'),
  cable_high_curl_end: require('../../assets/exercises/cable_high_curl_end.jpg'),
  cable_preacher_curl_start: require('../../assets/exercises/cable_preacher_curl_start.jpg'),
  cable_preacher_curl_end: require('../../assets/exercises/cable_preacher_curl_end.jpg'),

  // ============================================
  // TRICEPS
  // ============================================
  cable_pushdown_rope_start: require('../../assets/exercises/cable_pushdown_rope_start.jpg'),
  cable_pushdown_rope_end: require('../../assets/exercises/cable_pushdown_rope_end.jpg'),
  cable_pushdown_bar_start: require('../../assets/exercises/cable_pushdown_bar_start.jpg'),
  cable_pushdown_bar_end: require('../../assets/exercises/cable_pushdown_bar_end.jpg'),
  cable_pushdown_vbar_start: require('../../assets/exercises/cable_pushdown_vbar_start.jpg'),
  cable_pushdown_vbar_end: require('../../assets/exercises/cable_pushdown_vbar_end.jpg'),
  cable_pushdown_reverse_start: require('../../assets/exercises/cable_pushdown_reverse_start.jpg'),
  cable_pushdown_reverse_end: require('../../assets/exercises/cable_pushdown_reverse_end.jpg'),
  cable_overhead_extension_rope_start: require('../../assets/exercises/cable_overhead_extension_rope_start.jpg'),
  cable_overhead_extension_rope_end: require('../../assets/exercises/cable_overhead_extension_rope_end.jpg'),
  cable_overhead_extension_single_start: require('../../assets/exercises/cable_overhead_extension_single_start.jpg'),
  cable_overhead_extension_single_end: require('../../assets/exercises/cable_overhead_extension_single_end.jpg'),
  cable_kickback_start: require('../../assets/exercises/cable_kickback_start.jpg'),
  cable_kickback_end: require('../../assets/exercises/cable_kickback_end.jpg'),
  dips_triceps_start: require('../../assets/exercises/dips_triceps_start.jpg'),
  dips_triceps_end: require('../../assets/exercises/dips_triceps_end.jpg'),

  // ============================================
  // FOREARMS
  // ============================================
  cable_wrist_curl_start: require('../../assets/exercises/cable_wrist_curl_start.jpg'),
  cable_wrist_curl_end: require('../../assets/exercises/cable_wrist_curl_end.jpg'),

  // ============================================
  // QUADRICEPS
  // ============================================
  leg_extension_start: require('../../assets/exercises/leg_extension_start.jpg'),
  leg_extension_end: require('../../assets/exercises/leg_extension_end.jpg'),
  //leg_press_start: require('../../assets/exercises/leg_press_start.jpg'),
  //leg_press_end: require('../../assets/exercises/leg_press_end.jpg'),
  squat_start: require('../../assets/exercises/squat_start.jpg'),
  squat_end: require('../../assets/exercises/squat_end.jpg'),

  // ============================================
  // HAMSTRINGS
  // ============================================
  leg_curl_start: require('../../assets/exercises/leg_curl_start.jpg'),
  leg_curl_end: require('../../assets/exercises/leg_curl_end.jpg'),
  seated_leg_curl_start: require('../../assets/exercises/seated_leg_curl_start.jpg'),
  seated_leg_curl_end: require('../../assets/exercises/seated_leg_curl_end.jpg'),
  cable_pull_through_start: require('../../assets/exercises/cable_pull_through_start.jpg'),
  cable_pull_through_end: require('../../assets/exercises/cable_pull_through_end.jpg'),

  // ============================================
  // GLUTES
  // ============================================
  cable_kickback_glutes_start: require('../../assets/exercises/cable_kickback_glutes_start.jpg'),
  cable_kickback_glutes_end: require('../../assets/exercises/cable_kickback_glutes_end.jpg'),
  cable_pull_through_glutes_start: require('../../assets/exercises/cable_pull_through_glutes_start.jpg'),
  cable_pull_through_glutes_end: require('../../assets/exercises/cable_pull_through_glutes_end.jpg'),

  // ============================================
  // CALVES
  // ============================================
  //leg_press_calf_raise_start: require('../../assets/exercises/leg_press_calf_raise_start.jpg'),
  //leg_press_calf_raise_end: require('../../assets/exercises/leg_press_calf_raise_end.jpg'),
  squat_calf_raise_start: require('../../assets/exercises/squat_calf_raise_start.jpg'),
  squat_calf_raise_end: require('../../assets/exercises/squat_calf_raise_end.jpg'),

  // ============================================
  // CORE
  // ============================================
  cable_crunch_start: require('../../assets/exercises/cable_crunch_start.jpg'),
  cable_crunch_end: require('../../assets/exercises/cable_crunch_end.jpg'),
  cable_woodchop_high_start: require('../../assets/exercises/cable_woodchop_high_start.jpg'),
  cable_woodchop_high_end: require('../../assets/exercises/cable_woodchop_high_end.jpg'),
  cable_woodchop_low_start: require('../../assets/exercises/cable_woodchop_low_start.jpg'),
  cable_woodchop_low_end: require('../../assets/exercises/cable_woodchop_low_end.jpg'),
  pallof_press_start: require('../../assets/exercises/pallof_press_start.jpg'),
  pallof_press_end: require('../../assets/exercises/pallof_press_end.jpg'),

  // ============================================
  // CARDIO
  // ============================================
  treadmill_running_start: require('../../assets/exercises/treadmill_running_start.jpg'),
  treadmill_running_end: require('../../assets/exercises/treadmill_running_end.jpg'),
  stationary_bike_start: require('../../assets/exercises/stationary_bike_start.jpg'),
  stationary_bike_end: require('../../assets/exercises/stationary_bike_end.jpg'),
  stepper_start: require('../../assets/exercises/stepper_start.jpg'),
  stepper_end: require('../../assets/exercises/stepper_end.jpg'),
  rowing_start: require('../../assets/exercises/rowing_start.jpg'),
  rowing_end: require('../../assets/exercises/rowing_end.jpg'),
  burpees_start: require('../../assets/exercises/burpees_start.jpg'),
  burpees_mid1: require('../../assets/exercises/burpees_flex.jpg'),
  burpees_mid2: require('../../assets/exercises/burpees_start.jpg'),
  burpees_mid3: require('../../assets/exercises/burpees_mid.jpg'),
  burpees_mid4: require('../../assets/exercises/burpees_end.jpg'),
  burpees_end: require('../../assets/exercises/burpees_mid.jpg'),
  jumping_jacks_start: require('../../assets/exercises/jumping_jacks_start.jpg'),
  jumping_jacks_end: require('../../assets/exercises/jumping_jacks_end.jpg'),

  // ============================================
  // KETTLEBELL
  // ============================================
  kb_swing_start: require('../../assets/exercises/kb_swing_start.jpg'),
  kb_swing_end: require('../../assets/exercises/kb_swing_end.jpg'),
  kb_goblet_squat_start: require('../../assets/exercises/kb_goblet_squat_start.jpg'),
  kb_goblet_squat_end: require('../../assets/exercises/kb_goblet_squat_end.jpg'),
  kb_deadlift_start: require('../../assets/exercises/kb_deadlift_start.jpg'),
  kb_deadlift_end: require('../../assets/exercises/kb_deadlift_end.jpg'),
  kb_press_start: require('../../assets/exercises/kb_press_start.jpg'),
  kb_press_end: require('../../assets/exercises/kb_press_end.jpg'),
  kb_row_start: require('../../assets/exercises/kb_row_start.jpg'),
  kb_row_end: require('../../assets/exercises/kb_row_end.jpg'),
  kb_clean_start: require('../../assets/exercises/kb_clean_start.jpg'),
  kb_clean_end: require('../../assets/exercises/kb_clean_end.jpg'),
  kb_snatch_start: require('../../assets/exercises/kb_snatch_start.jpg'),
  kb_snatch_end: require('../../assets/exercises/kb_snatch_end.jpg'),
  turkish_getup_start: require('../../assets/exercises/turkish_getup_start.jpg'),
  turkish_getup_end: require('../../assets/exercises/turkish_getup_end.jpg'),
  kb_lunge_start: require('../../assets/exercises/kb_lunge_start.jpg'),
  kb_lunge_end: require('../../assets/exercises/kb_lunge_end.jpg'),
  kb_windmill_start: require('../../assets/exercises/kb_windmill_start.jpg'),
  kb_windmill_end: require('../../assets/exercises/kb_windmill_end.jpg'),

  // ============================================
  // EXERCISE BALL
  // ============================================
  ball_wall_squat_start: require('../../assets/exercises/ball_wall_squat_start.jpg'),
  ball_wall_squat_end: require('../../assets/exercises/ball_wall_squat_end.jpg'),
  ball_hamstring_curl_start: require('../../assets/exercises/ball_hamstring_curl_start.jpg'),
  ball_hamstring_curl_end: require('../../assets/exercises/ball_hamstring_curl_end.jpg'),
  ball_crunch_start: require('../../assets/exercises/ball_crunch_start.jpg'),
  ball_crunch_end: require('../../assets/exercises/ball_crunch_end.jpg'),
  ball_pike_start: require('../../assets/exercises/ball_pike_start.jpg'),
  ball_pike_end: require('../../assets/exercises/ball_pike_end.jpg'),
  ball_back_extension_start: require('../../assets/exercises/ball_back_extension_start.jpg'),
  ball_back_extension_end: require('../../assets/exercises/ball_back_extension_end.jpg'),
  ball_plank_start: require('../../assets/exercises/ball_plank_start.jpg'),
  ball_plank_end: require('../../assets/exercises/ball_plank_start.jpg'),
  ball_russian_twist_start: require('../../assets/exercises/ball_russian_twist_start.jpg'),
  ball_russian_twist_mid: require('../../assets/exercises/ball_russian_twist_mid.jpg'),
  ball_russian_twist_end: require('../../assets/exercises/ball_russian_twist_end.jpg'),
  ball_pass_start: require('../../assets/exercises/ball_pass_start.jpg'),
  ball_pass_mid: require('../../assets/exercises/ball_pass_mid.jpg'),
  ball_pass_end: require('../../assets/exercises/ball_pass_end.jpg'),
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
  style
}) => {
  // Get images for this exercise
  const startImage = exerciseImages[`${exerciseId}_start`];
  const endImage = exerciseImages[`${exerciseId}_end`];
  const midImage = exerciseImages[`${exerciseId}_mid`];
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
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={startImage}
        style={[styles.image, styles.stackedImage, { width: size, height: size }]}
        resizeMode="contain"
      />
      {isSequential && seqMids.map((src, i) => (
        <Animated.Image
          key={i}
          source={src}
          style={[styles.image, styles.stackedImage, { width: size, height: size, opacity: opacities[i] }]}
          resizeMode="contain"
        />
      ))}
      {hasMid && (
        <Animated.Image
          source={midImage}
          style={[styles.image, styles.stackedImage, { width: size, height: size, opacity: opacities[0] }]}
          resizeMode="contain"
        />
      )}
      <Animated.Image
        source={endImage}
        style={[
          styles.image,
          styles.stackedImage,
          { width: size, height: size, opacity: opacities[isSequential ? seqMids.length : hasMid ? 1 : 0] }
        ]}
        resizeMode="contain"
      />
      {isSequential && (
        <Animated.Image
          source={startImage}
          style={[styles.image, styles.stackedImage, { width: size, height: size, opacity: opacities[seqMids.length + 1] }]}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

// Static version without animation (for lists, etc.)
export const ExerciseImageStatic = ({ exerciseId, size = 60, style, preferEnd = false }) => {
  const startImage = exerciseImages[`${exerciseId}_start`];
  const endImage = exerciseImages[`${exerciseId}_end`];
  
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

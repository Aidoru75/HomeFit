// ExerciseImage Component - Displays exercise images with cross-fade animation
import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme';

/*
  IMAGE NAMING CONVENTION:
  
  Place exercise images in: assets/exercises/
  
  Naming format: {exercise_id}_{position}.png
  
  Where:
  - exercise_id: The ID from exercises.js (e.g., "bench_press", "deadlift")
  - position: Either "start" or "end"
  
  Examples:
  - bench_press_start.png
  - bench_press_end.png
  - deadlift_start.png
  - deadlift_end.png
  
  All images should be 700x700 pixels.
  
  If images don't exist for an exercise, a placeholder will be shown.
*/

// Map of available exercise images
// Add entries here as you create images
const exerciseImages = {
  // Example format - uncomment and add as you create images:

  // CHEST
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
  push_ups_start: require('../../assets/exercises/push_ups_start.png'),
  push_ups_end: require('../../assets/exercises/push_ups_end.png'),
  incline_push_ups_start: require('../../assets/exercises/incline_push_ups_start.png'),
  incline_push_ups_end: require('../../assets/exercises/incline_push_ups_end.png'),
  decline_push_ups_start: require('../../assets/exercises/decline_push_ups_start.png'),
  decline_push_ups_end: require('../../assets/exercises/decline_push_ups_end.png'),
  dips_chest_start: require('../../assets/exercises/dips_chest_start.png'),
  dips_chest_end: require('../../assets/exercises/dips_chest_end.png'),
  //svend_press_start: require('../../assets/exercises/svend_press_start.png'),
  //svend_press_end: require('../../assets/exercises/svend_press_end.png'),
  pullover_chest_start: require('../../assets/exercises/pullover_chest_start.png'),
  pullover_chest_end: require('../../assets/exercises/pullover_chest_end.png'),

  // BACK
  pullups_wide_start: require('../../assets/exercises/pullups_wide_start.png'),
  pullups_wide_end: require('../../assets/exercises/pullups_wide_end.png'),
  pullups_close_start: require('../../assets/exercises/pullups_close_start.png'),
  pullups_close_end: require('../../assets/exercises/pullups_close_end.png'),
  chinups_start: require('../../assets/exercises/chinups_start.png'),
  chinups_end: require('../../assets/exercises/chinups_end.png'),
  //weighted_pullups_start: require('../../assets/exercises/weighted_pullups_start.png'),
  //weighted_pullups_end: require('../../assets/exercises/weighted_pullups_end.png'),
  //band_assisted_pullups_start: require('../../assets/exercises/band_assisted_pullups_start.png'),
  //band_assisted_pullups_end: require('../../assets/exercises/band_assisted_pullups_end.png'),
  lat_pulldown_wide_start: require('../../assets/exercises/lat_pulldown_wide_start.png'),
  lat_pulldown_wide_end: require('../../assets/exercises/lat_pulldown_wide_end.png'),
  //lat_pulldown_close_start: require('../../assets/exercises/lat_pulldown_close_start.png'),
  //lat_pulldown_close_end: require('../../assets/exercises/lat_pulldown_close_end.png'),
  lat_pulldown_reverse_start: require('../../assets/exercises/lat_pulldown_reverse_start.png'),
  lat_pulldown_reverse_end: require('../../assets/exercises/lat_pulldown_reverse_end.png'),
  behind_neck_pulldown_start: require('../../assets/exercises/behind_neck_pulldown_start.png'),
  behind_neck_pulldown_end: require('../../assets/exercises/behind_neck_pulldown_end.png'),
  seated_cable_row_start: require('../../assets/exercises/seated_cable_row_start.png'),
  seated_cable_row_end: require('../../assets/exercises/seated_cable_row_end.png'),
  face_pulls_start: require('../../assets/exercises/face_pulls_start.png'),
  face_pulls_end: require('../../assets/exercises/face_pulls_end.png'),
  //single_arm_cable_row_start: require('../../assets/exercises/single_arm_cable_row_start.png'),
  //single_arm_cable_row_end: require('../../assets/exercises/single_arm_cable_row_end.png'),
  barbell_row_start: require('../../assets/exercises/barbell_row_start.png'),
  barbell_row_end: require('../../assets/exercises/barbell_row_end.png'),
  //barbell_row_underhand_start: require('../../assets/exercises/barbell_row_underhand_start.png'),
  //barbell_row_underhand_end: require('../../assets/exercises/barbell_row_underhand_end.png'),
  //pendlay_row_start: require('../../assets/exercises/pendlay_row_start.png'),
  //pendlay_row_end: require('../../assets/exercises/pendlay_row_end.png'),
  dumbbell_row_start: require('../../assets/exercises/dumbbell_row_start.png'),
  dumbbell_row_end: require('../../assets/exercises/dumbbell_row_end.png'),
  db_bent_over_row_start: require('../../assets/exercises/db_bent_over_row_start.png'),
  db_bent_over_row_end: require('../../assets/exercises/db_bent_over_row_end.png'),
  pullover_back_start: require('../../assets/exercises/pullover_chest_start.png'),
  pullover_back_end: require('../../assets/exercises/pullover_chest_end.png'),
  //tbar_row_start: require('../../assets/exercises/tbar_row_start.png'),
  //tbar_row_end: require('../../assets/exercises/tbar_row_end.png'),
  deadlift_start: require('../../assets/exercises/deadlift_start.png'),
  deadlift_end: require('../../assets/exercises/deadlift_end.png'),
  //romanian_deadlift_barbell_start: require('../../assets/exercises/romanian_deadlift_barbell_start.png'),
  //romanian_deadlift_barbell_end: require('../../assets/exercises/romanian_deadlift_barbell_end.png'),
  //romanian_deadlift_dumbbell_start: require('../../assets/exercises/romanian_deadlift_dumbbell_start.png'),
  //romanian_deadlift_dumbbell_end: require('../../assets/exercises/romanian_deadlift_dumbbell_end.png'),
  good_mornings_start: require('../../assets/exercises/good_mornings_start.png'),
  good_mornings_end: require('../../assets/exercises/good_mornings_end.png'),
  //hyperextension_start: require('../../assets/exercises/hyperextension_start.png'),
  //hyperextension_end: require('../../assets/exercises/hyperextension_end.png'),
  shrugs_barbell_start: require('../../assets/exercises/shrugs_barbell_start.png'),
  shrugs_barbell_end: require('../../assets/exercises/shrugs_barbell_end.png'),
  shrugs_dumbbell_start: require('../../assets/exercises/shrugs_dumbbell_start.png'),
  shrugs_dumbbell_end: require('../../assets/exercises/shrugs_dumbbell_end.png'),
  cable_shrugs_start: require('../../assets/exercises/cable_shrugs_start.png'),
  cable_shrugs_end: require('../../assets/exercises/cable_shrugs_end.png'),

  // SHOULDERS
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
  //rear_delt_fly_incline_start: require('../../assets/exercises/rear_delt_fly_incline_start.png'),
  //rear_delt_fly_incline_end: require('../../assets/exercises/rear_delt_fly_incline_end.png'),
  cable_lateral_raise_start: require('../../assets/exercises/cable_lateral_raise_start.png'),
  cable_lateral_raise_end: require('../../assets/exercises/cable_lateral_raise_end.png'),
  cable_front_raise_start: require('../../assets/exercises/cable_front_raise_start.png'),
  cable_front_raise_end: require('../../assets/exercises/cable_front_raise_end.png'),
  //cable_rear_delt_fly_start: require('../../assets/exercises/cable_rear_delt_fly_start.png'),
  //cable_rear_delt_fly_end: require('../../assets/exercises/cable_rear_delt_fly_end.png'),
  face_pulls_shoulders_start: require('../../assets/exercises/face_pulls_start.png'),
  face_pulls_shoulders_end: require('../../assets/exercises/face_pulls_end.png'),
  upright_row_barbell_start: require('../../assets/exercises/upright_row_barbell_start.png'),
  upright_row_barbell_end: require('../../assets/exercises/upright_row_barbell_end.png'),
  upright_row_dumbbell_start: require('../../assets/exercises/upright_row_dumbbell_start.png'),
  upright_row_dumbbell_end: require('../../assets/exercises/upright_row_dumbbell_end.png'),
  //upright_row_cable_start: require('../../assets/exercises/upright_row_cable_start.png'),
  //upright_row_cable_end: require('../../assets/exercises/upright_row_cable_end.png'),
  plate_front_raise_start: require('../../assets/exercises/plate_front_raise_start.png'),
  plate_front_raise_end: require('../../assets/exercises/plate_front_raise_end.png'),
  bus_drivers_start: require('../../assets/exercises/bus_drivers_start.png'),
  bus_drivers_end: require('../../assets/exercises/bus_drivers_end.png'),
  //band_pull_aparts_start: require('../../assets/exercises/band_pull_aparts_start.png'),
  //band_pull_aparts_end: require('../../assets/exercises/band_pull_aparts_end.png'),
  barbell_high_pull_start: require('../../assets/exercises/barbell_high_pull_start.png'),
  barbell_high_pull_end: require('../../assets/exercises/barbell_high_pull_end.png'),

  // BICEPS
  //barbell_curl_standing_start: require('../../assets/exercises/barbell_curl_standing_start.png'),
  //barbell_curl_standing_end: require('../../assets/exercises/barbell_curl_standing_end.png'),
  //barbell_curl_wide_start: require('../../assets/exercises/barbell_curl_wide_start.png'),
  //barbell_curl_wide_end: require('../../assets/exercises/barbell_curl_wide_end.png'),
  //barbell_curl_close_start: require('../../assets/exercises/barbell_curl_close_start.png'),
  //barbell_curl_close_end: require('../../assets/exercises/barbell_curl_close_end.png'),
  ez_bar_curl_start: require('../../assets/exercises/ez_bar_curl_start.png'),
  ez_bar_curl_end: require('../../assets/exercises/ez_bar_curl_end.png'),
  ez_bar_curl_wide_start: require('../../assets/exercises/ez_bar_curl_wide_start.png'),
  ez_bar_curl_wide_end: require('../../assets/exercises/ez_bar_curl_wide_end.png'),
  ez_bar_preacher_curl_start: require('../../assets/exercises/ez_bar_preacher_curl_start.png'),
  ez_bar_preacher_curl_end: require('../../assets/exercises/ez_bar_preacher_curl_end.png'),
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
  db_preacher_curl_start: require('../../assets/exercises/db_preacher_curl_start.png'),
  db_preacher_curl_end: require('../../assets/exercises/db_preacher_curl_end.png'),
  //zottman_curl_start: require('../../assets/exercises/zottman_curl_start.png'),
  //zottman_curl_end: require('../../assets/exercises/zottman_curl_end.png'),
  cable_curl_bar_start: require('../../assets/exercises/cable_curl_bar_start.png'),
  cable_curl_bar_end: require('../../assets/exercises/cable_curl_bar_end.png'),
  //cable_curl_rope_start: require('../../assets/exercises/cable_curl_rope_start.png'),
  //cable_curl_rope_end: require('../../assets/exercises/cable_curl_rope_end.png'),
  cable_curl_single_start: require('../../assets/exercises/cable_curl_single_start.png'),
  cable_curl_single_end: require('../../assets/exercises/cable_curl_single_end.png'),
  cable_high_curl_start: require('../../assets/exercises/cable_high_curl_start.png'),
  cable_high_curl_end: require('../../assets/exercises/cable_high_curl_end.png'),
  cable_preacher_curl_start: require('../../assets/exercises/cable_preacher_curl_start.png'),
  cable_preacher_curl_end: require('../../assets/exercises/cable_preacher_curl_end.png'),
  drag_curl_start: require('../../assets/exercises/drag_curl_start.png'),
  drag_curl_end: require('../../assets/exercises/drag_curl_end.png'),
  chinups_biceps_start: require('../../assets/exercises/chinups_biceps_start.png'),
  chinups_biceps_end: require('../../assets/exercises/chinups_biceps_end.png'),
  //band_curl_start: require('../../assets/exercises/band_curl_start.png'),
  //band_curl_end: require('../../assets/exercises/band_curl_end.png'),

  // TRICEPS
  close_grip_bench_start: require('../../assets/exercises/close_grip_bench_start.png'),
  close_grip_bench_end: require('../../assets/exercises/close_grip_bench_end.png'),
  skull_crushers_start: require('../../assets/exercises/skull_crushers_start.png'),
  skull_crushers_end: require('../../assets/exercises/skull_crushers_end.png'),
  db_skull_crushers_start: require('../../assets/exercises/db_skull_crushers_start.png'),
  db_skull_crushers_end: require('../../assets/exercises/db_skull_crushers_end.png'),
  db_overhead_extension_two_start: require('../../assets/exercises/db_overhead_extension_two_start.png'),
  db_overhead_extension_two_end: require('../../assets/exercises/db_overhead_extension_two_end.png'),
  //db_overhead_extension_single_start: require('../../assets/exercises/db_overhead_extension_single_start.png'),
  //db_overhead_extension_single_end: require('../../assets/exercises/db_overhead_extension_single_end.png'),
  db_kickback_start: require('../../assets/exercises/db_kickback_start.png'),
  db_kickback_end: require('../../assets/exercises/db_kickback_end.png'),
  //cable_pushdown_rope_start: require('../../assets/exercises/cable_pushdown_rope_start.png'),
  //cable_pushdown_rope_end: require('../../assets/exercises/cable_pushdown_rope_end.png'),
  //cable_pushdown_bar_start: require('../../assets/exercises/cable_pushdown_bar_start.png'),
  //cable_pushdown_bar_end: require('../../assets/exercises/cable_pushdown_bar_end.png'),
  cable_pushdown_vbar_start: require('../../assets/exercises/cable_pushdown_vbar_start.png'),
  cable_pushdown_vbar_end: require('../../assets/exercises/cable_pushdown_vbar_end.png'),
  //cable_pushdown_reverse_start: require('../../assets/exercises/cable_pushdown_reverse_start.png'),
  //cable_pushdown_reverse_end: require('../../assets/exercises/cable_pushdown_reverse_end.png'),
  //cable_overhead_extension_rope_start: require('../../assets/exercises/cable_overhead_extension_rope_start.png'),
  //cable_overhead_extension_rope_end: require('../../assets/exercises/cable_overhead_extension_rope_end.png'),
  //cable_overhead_extension_single_start: require('../../assets/exercises/cable_overhead_extension_single_start.png'),
  //cable_overhead_extension_single_end: require('../../assets/exercises/cable_overhead_extension_single_end.png'),
  //cable_kickback_start: require('../../assets/exercises/cable_kickback_start.png'),
  //cable_kickback_end: require('../../assets/exercises/cable_kickback_end.png'),
  //dips_triceps_start: require('../../assets/exercises/dips_triceps_start.png'),
  //dips_triceps_end: require('../../assets/exercises/dips_triceps_end.png'),
  bench_dips_start: require('../../assets/exercises/bench_dips_start.png'),
  bench_dips_end: require('../../assets/exercises/bench_dips_end.png'),
  diamond_push_ups_start: require('../../assets/exercises/diamond_push_ups_start.png'),
  diamond_push_ups_end: require('../../assets/exercises/diamond_push_ups_end.png'),
  //band_pushdown_start: require('../../assets/exercises/band_pushdown_start.png'),
  //band_pushdown_end: require('../../assets/exercises/band_pushdown_end.png'),

  // FOREARMS
  barbell_wrist_curl_start: require('../../assets/exercises/barbell_wrist_curl_start.png'),
  barbell_wrist_curl_end: require('../../assets/exercises/barbell_wrist_curl_end.png'),
  //barbell_reverse_wrist_curl_start: require('../../assets/exercises/barbell_reverse_wrist_curl_start.png'),
  //barbell_reverse_wrist_curl_end: require('../../assets/exercises/barbell_reverse_wrist_curl_end.png'),
  db_wrist_curl_start: require('../../assets/exercises/db_wrist_curl_start.png'),
  db_wrist_curl_end: require('../../assets/exercises/db_wrist_curl_end.png'),
  db_reverse_wrist_curl_start: require('../../assets/exercises/db_reverse_wrist_curl_start.png'),
  db_reverse_wrist_curl_end: require('../../assets/exercises/db_reverse_wrist_curl_end.png'),
  //farmers_walk_start: require('../../assets/exercises/farmers_walk_start.png'),
  //farmers_walk_end: require('../../assets/exercises/farmers_walk_end.png'),
  //plate_pinch_hold_start: require('../../assets/exercises/plate_pinch_hold_start.png'),
  //plate_pinch_hold_end: require('../../assets/exercises/plate_pinch_hold_end.png'),
  //dead_hang_start: require('../../assets/exercises/dead_hang_start.png'),
  //dead_hang_end: require('../../assets/exercises/dead_hang_end.png'),
  //towel_pullups_start: require('../../assets/exercises/towel_pullups_start.png'),
  //towel_pullups_end: require('../../assets/exercises/towel_pullups_end.png'),
  //cable_wrist_curl_start: require('../../assets/exercises/cable_wrist_curl_start.png'),
  //cable_wrist_curl_end: require('../../assets/exercises/cable_wrist_curl_end.png'),
  reverse_curl_barbell_start: require('../../assets/exercises/reverse_curl_barbell_start.png'),
  reverse_curl_barbell_end: require('../../assets/exercises/reverse_curl_barbell_end.png'),
  reverse_curl_ez_start: require('../../assets/exercises/reverse_curl_barbell_start.png'),
  reverse_curl_ez_end: require('../../assets/exercises/reverse_curl_barbell_end.png'),

  // QUADRICEPS
  back_squat_start: require('../../assets/exercises/back_squat_start.png'),
  back_squat_end: require('../../assets/exercises/back_squat_end.png'),
  front_squat_start: require('../../assets/exercises/front_squat_start.png'),
  front_squat_end: require('../../assets/exercises/front_squat_end.png'),
  //box_squat_start: require('../../assets/exercises/box_squat_start.png'),
  //box_squat_end: require('../../assets/exercises/box_squat_end.png'),
  pause_squat_start: require('../../assets/exercises/pause_squat_start.png'),
  pause_squat_end: require('../../assets/exercises/pause_squat_end.png'),
  //goblet_squat_start: require('../../assets/exercises/goblet_squat_start.png'),
  //goblet_squat_end: require('../../assets/exercises/goblet_squat_end.png'),
  //dumbbell_squat_start: require('../../assets/exercises/dumbbell_squat_start.png'),
  //dumbbell_squat_end: require('../../assets/exercises/dumbbell_squat_end.png'),
  lunges_forward_start: require('../../assets/exercises/lunges_forward_start.png'),
  lunges_forward_end: require('../../assets/exercises/lunges_forward_end.png'),
  lunges_reverse_start: require('../../assets/exercises/lunges_reverse_start.png'),
  lunges_reverse_end: require('../../assets/exercises/lunges_reverse_end.png'),
  lunges_walking_start: require('../../assets/exercises/lunges_walking_start.png'),
  lunges_walking_end: require('../../assets/exercises/lunges_walking_end.png'),
  barbell_lunges_start: require('../../assets/exercises/barbell_lunges_start.png'),
  barbell_lunges_end: require('../../assets/exercises/barbell_lunges_end.png'),
  bulgarian_split_squat_db_start: require('../../assets/exercises/bulgarian_split_squat_db_start.png'),
  bulgarian_split_squat_db_end: require('../../assets/exercises/bulgarian_split_squat_db_end.png'),
  //bulgarian_split_squat_bb_start: require('../../assets/exercises/bulgarian_split_squat_bb_start.png'),
  //bulgarian_split_squat_bb_end: require('../../assets/exercises/bulgarian_split_squat_bb_end.png'),
  //step_ups_start: require('../../assets/exercises/step_ups_start.png'),
  //step_ups_end: require('../../assets/exercises/step_ups_end.png'),
  leg_extension_start: require('../../assets/exercises/leg_extension_start.png'),
  leg_extension_end: require('../../assets/exercises/leg_extension_end.png'),
  leg_press_start: require('../../assets/exercises/leg_press_start.png'),
  leg_press_end: require('../../assets/exercises/leg_press_end.png'),
  //sissy_squat_start: require('../../assets/exercises/sissy_squat_start.png'),
  //sissy_squat_end: require('../../assets/exercises/sissy_squat_end.png'),
  //wall_sit_start: require('../../assets/exercises/wall_sit_start.png'),
  //wall_sit_end: require('../../assets/exercises/wall_sit_end.png'),
  //band_squat_start: require('../../assets/exercises/band_squat_start.png'),
  //band_squat_end: require('../../assets/exercises/band_squat_end.png'),

  // HAMSTRINGS (4)
  rdl_barbell_start: require('../../assets/exercises/deadlift_start.png'),
  rdl_barbell_end: require('../../assets/exercises/deadlift_end.png'),
  //rdl_dumbbell_start: require('../../assets/exercises/rdl_dumbbell_start.png'),
  //rdl_dumbbell_end: require('../../assets/exercises/rdl_dumbbell_end.png'),
  stiff_leg_deadlift_start: require('../../assets/exercises/stiff_leg_deadlift_start.png'),
  stiff_leg_deadlift_end: require('../../assets/exercises/stiff_leg_deadlift_end.png'),
  single_leg_rdl_start: require('../../assets/exercises/single_leg_rdl_start.png'),
  single_leg_rdl_end: require('../../assets/exercises/single_leg_rdl_end.png'),
  good_mornings_hamstrings_start: require('../../assets/exercises/good_mornings_hamstrings_start.png'),
  good_mornings_hamstrings_end: require('../../assets/exercises/good_mornings_hamstrings_end.png'),
  leg_curl_start: require('../../assets/exercises/leg_curl_start.png'),
  leg_curl_end: require('../../assets/exercises/leg_curl_end.png'),
  seated_leg_curl_start: require('../../assets/exercises/seated_leg_curl_start.png'),
  seated_leg_curl_end: require('../../assets/exercises/seated_leg_curl_end.png'),
  //cable_pull_through_start: require('../../assets/exercises/cable_pull_through_start.png'),
  //cable_pull_through_end: require('../../assets/exercises/cable_pull_through_end.png'),
  //nordic_curl_start: require('../../assets/exercises/nordic_curl_start.png'),
  //nordic_curl_end: require('../../assets/exercises/nordic_curl_end.png'),
  //glute_ham_raise_start: require('../../assets/exercises/glute_ham_raise_start.png'),
  //glute_ham_raise_end: require('../../assets/exercises/glute_ham_raise_end.png'),
  //band_leg_curl_start: require('../../assets/exercises/band_leg_curl_start.png'),
  //band_leg_curl_end: require('../../assets/exercises/band_leg_curl_end.png'),

  // GLUTES (4)
  hip_thrust_barbell_start: require('../../assets/exercises/hip_thrust_barbell_start.png'),
  hip_thrust_barbell_end: require('../../assets/exercises/hip_thrust_barbell_end.png'),
  //hip_thrust_dumbbell_start: require('../../assets/exercises/hip_thrust_dumbbell_start.png'),
  //hip_thrust_dumbbell_end: require('../../assets/exercises/hip_thrust_dumbbell_end.png'),
  //single_leg_hip_thrust_start: require('../../assets/exercises/single_leg_hip_thrust_start.png'),
  //single_leg_hip_thrust_end: require('../../assets/exercises/single_leg_hip_thrust_end.png'),
  glute_bridge_barbell_start: require('../../assets/exercises/glute_bridge_barbell_start.png'),
  glute_bridge_barbell_end: require('../../assets/exercises/glute_bridge_barbell_end.png'),
  glute_bridge_dumbbell_start: require('../../assets/exercises/glute_bridge_dumbbell_start.png'),
  glute_bridge_dumbbell_end: require('../../assets/exercises/glute_bridge_dumbbell_end.png'),
  cable_kickback_glutes_start: require('../../assets/exercises/cable_kickback_glutes_start.png'),
  cable_kickback_glutes_end: require('../../assets/exercises/cable_kickback_glutes_end.png'),
  //cable_pull_through_glutes_start: require('../../assets/exercises/cable_pull_through_glutes_start.png'),
  //cable_pull_through_glutes_end: require('../../assets/exercises/cable_pull_through_glutes_end.png'),
  sumo_deadlift_start: require('../../assets/exercises/sumo_deadlift_start.png'),
  sumo_deadlift_end: require('../../assets/exercises/sumo_deadlift_end.png'),
  sumo_squat_start: require('../../assets/exercises/sumo_squat_start.png'),
  sumo_squat_end: require('../../assets/exercises/sumo_squat_end.png'),
  rdl_glutes_start: require('../../assets/exercises/rdl_glutes_start.png'),
  rdl_glutes_end: require('../../assets/exercises/rdl_glutes_end.png'),
  //step_ups_glutes_start: require('../../assets/exercises/step_ups_glutes_start.png'),
  //step_ups_glutes_end: require('../../assets/exercises/step_ups_glutes_end.png'),
  //lateral_band_walk_start: require('../../assets/exercises/lateral_band_walk_start.png'),
  //lateral_band_walk_end: require('../../assets/exercises/lateral_band_walk_end.png'),
  //clamshells_start: require('../../assets/exercises/clamshells_start.png'),
  //clamshells_end: require('../../assets/exercises/clamshells_end.png'),
  donkey_kicks_start: require('../../assets/exercises/donkey_kicks_start.png'),
  donkey_kicks_end: require('../../assets/exercises/donkey_kicks_end.png'),
  //fire_hydrants_start: require('../../assets/exercises/fire_hydrants_start.png'),
  //fire_hydrants_end: require('../../assets/exercises/fire_hydrants_end.png'),
  //frog_pumps_start: require('../../assets/exercises/frog_pumps_start.png'),
  //frog_pumps_end: require('../../assets/exercises/frog_pumps_end.png'),

  // CALVES (2)
  standing_calf_raise_barbell_start: require('../../assets/exercises/standing_calf_raise_barbell_start.png'),
  standing_calf_raise_barbell_end: require('../../assets/exercises/standing_calf_raise_barbell_end.png'),
  standing_calf_raise_dumbbell_start: require('../../assets/exercises/standing_calf_raise_dumbbell_start.png'),
  standing_calf_raise_dumbbell_end: require('../../assets/exercises/standing_calf_raise_dumbbell_end.png'),
  standing_calf_raise_single_start: require('../../assets/exercises/standing_calf_raise_single_start.png'),
  standing_calf_raise_single_end: require('../../assets/exercises/standing_calf_raise_single_end.png'),
  seated_calf_raise_start: require('../../assets/exercises/seated_calf_raise_start.png'),
  seated_calf_raise_end: require('../../assets/exercises/seated_calf_raise_end.png'),
  leg_press_calf_raise_start: require('../../assets/exercises/leg_press_calf_raise_start.png'),
  leg_press_calf_raise_end: require('../../assets/exercises/leg_press_calf_raise_end.png'),
  //donkey_calf_raise_start: require('../../assets/exercises/donkey_calf_raise_start.png'),
  //donkey_calf_raise_end: require('../../assets/exercises/donkey_calf_raise_end.png'),
  //jump_rope_start: require('../../assets/exercises/jump_rope_start.png'),
  //jump_rope_end: require('../../assets/exercises/jump_rope_end.png'),
  //calf_raise_bodyweight_start: require('../../assets/exercises/calf_raise_bodyweight_start.png'),
  //calf_raise_bodyweight_end: require('../../assets/exercises/calf_raise_bodyweight_end.png'),

  // CORE (7)
  crunches_start: require('../../assets/exercises/crunches_start.png'),
  crunches_end: require('../../assets/exercises/crunches_end.png'),
  reverse_crunches_start: require('../../assets/exercises/reverse_crunches_start.png'),
  reverse_crunches_end: require('../../assets/exercises/reverse_crunches_end.png'),
  //bicycle_crunches_start: require('../../assets/exercises/bicycle_crunches_start.png'),
  //bicycle_crunches_end: require('../../assets/exercises/bicycle_crunches_end.png'),
  sit_ups_start: require('../../assets/exercises/sit_ups_start.png'),
  sit_ups_end: require('../../assets/exercises/sit_ups_end.png'),
  //decline_sit_ups_start: require('../../assets/exercises/decline_sit_ups_start.png'),
  //decline_sit_ups_end: require('../../assets/exercises/decline_sit_ups_end.png'),
  //weighted_decline_sit_ups_start: require('../../assets/exercises/weighted_decline_sit_ups_start.png'),
  //weighted_decline_sit_ups_end: require('../../assets/exercises/weighted_decline_sit_ups_end.png'),
  hanging_leg_raise_start: require('../../assets/exercises/hanging_leg_raise_start.png'),
  hanging_leg_raise_end: require('../../assets/exercises/hanging_leg_raise_end.png'),
  hanging_knee_raise_start: require('../../assets/exercises/hanging_leg_raise_start.png'),
  hanging_knee_raise_end: require('../../assets/exercises/hanging_leg_raise_end.png'),
  //hanging_oblique_knee_raise_start: require('../../assets/exercises/hanging_oblique_knee_raise_start.png'),
  //hanging_oblique_knee_raise_end: require('../../assets/exercises/hanging_oblique_knee_raise_end.png'),
  //toes_to_bar_start: require('../../assets/exercises/toes_to_bar_start.png'),
  //toes_to_bar_end: require('../../assets/exercises/toes_to_bar_end.png'),
  //windshield_wipers_start: require('../../assets/exercises/windshield_wipers_start.png'),
  //windshield_wipers_end: require('../../assets/exercises/windshield_wipers_end.png'),
  cable_crunch_start: require('../../assets/exercises/cable_crunch_start.png'),
  cable_crunch_end: require('../../assets/exercises/cable_crunch_end.png'),
  cable_woodchop_high_start: require('../../assets/exercises/cable_woodchop_high_start.png'),
  cable_woodchop_high_end: require('../../assets/exercises/cable_woodchop_high_end.png'),
  //cable_woodchop_low_start: require('../../assets/exercises/cable_woodchop_low_start.png'),
  //cable_woodchop_low_end: require('../../assets/exercises/cable_woodchop_low_end.png'),
  //pallof_press_start: require('../../assets/exercises/pallof_press_start.png'),
  //pallof_press_end: require('../../assets/exercises/pallof_press_end.png'),
  plank_start: require('../../assets/exercises/plank_start.png'),
  plank_end: require('../../assets/exercises/plank_end.png'),
  side_plank_start: require('../../assets/exercises/side_plank_start.png'),
  side_plank_end: require('../../assets/exercises/side_plank_end.png'),
  //weighted_plank_start: require('../../assets/exercises/weighted_plank_start.png'),
  //weighted_plank_end: require('../../assets/exercises/weighted_plank_end.png'),
  //mountain_climbers_start: require('../../assets/exercises/mountain_climbers_start.png'),
  //mountain_climbers_end: require('../../assets/exercises/mountain_climbers_end.png'),
  //dead_bug_start: require('../../assets/exercises/dead_bug_start.png'),
  //dead_bug_end: require('../../assets/exercises/dead_bug_end.png'),
  //bird_dog_start: require('../../assets/exercises/bird_dog_start.png'),
  //bird_dog_end: require('../../assets/exercises/bird_dog_end.png'),
  //ab_rollout_start: require('../../assets/exercises/ab_rollout_start.png'),
  //ab_rollout_end: require('../../assets/exercises/ab_rollout_end.png'),
  //russian_twist_start: require('../../assets/exercises/russian_twist_start.png'),
  //russian_twist_end: require('../../assets/exercises/russian_twist_end.png'),
  //v_ups_start: require('../../assets/exercises/v_ups_start.png'),
  //v_ups_end: require('../../assets/exercises/v_ups_end.png'),
  //l_sit_hold_start: require('../../assets/exercises/l_sit_hold_start.png'),
  //l_sit_hold_end: require('../../assets/exercises/l_sit_hold_end.png'),
  //hyperextension_core_start: require('../../assets/exercises/hyperextension_core_start.png'),
  //hyperextension_core_end: require('../../assets/exercises/hyperextension_core_end.png'),
  //superman_start: require('../../assets/exercises/superman_start.png'),
  //superman_end: require('../../assets/exercises/superman_end.png'),
  suitcase_carry_start: require('../../assets/exercises/suitcase_carry_start.png'),
  suitcase_carry_end: require('../../assets/exercises/suitcase_carry_end.png'),
};

// Placeholder image (create this file or it will show a colored box)
let placeholderImage = null;
try {
  placeholderImage = require('../../assets/exercises/placeholder.png');
} catch (e) {
  // Placeholder doesn't exist, will use colored box
}

const ExerciseImage = ({ 
  exerciseId, 
  size = 200, 
  animate = true,
  animationDuration = 2000, // Duration of each image display in ms
  crossFadeDuration = 500,   // Duration of cross-fade in ms
  style 
}) => {
  // Opacity for start image (1 = fully visible, 0 = hidden)
  const startOpacity = useRef(new Animated.Value(1)).current;
  const endOpacity = useRef(new Animated.Value(0)).current;
  const showingStart = useRef(true);

  // Get images for this exercise
  const startImage = exerciseImages[`${exerciseId}_start`];
  const endImage = exerciseImages[`${exerciseId}_end`];
  const hasImages = startImage && endImage;

  useEffect(() => {
    if (!animate || !hasImages) return;

    const crossFade = () => {
      if (showingStart.current) {
        // Fade from start to end
        Animated.parallel([
          Animated.timing(startOpacity, {
            toValue: 0,
            duration: crossFadeDuration,
            useNativeDriver: true,
          }),
          Animated.timing(endOpacity, {
            toValue: 1,
            duration: crossFadeDuration,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Fade from end to start
        Animated.parallel([
          Animated.timing(startOpacity, {
            toValue: 1,
            duration: crossFadeDuration,
            useNativeDriver: true,
          }),
          Animated.timing(endOpacity, {
            toValue: 0,
            duration: crossFadeDuration,
            useNativeDriver: true,
          }),
        ]).start();
      }
      showingStart.current = !showingStart.current;
    };

    const interval = setInterval(crossFade, animationDuration);

    return () => clearInterval(interval);
  }, [animate, hasImages, animationDuration, crossFadeDuration]);

  // If no images available, show placeholder
  if (!hasImages) {
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

  // True cross-fade: both images stacked, opacity animated in opposite directions
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Animated.Image
        source={startImage}
        style={[
          styles.image,
          styles.stackedImage,
          { width: size, height: size, opacity: startOpacity }
        ]}
        resizeMode="contain"
      />
      <Animated.Image
        source={endImage}
        style={[
          styles.image,
          styles.stackedImage,
          { width: size, height: size, opacity: endOpacity }
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

// Static version without animation (for lists, etc.)
export const ExerciseImageStatic = ({ exerciseId, size = 60, style }) => {
  const startImage = exerciseImages[`${exerciseId}_start`];
  
  if (!startImage) {
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
      source={startImage}
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

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
  // CHEST (5)
  bench_press_start: require('../../assets/exercises/bench_press_start.png'),
  bench_press_end: require('../../assets/exercises/bench_press_end.png'),
  incline_press_start: require('../../assets/exercises/incline_press_start.png'),
  incline_press_end: require('../../assets/exercises/incline_press_end.png'),
  dumbbell_flyes_start: require('../../assets/exercises/dumbbell_flyes_start.png'),
  dumbbell_flyes_end: require('../../assets/exercises/dumbbell_flyes_end.png'),
  //cable_crossover_start: require('../../assets/exercises/cable_crossover_start.png'),
  //cable_crossover_end: require('../../assets/exercises/cable_crossover_end.png'),
  pec_deck_start: require('../../assets/exercises/pec_deck_start.png'),
  pec_deck_end: require('../../assets/exercises/pec_deck_end.png'),
  // BACK (7)
  pullups_start: require('../../assets/exercises/pullups_start.png'),
  pullups_end: require('../../assets/exercises/pullups_end.png'),
  lat_pulldown_start: require('../../assets/exercises/lat_pulldown_start.png'),
  lat_pulldown_end: require('../../assets/exercises/lat_pulldown_end.png'),
  seated_cable_row_start: require('../../assets/exercises/seated_cable_row_start.png'),
  seated_cable_row_end: require('../../assets/exercises/seated_cable_row_end.png'),
  face_pulls_start: require('../../assets/exercises/face_pulls_start.png'),
  face_pulls_end: require('../../assets/exercises/face_pulls_end.png'),
  barbell_row_start: require('../../assets/exercises/barbell_row_start.png'),
  barbell_row_end: require('../../assets/exercises/barbell_row_end.png'),
  dumbbell_row_start: require('../../assets/exercises/dumbbell_row_start.png'),
  dumbbell_row_end: require('../../assets/exercises/dumbbell_row_end.png'),
  deadlift_start: require('../../assets/exercises/deadlift_start.png'),
  deadlift_end: require('../../assets/exercises/deadlift_end.png'),
  // SHOULDERS (5)
  cable_lateral_raise_start: require('../../assets/exercises/cable_lateral_raise_start.png'),
  cable_lateral_raise_end: require('../../assets/exercises/cable_lateral_raise_end.png'),
  db_shoulder_press_start: require('../../assets/exercises/db_shoulder_press_start.png'),
  db_shoulder_press_end: require('../../assets/exercises/db_shoulder_press_end.png'),
  lateral_raise_start: require('../../assets/exercises/lateral_raise_start.png'),
  lateral_raise_end: require('../../assets/exercises/lateral_raise_end.png'),
  overhead_press_start: require('../../assets/exercises/overhead_press_start.png'),
  overhead_press_end: require('../../assets/exercises/overhead_press_end.png'),
  rear_delt_fly_start: require('../../assets/exercises/rear_delt_fly_start.png'),
  rear_delt_fly_end: require('../../assets/exercises/rear_delt_fly_end.png'),
  // BICEPS (5)
  barbell_curl_start: require('../../assets/exercises/barbell_curl_start.png'),
  barbell_curl_end: require('../../assets/exercises/barbell_curl_end.png'),
  ez_bar_curl_start: require('../../assets/exercises/ez_bar_curl_start.png'),
  ez_bar_curl_end: require('../../assets/exercises/ez_bar_curl_end.png'),
  preacher_curl_start: require('../../assets/exercises/preacher_curl_start.png'),
  preacher_curl_end: require('../../assets/exercises/preacher_curl_end.png'),
  hammer_curl_start: require('../../assets/exercises/hammer_curl_start.png'),
  hammer_curl_end: require('../../assets/exercises/hammer_curl_end.png'),
  cable_curl_start: require('../../assets/exercises/cable_curl_start.png'),
  cable_curl_end: require('../../assets/exercises/cable_curl_end.png'),
  // TRICEPS (5)
  close_grip_bench_start: require('../../assets/exercises/close_grip_bench_start.png'),
  close_grip_bench_end: require('../../assets/exercises/close_grip_bench_end.png'),
  skull_crushers_start: require('../../assets/exercises/skull_crushers_start.png'),
  skull_crushers_end: require('../../assets/exercises/skull_crushers_end.png'),
  rope_pushdown_start: require('../../assets/exercises/rope_pushdown_start.png'),
  rope_pushdown_end: require('../../assets/exercises/rope_pushdown_end.png'),
  //overhead_extension_start: require('../../assets/exercises/overhead_extension_start.png'),
  //overhead_extension_end: require('../../assets/exercises/overhead_extension_end.png'),
  dips_start: require('../../assets/exercises/dips_start.png'),
  dips_end: require('../../assets/exercises/dips_end.png'),
  // QUADRICEPS (6)
  back_squat_start: require('../../assets/exercises/back_squat_start.png'),
  back_squat_end: require('../../assets/exercises/back_squat_end.png'),
  front_squat_start: require('../../assets/exercises/front_squat_start.png'),
  front_squat_end: require('../../assets/exercises/front_squat_end.png'),
  //goblet_squat_start: require('../../assets/exercises/goblet_squat_start.png'),
  //goblet_squat_end: require('../../assets/exercises/goblet_squat_end.png'),
  lunges_start: require('../../assets/exercises/lunges_start.png'),
  lunges_end: require('../../assets/exercises/lunges_end.png'),
  bulgarian_split_squat_start: require('../../assets/exercises/bulgarian_split_squat_start.png'),
  bulgarian_split_squat_end: require('../../assets/exercises/bulgarian_split_squat_end.png'),
  leg_extension_start: require('../../assets/exercises/leg_extension_start.png'),
  leg_extension_end: require('../../assets/exercises/leg_extension_end.png'),
  // HAMSTRINGS (4)
  //romanian_deadlift_start: require('../../assets/exercises/romanian_deadlift_start.png'),
  //romanian_deadlift_end: require('../../assets/exercises/romanian_deadlift_end.png'),
  lying_leg_curl_start: require('../../assets/exercises/lying_leg_curl_start.png'),
  lying_leg_curl_end: require('../../assets/exercises/lying_leg_curl_end.png'),
  good_mornings_start: require('../../assets/exercises/good_mornings_start.png'),
  good_mornings_end: require('../../assets/exercises/good_mornings_end.png'),
  //cable_pull_through_start: require('../../assets/exercises/cable_pull_through_start.png'),
  //cable_pull_through_end: require('../../assets/exercises/cable_pull_through_end.png'),
  // GLUTES (4)
  hip_thrust_start: require('../../assets/exercises/hip_thrust_start.png'),
  hip_thrust_end: require('../../assets/exercises/hip_thrust_end.png'),
  cable_kickback_start: require('../../assets/exercises/cable_kickback_start.png'),
  cable_kickback_end: require('../../assets/exercises/cable_kickback_end.png'),
  sumo_deadlift_start: require('../../assets/exercises/sumo_deadlift_start.png'),
  sumo_deadlift_end: require('../../assets/exercises/sumo_deadlift_end.png'),
  glute_bridge_start: require('../../assets/exercises/glute_bridge_start.png'),
  glute_bridge_end: require('../../assets/exercises/glute_bridge_end.png'),
  // CALVES (2)
  standing_calf_raise_start: require('../../assets/exercises/standing_calf_raise_start.png'),
  standing_calf_raise_end: require('../../assets/exercises/standing_calf_raise_end.png'),
  seated_calf_raise_start: require('../../assets/exercises/seated_calf_raise_start.png'),
  seated_calf_raise_end: require('../../assets/exercises/seated_calf_raise_end.png'),
  // CORE (7)
  hanging_leg_raise_start: require('../../assets/exercises/hanging_leg_raise_start.png'),
  hanging_leg_raise_end: require('../../assets/exercises/hanging_leg_raise_end.png'),
  hanging_leg_raise_start: require('../../assets/exercises/hanging_leg_raise_start.png'),
  hanging_leg_raise_end: require('../../assets/exercises/hanging_leg_raise_end.png'),
  cable_woodchop_start: require('../../assets/exercises/cable_woodchop_start.png'),
  cable_woodchop_end: require('../../assets/exercises/cable_woodchop_end.png'),
  plank_start: require('../../assets/exercises/plank_start.png'),
  plank_end: require('../../assets/exercises/plank_end.png'),
  //russian_twist_start: require('../../assets/exercises/russian_twist_start.png'),
  //russian_twist_end: require('../../assets/exercises/russian_twist_end.png'),
  //ab_rollout_start: require('../../assets/exercises/ab_rollout_start.png'),
  //ab_rollout_end: require('../../assets/exercises/ab_rollout_end.png'),
  //hyperextension_start: require('../../assets/exercises/hyperextension_start.png'),
  //hyperextension_end: require('../../assets/exercises/hyperextension_end.png'),
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

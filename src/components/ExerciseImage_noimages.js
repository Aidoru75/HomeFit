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
  // bench_press_start: require('../../assets/exercises/bench_press_start.png'),
  // bench_press_end: require('../../assets/exercises/bench_press_end.png'),
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

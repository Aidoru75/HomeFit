# Exercise Images Folder

## Naming Convention

Place exercise images in this folder using the following naming format:

```
{exercise_id}_start.png  - Starting position of the exercise
{exercise_id}_end.png    - Ending position of the exercise
```

## Exercise IDs

Use these exact IDs for your image files:

### Chest
- bench_press
- incline_press
- dumbbell_flyes
- cable_crossover
- pec_deck

### Back
- pullups
- lat_pulldown
- seated_cable_row
- face_pulls
- barbell_row
- dumbbell_row
- deadlift

### Shoulders
- overhead_press
- db_shoulder_press
- lateral_raise
- rear_delt_fly
- cable_lateral_raise

### Biceps
- barbell_curl
- ez_bar_curl
- preacher_curl
- hammer_curl
- cable_curl

### Triceps
- close_grip_bench
- skull_crushers
- rope_pushdown
- overhead_extension
- dips

### Quadriceps
- back_squat
- front_squat
- goblet_squat
- lunges
- bulgarian_split_squat
- leg_extension

### Hamstrings
- romanian_deadlift
- lying_leg_curl
- good_mornings
- cable_pull_through

### Glutes
- hip_thrust
- cable_kickback
- sumo_deadlift
- glute_bridge

### Calves
- standing_calf_raise
- seated_calf_raise

### Core
- hanging_leg_raise
- cable_crunch
- cable_woodchop
- plank
- russian_twist
- ab_rollout
- hyperextension

## Example

For the Barbell Bench Press exercise:
- bench_press_start.png (lying on bench, bar at chest)
- bench_press_end.png (arms extended, bar at top)

## Image Specifications

- **Dimensions**: 700 x 700 pixels
- **Format**: PNG (recommended) or JPG
- **Background**: Transparent or solid color

## Placeholder

If you want a default placeholder image for exercises without images:
- Create a file named `placeholder.png` in this folder

## After Adding Images

After adding image files, you need to register them in the app:

1. Open `src/components/ExerciseImage.js`
2. Find the `exerciseImages` object (around line 30)
3. Add require statements for your images:

```javascript
const exerciseImages = {
  bench_press_start: require('../../assets/exercises/bench_press_start.png'),
  bench_press_end: require('../../assets/exercises/bench_press_end.png'),
  // Add more as needed...
};
```

4. Save and restart Expo

The app will automatically use these images with a cross-fade animation between start and end positions.

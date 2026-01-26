# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HomeFit is an Expo React Native fitness application that provides a comprehensive exercise library, workout routine management, and training session tracking. The app supports bilingual content (English/Spanish) and features equipment-based exercise filtering.

## Development Commands

### Running the App
- `npm start` or `expo start` - Start the Expo development server
- `npm run start:clear` or `expo start -c` - Start with cache cleared
- `npm run android` or `expo run:android` - Run on Android device/emulator
- `npm run ios` or `expo run:ios` - Run on iOS device/simulator
- `npm run web` or `expo start --web` - Run in web browser

### Building
- Use EAS Build for production builds: `eas build --platform android --profile preview`
- Configuration in [eas.json](eas.json) (preview profile creates APK instead of AAB)

## Project Architecture

### Navigation Structure
The app uses React Navigation with a bottom tab navigator. All main screens are accessible via tabs except TrainingScreen, which is hidden from the tab bar but accessible programmatically. The tab bar is hidden when TrainingScreen is active.

**Main tabs**: Home → Exercises → Routines → Profile → Settings
**Hidden screen**: Training (accessed from Home/Routines)

### Data Layer ([src/storage/storage.js](src/storage/storage.js))
All app data is persisted locally using AsyncStorage. No backend server or API.

**Storage keys**:
- `homefit_routines` - User-created workout routines
- `homefit_last_workout` - Most recent workout session
- `homefit_history` - Last 100 workout sessions
- `homefit_settings` - User preferences (name, height, weight, age, sex, language, sound)
- `homefit_excluded_exercises` - Exercises hidden from selection
- `homefit_available_equipment` - Equipment user has access to

**Important**: Exercise exclusion is automatically calculated based on available equipment. When equipment selection changes, excluded exercises are updated accordingly via `updateExcludedByEquipment()`.

### Exercise System ([src/data/exercises.js](src/data/exercises.js))
The app includes 199 pre-defined exercises covering all major muscle groups. Each exercise object contains:
- `id` - Unique identifier
- `name` - Bilingual object `{ en: string, es: string }`
- `muscleGroup` - Primary muscle group targeted
- `equipment` - Array of equipment IDs required (empty for bodyweight)
- `weightType` - 'barbell', 'dumbbell', 'bodyweight', 'machine', 'cable', or 'other'
- `description` - Bilingual exercise instructions
- `bmc` - Base metabolic cost for calorie calculation
- `wf` - Weight factor (0 for bodyweight exercises)

**Exercise images**: Located in `assets/exercises/` as PNG files. Naming convention: `{exercise_id}_start.png` and `{exercise_id}_end.png`. The ExerciseImage component handles loading and fallback.

### Calorie Estimation System
TrainingScreen calculates personalized calorie burn using the Mifflin-St Jeor equation combined with exercise-specific metabolic costs. The calculation considers:
- User profile (weight, height, age, sex from settings)
- Exercise `bmc` and `wf` values for each exercise
- Workout duration and completed sets/reps

### QR Routine Sharing
Users can share routines via QR codes generated with `react-native-qrcode-svg`. Other users can scan QR codes using `expo-camera` to import routines.

### Equipment System ([src/data/equipment.js](src/data/equipment.js))
Equipment definitions with bilingual names. Users select available equipment in Settings, which automatically filters exercises. An exercise is excluded if the user doesn't have ALL required equipment.

### Internationalization
The app supports English and Spanish via the translations system in [src/data/translations.js](src/data/translations.js). Language setting is stored in AsyncStorage and loaded on app start. All user-facing strings should use the `t()` function from the translations object.

**Pattern**: Store bilingual content as objects with `en` and `es` keys, then select based on current language setting.

### Theming ([src/theme.js](src/theme.js))
Centralized design tokens exported as constants:
- `colors` - Semantic color palette including muscle group colors
- `spacing` - Consistent spacing scale (xs to xl)
- `borderRadius` - Border radius values
- `fontSize` - Font size scale
- `fonts` - Custom font family names (JosefinSans variants + ArialNarrow)
- `shadows` - Pre-configured shadow styles

**Custom fonts**: Loaded via expo-font in App.js. Font files in `assets/fonts/`.

### Screen Structure
Each screen in [src/screens/](src/screens/) is a functional component that handles its own state management. Screens use React Navigation hooks (`useNavigation`, `useFocusEffect`) and load data from storage when focused.

**Key patterns**:
- Use `useFocusEffect` to reload data when screen comes into focus
- Load language setting from storage to display translated content
- Use theme constants for consistent styling

### TrainingScreen Workflow
The active workout screen has complex state management:
- **State tracking**: Current exercise index, set index, rest timers, modifications to reps/weights
- **Background handling**: Uses `restEndTimeRef` timestamp to correctly calculate remaining rest time when app returns from background
- **Modification tracking**: Changes to reps/weights during workout are stored in `modifiedExercises` state and saved to the routine on workout completion
- **Navigation blocking**: Prevents accidental exit with unsaved changes

### Routine Data Structure
Routines stored in AsyncStorage follow this structure:
```javascript
{
  id: string,           // UUID
  name: string,         // Routine name
  restBetweenSets: number,      // Seconds (default 60)
  restBetweenExercises: number, // Seconds (default 90)
  days: [{
    name: string,       // Day name
    customName: string, // Optional user-defined name
    exercises: [{
      exerciseId: string,
      sets: number,
      reps: number[],   // Per-set reps
      weights: number[] // Per-set weights in kg
    }]
  }]
}
```

### Audio System
The app uses expo-audio for workout timer sounds. Sound settings (enabled/volume) are stored in settings. Audio files should be in `assets/audio/` if needed.

### Platform-Specific Behavior
- **Android**: Navigation bar is configured to auto-hide (overlay-swipe) in App.js
- **iOS**: Tab bar respects safe areas
- App requires audio permissions on Android (already configured in app.json)

## File Organization

```
HomeFit/
├── App.js              # Root component, navigation setup, font loading
├── app.json            # Expo configuration
├── eas.json            # EAS Build configuration
├── src/
│   ├── components/     # Reusable components (e.g., ExerciseImage)
│   ├── data/           # Static data and translations
│   │   ├── exercises.js
│   │   ├── equipment.js
│   │   └── translations.js
│   ├── screens/        # Screen components
│   │   ├── HomeScreen.js
│   │   ├── ExercisesScreen.js
│   │   ├── RoutinesScreen.js
│   │   ├── TrainingScreen.js
│   │   ├── ProfileScreen.js
│   │   └── SettingsScreen.js
│   ├── storage/        # AsyncStorage wrapper functions
│   │   └── storage.js
│   └── theme.js        # Design tokens
└── assets/
    ├── fonts/          # Custom font files (JosefinSans, Arial Narrow)
    ├── icons/          # Tab bar icons (PNG)
    ├── exercises/      # Exercise demonstration images
    └── audio/          # Sound files for training
```

## Key Considerations

### Adding New Exercises
1. Add exercise object to `exercises` array in [src/data/exercises.js](src/data/exercises.js)
2. Include bilingual name and description
3. Optionally add exercise images to `assets/exercises/` following naming convention
4. Specify required equipment array (use IDs from equipment.js)

### Adding New Equipment
1. Add equipment definition to [src/data/equipment.js](src/data/equipment.js) with bilingual name
2. Equipment filtering is automatic - no additional code needed
3. Update exercise definitions that use the new equipment

### Modifying Storage Schema
When adding new AsyncStorage keys, update the KEYS object in [src/storage/storage.js](src/storage/storage.js) and add corresponding load/save functions. Remember to update `clearAllData()` if the key should be cleared when user resets app data.

### Working with Translations
Add new UI strings to [src/data/translations.js](src/data/translations.js) under both `en` and `es` keys. Use descriptive key names that indicate where the string is used. Access translations in components by loading settings to get current language.

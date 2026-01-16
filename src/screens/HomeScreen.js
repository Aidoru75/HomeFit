// Home Screen - Dashboard with quick actions and last workout info
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontSize, shadows } from '../theme';
import { getLastWorkout, loadRoutines, loadSettings } from '../storage/storage';
import { t } from '../data/translations';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [lastWorkout, setLastWorkout] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [suggestedNext, setSuggestedNext] = useState(null);
  const [settings, setSettings] = useState({ language: 'en' });

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const last = await getLastWorkout();
    const allRoutines = await loadRoutines();
    const userSettings = await loadSettings();
    
    setLastWorkout(last);
    setRoutines(allRoutines);
    setSettings(userSettings);
    
    // Calculate suggested next workout
    if (last && allRoutines.length > 0) {
      const routine = allRoutines.find(r => r.id === last.routineId);
      if (routine && routine.days) {
        const nextDayIndex = (last.dayIndex + 1) % routine.days.length;
        const nextDay = routine.days[nextDayIndex];
        setSuggestedNext({
          routine,
          dayIndex: nextDayIndex,
          dayName: nextDay?.name || `Day ${nextDayIndex + 1}`,
          isEmpty: !nextDay?.exercises || nextDay.exercises.length === 0,
        });
      }
    }
  };

  const lang = settings.language || 'en';

  const startSuggestedWorkout = () => {
    if (suggestedNext) {
      if (suggestedNext.isEmpty) {
        Alert.alert(
          '⚠️',
          t('emptyDayWarning', lang),
          [{ text: 'OK' }]
        );
        return;
      }
      navigation.navigate('Training', {
        routineId: suggestedNext.routine.id,
        dayIndex: suggestedNext.dayIndex,
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('today', lang);
    if (diffDays === 1) return t('yesterday', lang);
    if (diffDays < 7) return `${diffDays} ${t('daysAgo', lang)}`;
    return date.toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.greeting}>💪 {t('appName', lang)}</Text>
        <Text style={styles.subtitle}>{t('tagline', lang)}</Text>
      </View>

      {/* Suggested Next Workout */}
      {suggestedNext ? (
        <TouchableOpacity 
          style={[
            styles.suggestedCard,
            suggestedNext.isEmpty && styles.suggestedCardDisabled
          ]} 
          onPress={startSuggestedWorkout}
        >
          <View style={styles.suggestedBadge}>
            <Text style={styles.suggestedBadgeText}>{t('continue', lang)}</Text>
          </View>
          <Text style={styles.suggestedTitle}>{suggestedNext.routine.name}</Text>
          <Text style={styles.suggestedDay}>{suggestedNext.dayName}</Text>
          {suggestedNext.isEmpty && (
            <Text style={styles.emptyWarning}>⚠️ {t('noExercisesAdded', lang)}</Text>
          )}
          <View style={[
            styles.suggestedButton,
            suggestedNext.isEmpty && styles.suggestedButtonDisabled
          ]}>
            <Text style={[
              styles.suggestedButtonText,
              suggestedNext.isEmpty && styles.suggestedButtonTextDisabled
            ]}>
              {t('startWorkout', lang)} →
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🏋️</Text>
          <Text style={styles.emptyTitle}>{t('readyToTrain', lang)}</Text>
          <Text style={styles.emptySubtitle}>
            {routines.length === 0 
              ? t('createFirstRoutine', lang)
              : t('selectRoutine', lang)}
          </Text>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>{t('quickActions', lang)}</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Routines')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>{t('routines', lang)}</Text>
          <Text style={styles.actionCount}>{routines.length} {t('saved', lang)}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Exercises')}
        >
          <Text style={styles.actionIcon}>💪</Text>
          <Text style={styles.actionText}>{t('exercises', lang)}</Text>
          <Text style={styles.actionCount}>50 {t('exercisesCount', lang)}</Text>
        </TouchableOpacity>
      </View>

      {/* Last Workout Info */}
      {lastWorkout && (
        <View style={styles.lastWorkoutCard}>
          <Text style={styles.lastWorkoutLabel}>{t('lastWorkout', lang)}</Text>
          <Text style={styles.lastWorkoutTitle}>{lastWorkout.routineName}</Text>
          <Text style={styles.lastWorkoutDay}>{lastWorkout.dayName}</Text>
          <Text style={styles.lastWorkoutDate}>
            {formatDate(lastWorkout.completedAt)}
          </Text>
        </View>
      )}

      {/* My Routines Quick List */}
      {routines.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>{t('myRoutines', lang)}</Text>
          {routines.slice(0, 3).map((routine) => (
            <TouchableOpacity
              key={routine.id}
              style={styles.routineItem}
              onPress={() => navigation.navigate('Routines', { routineId: routine.id })}
            >
              <View style={styles.routineInfo}>
                <Text style={styles.routineName}>{routine.name}</Text>
                <Text style={styles.routineDays}>
                  {routine.days?.length || 0} {t('days', lang).toLowerCase()} • {routine.restBetweenSets || 60}s {t('rest', lang).toLowerCase()}
                </Text>
              </View>
              <Text style={styles.routineArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingBottom: 30,
    paddingHorizontal: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.white,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  suggestedCard: {
    backgroundColor: colors.accent,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  suggestedCardDisabled: {
    backgroundColor: colors.primaryLight,
  },
  suggestedBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  suggestedBadgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  suggestedTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  suggestedDay: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  emptyWarning: {
    fontSize: fontSize.sm,
    color: colors.warning,
    marginTop: spacing.sm,
  },
  suggestedButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  suggestedButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  suggestedButtonText: {
    color: colors.accent,
    fontWeight: 'bold',
    fontSize: fontSize.md,
  },
  suggestedButtonTextDisabled: {
    color: colors.white,
  },
  emptyCard: {
    backgroundColor: colors.card,
    margin: spacing.md,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.small,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.small,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionCount: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  lastWorkoutCard: {
    backgroundColor: colors.card,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  lastWorkoutLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  lastWorkoutTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  lastWorkoutDay: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  lastWorkoutDate: {
    fontSize: fontSize.sm,
    color: colors.accent,
    marginTop: spacing.sm,
  },
  routineItem: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.small,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  routineDays: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  routineArrow: {
    fontSize: fontSize.lg,
    color: colors.accent,
  },
  bottomPadding: {
    height: 100,
  },
});

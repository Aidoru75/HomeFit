// Home Screen - Dashboard with quick actions and last workout info
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, borderRadius, fontSize, shadows, fonts } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { getLastWorkout, getHistory, loadRoutines, loadSettings } from '../storage/storage';
import { t } from '../data/translations';
import { IS_PRO } from '../config';

const faviconIcon = IS_PRO
  ? require('../../assets/icons/homeicon.png')
  : require('../../assets/icons/homeicon_f.png');

const dayKeys = ['dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri', 'daySat', 'daySun'];

const quotes = [
  { en: 'The only bad workout is the one that didn\'t happen.', es: 'El único mal entrenamiento es el que no se hizo.' },
  { en: 'Your body can stand almost anything. It\'s your mind you have to convince.', es: 'Tu cuerpo aguanta casi todo. Es tu mente la que debes convencer.' },
  { en: 'Discipline is choosing between what you want now and what you want most.', es: 'Disciplina es elegir entre lo que quieres ahora y lo que más deseas.' },
  { en: 'Strength does not come from the body. It comes from the will.', es: 'La fuerza no viene del cuerpo. Viene de la voluntad.' },
  { en: 'The pain you feel today will be the strength you feel tomorrow.', es: 'El dolor que sientes hoy será la fuerza que sentirás mañana.' },
  { en: 'Success starts with self-discipline.', es: 'El éxito empieza con la autodisciplina.' },
  { en: 'Don\'t wish for it. Work for it.', es: 'No lo desees. Trabaja por ello.' },
  { en: 'Small daily improvements lead to stunning results.', es: 'Pequeñas mejoras diarias llevan a resultados asombrosos.' },
  { en: 'The difference between try and triumph is a little umph.', es: 'La diferencia entre intentar y triunfar es un poco de esfuerzo extra.' },
  { en: 'Fall in love with the process and the results will come.', es: 'Enamórate del proceso y los resultados llegarán.' },
  { en: 'You don\'t have to be extreme, just consistent.', es: 'No tienes que ser extremo, solo constante.' },
  { en: 'What seems impossible today will one day be your warm-up.', es: 'Lo que hoy parece imposible, un día será tu calentamiento.' },
  { en: 'Motivation gets you started. Habit keeps you going.', es: 'La motivación te pone en marcha. El hábito te mantiene.' },
  { en: 'Train insane or remain the same.', es: 'Entrena con locura o quédate igual.' },
  { en: 'Every rep counts. Every set matters.', es: 'Cada repetición cuenta. Cada serie importa.' },
  { en: 'Champions are made when nobody is watching.', es: 'Los campeones se forjan cuando nadie los mira.' },
  { en: 'Be stronger than your excuses.', es: 'Sé más fuerte que tus excusas.' },
  { en: 'Progress, not perfection.', es: 'Progreso, no perfección.' },
  { en: 'Push yourself, because no one else is going to do it for you.', es: 'Supérate, porque nadie más lo hará por ti.' },
  { en: 'Sweat is just fat crying.', es: 'El sudor es solo grasa llorando.' },
];

const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
};

const getWeekDays = (history) => {
  const now = new Date();
  const todayDow = now.getDay(); // 0=Sun, 1=Mon, ...
  const mondayOffset = todayDow === 0 ? 6 : todayDow - 1; // days since Monday
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);

  // Build set of local date strings that have workouts this week
  const workoutDates = new Set();
  if (history) {
    history.forEach(w => {
      const d = new Date(w.completedAt);
      if (d >= monday) {
        workoutDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    });
  }

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const isToday = i === mondayOffset;
    const isFuture = d > now;
    days.push({ trained: workoutDates.has(key), isToday, isFuture });
  }
  return days;
};

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [lastWorkout, setLastWorkout] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [suggestedNext, setSuggestedNext] = useState(null);
  const [settings, setSettings] = useState({ language: 'en' });
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const last = await getLastWorkout();
    const allRoutines = await loadRoutines();
    const userSettings = await loadSettings();
    const history = await getHistory();

    setLastWorkout(last);
    setRoutines(allRoutines);
    setSettings(userSettings);
    setWeekDays(getWeekDays(history));
    
    // Calculate suggested next workout
    if (last && allRoutines.length > 0) {
      const routine = allRoutines.find(r => r.id === last.routineId);
      if (routine && routine.days) {
        const nextDayIndex = (last.dayIndex + 1) % routine.days.length;
        const nextDay = routine.days[nextDayIndex];
        setSuggestedNext({
          routine,
          dayIndex: nextDayIndex,
          dayName: nextDay?.customName || nextDay?.name || `Day ${nextDayIndex + 1}`,
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
    // Compare calendar dates, not elapsed hours
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('today', lang);
    if (diffDays === 1) return t('yesterday', lang);
    if (diffDays < 7) return `${diffDays} ${t('daysAgo', lang)}`;
    return date.toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.greetingRow}>
          <Image source={faviconIcon} style={styles.faviconIcon} />
        </View>
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
          <Image source={require('../../assets/icons/starter.png')} style={styles.emptyIconImage} />
          <Text style={styles.emptyTitle}>{t('readyToTrain', lang)}</Text>
          {routines.length === 0 ? (
            <TouchableOpacity
              style={styles.accentButton}
              onPress={() => navigation.navigate('Routines')}
            >
              <Text style={styles.accentButtonText}>{t('createFirstRoutine', lang)}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.accentButton}
              onPress={() => navigation.navigate('Routines')}
            >
              <Text style={styles.accentButtonText}>{t('selectRoutine', lang)}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Quick Actions
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
      </View>*/}

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

      {/* Weekly Consistency */}
      <View style={styles.weekCard}>
        <Text style={styles.weekTitle}>{t('weeklyActivity', lang)}</Text>
        <View style={styles.weekRow}>
          {weekDays.map((day, i) => (
            <View key={i} style={styles.weekDayCol}>
              <View style={[
                styles.weekDot,
                day.trained && styles.weekDotFilled,
                day.isToday && styles.weekDotToday,
                day.isFuture && styles.weekDotFuture,
              ]} />
              <Text style={[
                styles.weekDayLabel,
                day.isToday && styles.weekDayLabelToday,
              ]}>
                {t(dayKeys[i], lang)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Motivational Quote */}
      <Text style={styles.quoteText}>
        &ldquo;{quotes[getDayOfYear() % quotes.length][lang]}&rdquo;
      </Text>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: {
    fontFamily: fonts.regular,
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingBottom: 30,
    paddingHorizontal: spacing.lg,
  },
  greetingRow: {
    width: '100%',
    alignItems: 'center',
  },
  faviconIcon: {
    width: 100,
    height: 100,
    marginRight: spacing.sm,
    resizeMode: 'contain',
  },
  subtitle: {
    textAlign: 'center',
    fontFamily: fonts.regular,
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
    backgroundColor: 'rgba(0,0,0,1)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  suggestedBadgeText: {
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: fontSize.xs,
  },
  suggestedTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: 'rgba(255,255,255,1)',
  },
  suggestedDay: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,1)',
    marginTop: spacing.xs,
  },
  emptyWarning: {
    fontFamily: fonts.regular,
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
    backgroundColor: colors.accent,
  },
  suggestedButtonText: {
    fontFamily: fonts.bold,
    color: colors.primary,
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
  emptyIconImage: {
    width: '60%',
    maxWidth: 250,
    aspectRatio: 1,
    marginBottom: spacing.md,
    resizeMode: 'contain',
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  accentButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  accentButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: fonts.regular,
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
    fontFamily: fonts.regular,
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  actionCount: {
    fontFamily: fonts.regular,
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
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  lastWorkoutTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  lastWorkoutDay: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  lastWorkoutDate: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.accent,
    marginTop: spacing.sm,
  },
  weekCard: {
    backgroundColor: colors.card,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  weekTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekDayCol: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  weekDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  weekDotFilled: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  weekDotToday: {
    borderColor: colors.textPrimary,
    borderWidth: 3,
  },
  weekDotFuture: {
    opacity: 0.3,
  },
  weekDayLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  weekDayLabelToday: {
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  quoteText: {
    fontFamily: fonts.regular,
    fontStyle: 'italic',
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    lineHeight: 24,
  },
  bottomPadding: {
    height: 100,
  },
});

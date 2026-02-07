// Stats Screen - Workout statistics and history
import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, shadows, fonts } from '../theme';
import { getHistory, loadSettings, clearHistory } from '../storage/storage';
import { muscleGroups } from '../data/exercises';
import { t } from '../data/translations';

const ITEMS_PER_PAGE = 10;
const CHART_HEIGHT = 180;
const screenWidth = Dimensions.get('window').width;

// Colors for different routine days
const DAY_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
];

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState({ language: 'en' });
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'calories'
  const histogramScrollRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const workoutHistory = await getHistory();
    const userSettings = await loadSettings();
    setHistory(workoutHistory);
    setSettings(userSettings);
    setLoaded(true);
  };

  const lang = settings.language || 'en';

  // Calculate statistics
  const totalWorkouts = history.length;

  // Use a stable "now" reference that only updates when data is loaded
  const now = useMemo(() => new Date(), [loaded, history]);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const workoutsThisWeek = history.filter(w =>
    new Date(w.completedAt) >= oneWeekAgo
  ).length;

  const workoutsThisMonth = history.filter(w =>
    new Date(w.completedAt) >= oneMonthAgo
  ).length;

  const totalCalories = history.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

  const totalDuration = history.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalMinutes = Math.round(totalDuration / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // Helper function to get date string in local timezone (YYYY-MM-DD format)
  const getLocalDateKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Get last 30 days data for histogram
  const last30DaysData = useMemo(() => {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const workoutsLast30 = history.filter(w => new Date(w.completedAt) >= thirtyDaysAgo);

    // Create a map of dayName to color
    const dayColorMap = {};
    let colorIndex = 0;

    workoutsLast30.forEach(w => {
      const key = `${w.routineName}|${w.dayName}`;
      if (!dayColorMap[key]) {
        dayColorMap[key] = DAY_COLORS[colorIndex % DAY_COLORS.length];
        colorIndex++;
      }
    });

    // Group workouts by date using consistent date key format
    const workoutsByDate = {};
    workoutsLast30.forEach(w => {
      const dateKey = getLocalDateKey(w.completedAt);
      if (!workoutsByDate[dateKey]) {
        workoutsByDate[dateKey] = [];
      }
      workoutsByDate[dateKey].push({
        ...w,
        color: dayColorMap[`${w.routineName}|${w.dayName}`],
      });
    });

    // Create array for last 30 days
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateKey = getLocalDateKey(date);
      const dayWorkouts = workoutsByDate[dateKey] || [];
      const totalCals = dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

      days.push({
        date,
        dayOfMonth: date.getDate(),
        workouts: dayWorkouts,
        calories: totalCals,
      });
    }

    return { days, dayColorMap };
  }, [history, now]);

  const maxCalories = useMemo(() => {
    return Math.max(...last30DaysData.days.map(d => d.calories), 100);
  }, [last30DaysData]);

  const formatShortDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const handleResetStats = () => {
    Alert.alert(
      t('resetStats', lang),
      t('resetStatsConfirm', lang),
      [
        { text: t('cancel', lang), style: 'cancel' },
        {
          text: t('delete', lang),
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setHistory([]);
            setCurrentPage(0);
          },
        },
      ]
    );
  };

  // Pagination
  const reversedHistory = [...history].reverse();
  const totalPages = Math.ceil(reversedHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = reversedHistory.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const renderOverviewTab = () => (
    <>
      {/* Stats Grid - 2 per row */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalWorkouts}</Text>
          <Text style={styles.statLabel}>{t('totalWorkouts', lang)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{workoutsThisWeek}</Text>
          <Text style={styles.statLabel}>{t('thisWeek', lang)}</Text>
        </View>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{workoutsThisMonth}</Text>
          <Text style={styles.statLabel}>{t('thisMonth', lang)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{Math.round(totalCalories)}</Text>
          <Text style={styles.statLabel}>{t('totalCalories', lang)}</Text>
        </View>
      </View>

      {/* Time Spent */}
      <View style={styles.timeCard}>
        <Text style={styles.timeLabel}>{t('totalTrainingTime', lang)}</Text>
        <Text style={styles.timeValue}>
          {totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${totalMinutes}m`}
        </Text>
      </View>
    </>
  );

  const renderCaloriesTab = () => {
    const { days, dayColorMap } = last30DaysData;
    const legendItems = Object.entries(dayColorMap).map(([key, color]) => {
      const separatorIndex = key.indexOf('|');
      const routineName = key.substring(0, separatorIndex);
      const dayName = key.substring(separatorIndex + 1);
      return { routineName, dayName, color };
    });

    return (
      <>
        {/* Histogram */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>{t('last30Days', lang)}</Text>

          <View style={styles.chartContainer}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
              <Text style={styles.yAxisLabel}>{maxCalories}</Text>
              <Text style={styles.yAxisLabel}>{Math.round(maxCalories / 2)}</Text>
              <Text style={styles.yAxisLabel}>0</Text>
            </View>

            {/* Bars */}
            <ScrollView
              ref={histogramScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.barsScrollView}
              contentContainerStyle={styles.barsContainer}
              onContentSizeChange={() => {
                histogramScrollRef.current?.scrollToEnd({ animated: false });
              }}
            >
              {days.map((day, index) => {
                const MIN_BAR_HEIGHT = 8; // Minimum visible height for any workout

                return (
                  <View key={index} style={styles.barColumn}>
                    <View style={styles.barWrapper}>
                      {day.workouts.length > 0 ? (
                        day.workouts.map((workout, wIndex) => {
                          const calories = workout.caloriesBurned || 0;
                          // Calculate height, but ensure minimum visibility
                          const calculatedHeight = calories > 0
                            ? (calories / maxCalories) * CHART_HEIGHT
                            : MIN_BAR_HEIGHT;
                          const workoutHeight = Math.max(calculatedHeight, MIN_BAR_HEIGHT);
                          return (
                            <View
                              key={wIndex}
                              style={[
                                styles.bar,
                                {
                                  height: workoutHeight,
                                  backgroundColor: workout.color || colors.accent,
                                },
                              ]}
                            />
                          );
                        })
                      ) : (
                        <View style={[styles.bar, styles.barEmpty]} />
                      )}
                    </View>
                    {(index === 0 || index === 14 || index === 29) && (
                      <Text style={styles.xAxisLabel}>{day.dayOfMonth}</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* Legend */}
          {legendItems.length > 0 && (
            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>{t('legend', lang)}</Text>
              <View style={styles.legendItems}>
                {legendItems.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText} numberOfLines={1}>
                      {item.dayName}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Monthly Total */}
        <View style={styles.monthlyTotalCard}>
          <Text style={styles.monthlyTotalLabel}>{t('caloriesThisMonth', lang)}</Text>
          <Text style={styles.monthlyTotalValue}>
            {Math.round(history
              .filter(w => new Date(w.completedAt) >= oneMonthAgo)
              .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)
            )} kcal
          </Text>
        </View>
      </>
    );
  };

  const formatVolume = (vol) => {
    if (vol >= 10000) return `${(vol / 1000).toFixed(1)}k`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return Math.round(vol).toString();
  };

  // Muscle groups from muscleColors (10 groups, no forearms)
  const MUSCLE_KEYS = Object.keys(colors.muscleColors);

  // Ideal balanced volume proportions (accounts for kg·reps bias: heavy compounds produce more)
  const BALANCED_PROPORTIONS = {
    back: 0.20,
    quads: 0.18,
    chest: 0.15,
    glutes: 0.12,
    shoulders: 0.10,
    hamstrings: 0.08,
    triceps: 0.06,
    biceps: 0.05,
    calves: 0.03,
    core: 0.03,
  };

  const renderWorkloadTab = () => {
    const volumeWorkouts = history.filter(w => w.muscleVolume && new Date(w.completedAt) >= oneMonthAgo);

    if (volumeWorkouts.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t('noVolumeData', lang)}</Text>
        </View>
      );
    }

    // Sum volume across last 30 days
    const totalVolume = {};
    volumeWorkouts.forEach(w => {
      Object.entries(w.muscleVolume).forEach(([muscle, vol]) => {
        totalVolume[muscle] = (totalVolume[muscle] || 0) + vol;
      });
    });

    // Build sorted array for horizontal bars
    const volumeEntries = MUSCLE_KEYS.map(id => ({
      id,
      name: muscleGroups.find(mg => mg.id === id)?.name[lang] || id,
      volume: totalVolume[id] || 0,
      color: colors.muscleColors[id],
    })).sort((a, b) => b.volume - a.volume);

    const maxVolume = Math.max(...volumeEntries.map(e => e.volume), 1);

    // Calculate balanced target for each muscle group
    const grandTotal = volumeEntries.reduce((sum, e) => sum + e.volume, 0);

    // Recent workouts with volume data (most recent first)
    const recentWorkouts = [...history]
      .filter(w => w.muscleVolume)
      .reverse()
      .slice(0, 20);

    return (
      <>
        {/* Last 30 Days Volume - Horizontal bars */}
        <View style={styles.chartCard}>
          <View style={styles.chartTitleRow}>
            <Text style={styles.chartTitle}>{t('last30DaysVolume', lang)}</Text>
            <TouchableOpacity
              onPress={() => Alert.alert(t('workloadHelp', lang), t('workloadHelpBody', lang))}
              style={styles.helpButton}
            >
              <Text style={styles.helpButtonText}>?</Text>
            </TouchableOpacity>
          </View>
          {volumeEntries.map(entry => {
            const targetVolume = grandTotal * (BALANCED_PROPORTIONS[entry.id] || 0);
            const targetPct = Math.min((targetVolume / maxVolume) * 100, 100);
            return (
              <View key={entry.id} style={styles.volumeBarRow}>
                <Text style={styles.volumeBarLabel} numberOfLines={1}>{entry.name}</Text>
                <View style={styles.volumeBarTrack}>
                  {entry.volume > 0 ? (
                    <View style={[styles.volumeBarFill, {
                      backgroundColor: entry.color,
                      width: `${Math.max((entry.volume / maxVolume) * 100, 3)}%`,
                    }]} />
                  ) : (
                    <View style={styles.volumeBarEmpty} />
                  )}
                  {targetPct > 0 && (
                    <View style={[styles.balanceMarker, { left: `${targetPct}%` }]} />
                  )}
                </View>
                <Text style={styles.volumeBarValue}>{formatVolume(entry.volume)}</Text>
              </View>
            );
          })}
        </View>

        {/* Recent Workouts - Stacked bars */}
        {recentWorkouts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('recentWorkouts', lang)}</Text>
            {recentWorkouts.map((workout, index) => {
              const totalVol = Object.values(workout.muscleVolume).reduce((sum, v) => sum + v, 0);
              if (totalVol === 0) return null;

              return (
                <View key={index} style={styles.workoutVolumeCard}>
                  <View style={styles.workoutVolumeHeader}>
                    <Text style={styles.workoutVolumeDate}>{formatShortDate(workout.completedAt)}</Text>
                    <Text style={styles.workoutVolumeName} numberOfLines={1}>
                      {workout.routineName} — {workout.dayName}
                    </Text>
                  </View>
                  <View style={styles.stackedBarContainer}>
                    {MUSCLE_KEYS.map(muscleId => {
                      const vol = workout.muscleVolume[muscleId] || 0;
                      if (vol === 0) return null;
                      const pct = (vol / totalVol) * 100;
                      return (
                        <View key={muscleId} style={[styles.stackedBarSegment, {
                          backgroundColor: colors.muscleColors[muscleId],
                          width: `${pct}%`,
                        }]} />
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>{t('statsTitle', lang)}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              {t('overview', lang)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'calories' && styles.tabActive]}
            onPress={() => setActiveTab('calories')}
          >
            <Text style={[styles.tabText, activeTab === 'calories' && styles.tabTextActive]}>
              {t('calories', lang)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'workload' && styles.tabActive]}
            onPress={() => setActiveTab('workload')}
          >
            <Text style={[styles.tabText, activeTab === 'workload' && styles.tabTextActive]}>
              {t('workload', lang)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'calories' && renderCaloriesTab()}
        {activeTab === 'workload' && renderWorkloadTab()}

        {/* Workout History */}
        <Text style={styles.sectionTitle}>{t('workoutHistory', lang)}</Text>

        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>{t('noWorkoutsYet', lang)}</Text>
            <Text style={styles.emptySubtitle}>{t('completeFirstWorkout', lang)}</Text>
          </View>
        ) : (
          <>
            <View style={styles.tableCard}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colDate]}>{t('date', lang)}</Text>
                <Text style={[styles.tableHeaderText, styles.colRoutine]}>{t('routine', lang)}</Text>
                <Text style={[styles.tableHeaderText, styles.colDay]}>{t('day', lang)}</Text>
                <Text style={[styles.tableHeaderText, styles.colDuration]}>{t('time', lang)}</Text>
                <Text style={[styles.tableHeaderText, styles.colCalories]}>kcal</Text>
              </View>

              {/* Table Rows */}
              {paginatedHistory.map((workout, index) => (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 && styles.tableRowEven
                  ]}
                >
                  <Text style={[styles.tableCell, styles.colDate]} numberOfLines={1}>
                    {formatShortDate(workout.completedAt)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colRoutine, styles.tableCellBold]} numberOfLines={1}>
                    {workout.routineName}
                  </Text>
                  <Text style={[styles.tableCell, styles.colDay]} numberOfLines={1}>
                    {workout.dayName}
                  </Text>
                  <Text style={[styles.tableCell, styles.colDuration]} numberOfLines={1}>
                    {formatDuration(workout.duration)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colCalories, styles.tableCellAccent]} numberOfLines={1}>
                    {workout.caloriesBurned ? Math.round(workout.caloriesBurned) : '--'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[styles.pageButton, currentPage === 0 && styles.pageButtonDisabled]}
                  onPress={goToPreviousPage}
                  disabled={currentPage === 0}
                >
                  <Text style={[styles.pageButtonText, currentPage === 0 && styles.pageButtonTextDisabled]}>
                    ←
                  </Text>
                </TouchableOpacity>

                <Text style={styles.pageInfo}>
                  {currentPage + 1} / {totalPages}
                </Text>

                <TouchableOpacity
                  style={[styles.pageButton, currentPage === totalPages - 1 && styles.pageButtonDisabled]}
                  onPress={goToNextPage}
                  disabled={currentPage === totalPages - 1}
                >
                  <Text style={[styles.pageButtonText, currentPage === totalPages - 1 && styles.pageButtonTextDisabled]}>
                    →
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Reset Stats Button */}
        {history.length > 0 && (
          <TouchableOpacity style={styles.resetButton} onPress={handleResetStats}>
            <Text style={styles.resetButtonText}>{t('resetStats', lang)}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  header: {
    backgroundColor: colors.primary,
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xxl,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    ...shadows.small,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.small,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    color: colors.accent,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  timeCard: {
    backgroundColor: colors.accent,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.medium,
  },
  timeLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.9,
  },
  timeValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxxl || 32,
    color: colors.white,
    marginTop: spacing.xs,
  },
  // Calories Tab
  chartCard: {
    backgroundColor: colors.card,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  chartTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  helpButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: fontSize.sm + 1,
  },
  chartContainer: {
    flexDirection: 'row',
    height: CHART_HEIGHT + 30,
  },
  yAxis: {
    width: 35,
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: spacing.xs,
  },
  yAxisLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  barsScrollView: {
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT + 20,
    paddingBottom: 20,
  },
  barColumn: {
    alignItems: 'center',
    width: 10,
    marginHorizontal: 1,
  },
  barWrapper: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 8,
    borderRadius: 2,
    minHeight: 2,
  },
  barEmpty: {
    backgroundColor: colors.border,
    height: 2,
  },
  xAxisLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  legendContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: spacing.xs,
  },
  legendText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    maxWidth: 100,
  },
  monthlyTotalCard: {
    backgroundColor: colors.accent,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.medium,
  },
  monthlyTotalLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.white,
  },
  monthlyTotalValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
  // Workload Tab
  volumeBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  volumeBarLabel: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    width: 80,
  },
  volumeBarTrack: {
    flex: 1,
    height: 16,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  volumeBarFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  volumeBarEmpty: {
    height: '100%',
    width: 2,
    backgroundColor: colors.border,
  },
  balanceMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.textPrimary,
    opacity: 0.5,
  },
  volumeBarValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    width: 40,
    textAlign: 'right',
  },
  workoutVolumeCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  workoutVolumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  workoutVolumeDate: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  workoutVolumeName: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  stackedBarContainer: {
    flexDirection: 'row',
    height: 20,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  stackedBarSegment: {
    height: '100%',
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
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  tableCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.small,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  tableHeaderText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    color: colors.white,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowEven: {
    backgroundColor: colors.background,
  },
  tableCell: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  tableCellBold: {
    fontFamily: fonts.bold,
  },
  tableCellAccent: {
    color: colors.accent,
    fontFamily: fonts.bold,
  },
  colDate: {
    width: 45,
  },
  colRoutine: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  colDay: {
    width: 70,
    paddingRight: spacing.xs,
  },
  colDuration: {
    width: 35,
    textAlign: 'right',
  },
  colCalories: {
    width: 40,
    textAlign: 'right',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    gap: spacing.md,
  },
  pageButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 44,
    alignItems: 'center',
  },
  pageButtonDisabled: {
    backgroundColor: colors.border,
  },
  pageButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.white,
  },
  pageButtonTextDisabled: {
    color: colors.textLight,
  },
  pageInfo: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    minWidth: 60,
    textAlign: 'center',
  },
  resetButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error || '#e74c3c',
    alignItems: 'center',
  },
  resetButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.error || '#e74c3c',
  },
  bottomPadding: {
    height: 100,
  },
});

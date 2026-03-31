// First-launch onboarding walkthrough
// Portrait: image on top, text below. Landscape: image left, text right.
// FREE and PRO have separate slide definitions — add free-XX.png images when ready.
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontSize, fonts } from '../theme';
import { t } from '../data/translations';
import { IS_PRO } from '../config';

// ─── Slide definitions ───────────────────────────────────────────────────────

const PRO_SLIDES = [
  {
    image: require('../../assets/onboarding/pro-01.png'),
    titleKey: 'onboardingWelcomeTitle',
    bodyKey:  'onboardingWelcomeBody',
  },
  {
    image: require('../../assets/onboarding/pro-02.png'),
    titleKey: 'onboardingEquipmentTitle',
    bodyKey:  'onboardingEquipmentBody',
  },
  {
    image: require('../../assets/onboarding/pro-03.png'),
    titleKey: 'onboardingRoutinesTitle',
    bodyKey:  'onboardingRoutinesBody',
  },
  {
    image: require('../../assets/onboarding/pro-04.png'),
    titleKey: 'onboardingImportTitle',
    bodyKey:  'onboardingImportBody',
  },
  {
    image: require('../../assets/onboarding/pro-05.png'),
    titleKey: 'onboardingBuildTitle',
    bodyKey:  'onboardingBuildBody',
  },
  {
    image: require('../../assets/onboarding/pro-6.png'),
    titleKey: 'onboardingTrainTitle',
    bodyKey:  'onboardingTrainBody',
  },
  {
    image: require('../../assets/onboarding/pro-7.png'),
    titleKey: 'onboardingStatsTitle',
    bodyKey:  'onboardingStatsBody',
  },
  {
    image: require('../../assets/onboarding/pro-8.png'),
    titleKey: 'onboardingShareTitle',
    bodyKey:  'onboardingShareBody',
  },
];

// TODO: replace with free-XX.png images when available
const FREE_SLIDES = PRO_SLIDES.filter((_, i) => i !== 6); // exclude Stats slide (PRO only)

// ─── Component ───────────────────────────────────────────────────────────────

export default function OnboardingWalkthrough({ lang, onDone }) {
  const [step, setStep] = useState(0);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const SLIDES = IS_PRO ? PRO_SLIDES : FREE_SLIDES;
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  // Portrait image: full available width, 67% of screen height (non-square box)
  const portraitImageWidth = width - spacing.lg * 2;
  const portraitImageHeight = height * 0.67;

  const goNext = () => isLast ? onDone() : setStep(s => s + 1);
  const goBack = () => setStep(s => s - 1);

  const Dots = () => (
    <View style={styles.dots}>
      {SLIDES.map((_, i) => (
        <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
      ))}
    </View>
  );

  const NavButtons = () => (
    <View style={styles.nav}>
      {step > 0 ? (
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← {t('onboardingBack', lang)}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.backButton} />
      )}
      <TouchableOpacity onPress={goNext} style={styles.nextButton}>
        <Text style={styles.nextText}>
          {isLast ? t('onboardingGetStarted', lang) : `${t('onboardingNext', lang)} →`}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible animationType="fade" transparent={false} statusBarTranslucent>
      {isLandscape ? (
        // ── Landscape: image left, text right ──────────────────────────────
        <View style={[styles.landscapeContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={[styles.skipAbsolute, { top: insets.top + spacing.sm }]}
            onPress={onDone}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.skipText}>{t('onboardingSkip', lang)}</Text>
          </TouchableOpacity>

          <Image source={slide.image} style={styles.landscapeImage} resizeMode="contain" />

          <View style={styles.landscapeText}>
            <Text style={styles.title}>{t(slide.titleKey, lang)}</Text>
            <Text style={styles.body}>{t(slide.bodyKey, lang)}</Text>
            <Dots />
            <NavButtons />
          </View>
        </View>
      ) : (
        // ── Portrait: image top, text bottom ───────────────────────────────
        <View style={[styles.portraitContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onDone} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.skipText}>{t('onboardingSkip', lang)}</Text>
            </TouchableOpacity>
            <Text style={styles.counter}>{step + 1}/{SLIDES.length}</Text>
          </View>

          {/* Image */}
          <View style={styles.portraitImageContainer}>
            <Image
              source={slide.image}
              style={{ width: portraitImageWidth, height: portraitImageHeight }}
              resizeMode="contain"
            />
          </View>

          {/* Spacer pushes text down to nav */}
          <View style={{ flex: 1 }} />

          {/* Text */}
          <Text style={styles.title}>{t(slide.titleKey, lang)}</Text>
          <Text style={styles.body}>{t(slide.bodyKey, lang)}</Text>

          <Dots />
          <NavButtons />
        </View>
      )}
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Portrait
  portraitContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  counter: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  portraitImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  portraitTextScroll: {
    flexShrink: 1,
  },
  portraitTextContent: {
    paddingTop: spacing.md,
  },

  // Landscape
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg + 50,
    gap: spacing.lg,
  },
  landscapeImage: {
    width: '45%',
    aspectRatio: 1,
    alignSelf: 'center',
  },
  landscapeText: {
    flex: 1,
    justifyContent: 'center',
  },
  skipAbsolute: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
  },

  // Shared text
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Dots
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },

  // Nav
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 100,
    paddingVertical: spacing.md,
  },
  backText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  nextButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    minWidth: 140,
    alignItems: 'center',
  },
  nextText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.white,
  },
});

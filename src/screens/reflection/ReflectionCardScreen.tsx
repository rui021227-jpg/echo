import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { COPY } from '../../constants/copy';
import { WeatherAvatar } from '../../components/WeatherAvatar';
import { processReflection } from '../../services/reflection';
import { getReflectionForWeek, getReflectionCountThisMonth } from '../../database/reflections';
import { useApp } from '../../state/AppContext';
import { AVATAR_MAP } from '../../constants/avatars';
import type { Reflection, AvatarKey } from '../../types/reflection';

const S = {
  bg: '#fcf9f1',
  surface: '#ffffff',
  green: '#586a48',
  greenMid: 'rgba(88,106,72,0.12)',
  cream: '#ffdcc4',
  peach: '#ffcf93',
  peachGlow: 'rgba(255,207,147,0.15)',
  textMain: '#1c1c17',
  textMuted: '#9e9e8e',
  textSecondary: '#6b6b5e',
  cardShadow: {
    shadowColor: '#586a48',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 32,
    elevation: 8,
  },
} as const;

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];
const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function formatReflectionDate(weekStart: string): string {
  const d = new Date(weekStart + 'T12:00:00');
  d.setDate(d.getDate() + 6);
  const dayName = DAYS[d.getDay()];
  const month = MONTHS[d.getMonth()];
  const date = d.getDate();
  return `${dayName}, ${month} ${date}`;
}

type Props = NativeStackScreenProps<MainStackParamList, 'ReflectionCard'>;

export function ReflectionCardScreen({ navigation, route }: Props) {
  const { weekStart } = route.params;
  const { isPremium } = useApp();
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      const existing = await getReflectionForWeek(weekStart);
      if (!active) return;

      if (existing) {
        setReflection(existing);
        setLoading(false);
        return;
      }

      if (!isPremium) {
        const count = await getReflectionCountThisMonth();
        if (!active) return;

        if (count >= 1) {
          navigation.replace('Paywall', { source: 'reflection', weekStart });
          return;
        }
      }

      const result = await processReflection(weekStart);
      if (!active) return;

      if (result.result === 'crisis') {
        navigation.replace('CrisisCard');
        return;
      }

      if (result.result === 'error') {
        setError(result.error ?? 'Something went wrong');
        setLoading(false);
        return;
      }

      const stored = await getReflectionForWeek(weekStart);
      if (!active) return;

      if (!stored) {
        setError('Your reflection is on its way — check back later.');
        setLoading(false);
        return;
      }

      setReflection(stored);
      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [weekStart, isPremium, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingRoot}>
        <ActivityIndicator color={S.green} size="large" />
        <Text style={styles.loadingText}>Gathering your week...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingRoot}>
        <Text style={styles.errorEmoji}>🌧️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>{COPY.reflection.back}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!reflection) return null;

  const avatarConfig = AVATAR_MAP[reflection.avatar_key as AvatarKey] ?? null;
  const avatarLabel = avatarConfig?.label ?? 'Gently Bright';
  const dateLabel = formatReflectionDate(weekStart);

  return (
    <SafeAreaView style={styles.root}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Sanctuary</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.topBarIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date + headline */}
        <View style={styles.headerBlock}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.headline}>Sunday Reflection</Text>
          <Text style={styles.subtitle}>
            A moment of stillness to witness the week that was.
          </Text>
        </View>

        {/* Reflection card */}
        <View style={[styles.reflectionCard, S.cardShadow]}>
          {/* Avatar section */}
          <LinearGradient
            colors={['rgba(255,207,147,0.18)', '#fcf9f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarSection}
          >
            <View style={[styles.particle, styles.particleA]} />
            <View style={[styles.particle, styles.particleB]} />
            <View style={[styles.particle, styles.particleC]} />
            <View style={[styles.particle, styles.particleD]} />
            <WeatherAvatar
              avatarKey={reflection.avatar_key}
              label={avatarLabel}
              size={64}
            />
          </LinearGradient>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Sentence section */}
          <View style={styles.sentenceSection}>
            <View style={styles.sentenceRow}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>🕐</Text>
              </View>
              <View style={styles.sentenceTextBlock}>
                <Text style={styles.sentenceHeader}>Your week at a glance</Text>
                <Text style={styles.sentenceBody}>{reflection.s1}</Text>
              </View>
            </View>

            {reflection.s2 ? (
              <View style={styles.sentenceRow}>
                <View style={styles.iconBox}>
                  <Text style={styles.iconText}>✨</Text>
                </View>
                <View style={styles.sentenceTextBlock}>
                  <Text style={styles.sentenceHeader}>Patterns & insights</Text>
                  <Text style={styles.sentenceBody}>{reflection.s2}</Text>
                </View>
              </View>
            ) : null}

            {reflection.s3 ? (
              <View style={styles.sentenceRow}>
                <View style={styles.iconBox}>
                  <Text style={styles.iconText}>⚖️</Text>
                </View>
                <View style={styles.sentenceTextBlock}>
                  <Text style={styles.sentenceHeader}>Balance & wellbeing</Text>
                  <Text style={styles.sentenceBody}>{reflection.s3}</Text>
                </View>
              </View>
            ) : null}

            <Text style={styles.closingQuote}>
              "May next week bring you the rest you deserve."
            </Text>
          </View>
        </View>

        {/* Insight card */}
        <View style={styles.insightCard}>
          <Text style={styles.insightIcon}>⭐</Text>
          <Text style={styles.insightText}>
            Reflection is the bridge between experience and wisdom. Your
            consistency this week has built a strong foundation for tomorrow.
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaWrapper}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[S.green, '#7a9060']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>Begin a New Week</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: S.bg,
  },
  loadingRoot: {
    flex: 1,
    backgroundColor: S.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontStyle: 'italic',
    color: S.textMuted,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: S.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 9999,
    backgroundColor: S.greenMid,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    color: S.green,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: S.green,
  },
  topBarIcon: {
    fontSize: 20,
    opacity: 0.55,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: S.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: S.textMain,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    color: S.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  reflectionCard: {
    backgroundColor: S.surface,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
  },
  avatarSection: {
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: S.peach,
    opacity: 0.5,
  },
  particleA: { top: 24, left: 32 },
  particleB: { top: 16, right: 48 },
  particleC: { bottom: 28, left: 56 },
  particleD: { bottom: 20, right: 36 },
  divider: {
    height: 1,
    backgroundColor: 'rgba(88,106,72,0.08)',
    marginHorizontal: 20,
  },
  sentenceSection: {
    padding: 24,
  },
  sentenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: S.greenMid,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: 15,
  },
  sentenceTextBlock: {
    flex: 1,
  },
  sentenceHeader: {
    fontSize: 12,
    color: S.textMuted,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  sentenceBody: {
    fontSize: 14,
    color: S.textSecondary,
    lineHeight: 20,
  },
  closingQuote: {
    fontSize: 13,
    fontStyle: 'italic',
    color: S.textMuted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  insightCard: {
    backgroundColor: S.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    gap: 12,
    shadowColor: S.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  insightIcon: {
    fontSize: 20,
    marginTop: 1,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: S.textSecondary,
    lineHeight: 20,
    fontWeight: '500',
  },
  ctaWrapper: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  ctaButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: S.surface,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

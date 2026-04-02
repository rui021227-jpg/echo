import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { WeatherAvatar } from '../../components/WeatherAvatar';
import { processReflection } from '../../services/reflection';
import { getReflectionForWeek, getReflectionCountThisMonth } from '../../database/reflections';
import { useApp } from '../../state/AppContext';
import type { Reflection } from '../../types/reflection';

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

      // Check entitlement: premium gets weekly, free gets monthly
      if (!isPremium) {
        const count = await getReflectionCountThisMonth();
        if (!active) return;

        if (count >= 1) {
          // Already used monthly free reflection
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
      <View style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Your reflection is on its way — check back later.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!reflection) return null;

  return (
    <View style={styles.container}>
      <WeatherAvatar avatarKey={reflection.avatar_key} size={120} />

      <View style={styles.card}>
        <Text style={styles.s1}>{reflection.s1}</Text>
        {reflection.s2 ? <Text style={styles.s2}>{reflection.s2}</Text> : null}
        {reflection.s3 ? <Text style={styles.s3}>{reflection.s3}</Text> : null}
      </View>

      <Text style={styles.seeYou}>{COPY.reflection.seeYou}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginTop: SPACING.xl,
    width: '100%',
  },
  s1: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  s2: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  s3: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  seeYou: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.muted,
    marginTop: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  backButton: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
  },
  backText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.accent,
  },
});

import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { useApp } from '../../state/AppContext';
import { WordStep } from '../../components/WordStep';

const S = {
  bg: '#fcf9f1',
  green: '#586a48',
  textMain: '#1c1c17',
  textMuted: '#9e9e8e',
  progressTrack: '#e8e5dc',
};

type Props = NativeStackScreenProps<MainStackParamList, 'WordInput'>;

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

export function WordInputScreen({ navigation, route }: Props) {
  const { emojiScore, date } = route.params;
  const { secondsRemaining, isTimedSessionActive } = useApp();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>Sanctuary</Text>
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.gearIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Date */}
        <Text style={styles.dateText}>{formatDate(date)}</Text>

        {/* Headline */}
        <Text style={styles.headline}>OneWord</Text>
        <Text style={styles.subtitle}>Let your thought float onto the page.</Text>

        {/* WordStep */}
        <View style={styles.wordStepArea}>
          <WordStep
            secondsRemaining={secondsRemaining}
            isTimedSessionActive={isTimedSessionActive}
            onSubmit={(word) =>
              navigation.navigate('Breathing', {
                emojiScore,
                word,
                date,
              })
            }
          />
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Step 2 of 4</Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: S.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  logo: {
    fontSize: 18,
    fontWeight: '600',
    color: S.green,
    letterSpacing: -0.2,
  },
  gearIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: S.textMuted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 20,
  },
  headline: {
    fontSize: 42,
    fontWeight: '700',
    color: S.textMain,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    color: S.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  wordStepArea: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    marginTop: 8,
  },
  progressSection: {
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: S.textMuted,
    fontWeight: '500',
  },
  progressTrack: {
    width: 140,
    height: 6,
    backgroundColor: S.progressTrack,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    width: '50%',
    height: '100%',
    backgroundColor: S.green,
    borderRadius: 9999,
  },
});

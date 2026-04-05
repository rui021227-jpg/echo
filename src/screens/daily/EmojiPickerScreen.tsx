import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { EMOJI_SCALE } from '../../constants/emojis';
import { EmojiCircle } from '../../components/EmojiCircle';
import { useApp } from '../../state/AppContext';
import { todayISO } from '../../utils/dateHelpers';
import { closeApp } from '../../utils/closeApp';
import { hasEntryToday } from '../../database/entries';
import { COPY } from '../../constants/copy';

const S = {
  bg: '#fcf9f1',
  surface: '#ffffff',
  green: '#586a48',
  cream: '#ffdcc4',
  peach: '#ffcf93',
  textMain: '#1c1c17',
  textMuted: '#9e9e8e',
  textSecondary: '#6b6b5e',
  progressTrack: 'rgba(88,106,72,0.15)',
};

const ARCH_OFFSETS = [20, 8, 0, 8, 20];
const ARCH_SIZES = [56, 56, 72, 56, 56];

type Props = NativeStackScreenProps<MainStackParamList, 'EmojiPicker'>;
const AUTO_CLOSE_ALREADY_DONE_MS = 1500;

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function EmojiPickerScreen({ navigation, route }: Props) {
  const fromNotification = route.params?.fromNotification ?? false;
  const { secondsRemaining, isTimedSessionActive, endTimedSession } = useApp();
  const [hasCompletedToday, setHasCompletedToday] = useState<boolean | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      setIsSelecting(false);
      setSelectedIndex(null);

      async function checkEntryStatus() {
        const completed = await hasEntryToday();
        if (active) {
          setHasCompletedToday(completed);
        }
      }

      void checkEntryStatus();

      return () => {
        active = false;
      };
    }, []),
  );

  useEffect(() => {
    if (!fromNotification || !hasCompletedToday) {
      return;
    }

    const timer = setTimeout(() => {
      endTimedSession();
      closeApp();
    }, AUTO_CLOSE_ALREADY_DONE_MS);

    return () => clearTimeout(timer);
  }, [endTimedSession, fromNotification, hasCompletedToday]);

  const handleContinue = () => {
    if (selectedIndex === null || isSelecting) return;
    setIsSelecting(true);
    const option = EMOJI_SCALE[selectedIndex];
    navigation.navigate('WordInput', {
      emojiScore: option.score,
      date: todayISO(),
    });
  };

  if (hasCompletedToday === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator color={S.green} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (hasCompletedToday) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.doneTitle}>
            {fromNotification
              ? COPY.daily.alreadyDoneNotification
              : COPY.daily.alreadyDoneTitle}
          </Text>
          <Text style={styles.doneSubtitle}>{COPY.daily.alreadyDoneSubtitle}</Text>
          {!fromNotification ? (
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.logo}>Sanctuary</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Date */}
        <Text style={styles.date}>{formatDate(new Date())}</Text>

        {/* Timer if timed session */}
        {isTimedSessionActive ? (
          <Text style={styles.timer}>{secondsRemaining}s</Text>
        ) : null}

        {/* Headline */}
        <View style={styles.headlineBlock}>
          <Text style={styles.headline}>How are you today?</Text>
          <Text style={styles.subtitle}>Take a moment to just be.</Text>
        </View>

        {/* Emoji arch */}
        <View style={styles.archContainer}>
          {/* Ambient glow behind arch */}
          <View style={styles.archGlow} />
          <View style={styles.archRow}>
            {EMOJI_SCALE.map((option, i) => (
              <View
                key={option.score}
                style={[styles.archItem, { transform: [{ translateY: ARCH_OFFSETS[i] }] }]}
              >
                <EmojiCircle
                  emoji={option.emoji}
                  selected={selectedIndex === i}
                  onPress={() => setSelectedIndex(i)}
                  size={ARCH_SIZES[i]}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressBlock}>
          <Text style={styles.progressLabel}>Step 1 of 4</Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* Continue button */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={selectedIndex === null}
          activeOpacity={0.85}
          style={selectedIndex === null ? styles.btnDisabled : undefined}
        >
          <LinearGradient
            colors={[S.peach, S.cream]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueBtn}
          >
            <Text style={styles.continueBtnText}>Continue →</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>Every breath is a fresh start.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: S.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: S.bg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  logo: {
    fontSize: 18,
    fontWeight: '600',
    color: S.green,
    letterSpacing: 0.3,
  },
  settingsIcon: {
    fontSize: 20,
    color: S.textMuted,
  },
  date: {
    fontSize: 13,
    color: S.textMuted,
    marginBottom: 4,
  },
  timer: {
    fontSize: 12,
    color: S.textMuted,
    marginBottom: 4,
  },
  headlineBlock: {
    marginTop: 16,
    marginBottom: 8,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: S.textMain,
    lineHeight: 40,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    color: S.textMuted,
  },
  archContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 8,
  },
  archGlow: {
    position: 'absolute',
    width: 260,
    height: 160,
    borderRadius: 130,
    backgroundColor: 'rgba(255,207,147,0.12)',
  },
  archRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingBottom: 20,
  },
  archItem: {
    alignItems: 'center',
  },
  progressBlock: {
    marginBottom: 16,
    gap: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: S.textMuted,
  },
  progressTrack: {
    height: 3,
    backgroundColor: S.progressTrack,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    width: '25%',
    height: '100%',
    backgroundColor: S.green,
    borderRadius: 2,
  },
  continueBtn: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: S.textMain,
    letterSpacing: 0.3,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  footer: {
    fontSize: 12,
    fontStyle: 'italic',
    color: S.textMuted,
    textAlign: 'center',
  },
  settingsBtn: {
    marginTop: 16,
  },
  doneTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: S.textMain,
    textAlign: 'center',
    marginBottom: 8,
  },
  doneSubtitle: {
    fontSize: 15,
    color: S.textSecondary,
    textAlign: 'center',
  },
});

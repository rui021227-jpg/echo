import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import { EMOJI_SCALE } from '../../constants/emojis';
import { EmojiCircle } from '../../components/EmojiCircle';
import { useApp } from '../../state/AppContext';
import { todayISO } from '../../utils/dateHelpers';
import { closeApp } from '../../utils/closeApp';
import { hasEntryToday } from '../../database/entries';
import { COPY } from '../../constants/copy';

type Props = NativeStackScreenProps<MainStackParamList, 'EmojiPicker'>;
const AUTO_CLOSE_ALREADY_DONE_MS = 1500;

export function EmojiPickerScreen({ navigation, route }: Props) {
  const fromNotification = route.params?.fromNotification ?? false;
  const { secondsRemaining, isTimedSessionActive, endTimedSession } = useApp();
  const [hasCompletedToday, setHasCompletedToday] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

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
  }, []);

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

  const handleEmojiPress = (score: number) => {
    navigation.navigate('WordInput', {
      emojiScore: score,
      date: todayISO(),
    });
  };

  if (hasCompletedToday === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  if (hasCompletedToday) {
    return (
      <View style={styles.container}>
        <Text style={styles.doneTitle}>
          {fromNotification
            ? COPY.daily.alreadyDoneNotification
            : COPY.daily.alreadyDoneTitle}
        </Text>
        <Text style={styles.doneSubtitle}>{COPY.daily.alreadyDoneSubtitle}</Text>

        {!fromNotification ? (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isTimedSessionActive ? (
        <Text style={styles.timer}>{secondsRemaining}s</Text>
      ) : null}

      <View style={styles.emojiContainer}>
        {EMOJI_SCALE.map((option) => (
          <EmojiCircle
            key={option.score}
            option={option}
            onPress={handleEmojiPress}
          />
        ))}
      </View>

      {!isTimedSessionActive ? (
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      ) : null}
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
  timer: {
    position: 'absolute',
    top: SPACING.xxxl,
    right: SPACING.xl,
    fontSize: FONT_SIZES.sm,
    color: COLORS.muted,
  },
  emojiContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  doneTitle: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  doneSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: SPACING.xxxl,
    right: SPACING.xl,
  },
  settingsIcon: {
    fontSize: FONT_SIZES.xl,
  },
});

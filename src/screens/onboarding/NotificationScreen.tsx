import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { registerForPushNotifications } from '../../services/notifications';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'NotificationPermission'>;

export function NotificationScreen({ navigation }: Props) {
  const [denied, setDenied] = useState(false);

  const handleAllow = async () => {
    const granted = await registerForPushNotifications();
    if (!granted) {
      setDenied(true);
    }
    navigation.navigate('ReminderTime');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.bellEmoji}>🔔</Text>
        <Text style={styles.title}>{COPY.onboarding.notificationTitle}</Text>
        {denied && (
          <Text style={styles.skip}>{COPY.onboarding.notificationSkip}</Text>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAllow}>
        <Text style={styles.buttonText}>{COPY.onboarding.notificationAllow}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.secondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  skip: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
});

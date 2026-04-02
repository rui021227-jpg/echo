import React, { useCallback, useRef } from 'react';
import { NavigationContainer, type NavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './navigation/RootNavigator';
import { AppProvider, useApp } from './state/AppContext';
import { useNotificationResponse } from './hooks/useNotificationResponse';
import { getReflectionWeekStart, type NotificationType } from './services/notifications';
import type { MainStackParamList } from './types/navigation';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from './constants/theme';
import { FadeOverlay } from './components/FadeOverlay';
import { closeApp } from './utils/closeApp';
import { FONT_SIZES, SPACING } from './constants/theme';

function AppContent() {
  const {
    isReady,
    bootstrapError,
    retryBootstrap,
    onboardingComplete,
    hasTimedSessionExpired,
    startTimedSession,
    endTimedSession,
  } = useApp();
  const navigationRef = useRef<NavigationContainerRef<MainStackParamList>>(null);

  const handleNotification = useCallback(
    (type: NotificationType, data: Record<string, unknown>) => {
      if (!onboardingComplete) return;

      if (type === 'daily') {
        startTimedSession();
        navigationRef.current?.navigate('EmojiPicker', { fromNotification: true });
      } else if (type === 'reflection') {
        const weekStart = getReflectionWeekStart(data);
        navigationRef.current?.navigate('ReflectionCard', { weekStart });
      }
    },
    [onboardingComplete, startTimedSession],
  );

  const handleTimedSessionExpire = useCallback(() => {
    endTimedSession();
    closeApp();
  }, [endTimedSession]);

  useNotificationResponse(handleNotification, isReady);

  if (!isReady) {
    if (bootstrapError) {
      return (
        <View style={styles.loading}>
          <Text style={styles.errorTitle}>We could not open ECHO.</Text>
          <Text style={styles.errorText}>{bootstrapError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void retryBootstrap()}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.appShell}>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
      <FadeOverlay
        visible={hasTimedSessionExpired}
        onFadeComplete={handleTimedSessionExpire}
      />
    </View>
  );
}

export function AppRoot() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  appShell: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
  },
  retryText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: '600',
  },
});

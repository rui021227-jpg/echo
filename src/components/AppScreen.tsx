import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  keyboard?: boolean;
  centered?: boolean;
}

export function AppScreen({
  children,
  style,
  contentContainerStyle,
  scroll = false,
  keyboard = false,
  centered = false,
}: Props) {
  const baseContentStyle = [
    scroll ? styles.scrollContent : styles.content,
    centered && styles.centered,
    contentContainerStyle,
  ];

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={baseContentStyle}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={baseContentStyle}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={['top', 'bottom', 'left', 'right']}>
      {keyboard ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

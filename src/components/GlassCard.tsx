import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, BORDER_RADIUS, SHADOWS, GRADIENTS, COLORS } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: boolean;
  bordered?: boolean;
}

export const GlassCard = ({ children, style, glow = false, bordered = false }: Props) => {
  const shadowStyle = glow ? SHADOWS.glow : SHADOWS.card;
  const borderStyle = bordered ? styles.bordered : null;

  return (
    <LinearGradient
      colors={GRADIENTS.glass}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, shadowStyle, borderStyle, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceGlass,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  bordered: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
});

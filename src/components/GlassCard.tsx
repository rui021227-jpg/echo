import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, BORDERS, SHADOWS } from '../constants/theme';

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
    <View style={[styles.card, shadowStyle, borderStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  bordered: {
    borderWidth: BORDERS.card.borderWidth,
    borderColor: BORDERS.card.borderColor,
  },
});

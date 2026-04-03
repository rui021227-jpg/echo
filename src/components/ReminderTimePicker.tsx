import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { COPY } from '../constants/copy';

interface Props {
  hour: number;
  minute: number;
  onAdjustHour: (delta: number) => void;
  onAdjustMinute: (delta: number) => void;
  disabled?: boolean;
}

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}

function ControlRow({
  label,
  value,
  onDecrement,
  onIncrement,
  disabled = false,
}: {
  label: string;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
  disabled?: boolean;
}) {
  const normalizedLabel = label.toLowerCase();

  return (
    <View style={[styles.controlRow, disabled && styles.controlRowDisabled]}>
      <Text style={styles.controlLabel}>{label}</Text>
      <View style={styles.controlButtons}>
        <TouchableOpacity
          onPress={onDecrement}
          style={[styles.arrowButton, disabled && styles.arrowButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${normalizedLabel}`}
          accessibilityHint={`Lowers the ${normalizedLabel} value`}
          accessibilityState={{ disabled }}
          disabled={disabled}
        >
          <Text style={styles.arrow}>-</Text>
        </TouchableOpacity>
        <Text style={styles.controlValue}>{value}</Text>
        <TouchableOpacity
          onPress={onIncrement}
          style={[styles.arrowButton, disabled && styles.arrowButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${normalizedLabel}`}
          accessibilityHint={`Raises the ${normalizedLabel} value`}
          accessibilityState={{ disabled }}
          disabled={disabled}
        >
          <Text style={styles.arrow}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ReminderTimePicker({
  hour,
  minute,
  onAdjustHour,
  onAdjustMinute,
  disabled = false,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.time, disabled && styles.timeDisabled]}>
        {formatTime(hour, minute)}
      </Text>

      <View style={styles.controls}>
        <ControlRow
          label={COPY.settings.hourLabel}
          value={String(hour % 12 || 12).padStart(2, '0')}
          onDecrement={() => onAdjustHour(-1)}
          onIncrement={() => onAdjustHour(1)}
          disabled={disabled}
        />
        <ControlRow
          label={COPY.settings.minuteLabel}
          value={String(minute).padStart(2, '0')}
          onDecrement={() => onAdjustMinute(-1)}
          onIncrement={() => onAdjustMinute(1)}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  time: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  timeDisabled: {
    opacity: 0.5,
  },
  controls: {
    width: '100%',
    gap: SPACING.md,
  },
  controlRow: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  controlRowDisabled: {
    opacity: 0.6,
  },
  controlLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.muted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButtonDisabled: {
    opacity: 0.5,
  },
  arrow: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    fontWeight: '600',
  },
  controlValue: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

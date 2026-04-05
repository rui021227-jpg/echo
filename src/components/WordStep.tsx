import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { isValidWord } from '../utils/validators';

const S = {
  bg: '#fcf9f1',
  surface: '#ffffff',
  green: '#586a48',
  cream: '#ffdcc4',
  peach: '#ffcf93',
  textMain: '#1c1c17',
  textMuted: '#9e9e8e',
  textSecondary: '#6b6b5e',
};

const MAX_LENGTH = 20;

interface Props {
  onSubmit: (word: string) => void;
  secondsRemaining?: number;
  isTimedSessionActive?: boolean;
}

export function WordStep({
  onSubmit,
  secondsRemaining = 0,
  isTimedSessionActive = false,
}: Props) {
  const [word, setWord] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const floatY = useSharedValue(0);
  const focusScale = useSharedValue(1);
  const focusBg = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1600, easing: Easing.inOut(Easing.sine) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sine) }),
      ),
      -1,
      true,
    );
  }, [floatY]);

  useFocusEffect(
    useCallback(() => {
      setIsSubmitting(false);
    }, []),
  );

  const handleDone = () => {
    if (isSubmitting || !isValidWord(word)) return;
    Keyboard.dismiss();
    setIsSubmitting(true);
    onSubmit(word.trim());
  };

  const cloudStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const inputContainerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusScale.value }],
    backgroundColor: focusBg.value === 1 ? S.surface : 'transparent',
    shadowOpacity: focusBg.value * 0.12,
  }));

  const isValid = isValidWord(word);

  return (
    <View style={styles.container}>
      {isTimedSessionActive ? (
        <Text style={styles.timer}>{secondsRemaining}s</Text>
      ) : null}

      <Animated.View style={[styles.cloudWrapper, cloudStyle]}>
        <Text style={styles.cloudEmoji}>☁️</Text>
      </Animated.View>

      <Animated.View style={[styles.inputCard, inputContainerAnimStyle]}>
        <TextInput
          style={styles.input}
          placeholder="peace..."
          placeholderTextColor={S.textMuted}
          value={word}
          onChangeText={setWord}
          maxLength={MAX_LENGTH}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleDone}
          editable={!isSubmitting}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => {
            focusScale.value = withSpring(1.02, { damping: 14, stiffness: 120 });
            focusBg.value = withTiming(1, { duration: 250 });
          }}
          onBlur={() => {
            focusScale.value = withSpring(1, { damping: 14, stiffness: 120 });
            focusBg.value = withTiming(0, { duration: 250 });
          }}
        />
        <Text style={styles.counter}>
          {word.length} / {MAX_LENGTH}
        </Text>
      </Animated.View>

      <TouchableOpacity
        style={[styles.buttonWrapper, (!isValid || isSubmitting) && styles.buttonDisabled]}
        onPress={handleDone}
        disabled={!isValid || isSubmitting}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[S.peach, S.cream]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Continue →</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.footerHint}>tap continue when you're ready</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '100%',
  },
  timer: {
    position: 'absolute',
    top: 8,
    right: 24,
    fontSize: 13,
    color: S.textMuted,
  },
  cloudWrapper: {
    alignSelf: 'flex-start',
    marginLeft: 8,
    marginBottom: 4,
  },
  cloudEmoji: {
    fontSize: 36,
    opacity: 0.28,
  },
  inputCard: {
    width: '100%',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 32,
    shadowColor: S.green,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 28,
    elevation: 6,
  },
  input: {
    fontSize: 44,
    fontWeight: '300',
    textAlign: 'center',
    color: S.textMain,
    width: '100%',
    paddingVertical: 4,
  },
  counter: {
    fontSize: 12,
    color: S.textMuted,
    textAlign: 'right',
    marginTop: 8,
  },
  buttonWrapper: {
    borderRadius: 9999,
    shadowColor: S.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 52,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: S.textMain,
    letterSpacing: 0.3,
  },
  footerHint: {
    fontSize: 11,
    fontStyle: 'italic',
    color: S.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});

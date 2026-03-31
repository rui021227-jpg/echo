import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { isValidWord } from '../../utils/validators';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingWordInput'>;

const MAX_LENGTH = 20;

export function OnboardingWordInputScreen({ navigation, route }: Props) {
  const { emojiScore, date } = route.params;
  const [word, setWord] = useState('');

  const handleDone = () => {
    if (!isValidWord(word)) return;
    navigation.navigate('OnboardingBreathing', {
      emojiScore,
      word: word.trim(),
      date,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={COPY.daily.wordPlaceholder}
          placeholderTextColor={COLORS.muted}
          value={word}
          onChangeText={setWord}
          maxLength={MAX_LENGTH}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleDone}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.counter}>{word.length}/{MAX_LENGTH}</Text>
      </View>
      <TouchableOpacity
        style={[styles.button, !isValidWord(word) && styles.buttonDisabled]}
        onPress={handleDone}
        disabled={!isValidWord(word)}
      >
        <Text style={styles.buttonText}>{COPY.daily.wordDone}</Text>
      </TouchableOpacity>
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
  inputContainer: { width: '100%', marginBottom: SPACING.xl },
  input: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.primary,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
    paddingVertical: SPACING.md,
  },
  counter: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.muted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 12,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.white },
});

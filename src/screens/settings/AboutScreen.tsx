import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import * as Application from 'expo-application';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { RUNTIME_CONFIG, warnMissingRuntimeConfig } from '../../config';

export function AboutScreen() {
  const version = Application.nativeApplicationVersion ?? '1.0.0';
  const privacyPolicyUrl = RUNTIME_CONFIG.privacyPolicyUrl;

  const openPrivacyPolicy = () => {
    if (!privacyPolicyUrl) {
      warnMissingRuntimeConfig(
        'privacyPolicyUrl',
        'The Settings privacy-policy link is disabled until EXPO_PUBLIC_PRIVACY_POLICY_URL is set.',
      );
      return;
    }

    void Linking.openURL(privacyPolicyUrl);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>{COPY.appName}</Text>
      <Text style={styles.version}>Version {version}</Text>

      <Text style={styles.disclaimer}>{COPY.about.disclaimer}</Text>

      <TouchableOpacity
        onPress={openPrivacyPolicy}
        disabled={!privacyPolicyUrl}
        style={styles.link}
      >
        <Text
          style={[
            styles.linkText,
            !privacyPolicyUrl && styles.linkTextDisabled,
          ]}
        >
          {COPY.settings.privacyPolicy}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
    alignItems: 'center',
  },
  appName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  version: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.muted,
    marginBottom: SPACING.xxl,
  },
  disclaimer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  link: {
    padding: SPACING.md,
  },
  linkText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.accent,
  },
  linkTextDisabled: {
    color: COLORS.muted,
  },
});

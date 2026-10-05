import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing } from '../../theme';
import { AppIcon, iconSize } from '../icons';
import { AppText } from '../ui';

type Props = {
  onPress: () => void;
};

export function EmergencyServiceCard({ onPress }: Props): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.glowLarge} />
      <View style={styles.glowSmall} />

      <View style={styles.topRow}>
        <View style={styles.copy}>
          <AppText variant="h2" color="#FFFFFF">
            Need help now?
          </AppText>

          <AppText
            variant="bodySmall"
            color="#DDF7E8"
            style={styles.description}
          >
            Find nearby professionals for urgent service needs.
          </AppText>
        </View>

        <View style={styles.available}>
          <View style={styles.availableDot} />
          <AppText variant="caption" color="#0F8449">
            Available nearby
          </AppText>
        </View>
      </View>

      <View style={styles.iconBox}>
        <AppIcon name="briefcase" size={iconSize.xl} color="#FFFFFF" />
      </View>

      <View style={styles.tags}>
        <EmergencyTag icon="zap" label="Electrical" />
        <EmergencyTag icon="wrench" label="Plumbing" />
        <EmergencyTag icon="sparkles" label="Appliance" />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          {
            opacity: pressed ? 0.88 : 1,
          },
        ]}
      >
        <AppText variant="label" color="#0F8449">
          Emergency Services
        </AppText>

        <AppIcon name="arrowRight" size={iconSize.xs} color="#0F8449" />
      </Pressable>
    </View>
  );
}

function EmergencyTag({
  icon,
  label,
}: {
  icon: 'zap' | 'wrench' | 'sparkles';
  label: string;
}): React.JSX.Element {
  return (
    <View style={styles.tag}>
      <AppIcon name={icon} size={12} color="#FFFFFF" />

      <AppText variant="overline" color="#FFFFFF">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 178,
    borderRadius: radius.xl,
    backgroundColor: '#10844A',
    padding: spacing[4],
    overflow: 'hidden',
  },
  glowLarge: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    right: -70,
    bottom: -60,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  glowSmall: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    right: 18,
    top: 48,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  copy: {
    flex: 1,
    paddingRight: 72,
  },
  description: {
    marginTop: spacing[1],
  },
  available: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  availableDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#4ACC7A',
  },
  iconBox: {
    position: 'absolute',
    right: spacing[5],
    top: 60,
    width: 62,
    height: 62,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  tag: {
    minHeight: 28,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  button: {
    alignSelf: 'flex-start',
    minHeight: 44,
    marginTop: spacing[3],
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
});

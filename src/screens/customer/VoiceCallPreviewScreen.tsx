import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, AppIconName, iconSize } from '../../components/icons';
import { AppText, Avatar } from '../../components/ui';
import { useCustomerBookings } from '../../hooks/useCustomerData';
import { CustomerStackParamList } from '../../navigation/types';
import { customerPalette, spacing, statusColors } from '../../theme';

type Props = NativeStackScreenProps<CustomerStackParamList, 'VoiceCallPreview'>;

export function VoiceCallPreviewScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { data: bookings = [] } = useCustomerBookings();

  const booking = useMemo(
    () => bookings.find(item => item.id === route.params.bookingId),
    [bookings, route.params.bookingId],
  );

  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  const name = booking?.providerName ?? 'Service provider';

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Math.max(insets.top, spacing[4]),
          paddingBottom: Math.max(insets.bottom, spacing[5]),
        },
      ]}
    >
      <View style={styles.top}>
        <AppText variant="overline" color="#A7F3D0">
          VOICE CALL PREVIEW
        </AppText>
        <AppText variant="caption" color="#D1FAE5" style={styles.previewNote}>
          Calling service is not connected yet.
        </AppText>
      </View>

      <View style={styles.identity}>
        {booking?.providerImage ? (
          <Image
            source={{ uri: booking.providerImage }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatarFrame}>
            <Avatar initials={name} size="lg" />
          </View>
        )}

        <AppText variant="h1" color="#FFFFFF" style={styles.name}>
          {name}
        </AppText>

        <AppText variant="body" color="#D1FAE5" style={styles.status}>
          {booking?.serviceName ?? 'Localsewa booking'}
        </AppText>

        <AppText variant="caption" color="#A7F3D0" style={styles.status}>
          UI preview · no audio connection
        </AppText>
      </View>

      <View style={styles.controls}>
        <Control
          label={muted ? 'Unmute' : 'Mute'}
          icon={muted ? 'micOff' : 'mic'}
          active={muted}
          onPress={() => setMuted(value => !value)}
        />

        <View style={styles.controlWrap}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="End call preview"
            onPress={() => navigation.goBack()}
            style={[styles.controlButton, styles.endButton]}
          >
            <AppIcon name="phoneOff" size={iconSize.lg} color="#FFFFFF" />
          </Pressable>

          <AppText
            variant="caption"
            color="#FFFFFF"
            style={styles.controlLabel}
          >
            End
          </AppText>
        </View>

        <Control
          label={speaker ? 'Speaker off' : 'Speaker'}
          icon={speaker ? 'volume' : 'volumeOff'}
          active={speaker}
          onPress={() => setSpeaker(value => !value)}
        />
      </View>
    </View>
  );
}

function Control({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: AppIconName;
  active: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <View style={styles.controlWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={[
          styles.controlButton,
          {
            backgroundColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.16)',
          },
        ]}
      >
        <AppIcon
          name={icon}
          size={iconSize.lg}
          color={active ? customerPalette.primaryDark : '#FFFFFF'}
        />
      </Pressable>

      <AppText variant="caption" color="#FFFFFF" style={styles.controlLabel}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: customerPalette.primaryDark,
    paddingHorizontal: spacing[6],
    justifyContent: 'space-between',
  },
  top: {
    alignItems: 'center',
  },
  previewNote: {
    marginTop: spacing[1],
  },
  identity: {
    alignItems: 'center',
  },
  avatarFrame: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 132,
    height: 132,
    borderRadius: 66,
  },
  name: {
    textAlign: 'center',
    marginTop: spacing[6],
  },
  status: {
    textAlign: 'center',
    marginTop: spacing[2],
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  controlWrap: {
    alignItems: 'center',
    width: 86,
  },
  controlButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endButton: {
    backgroundColor: statusColors.error,
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  controlLabel: {
    textAlign: 'center',
    marginTop: spacing[2],
  },
});

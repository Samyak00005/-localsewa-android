import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {
  Provider,
} from '../../types/provider';
import {
  radius,
  shadows,
  spacing,
  useAppTheme,
} from '../../theme';
import {
  AppIcon,
  iconSize,
} from '../icons';
import {
  AppText,
  Avatar,
  Badge,
} from '../ui';

type Props = {
  provider: Provider;
  removing?: boolean;
  onDetails: () => void;
  onRemove: () => void;
  onBook: () => void;
};

function money(
  value?: number,
): string | null {
  if (
    value == null ||
    !Number.isFinite(
      value,
    )
  ) {
    return null;
  }

  return `₹${Math.round(
    value,
  ).toLocaleString(
    'en-IN',
  )}`;
}

export function SavedProviderCard({
  provider,
  removing = false,
  onDetails,
  onRemove,
  onBook,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const price =
    money(
      provider.startingPrice,
    );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            theme.colors.surface,
          borderColor:
            theme.colors.border,
        },
        shadows.sm,
      ]}>
      <View
        style={
          styles.topRow
        }>
        {provider.imageUrl ? (
          <Image
            source={{
              uri:
                provider.imageUrl,
            }}
            style={
              styles.image
            }
          />
        ) : (
          <View
            style={
              styles.avatarWrap
            }>
            <Avatar
              initials={
                provider.name
              }
              size="lg"
            />
          </View>
        )}

        <View
          style={
            styles.identity
          }>
          <View
            style={
              styles.nameRow
            }>
            <AppText
              variant="title"
              numberOfLines={1}
              style={
                styles.name
              }>
              {provider.name}
            </AppText>

            {provider.verified ? (
              <Badge variant="success">
                VERIFIED
              </Badge>
            ) : null}
          </View>

          <AppText
            variant="label"
            color={
              theme.colors.primary
            }
            numberOfLines={1}
            style={
              styles.category
            }>
            {provider.category}
          </AppText>

          <View
            style={
              styles.locationRow
            }>
            <AppIcon
              name="mapPin"
              size={14}
              color={
                theme.colors.textMuted
              }
            />

            <AppText
              variant="caption"
              muted
              numberOfLines={1}
              style={
                styles.location
              }>
              {provider.location}
            </AppText>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove from saved providers"
          accessibilityState={{
            busy: removing,
          }}
          disabled={removing}
          hitSlop={6}
          onPress={onRemove}
          style={({pressed}) => [
            styles.savedMark,
            {
              backgroundColor:
                theme.colors.secondary,
              opacity:
                removing
                  ? 0.55
                  : pressed
                    ? 0.72
                    : 1,
            },
          ]}>
          {removing ? (
            <ActivityIndicator
              size="small"
              color={
                theme.colors.primary
              }
            />
          ) : (
            <AppIcon
              name="bookmark"
              size={
                iconSize.sm
              }
              color={
                theme.colors.primary
              }
              fill={
                theme.colors.primary
              }
            />
          )}
        </Pressable>
      </View>

      <View
        style={
          styles.metaRow
        }>
        <View
          style={
            styles.rating
          }>
          <AppIcon
            name="star"
            size={14}
            color="#F5A623"
            fill={
              provider.rating ==
              null
                ? 'none'
                : '#F5A623'
            }
          />

          <AppText
            variant="label">
            {provider.rating ==
            null
              ? `New (${provider.reviewCount} ${
                  provider.reviewCount ===
                  1
                    ? 'review'
                    : 'reviews'
                })`
              : `${provider.rating.toFixed(
                  1,
                )} (${provider.reviewCount} ${
                  provider.reviewCount ===
                  1
                    ? 'review'
                    : 'reviews'
                })`}
          </AppText>
        </View>

        <View
          style={
            styles.dotSeparator
          }
        />

        <AppText
          variant="caption"
          muted>
          {provider.experienceYears}{' '}
          yrs experience
        </AppText>
      </View>

      <View
        style={
          styles.infoRow
        }>
        <View
          style={[
            styles.infoTile,
            {
              backgroundColor:
                '#F5FAF7',
            },
          ]}>
          <AppText
            variant="caption"
            muted>
            Services
          </AppText>

          <AppText
            variant="label"
            style={
              styles.infoValue
            }>
            {
              provider.serviceCount
            }
          </AppText>
        </View>

        <View
          style={[
            styles.infoTile,
            {
              backgroundColor:
                '#F5FAF7',
            },
          ]}>
          <AppText
            variant="caption"
            muted>
            Starting at
          </AppText>

          <AppText
            variant="label"
            color={
              theme.colors.primary
            }
            style={
              styles.infoValue
            }>
            {price ?? '—'}
          </AppText>
        </View>

        <View
          style={[
            styles.infoTile,
            {
              backgroundColor:
                provider.available
                  ? '#ECFAF1'
                  : '#F1F3F2',
            },
          ]}>
          <AppText
            variant="caption"
            color={
              provider.available
                ? '#087443'
                : theme.colors.textMuted
            }>
            Status
          </AppText>

          <View
            style={
              styles.availableRow
            }>
            <View
              style={[
                styles.availableDot,
                {
                  backgroundColor:
                    provider.available
                      ? '#24C56A'
                      : theme.colors.disabled,
                },
              ]}
            />

            <AppText
              variant="label"
              color={
                provider.available
                  ? '#087443'
                  : theme.colors.textMuted
              }
              style={
                styles.infoValue
              }>
              {provider.available
                ? 'Available'
                : 'Unavailable'}
            </AppText>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.actions,
          {
            borderTopColor:
              theme.colors.border,
          },
        ]}>
        <SavedAction
          icon="eye"
          label="Details"
          onPress={
            onDetails
          }
        />

        <SavedAction
          icon="calendar"
          label="Book"
          primary
          disabled={
            !provider.available
          }
          onPress={
            onBook
          }
        />
      </View>
    </View>
  );
}

function SavedAction({
  icon,
  label,
  primary = false,
  disabled = false,
  onPress,
}: {
  icon:
    | 'eye'
    | 'calendar';
  label: string;
  primary?: boolean;
  disabled?: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const background =
    primary &&
    !disabled
      ? '#118B4B'
      : '#FFFFFF';

  const border =
    primary &&
    !disabled
      ? '#118B4B'
      : theme.colors.border;

  const color =
    primary &&
    !disabled
      ? '#FFFFFF'
      : theme.colors.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={
        disabled
      }
      onPress={onPress}
      style={({pressed}) => [
        styles.action,
        {
          backgroundColor:
            background,
          borderColor:
            border,
          opacity:
            disabled
              ? 0.42
              : pressed
                ? 0.8
                : 1,
        },
      ]}>
      <AppIcon
        name={icon}
        size={15}
        color={color}
      />

      <AppText
        variant="label"
        color={color}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderRadius: 22,
      overflow: 'hidden',
    },
    topRow: {
      paddingHorizontal:
        spacing[4],
      paddingTop:
        spacing[4],
      flexDirection: 'row',
      alignItems:
        'flex-start',
      gap: spacing[3],
    },
    image: {
      width: 54,
      height: 54,
      borderRadius: 27,
    },
    avatarWrap: {
      width: 54,
      height: 54,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    identity: {
      flex: 1,
      minWidth: 0,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems:
        'center',
      gap: spacing[2],
    },
    name: {
      flex: 1,
      minWidth: 0,
    },
    category: {
      marginTop: 2,
    },
    locationRow: {
      marginTop: 5,
      flexDirection: 'row',
      alignItems:
        'center',
      gap: 5,
    },
    location: {
      flex: 1,
    },
    savedMark: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    metaRow: {
      paddingHorizontal:
        spacing[4],
      marginTop:
        spacing[3],
      flexDirection: 'row',
      alignItems:
        'center',
      flexWrap: 'wrap',
      gap: 7,
    },
    rating: {
      flexDirection: 'row',
      alignItems:
        'center',
      gap: 5,
    },
    dotSeparator: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor:
        '#A2B0A8',
    },
    infoRow: {
      paddingHorizontal:
        spacing[4],
      marginTop:
        spacing[3],
      flexDirection: 'row',
      gap: spacing[2],
    },
    infoTile: {
      flex: 1,
      minWidth: 0,
      borderRadius:
        radius.md,
      paddingHorizontal: 9,
      paddingVertical: 9,
    },
    infoValue: {
      marginTop: 2,
    },
    availableRow: {
      flexDirection: 'row',
      alignItems:
        'center',
      gap: 5,
    },
    availableDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginTop: 2,
    },
    actions: {
      marginTop:
        spacing[4],
      paddingHorizontal:
        spacing[3],
      paddingVertical:
        spacing[3],
      borderTopWidth: 1,
      flexDirection: 'row',
      gap: spacing[2],
    },
    action: {
      flex: 1,
      minWidth: 0,
      minHeight: 44,
      borderWidth: 1,
      borderRadius: 999,
      flexDirection: 'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 5,
      paddingHorizontal: 7,
    },
  });

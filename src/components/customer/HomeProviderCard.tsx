import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {
  AppIcon,
  iconSize,
} from '../icons';
import {
  AppText,
  Avatar,
  Badge,
} from '../ui';
import {
  Provider,
} from '../../types/provider';
import {
  radius,
  shadows,
  spacing,
  useAppTheme,
} from '../../theme';

type Props = {
  provider: Provider;
  saved: boolean;
  saving?: boolean;
  onDetails: () => void;
  onToggleSaved: () => void;
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

export function HomeProviderCard({
  provider,
  saved,
  saving = false,
  onDetails,
  onToggleSaved,
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
      <View style={styles.decorOne} />
      <View style={styles.decorTwo} />

      <View style={styles.topRow}>
        {provider.imageUrl ? (
          <Image
            source={{
              uri:
                provider.imageUrl,
            }}
            style={styles.image}
          />
        ) : (
          <View style={styles.avatarBox}>
            <Avatar
              initials={
                provider.name
              }
              size="lg"
            />
          </View>
        )}

        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <AppText
              variant="title"
              numberOfLines={1}
              style={styles.name}>
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
            numberOfLines={1}>
            {provider.category}
          </AppText>

          <View style={styles.locationRow}>
            <AppIcon
              name="mapPin"
              size={14}
              color={
                theme.colors
                  .textMuted
              }
            />

            <AppText
              variant="caption"
              muted
              numberOfLines={1}
              style={styles.location}>
              {provider.location}
            </AppText>
          </View>

          {provider.distanceLabel ? (
            <AppText
              variant="caption"
              color={
                theme.colors.primary
              }
              numberOfLines={1}
              style={styles.distance}>
              {provider.distanceLabel}
            </AppText>
          ) : null}
        </View>
      </View>

      {provider.serviceCount >
      0 ? (
        <View
          style={[
            styles.catalog,
            {
              backgroundColor:
                '#ECFAF1',
              borderColor:
                '#D6F0E0',
            },
          ]}>
          <View>
            <AppText
              variant="overline"
              color={
                theme.colors.primary
              }>
              PROVIDER CATALOG
            </AppText>

            <AppText
              variant="label"
              style={styles.catalogValue}>
              {provider.serviceCount}{' '}
              {provider.serviceCount ===
              1
                ? 'service'
                : 'services'}{' '}
              available
            </AppText>
          </View>

          {price ? (
            <View style={styles.price}>
              <AppText
                variant="overline"
                color={
                  theme.colors
                    .textMuted
                }>
                STARTING AT
              </AppText>

              <AppText
                variant="title"
                color={
                  theme.colors.primary
                }>
                {price}
              </AppText>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.metaRow}>
        <View style={styles.ratingRow}>
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
            variant="label"
            color={
              theme.colors.text
            }>
            {provider.rating ==
            null
              ? 'New'
              : provider.rating.toFixed(
                  1,
                )}
          </AppText>

          <AppText
            variant="caption"
            muted>
            {provider.reviewCount}{' '}
            reviews
          </AppText>

          <AppText
            variant="caption"
            muted>
            •
          </AppText>

          <AppText
            variant="caption"
            muted>
            {provider.experienceYears}{' '}
            yrs experience
          </AppText>
        </View>

        <View style={styles.availableRow}>
          <View
            style={[
              styles.availableDot,
              {
                backgroundColor:
                  provider.available
                    ? '#24C56A'
                    : theme.colors
                        .disabled,
              },
            ]}
          />

          <AppText
            variant="caption"
            color={
              provider.available
                ? theme.colors
                    .primary
                : theme.colors
                    .textMuted
            }>
            {provider.available
              ? 'Available'
              : 'Unavailable'}
          </AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <ProviderAction
          icon="eye"
          label="Details"
          onPress={onDetails}
        />

        <ProviderAction
          icon="bookmark"
          label={
            saved
              ? 'Saved'
              : 'Save'
          }
          active={saved}
          busy={saving}
          onPress={
            onToggleSaved
          }
        />

        <ProviderAction
          icon="calendar"
          label="Book"
          filled
          disabled={
            !provider.available
          }
          onPress={onBook}
        />
      </View>
    </View>
  );
}

function ProviderAction({
  icon,
  label,
  active = false,
  filled = false,
  disabled = false,
  busy = false,
  onPress,
}: {
  icon:
    | 'eye'
    | 'bookmark'
    | 'calendar';
  label: string;
  active?: boolean;
  filled?: boolean;
  disabled?: boolean;
  busy?: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const dark =
    filled &&
    !disabled;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={
        disabled ||
        busy
      }
      onPress={onPress}
      style={({pressed}) => [
        styles.action,
        {
          backgroundColor:
            dark
              ? '#092C20'
              : active
                ? theme.colors
                    .secondary
                : theme.colors
                    .surface,
          borderColor:
            dark
              ? '#092C20'
              : active
                ? theme.colors
                    .primary
                : theme.colors
                    .border,
          opacity:
            disabled
              ? 0.45
              : pressed
                ? 0.85
                : 1,
        },
      ]}>
      {busy ? (
        <ActivityIndicator
          size="small"
          color={
            theme.colors.primary
          }
        />
      ) : (
        <AppIcon
          name={icon}
          size={16}
          color={
            dark
              ? '#FFFFFF'
              : active
                ? theme.colors
                    .primary
                : theme.colors
                    .textSecondary
          }
          fill={
            icon ===
              'bookmark' &&
            active
              ? theme.colors
                  .primary
              : 'none'
          }
        />
      )}

      <AppText
        variant="label"
        color={
          dark
            ? '#FFFFFF'
            : active
              ? theme.colors
                  .primary
              : theme.colors
                  .textSecondary
        }>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderRadius:
        radius.xl,
      padding: spacing[4],
      overflow: 'hidden',
    },
    decorOne: {
      position: 'absolute',
      width: 110,
      height: 110,
      borderRadius: 55,
      right: -56,
      top: 42,
      borderWidth: 7,
      borderColor:
        '#F0FAF4',
    },
    decorTwo: {
      position: 'absolute',
      width: 46,
      height: 46,
      borderRadius: 23,
      right: 15,
      top: 80,
      borderWidth: 4,
      borderColor:
        '#F0FAF4',
    },
    topRow: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      gap: spacing[3],
    },
    image: {
      width: 56,
      height: 56,
      borderRadius:
        radius.md,
    },
    avatarBox: {
      width: 56,
      height: 56,
      alignItems:
        'center',
      justifyContent:
        'center',
    },
    identity: {
      flex: 1,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems:
        'center',
      gap: spacing[2],
    },
    name: {
      flex: 1,
    },
    locationRow: {
      marginTop:
        spacing[1],
      flexDirection: 'row',
      alignItems:
        'center',
      gap: spacing[1],
    },
    location: {
      flex: 1,
    },
    distance: {
      marginTop:
        spacing[2],
      fontWeight: '600',
    },
    catalog: {
      marginTop:
        spacing[4],
      borderWidth: 1,
      borderRadius:
        radius.md,
      padding: spacing[3],
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems:
        'center',
      gap: spacing[3],
    },
    catalogValue: {
      marginTop:
        spacing[1],
    },
    price: {
      alignItems:
        'flex-end',
    },
    metaRow: {
      marginTop:
        spacing[4],
      paddingTop:
        spacing[3],
      borderTopWidth: 1,
      borderTopColor:
        '#EDF2EF',
      gap: spacing[3],
    },
    ratingRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems:
        'center',
      gap: spacing[2],
    },
    availableRow: {
      flexDirection: 'row',
      alignItems:
        'center',
      gap: spacing[2],
    },
    availableDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing[2],
      marginTop:
        spacing[4],
    },
    action: {
      flex: 1,
      minHeight: 44,
      borderWidth: 1,
      borderRadius:
        radius.md,
      flexDirection: 'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: spacing[2],
      paddingHorizontal:
        spacing[2],
    },
  });

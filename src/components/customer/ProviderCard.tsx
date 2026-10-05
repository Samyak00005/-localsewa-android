import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { spacing, useAppTheme } from '../../theme';
import { Provider } from '../../types/provider';
import { AppIcon, iconSize } from '../icons';
import { AppText, Avatar, Badge, Card } from '../ui';

type ProviderCardProps = {
  provider: Provider;
  onPress: () => void;
};

function money(value?: number): string | null {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }

  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function ProviderCard({
  provider,
  onPress,
}: ProviderCardProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const price = money(provider.startingPrice);

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {({ pressed }) => (
        <Card style={[styles.card, { opacity: pressed ? 0.92 : 1 }]}>
          <View style={styles.row}>
            {provider.imageUrl ? (
              <Image source={{ uri: provider.imageUrl }} style={styles.image} />
            ) : (
              <Avatar initials={provider.name} size="lg" />
            )}

            <View style={styles.copy}>
              <View style={styles.titleRow}>
                <AppText variant="title" numberOfLines={1} style={styles.name}>
                  {provider.name}
                </AppText>

                {provider.verified ? (
                  <Badge variant="success">VERIFIED</Badge>
                ) : null}
              </View>

              <AppText
                variant="bodySmall"
                color={theme.colors.primary}
                numberOfLines={1}
              >
                {provider.category}
              </AppText>

              <AppText
                variant="caption"
                muted
                numberOfLines={1}
                style={styles.meta}
              >
                {provider.location}
              </AppText>

              <View style={styles.footer}>
                <View>
                  {provider.rating == null ? (
                    <AppText variant="label">New</AppText>
                  ) : (
                    <View style={styles.rating}>
                      <AppIcon
                        name="star"
                        size={iconSize.xs}
                        color={theme.colors.warning}
                        fill={theme.colors.warning}
                      />
                      <AppText variant="label">
                        {provider.rating.toFixed(1)}
                      </AppText>
                    </View>
                  )}

                  <AppText variant="caption" muted>
                    {provider.reviewCount}{' '}
                    {provider.reviewCount === 1 ? 'review' : 'reviews'}
                  </AppText>
                </View>

                <View style={styles.price}>
                  {price ? (
                    <>
                      <AppText variant="caption" muted>
                        Starting
                      </AppText>
                      <AppText variant="label" color={theme.colors.primary}>
                        {price}
                      </AppText>
                    </>
                  ) : (
                    <Badge variant={provider.available ? 'success' : 'default'}>
                      {provider.available ? 'AVAILABLE' : 'UNAVAILABLE'}
                    </Badge>
                  )}
                </View>
              </View>
            </View>
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  copy: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  name: {
    flex: 1,
  },
  meta: {
    marginTop: spacing[1],
  },
  footer: {
    marginTop: spacing[3],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  price: {
    alignItems: 'flex-end',
  },
});

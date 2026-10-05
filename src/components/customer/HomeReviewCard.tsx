import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { radius, shadows, spacing, useAppTheme } from '../../theme';
import { HomeReview } from '../../types/home';
import { AppIcon } from '../icons';
import { AppText, Avatar } from '../ui';

type Props = {
  review: HomeReview;
};

export function HomeReviewCard({ review }: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: '#DDE9E2',
        },
        shadows.sm,
      ]}
    >
      <View style={styles.header}>
        {review.customerImage ? (
          <Image
            source={{
              uri: review.customerImage,
            }}
            style={styles.avatar}
          />
        ) : (
          <Avatar initials={review.customerName} size="md" />
        )}

        <View style={styles.copy}>
          <AppText variant="label" numberOfLines={1}>
            {review.customerName}
          </AppText>

          {review.providerName ? (
            <AppText variant="caption" muted numberOfLines={1}>
              {review.providerName}
            </AppText>
          ) : null}
        </View>
      </View>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(value => (
          <AppIcon
            key={value}
            name="star"
            size={14}
            color="#F5B301"
            fill={value <= Math.round(review.rating) ? '#F5B301' : 'none'}
          />
        ))}
      </View>

      <View
        style={[
          styles.quoteRule,
          {
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <AppText variant="h3" color={theme.colors.primary}>
          “
        </AppText>
      </View>

      <AppText
        variant="bodySmall"
        color={theme.colors.textSecondary}
        style={styles.comment}
        numberOfLines={4}
      >
        {review.comment}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 216,
    minHeight: 176,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  copy: {
    flex: 1,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: spacing[4],
  },
  quoteRule: {
    marginTop: spacing[3],
    borderBottomWidth: 1,
    height: 22,
  },
  comment: {
    marginTop: spacing[3],
  },
});

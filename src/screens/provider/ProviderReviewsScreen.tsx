import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { AppIcon, iconSize } from '../../components/icons';
import {
  AlertBanner,
  AppText,
  Avatar,
  Button,
  Card,
  Skeleton,
} from '../../components/ui';
import { useProviderReviews } from '../../hooks/useProviderWorkspace';
import { ProviderWorkspaceReview } from '../../types/providerWorkspace';
import { customerPalette, layout, radius, spacing, useAppTheme } from '../../theme';

const PROVIDER_SURFACE_RADIUS = 28;

export function ProviderReviewsScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const { data, isLoading, error, refetch, isRefetching } = useProviderReviews();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          tintColor={theme.colors.primary}
        />
      }
    >
      {isLoading ? (
        <ReviewsSkeleton />
      ) : error ? (
        <View style={styles.errorBlock}>
          <AlertBanner variant="error">{errorMessage(error)}</AlertBanner>
          <Button
            label="Retry"
            loading={isRefetching}
            onPress={() => refetch()}
            fullWidth
          />
        </View>
      ) : data ? (
        <>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryMainRow}>
              <View
                style={[
                  styles.summaryIcon,
                  { backgroundColor: theme.colors.secondary },
                ]}
              >
                <AppIcon
                  name="star"
                  size={iconSize.lg}
                  color={customerPalette.accent}
                />
              </View>

              <View style={styles.summaryCopy}>
                <AppText variant="caption" muted>
                  Overall rating
                </AppText>

                <View style={styles.ratingValueRow}>
                  <AppText variant="display" color={theme.colors.primary}>
                    {data.averageRating == null
                      ? 'New'
                      : data.averageRating.toFixed(1)}
                  </AppText>
                  {data.averageRating != null ? (
                    <AppText variant="bodySmall" muted style={styles.outOfFive}>
                      / 5
                    </AppText>
                  ) : null}
                </View>

                {data.averageRating != null ? (
                  <StarRow rating={data.averageRating} />
                ) : (
                  <AppText variant="bodySmall" muted style={styles.smallGap}>
                    Your rating will appear after the first review.
                  </AppText>
                )}
              </View>
            </View>

            <View
              style={[
                styles.summaryFooter,
                { borderTopColor: theme.colors.border },
              ]}
            >
              <AppText variant="bodySmall" muted>
                Total reviews
              </AppText>
              <AppText variant="label" color={theme.colors.primary}>
                {data.reviews.length}{' '}
                {data.reviews.length === 1 ? 'review' : 'reviews'}
              </AppText>
            </View>
          </Card>

          <View style={styles.feedbackHeader}>
            <View style={styles.flex}>
              <AppText variant="h2">Customer feedback</AppText>
              <AppText variant="caption" muted style={styles.smallGap}>
                Feedback from customers after completed services.
              </AppText>
            </View>
          </View>

          {data.reviews.length ? (
            <View style={styles.reviewList}>
              {data.reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: theme.colors.secondary },
                ]}
              >
                <AppIcon
                  name="star"
                  size={iconSize.lg}
                  color={customerPalette.accent}
                />
              </View>
              <AppText variant="title" style={styles.emptyTitle}>
                No reviews yet
              </AppText>
              <AppText variant="bodySmall" muted style={styles.emptyCopy}>
                Customer reviews from completed services will appear here.
              </AppText>
            </Card>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

function ReviewCard({
  review,
}: {
  review: ProviderWorkspaceReview;
}): React.JSX.Element {
  const { theme } = useAppTheme();
  const customerName = review.customerName || 'Customer';

  return (
    <Card style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <Avatar initials={customerName} size="sm" />

        <View style={styles.flex}>
          <AppText variant="label" numberOfLines={1}>
            {customerName}
          </AppText>
          {review.serviceName ? (
            <AppText variant="caption" muted style={styles.smallGap}>
              {review.serviceName}
            </AppText>
          ) : null}
        </View>

        <View style={styles.ratingPill}>
          <AppIcon
            name="star"
            size={iconSize.xs}
            color={customerPalette.accent}
            fill={customerPalette.accent}
          />
          <AppText variant="label" color={theme.colors.primary}>
            {review.rating.toFixed(1)}
          </AppText>
        </View>
      </View>

      <AppText variant="bodySmall" style={styles.comment}>
        {review.comment || 'Rating submitted without a written comment.'}
      </AppText>

      {review.createdAt ? (
        <View style={styles.dateRow}>
          <AppIcon
            name="calendar"
            size={iconSize.xs}
            color={theme.colors.textMuted}
          />
          <AppText variant="caption" muted>
            {formatReviewDate(review.createdAt)}
          </AppText>
        </View>
      ) : null}
    </Card>
  );
}

function StarRow({ rating }: { rating: number }): React.JSX.Element {
  const { theme } = useAppTheme();
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <View
      style={styles.stars}
      accessibilityLabel={`${rating.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(value => (
        <AppIcon
          key={value}
          name="star"
          size={iconSize.xs}
          color={value <= rounded ? customerPalette.accent : theme.colors.border}
          fill={value <= rounded ? customerPalette.accent : 'none'}
        />
      ))}
    </View>
  );
}

function formatReviewDate(value: string): string {
  const normalized = /^\d{4}-\d{2}-\d{2} \d/.test(value)
    ? `${value.replace(' ', 'T')}+05:30`
    : value;
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function ReviewsSkeleton(): React.JSX.Element {
  return (
    <View style={styles.skeletonStack}>
      <Skeleton height={178} radiusValue={PROVIDER_SURFACE_RADIUS} />
      <Skeleton height={138} radiusValue={PROVIDER_SURFACE_RADIUS} />
      <Skeleton height={138} radiusValue={PROVIDER_SURFACE_RADIUS} />
      <Skeleton height={138} radiusValue={PROVIDER_SURFACE_RADIUS} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[5],
  },
  errorBlock: { gap: spacing[3] },
  summaryCard: {
    minHeight: 178,
    borderRadius: PROVIDER_SURFACE_RADIUS,
    padding: spacing[4],
  },
  summaryMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  summaryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCopy: { flex: 1, minWidth: 0 },
  ratingValueRow: {
    marginTop: spacing[1],
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  outOfFive: { marginLeft: spacing[1] },
  stars: {
    marginTop: spacing[1],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  smallGap: { marginTop: spacing[1] },
  summaryFooter: {
    marginTop: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  flex: { flex: 1, minWidth: 0 },
  reviewList: { gap: spacing[3] },
  reviewCard: {
    borderRadius: PROVIDER_SURFACE_RADIUS,
    padding: spacing[4],
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  ratingPill: {
    minHeight: 32,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  comment: { marginTop: spacing[4], lineHeight: 21 },
  dateRow: {
    marginTop: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  emptyCard: {
    minHeight: 260,
    borderRadius: PROVIDER_SURFACE_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { marginTop: spacing[4] },
  emptyCopy: {
    marginTop: spacing[2],
    textAlign: 'center',
    maxWidth: 310,
  },
  skeletonStack: { gap: spacing[4] },
});

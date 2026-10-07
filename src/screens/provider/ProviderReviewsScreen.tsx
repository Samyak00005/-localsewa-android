import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  errorMessage,
} from '../../api/apiClient';
import {
  AppIcon,
  iconSize,
} from '../../components/icons';
import {
  AlertBanner,
  AppText,
  Avatar,
  Button,
  Card,
  Skeleton,
} from '../../components/ui';
import {
  useProviderReviews,
} from '../../hooks/useProviderWorkspace';
import {
  ProviderWorkspaceReview,
} from '../../types/providerWorkspace';
import {
  layout,
  radius,
  spacing,
  useAppTheme,
} from '../../theme';

export function ProviderReviewsScreen(): React.JSX.Element {
  const {
    theme,
  } = useAppTheme();

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } =
    useProviderReviews();

  return (
    <ScrollView
      style={[
        styles.screen,
        {
          backgroundColor:
            theme.colors
              .background,
        },
      ]}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
      refreshControl={
        <RefreshControl
          refreshing={
            isRefetching
          }
          onRefresh={() =>
            refetch()
          }
          tintColor={
            theme.colors
              .primary
          }
        />
      }>
      <AppText variant="h1">
        Reviews
      </AppText>

      <AppText
        variant="body"
        muted
        style={
          styles.description
        }>
        Track your rating and read feedback from completed services.
      </AppText>

      {isLoading ? (
        <ReviewsSkeleton />
      ) : error ? (
        <View
          style={
            styles.errorBlock
          }>
          <AlertBanner variant="error">
            {errorMessage(
              error,
            )}
          </AlertBanner>

          <Button
            label="Retry"
            loading={
              isRefetching
            }
            onPress={() =>
              refetch()
            }
            fullWidth
          />
        </View>
      ) : data ? (
        <>
          <Card
            style={
              styles.summaryCard
            }>
            <View
              style={
                styles.summaryTop
              }>
              <View>
                <AppText
                  variant="display"
                  color={
                    theme.colors
                      .primary
                  }>
                  {data.averageRating ==
                  null
                    ? 'New'
                    : data.averageRating.toFixed(
                        1,
                      )}
                </AppText>

                {data.averageRating !=
                null ? (
                  <StarRow
                    rating={
                      data.averageRating
                    }
                  />
                ) : null}

                <AppText
                  variant="caption"
                  muted
                  style={
                    styles.smallGap
                  }>
                  {data.totalReviews}{' '}
                  {data.totalReviews ===
                  1
                    ? 'review'
                    : 'reviews'}
                </AppText>
              </View>

              <View
                style={[
                  styles.fiveStarBox,
                  {
                    backgroundColor:
                      theme.colors
                        .secondary,
                  },
                ]}>
                <AppIcon
                  name="star"
                  size={
                    iconSize.sm
                  }
                  color={
                    theme.colors
                      .primary
                  }
                />

                <AppText variant="title">
                  {
                    data.fiveStarCount
                  }
                </AppText>

                <AppText
                  variant="caption"
                  muted>
                  5-star
                </AppText>
              </View>
            </View>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor:
                    theme.colors
                      .border,
                },
              ]}
            />

            <View
              style={
                styles.distribution
              }>
              {[
                5,
                4,
                3,
                2,
                1,
              ].map(value => (
                <RatingBar
                  key={value}
                  rating={
                    value as
                      | 1
                      | 2
                      | 3
                      | 4
                      | 5
                  }
                  count={
                    data.distribution[
                      value as
                        | 1
                        | 2
                        | 3
                        | 4
                        | 5
                    ]
                  }
                  total={
                    Math.max(
                      1,
                      data.reviews
                        .length,
                    )
                  }
                />
              ))}
            </View>
          </Card>

          <View
            style={
              styles.feedbackHeader
            }>
            <View
              style={
                styles.flex
              }>
              <AppText variant="h2">
                Customer feedback
              </AppText>

              <AppText
                variant="caption"
                muted
                style={
                  styles.smallGap
                }>
                Most recent provider reviews
              </AppText>
            </View>

            <AppText
              variant="caption"
              muted>
              {
                data.reviews
                  .length
              }{' '}
              shown
            </AppText>
          </View>

          {data.reviews.length ? (
            <View
              style={
                styles.reviewList
              }>
              {data.reviews.map(
                review => (
                  <ReviewCard
                    key={
                      review.id
                    }
                    review={
                      review
                    }
                  />
                ),
              )}
            </View>
          ) : (
            <Card
              style={
                styles.emptyCard
              }>
              <View
                style={[
                  styles.emptyIcon,
                  {
                    backgroundColor:
                      theme.colors
                        .secondary,
                  },
                ]}>
                <AppIcon
                  name="star"
                  size={
                    iconSize.lg
                  }
                  color={
                    theme.colors
                      .primary
                  }
                />
              </View>

              <AppText
                variant="title"
                style={
                  styles.emptyTitle
                }>
                No reviews yet
              </AppText>

              <AppText
                variant="bodySmall"
                muted
                style={
                  styles.emptyText
                }>
                Customer reviews will appear here after completed services are rated.
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
  const {
    theme,
  } = useAppTheme();

  const customerName =
    review.customerName ||
    'Customer';

  return (
    <Card
      style={
        styles.reviewCard
      }>
      <View
        style={
          styles.reviewTop
        }>
        <Avatar
          initials={
            customerName
          }
          size="sm"
        />

        <View
          style={
            styles.reviewIdentity
          }>
          <AppText
            variant="label"
            numberOfLines={
              1
            }>
            {customerName}
          </AppText>

          {review.serviceName ? (
            <AppText
              variant="caption"
              muted
              numberOfLines={
                1
              }>
              {
                review.serviceName
              }
            </AppText>
          ) : null}
        </View>

        <View
          style={
            styles.ratingPill
          }>
          <AppIcon
            name="star"
            size={14}
            color="#C76B00"
            fill="#C76B00"
          />

          <AppText variant="label">
            {review.rating.toFixed(
              1,
            )}
          </AppText>
        </View>
      </View>

      {review.comment ? (
        <AppText
          variant="bodySmall"
          color={
            theme.colors
              .textSecondary
          }
          style={
            styles.reviewComment
          }>
          {review.comment}
        </AppText>
      ) : (
        <AppText
          variant="bodySmall"
          muted
          style={
            styles.reviewComment
          }>
          Rating submitted without a written comment.
        </AppText>
      )}

      <View
        style={
          styles.reviewMeta
        }>
        {review.bookingCode ? (
          <AppText
            variant="caption"
            muted>
            {
              review.bookingCode
            }
          </AppText>
        ) : null}

        {review.createdAt ? (
          <AppText
            variant="caption"
            muted>
            {formatDate(
              review.createdAt,
            )}
          </AppText>
        ) : null}
      </View>
    </Card>
  );
}

function RatingBar({
  rating,
  count,
  total,
}: {
  rating:
    | 1
    | 2
    | 3
    | 4
    | 5;
  count: number;
  total: number;
}): React.JSX.Element {
  const {
    theme,
  } = useAppTheme();

  const percent =
    Math.max(
      0,
      Math.min(
        100,
        (count /
          total) *
          100,
      ),
    );

  return (
    <View
      style={
        styles.ratingBarRow
      }>
      <AppText
        variant="caption"
        style={
          styles.ratingNumber
        }>
        {rating}
      </AppText>

      <AppIcon
        name="star"
        size={12}
        color="#C76B00"
        fill="#C76B00"
      />

      <View
        style={[
          styles.track,
          {
            backgroundColor:
              theme.colors
                .surfaceMuted,
          },
        ]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor:
                theme.colors
                  .primary,
              width: `${percent}%`,
            },
          ]}
        />
      </View>

      <AppText
        variant="caption"
        muted
        style={
          styles.ratingCount
        }>
        {count}
      </AppText>
    </View>
  );
}

function StarRow({
  rating,
}: {
  rating: number;
}): React.JSX.Element {
  return (
    <View
      style={
        styles.stars
      }>
      {[
        1,
        2,
        3,
        4,
        5,
      ].map(value => (
        <AppIcon
          key={value}
          name="star"
          size={15}
          color="#C76B00"
          fill={
            value <=
            Math.round(
              rating,
            )
              ? '#C76B00'
              : 'none'
          }
        />
      ))}
    </View>
  );
}

function formatDate(
  value: string,
): string {
  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return value;
  }

  return parsed.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
}

function ReviewsSkeleton(): React.JSX.Element {
  return (
    <>
      <Card
        style={
          styles.summaryCard
        }>
        <Skeleton
          width="36%"
          height={44}
        />

        <Skeleton
          width="60%"
          height={16}
          style={
            styles.skeletonGap
          }
        />

        <Skeleton
          width="100%"
          height={120}
          radiusValue={14}
          style={
            styles.skeletonGap
          }
        />
      </Card>

      <Card
        style={
          styles.reviewCard
        }>
        <Skeleton
          width="55%"
          height={18}
        />

        <Skeleton
          width="100%"
          height={58}
          radiusValue={12}
          style={
            styles.skeletonGap
          }
        />
      </Card>
    </>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    content: {
      paddingHorizontal:
        layout.screenHorizontal,
      paddingTop:
        spacing[5],
      paddingBottom:
        spacing[12],
    },
    description: {
      marginTop:
        spacing[2],
    },
    errorBlock: {
      marginTop:
        spacing[5],
      gap: spacing[3],
    },
    summaryCard: {
      marginTop:
        spacing[5],
      borderRadius:
        radius.xl,
    },
    summaryTop: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap: spacing[4],
    },
    fiveStarBox: {
      minWidth: 92,
      minHeight: 86,
      borderRadius: 18,
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 3,
    },
    stars: {
      marginTop:
        spacing[1],
      flexDirection:
        'row',
      gap: 2,
    },
    divider: {
      height:
        StyleSheet.hairlineWidth,
      marginVertical:
        spacing[4],
    },
    distribution: {
      gap: spacing[2],
    },
    ratingBarRow: {
      minHeight: 20,
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 5,
    },
    ratingNumber: {
      width: 10,
      textAlign:
        'right',
    },
    track: {
      flex: 1,
      height: 7,
      borderRadius: 999,
      overflow:
        'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 999,
    },
    ratingCount: {
      width: 26,
      textAlign:
        'right',
    },
    feedbackHeader: {
      marginTop:
        spacing[7],
      flexDirection:
        'row',
      alignItems:
        'flex-end',
      gap: spacing[3],
    },
    reviewList: {
      marginTop:
        spacing[3],
      gap: spacing[3],
    },
    reviewCard: {
      borderRadius:
        radius.lg,
    },
    reviewTop: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: spacing[3],
    },
    reviewIdentity: {
      flex: 1,
      minWidth: 0,
    },
    ratingPill: {
      minHeight: 30,
      paddingHorizontal:
        spacing[2],
      borderRadius: 999,
      backgroundColor:
        '#FFF6E8',
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 4,
    },
    reviewComment: {
      marginTop:
        spacing[3],
      lineHeight: 21,
    },
    reviewMeta: {
      marginTop:
        spacing[3],
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap: spacing[2],
    },
    emptyCard: {
      marginTop:
        spacing[3],
      alignItems:
        'center',
      paddingVertical:
        spacing[8],
    },
    emptyIcon: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems:
        'center',
      justifyContent:
        'center',
    },
    emptyTitle: {
      marginTop:
        spacing[3],
    },
    emptyText: {
      marginTop:
        spacing[2],
      textAlign:
        'center',
      maxWidth: 280,
    },
    flex: {
      flex: 1,
      minWidth: 0,
    },
    smallGap: {
      marginTop:
        spacing[1],
    },
    skeletonGap: {
      marginTop:
        spacing[3],
    },
  });

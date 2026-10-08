import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { useReviewBooking } from '../../hooks/useCustomerData';
import { radius, spacing, useAppTheme } from '../../theme';
import { AppIcon, iconSize } from '../icons';
import { AlertBanner, AppText, Button } from '../ui';

type Props = {
  bookingId: number;
  canRate: boolean;
  rating: number | null;
  reviewComment: string | null;
  compact?: boolean;
};

export function InlineBookingReview({
  bookingId,
  canRate,
  rating,
  reviewComment,
  compact = false,
}: Props): React.JSX.Element | null {
  const { theme } = useAppTheme();

  const review = useReviewBooking();

  const [selectedRating, setSelectedRating] = useState(0);

  const [comment, setComment] = useState('');

  const [expanded, setExpanded] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);

  if (rating != null) {
    return (
      <View
        style={[
          styles.reviewedBox,
          {
            backgroundColor: '#F6FBF8',
            borderColor: '#D7E8DE',
          },
        ]}
      >
        <View style={styles.reviewedHeader}>
          <AppText variant="label" color="#0A5B36">
            Your review
          </AppText>

          <View style={styles.ratingValue}>
            <AppIcon name="star" size={15} color={theme.colors.rating} fill={theme.colors.rating} />

            <AppText variant="label" color="#B06A00">
              {rating}
            </AppText>
          </View>
        </View>

        {reviewComment ? (
          <AppText
            variant="bodySmall"
            color={theme.colors.textSecondary}
            numberOfLines={compact ? 3 : undefined}
            style={styles.reviewComment}
          >
            {reviewComment}
          </AppText>
        ) : null}
      </View>
    );
  }

  if (!canRate) {
    return null;
  }

  async function submit() {
    if (selectedRating < 1 || selectedRating > 5) {
      setLocalError('Select a rating first.');
      return;
    }

    setLocalError(null);

    try {
      await review.mutateAsync({
        bookingId,
        rating: selectedRating,
        comment,
      });

      setComment('');
      setExpanded(false);
    } catch (mutationError) {
      setLocalError(errorMessage(mutationError));
    }
  }

  return (
    <View
      style={[
        styles.rateBox,
        {
          borderColor: '#CFECDD',
          backgroundColor: '#FBFFFC',
        },
      ]}
    >
      <AppText variant="label" color="#087443" style={styles.center}>
        How was your service?
      </AppText>

      <AppText
        variant="caption"
        color={theme.colors.textMuted}
        style={[styles.center, styles.subtitle]}
      >
        Rate your experience
      </AppText>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(value => {
          const selected = value <= selectedRating;

          return (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`${value} star rating`}
              onPress={() => {
                setSelectedRating(value);
                setExpanded(true);
                setLocalError(null);
              }}
              hitSlop={5}
              style={({ pressed }) => [
                styles.starButton,
                {
                  opacity: pressed ? 0.65 : 1,
                },
              ]}
            >
              <AppIcon
                name="star"
                size={compact ? 21 : iconSize.lg}
                color={selected ? theme.colors.rating : '#B8C6D4'}
                fill={selected ? '#FFF4D1' : 'none'}
              />
            </Pressable>
          );
        })}
      </View>

      {expanded ? (
        <View style={styles.form}>
          {localError ? (
            <AlertBanner variant="error">{localError}</AlertBanner>
          ) : null}

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Share a short review (optional)"
            placeholderTextColor="#7E8E86"
            multiline
            maxLength={1000}
            textAlignVertical="top"
            style={[
              styles.input,
              {
                color: theme.colors.text,
                borderColor: '#A8E3C0',
                backgroundColor: theme.colors.surface,
              },
            ]}
          />

          <Button
            label="Save review"
            loading={review.isPending}
            onPress={submit}
            fullWidth
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rateBox: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  center: {
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 2,
  },
  stars: {
    marginTop: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  starButton: {
    minWidth: 28,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    marginTop: spacing[3],
    gap: spacing[3],
  },
  input: {
    minHeight: 86,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: 14,
  },
  reviewedBox: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  reviewedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewComment: {
    marginTop: spacing[2],
  },
});

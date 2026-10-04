import React, {
  useState,
} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  errorMessage,
} from '../../api/apiClient';
import {
  AlertBanner,
  AppText,
  Button,
  Card,
  Input,
} from '../../components/ui';
import {
  useReviewBooking,
} from '../../hooks/useCustomerData';
import {
  CustomerStackParamList,
} from '../../navigation/types';
import {
  layout,
  radius,
  spacing,
  useAppTheme,
} from '../../theme';

type Props =
  NativeStackScreenProps<
    CustomerStackParamList,
    'BookingReview'
  >;

export function BookingReviewScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const {theme} = useAppTheme();
  const review =
    useReviewBooking();

  const [rating, setRating] =
    useState(5);
  const [comment, setComment] =
    useState('');
  const [error, setError] =
    useState<string | null>(null);

  async function submit() {
    setError(null);

    try {
      await review.mutateAsync({
        bookingId:
          route.params.bookingId,
        rating,
        comment,
      });

      navigation.goBack();
    } catch (
      mutationError
    ) {
      setError(
        errorMessage(
          mutationError,
        ),
      );
    }
  }

  return (
    <ScrollView
      style={{
        backgroundColor:
          theme.colors.background,
      }}
      contentContainerStyle={
        styles.content
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <AppText variant="h1">
        Rate your service
      </AppText>

      <AppText
        variant="body"
        muted
        style={styles.subtitle}>
        Your rating updates the provider’s Localsewa review profile.
      </AppText>

      <Card style={styles.card}>
        {error ? (
          <AlertBanner variant="error">
            {error}
          </AlertBanner>
        ) : null}

        <AppText variant="label">
          Rating
        </AppText>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map(
            value => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={`${value} star rating`}
                onPress={() =>
                  setRating(value)
                }
                style={[
                  styles.starButton,
                  {
                    backgroundColor:
                      value <= rating
                        ? theme.colors.secondary
                        : theme.colors.surfaceMuted,
                    borderColor:
                      value <= rating
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}>
                <AppText
                  variant="h3"
                  color={
                    value <= rating
                      ? theme.colors.primary
                      : theme.colors.textMuted
                  }>
                  ★
                </AppText>
              </Pressable>
            ),
          )}
        </View>

        <Input
          label="Comment (optional)"
          placeholder="How was your experience?"
          value={comment}
          onChangeText={
            setComment
          }
          multiline
          maxLength={1000}
          style={styles.comment}
        />

        <Button
          label="Submit review"
          loading={
            review.isPending
          }
          onPress={submit}
          fullWidth
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal:
      layout.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[12],
  },
  subtitle: {
    marginTop: spacing[2],
  },
  card: {
    marginTop: spacing[6],
    gap: spacing[5],
  },
  stars: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  starButton: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comment: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
});

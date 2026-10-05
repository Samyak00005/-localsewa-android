import React, {
  useEffect,
  useState,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

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
  useCustomerProfile,
  useUpdateCustomerProfile,
} from '../../hooks/useAccount';
import {
  validateFullName,
} from '../../utils/authValidation';
import {
  layout,
  spacing,
  useAppTheme,
} from '../../theme';

export function EditCustomerProfileScreen(): React.JSX.Element {
  const {theme} =
    useAppTheme();

  const {
    data: profile,
    isLoading,
    error,
  } = useCustomerProfile();

  const update =
    useUpdateCustomerProfile();

  const [fullName, setFullName] =
    useState('');
  const [message, setMessage] =
    useState<string | null>(null);
  const [formError, setFormError] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFullName(
      profile.fullName,
    );
  }, [profile]);

  async function save() {
    setMessage(null);
    setFormError(null);

    const nameCheck =
      validateFullName(
        fullName,
      );

    if (!nameCheck.valid) {
      setFormError(
        nameCheck.message,
      );
      return;
    }


    try {
      await update.mutateAsync({
        fullName,
        phone:
          profile?.phone ??
          '',
        whatsapp:
          profile?.whatsapp ??
          '',
      });

      setMessage(
        'Profile updated successfully.',
      );
    } catch (
      mutationError
    ) {
      setFormError(
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
      keyboardShouldPersistTaps="handled">
      <AppText variant="h1">
        Edit profile
      </AppText>

      <AppText
        variant="body"
        muted
        style={styles.subtitle}>
        Update the profile details that are allowed to change. Your linked
        email and mobile number stay fixed.
      </AppText>

      {error ? (
        <View style={styles.section}>
          <AlertBanner variant="error">
            {errorMessage(error)}
          </AlertBanner>
        </View>
      ) : null}

      {message ? (
        <View style={styles.section}>
          <AlertBanner variant="success">
            {message}
          </AlertBanner>
        </View>
      ) : null}

      {formError ? (
        <View style={styles.section}>
          <AlertBanner variant="error">
            {formError}
          </AlertBanner>
        </View>
      ) : null}

      <Card style={styles.card}>
        <View style={styles.form}>
          <Input
            label="Full name"
            placeholder="Your name"
            value={fullName}
            onChangeText={
              setFullName
            }
            editable={
              !isLoading &&
              !update.isPending
            }
            maxLength={80}
          />


          <Button
            label="Save changes"
            loading={
              update.isPending
            }
            onPress={save}
            fullWidth
          />
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <AppText variant="label">
          Linked account details
        </AppText>

        <AppText
          variant="bodySmall"
          muted
          style={styles.subtitle}>
          Your account email and mobile number cannot be changed after they are
          linked to your Localsewa account.
        </AppText>
      </Card>

      <Card style={styles.infoCard}>
        <AppText variant="label">
          Profile photo
        </AppText>

        <AppText
          variant="bodySmall"
          muted
          style={styles.subtitle}>
          Photo upload is intentionally not enabled in this build. The backend
          audit found ordinary image uploads may retain embedded EXIF/device
          metadata, so native photo upload will be added only after the media
          privacy path is hardened.
        </AppText>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal:
      layout.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom:
      spacing[12],
  },
  subtitle: {
    marginTop:
      spacing[2],
  },
  section: {
    marginTop:
      spacing[4],
  },
  card: {
    marginTop:
      spacing[6],
  },
  form: {
    gap: spacing[4],
  },
  infoCard: {
    marginTop:
      spacing[4],
  },
});

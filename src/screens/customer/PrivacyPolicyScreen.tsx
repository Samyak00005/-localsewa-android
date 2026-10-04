import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  AccordionCard,
} from '../../components/account';
import {
  AppText,
  Button,
  Card,
} from '../../components/ui';
import {
  layout,
  spacing,
  useAppTheme,
} from '../../theme';

export function PrivacyPolicyScreen(): React.JSX.Element {
  const {theme} =
    useAppTheme();

  return (
    <ScrollView
      style={{
        backgroundColor:
          theme.colors.background,
      }}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}>
      <AppText variant="h1">
        Privacy Policy
      </AppText>

      <AppText
        variant="body"
        muted
        style={styles.subtitle}>
        Native privacy overview based on current Localsewa functionality. The
        published policy remains the authoritative legal text.
      </AppText>

      <View style={styles.list}>
        <AccordionCard
          icon="user"
          title="Account information"
          defaultOpen>
          <AppText
            variant="bodySmall"
            muted>
            Localsewa account data can include your name, email, mobile number,
            verification state, profile information and assigned roles.
          </AppText>
        </AccordionCard>

        <AccordionCard icon="message" title="Bookings & messages">
          <AppText
            variant="bodySmall"
            muted>
            Booking requests contain service, schedule and verified location
            information. Booking-scoped messages are associated with the
            customer/provider participants and booking lifecycle.
          </AppText>
        </AccordionCard>

        <AccordionCard icon="mapPin" title="Location">
          <AppText
            variant="bodySmall"
            muted>
            Location data may be used for provider discovery, default service
            location and booking fulfillment. Exact data is restricted by
            backend workflow where appropriate.
          </AppText>
        </AccordionCard>

        <AccordionCard icon="lock" title="Authentication">
          <AppText
            variant="bodySmall"
            muted>
            Native sessions use an opaque API token stored through secure
            Android credential storage. Passwords and OTP codes are not stored
            persistently by the app.
          </AppText>
        </AccordionCard>

        <AccordionCard icon="trash" title="Account deletion">
          <AppText
            variant="bodySmall"
            muted>
            Localsewa uses a scheduled account-deletion lifecycle with a 30-day
            grace period. Scheduling deletion revokes active sessions, and an
            eligible verified login during the grace period can cancel the
            pending request.
          </AppText>
        </AccordionCard>
      </View>

      <Card style={styles.card}>
        <AppText variant="label">
          Official policy
        </AppText>

        <AppText
          variant="bodySmall"
          muted
          style={styles.subtitle}>
          This screen is a functional summary, not a replacement for the full
          published Privacy Policy.
        </AppText>

        <View style={styles.action}>
          <Button
            label="Open official Privacy Policy"
            icon="externalLink"
            iconPosition="right"
            variant="outline"
            onPress={() => {
              Linking.openURL(
                'https://localsewa.com/privacy',
              );
            }}
            fullWidth
          />
        </View>
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
  list: {
    gap: spacing[3],
    marginTop:
      spacing[6],
  },
  card: {
    marginTop:
      spacing[6],
  },
  action: {
    marginTop:
      spacing[4],
  },
});

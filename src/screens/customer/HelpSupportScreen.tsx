import React from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { AccordionCard } from '../../components/account';
import { AppText, Button, Card } from '../../components/ui';
import { layout, spacing, useAppTheme } from '../../theme';

export function HelpSupportScreen(): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
      }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppText variant="h1">Help & Support</AppText>

      <AppText variant="body" muted style={styles.subtitle}>
        Quick guidance for bookings, accounts and service communication.
      </AppText>

      <View style={styles.list}>
        <AccordionCard
          icon="calendar"
          title="Booking status"
          subtitle="What Pending, Accepted and In Progress mean"
          defaultOpen
        >
          <AppText variant="bodySmall" muted>
            Pending means the request is waiting for provider action. Accepted
            means the provider has accepted it. In Progress means the service is
            actively being handled. Closed states such as Completed, Cancelled,
            Rejected and Not Completed remove actions that are no longer
            eligible.
          </AppText>
        </AccordionCard>

        <AccordionCard
          icon="message"
          title="Chat & call"
          subtitle="Booking communication"
        >
          <AppText variant="bodySmall" muted>
            Booking chat is available only while the backend marks the booking
            communication state as eligible. Voice-call UI is currently a
            preview; actual calling remains on hold.
          </AppText>
        </AccordionCard>

        <AccordionCard
          icon="mapPin"
          title="Location"
          subtitle="Why addresses are verified"
        >
          <AppText variant="bodySmall" muted>
            Localsewa verifies location data before it is saved to a booking or
            default customer location. This helps prevent address and coordinate
            mismatches.
          </AppText>
        </AccordionCard>

        <AccordionCard
          icon="shieldCheck"
          title="Account access"
          subtitle="Password, email and sessions"
        >
          <AppText variant="bodySmall" muted>
            Sensitive account changes use verification. Signing out all devices
            revokes active Localsewa API sessions for the account.
          </AppText>
        </AccordionCard>
      </View>

      <Card style={styles.card}>
        <AppText variant="title">Need more help?</AppText>

        <AppText variant="bodySmall" muted style={styles.subtitle}>
          Open the Localsewa website for the latest support/contact options.
        </AppText>

        <View style={styles.action}>
          <Button
            label="Open localsewa.com"
            icon="externalLink"
            iconPosition="right"
            variant="outline"
            onPress={() => {
              Linking.openURL('https://localsewa.com/');
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
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[12],
  },
  subtitle: {
    marginTop: spacing[2],
  },
  list: {
    gap: spacing[3],
    marginTop: spacing[6],
  },
  card: {
    marginTop: spacing[6],
  },
  action: {
    marginTop: spacing[4],
  },
});

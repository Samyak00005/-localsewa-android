import React from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { AccordionCard } from '../../components/account';
import { AppText, Button, Card } from '../../components/ui';
import { layout, spacing, useAppTheme } from '../../theme';

export function TermsConditionsScreen(): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
      }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppText variant="h1">Terms & Conditions</AppText>

      <AppText variant="body" muted style={styles.subtitle}>
        Native policy overview. The published Localsewa Terms remain the
        authoritative legal text.
      </AppText>

      <View style={styles.list}>
        <AccordionCard icon="user" title="Account use" defaultOpen>
          <AppText variant="bodySmall" muted>
            Use accurate account information, protect your login credentials and
            use only account capabilities assigned to you.
          </AppText>
        </AccordionCard>

        <AccordionCard icon="calendar" title="Bookings">
          <AppText variant="bodySmall" muted>
            Booking availability, cancellation, chat, review and other actions
            depend on the current backend booking state and provider/customer
            eligibility.
          </AppText>
        </AccordionCard>

        <AccordionCard icon="briefcase" title="Service providers">
          <AppText variant="bodySmall" muted>
            Providers manage their own service offerings and availability.
            Localsewa displays platform information and booking workflow without
            exposing private contact/location details outside allowed states.
          </AppText>
        </AccordionCard>

        <AccordionCard icon="star" title="Reviews">
          <AppText variant="bodySmall" muted>
            Eligible completed bookings may allow a customer review. Reviews
            should reflect genuine service experience.
          </AppText>
        </AccordionCard>

        <AccordionCard icon="shield" title="Platform availability">
          <AppText variant="bodySmall" muted>
            Features can depend on network connectivity, backend availability,
            account status and third-party integrations.
          </AppText>
        </AccordionCard>
      </View>

      <Card style={styles.card}>
        <AppText variant="label">Official policy</AppText>

        <AppText variant="bodySmall" muted style={styles.subtitle}>
          This in-app screen is a product summary and does not replace the full
          published legal text.
        </AppText>

        <View style={styles.action}>
          <Button
            label="Open official Terms"
            icon="externalLink"
            iconPosition="right"
            variant="outline"
            onPress={() => {
              Linking.openURL('https://localsewa.com/terms');
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

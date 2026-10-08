import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { AccordionCard } from '../../components/account';
import { ProviderHeader, ProviderSubpageHeader } from '../../components/provider';
import { AppText, Button, Card } from '../../components/ui';
import { ProviderStackParamList } from '../../navigation/types';
import { layout, spacing, useAppTheme } from '../../theme';

type Props = NativeStackScreenProps<ProviderStackParamList, 'ProviderPrivacyPolicy'>;

export function ProviderPrivacyPolicyScreen({ navigation }: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ProviderHeader />
      <ProviderSubpageHeader
        title="Privacy Policy"
        subtitle="Provider privacy overview"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          <AccordionCard icon="user" title="Account & business information" defaultOpen>
            <AppText variant="bodySmall" muted>
              Localsewa account data can include your name, email, mobile number, profile information, business details and assigned roles.
            </AppText>
          </AccordionCard>
          <AccordionCard icon="message" title="Bookings & messages">
            <AppText variant="bodySmall" muted>
              Provider booking requests and booking-scoped messages are associated with the customer/provider participants and booking lifecycle.
            </AppText>
          </AccordionCard>
          <AccordionCard icon="mapPin" title="Location">
            <AppText variant="bodySmall" muted>
              Business and service-location data may be used for discovery and booking fulfillment. Exact location exposure follows backend workflow rules.
            </AppText>
          </AccordionCard>
          <AccordionCard icon="lock" title="Authentication">
            <AppText variant="bodySmall" muted>
              Native sessions use an opaque API token stored through secure Android credential storage. Passwords and OTP codes are not stored persistently by the app.
            </AppText>
          </AccordionCard>
          <AccordionCard icon="trash" title="Account deletion">
            <AppText variant="bodySmall" muted>
              Localsewa uses a scheduled account-deletion lifecycle with a 30-day grace period. Scheduling deletion revokes active sessions.
            </AppText>
          </AccordionCard>
        </View>

        <Card style={styles.card}>
          <AppText variant="label">Official policy</AppText>
          <AppText variant="bodySmall" muted style={styles.subtitle}>
            This screen is a functional overview, not a replacement for the full published Privacy Policy.
          </AppText>
          <View style={styles.action}>
            <Button
              label="Open official Privacy Policy"
              icon="externalLink"
              iconPosition="right"
              variant="outline"
              onPress={() => Linking.openURL('https://localsewa.com/privacy')}
              fullWidth
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[5],
    paddingBottom: spacing[12],
  },
  list: { gap: spacing[3] },
  card: { marginTop: spacing[6] },
  subtitle: { marginTop: spacing[2] },
  action: { marginTop: spacing[4] },
});

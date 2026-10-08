import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { AccordionCard } from '../../components/account';
import { ProviderHeader, ProviderSubpageHeader } from '../../components/provider';
import { AppText, Button, Card } from '../../components/ui';
import { ProviderStackParamList } from '../../navigation/types';
import { layout, spacing, useAppTheme } from '../../theme';

type Props = NativeStackScreenProps<ProviderStackParamList, 'ProviderHelpSupport'>;

export function ProviderHelpSupportScreen({ navigation }: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ProviderHeader />
      <ProviderSubpageHeader
        title="Help & Support"
        subtitle="Provider account, requests and workspace help"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.list}>
          <AccordionCard
            icon="calendar"
            title="Request status"
            subtitle="Pending, Accepted and In Progress"
            defaultOpen
          >
            <AppText variant="bodySmall" muted>
              Pending requests are waiting for your response. Accepted requests can move to In Progress, and active work can be completed or marked Not Completed according to the booking state.
            </AppText>
          </AccordionCard>

          <AccordionCard icon="message" title="Chat & call" subtitle="Booking communication">
            <AppText variant="bodySmall" muted>
              Booking chat is available only while the backend marks the booking communication state as eligible. Voice-call UI is currently a preview; actual calling remains on hold.
            </AppText>
          </AccordionCard>

          <AccordionCard icon="mapPin" title="Service location" subtitle="Customer location access">
            <AppText variant="bodySmall" muted>
              Service-location visibility follows the booking lifecycle. Exact location and route actions are shown only in states where the backend allows them.
            </AppText>
          </AccordionCard>

          <AccordionCard icon="shieldCheck" title="Account access" subtitle="Password, email and sessions">
            <AppText variant="bodySmall" muted>
              Sensitive account changes use verification. Signing out all devices revokes active Localsewa API sessions for the account.
            </AppText>
          </AccordionCard>
        </View>

        <Card style={styles.card}>
          <AppText variant="title">Need more help?</AppText>
          <AppText variant="bodySmall" muted style={styles.subtitle}>
            Open the Localsewa website for the latest support and contact options.
          </AppText>
          <View style={styles.action}>
            <Button
              label="Open localsewa.com"
              icon="externalLink"
              iconPosition="right"
              variant="outline"
              onPress={() => Linking.openURL('https://localsewa.com/')}
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

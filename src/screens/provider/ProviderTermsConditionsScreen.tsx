import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { AccordionCard } from '../../components/account';
import { ProviderHeader, ProviderSubpageHeader } from '../../components/provider';
import { AppText, Button, Card } from '../../components/ui';
import { ProviderStackParamList } from '../../navigation/types';
import { layout, spacing, useAppTheme } from '../../theme';

type Props = NativeStackScreenProps<ProviderStackParamList, 'ProviderTermsConditions'>;

export function ProviderTermsConditionsScreen({ navigation }: Props): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ProviderHeader />
      <ProviderSubpageHeader
        title="Terms & Conditions"
        subtitle="Provider workspace terms overview"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          <AccordionCard icon="user" title="Account use" defaultOpen>
            <AppText variant="bodySmall" muted>
              Use accurate account and business information, protect your login credentials and use only account capabilities assigned to you.
            </AppText>
          </AccordionCard>
          <AccordionCard icon="calendar" title="Bookings">
            <AppText variant="bodySmall" muted>
              Booking actions depend on the current backend state and Provider eligibility. Rejected and Not Completed outcomes require a reason.
            </AppText>
          </AccordionCard>
          <AccordionCard icon="briefcase" title="Provider services">
            <AppText variant="bodySmall" muted>
              Providers manage their own service offerings, pricing, availability and business information shown through Localsewa.
            </AppText>
          </AccordionCard>
          <AccordionCard icon="star" title="Reviews">
            <AppText variant="bodySmall" muted>
              Eligible completed bookings may allow a customer review. Reviews should reflect genuine service experience.
            </AppText>
          </AccordionCard>
          <AccordionCard icon="shield" title="Platform availability">
            <AppText variant="bodySmall" muted>
              Features can depend on network connectivity, backend availability, account status and third-party integrations.
            </AppText>
          </AccordionCard>
        </View>

        <Card style={styles.card}>
          <AppText variant="label">Official policy</AppText>
          <AppText variant="bodySmall" muted style={styles.subtitle}>
            This in-app overview does not replace the full published legal text.
          </AppText>
          <View style={styles.action}>
            <Button
              label="Open official Terms"
              icon="externalLink"
              iconPosition="right"
              variant="outline"
              onPress={() => Linking.openURL('https://localsewa.com/terms')}
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

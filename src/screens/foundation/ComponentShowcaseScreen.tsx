import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  AppSwitch,
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  IconButton,
  Input,
  Skeleton,
  Spinner,
} from '../../components/ui';
import {
  AppThemeMode,
  layout,
  radius,
  spacing,
  useAppTheme,
} from '../../theme';

const modes: Array<{label: string; value: AppThemeMode}> = [
  {label: 'Customer', value: 'customer'},
  {label: 'Provider', value: 'providerStandard'},
  {label: 'Localsewa+', value: 'providerPremium'},
];

export function ComponentShowcaseScreen(): React.JSX.Element {
  const {mode, setMode, theme} = useAppTheme();
  const [available, setAvailable] = useState(true);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {backgroundColor: theme.colors.background},
      ]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AppText
          variant="overline"
          color={theme.colors.primary}
          style={styles.eyebrow}>
          LOCALSEWA ANDROID • v1.3.0
        </AppText>

        <AppText variant="h1">
          UI Component Foundation
        </AppText>

        <AppText
          variant="body"
          muted
          style={styles.intro}>
          Reusable React Native primitives driven by the active Customer,
          Provider or Localsewa+ theme.
        </AppText>

        <View style={styles.modeRow}>
          {modes.map(item => (
            <View key={item.value} style={styles.modeItem}>
              <Button
                label={item.label}
                variant={mode === item.value ? 'primary' : 'secondary'}
                onPress={() => setMode(item.value)}
                fullWidth
              />
            </View>
          ))}
        </View>

        <Section title="Typography">
          <Card>
            <AppText variant="h2">Heading H2</AppText>
            <AppText variant="title" style={styles.stackGap}>
              Section title
            </AppText>
            <AppText variant="body" style={styles.stackGap}>
              Standard body text for Localsewa screens and cards.
            </AppText>
            <AppText variant="caption" muted style={styles.stackGap}>
              Muted metadata and supporting information.
            </AppText>
          </Card>
        </Section>

        <Section title="Buttons">
          <View style={styles.buttonStack}>
            <Button label="Primary action" fullWidth />
            <Button
              label="Secondary action"
              variant="secondary"
              fullWidth
            />
            <Button
              label="Outline action"
              variant="outline"
              fullWidth
            />
            <Button
              label="Ghost action"
              variant="ghost"
              fullWidth
            />
            <Button
              label="Destructive action"
              variant="destructive"
              fullWidth
            />
            <Button
              label="Loading"
              loading
              fullWidth
            />
          </View>
        </Section>

        <Section title="Inputs">
          <Card>
            <Input
              label="Service"
              placeholder="What service do you need?"
              helperText="Example helper text"
            />
            <View style={styles.largeGap} />
            <Input
              label="Phone number"
              placeholder="+91"
              error="Please enter a valid phone number."
            />
          </Card>
        </Section>

        <Section title="Badges">
          <View style={styles.badgeRow}>
            <Badge>DEFAULT</Badge>
            <Badge variant="success">ACCEPTED</Badge>
            <Badge variant="warning">PENDING</Badge>
            <Badge variant="error">CANCELLED</Badge>
            <Badge variant="info">INFO</Badge>
            <Badge variant="premium">LOCALSEWA+</Badge>
          </View>
        </Section>

        <Section title="Profile & controls">
          <Card>
            <View style={styles.profileRow}>
              <Avatar initials="SN" size="lg" />
              <View style={styles.profileCopy}>
                <AppText variant="title">Samyak N</AppText>
                <AppText variant="bodySmall" muted>
                  Provider account
                </AppText>
              </View>

              <IconButton
                accessibilityLabel="More options"
                icon={
                  <AppText
                    variant="title"
                    color={theme.colors.primary}>
                    •••
                  </AppText>
                }
              />
            </View>

            <View style={styles.dividerSpace}>
              <Divider />
            </View>

            <AppSwitch
              value={available}
              onValueChange={setAvailable}
              label="Available for work"
              description="Customers can see your availability."
            />
          </Card>
        </Section>

        <Section title="Loading states">
          <Card>
            <View style={styles.loadingRow}>
              <Spinner />
              <AppText variant="bodySmall" muted>
                Loading
              </AppText>
            </View>

            <View style={styles.largeGap} />

            <Skeleton width="62%" height={20} />
            <Skeleton
              width="100%"
              height={14}
              style={styles.skeletonGap}
            />
            <Skeleton
              width="84%"
              height={14}
              style={styles.skeletonGap}
            />
          </Card>
        </Section>

        <Card
          style={[
            styles.footerCard,
            {
              borderColor:
                mode === 'providerPremium'
                  ? theme.colors.accent
                  : theme.colors.border,
            },
          ]}>
          <AppText variant="title">
            v1.3.0 Foundation
          </AppText>
          <AppText variant="bodySmall" muted style={styles.stackGap}>
            These primitives will be used to build Authentication,
            Customer and Provider screens instead of styling each page
            independently.
          </AppText>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: React.PropsWithChildren<{title: string}>): React.JSX.Element {
  return (
    <View style={styles.section}>
      <AppText variant="title" style={styles.sectionTitle}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[4],
    paddingBottom: spacing[16],
  },
  eyebrow: {
    letterSpacing: 1.2,
    marginBottom: spacing[2],
  },
  intro: {
    marginTop: spacing[2],
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[6],
  },
  modeItem: {
    flex: 1,
  },
  section: {
    marginTop: layout.majorSectionGap,
  },
  sectionTitle: {
    marginBottom: spacing[3],
  },
  stackGap: {
    marginTop: spacing[2],
  },
  largeGap: {
    height: spacing[4],
  },
  buttonStack: {
    gap: spacing[3],
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCopy: {
    flex: 1,
    marginLeft: spacing[3],
  },
  dividerSpace: {
    marginVertical: spacing[4],
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  skeletonGap: {
    marginTop: spacing[2],
  },
  footerCard: {
    marginTop: spacing[8],
    borderRadius: radius.xl,
  },
});

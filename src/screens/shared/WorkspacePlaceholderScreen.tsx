import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Badge, Card } from '../../components/ui';
import { layout, radius, spacing, useAppTheme } from '../../theme';

type WorkspacePlaceholderScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  premiumBadge?: boolean;
};

export function WorkspacePlaceholderScreen({
  eyebrow,
  title,
  description,
  children,
  premiumBadge = false,
}: WorkspacePlaceholderScreenProps): React.JSX.Element {
  const { theme, mode } = useAppTheme();
  const premium = mode === 'providerPremium';

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <AppText
              variant="overline"
              color={premium ? theme.colors.accent : theme.colors.primary}
              style={styles.eyebrow}
            >
              {eyebrow}
            </AppText>
            <AppText variant="h1">{title}</AppText>
          </View>

          {premiumBadge ? <Badge variant="premium">LOCALSEWA+</Badge> : null}
        </View>

        <AppText variant="body" muted style={styles.description}>
          {description}
        </AppText>

        <Card
          style={[
            styles.placeholderCard,
            premium && {
              backgroundColor:
                theme.colors.premiumIvorySurface ?? theme.colors.surface,
              borderColor: theme.colors.accent,
            },
          ]}
        >
          <View
            style={[
              styles.mark,
              {
                backgroundColor: premium
                  ? theme.colors.secondary
                  : theme.colors.primary,
              },
            ]}
          />
          <AppText variant="title">App shell ready</AppText>
          <AppText variant="bodySmall" muted style={styles.cardText}>
            This screen is intentionally a placeholder. Real screen UI will be
            designed after navigation structure is approved.
          </AppText>
        </Card>

        {children ? <View style={styles.actions}>{children}</View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[5],
    paddingBottom: spacing[10],
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  headingCopy: {
    flex: 1,
  },
  eyebrow: {
    letterSpacing: 1.1,
    marginBottom: spacing[2],
  },
  description: {
    marginTop: spacing[2],
  },
  placeholderCard: {
    marginTop: spacing[8],
    borderRadius: radius.xl,
  },
  mark: {
    width: 42,
    height: 5,
    borderRadius: radius.pill,
    marginBottom: spacing[4],
  },
  cardText: {
    marginTop: spacing[2],
  },
  actions: {
    gap: spacing[3],
    marginTop: spacing[6],
  },
});

import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  AppThemeMode,
  layout,
  radius,
  spacing,
  themes,
  typography,
} from '../../theme';

const options: Array<{ label: string; mode: AppThemeMode }> = [
  { label: 'Customer', mode: 'customer' },
  { label: 'Provider', mode: 'providerStandard' },
  { label: 'Localsewa+', mode: 'providerPremium' },
];

export function FoundationScreen(): React.JSX.Element {
  const [mode, setMode] = useState<AppThemeMode>('customer');
  const theme = useMemo(() => themes[mode], [mode]);

  const premium = mode === 'providerPremium';

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.overline, { color: theme.colors.primary }]}>
        LOCALSEWA ANDROID
      </Text>

      <Text style={[styles.heading, { color: theme.colors.text }]}>
        Foundation Design System
      </Text>

      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        Each role has five core brand colors: Text, Background, Primary,
        Secondary and Accent.
      </Text>

      <View style={styles.switcher}>
        {options.map(option => {
          const selected = option.mode === mode;

          return (
            <Pressable
              key={option.mode}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setMode(option.mode)}
              style={[
                styles.modeButton,
                {
                  backgroundColor: selected
                    ? premium
                      ? theme.colors.secondary
                      : theme.colors.primary
                    : theme.colors.surface,
                  borderColor: selected
                    ? premium
                      ? theme.colors.accent
                      : theme.colors.primary
                    : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color: selected
                      ? theme.colors.onPrimary
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {premium ? (
        <PremiumHero theme={theme} />
      ) : (
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
        >
          <Text style={styles.heroEyebrow}>CURRENT MODE</Text>
          <Text style={styles.heroTitle}>
            {mode === 'customer' ? 'Customer' : 'Provider Standard'}
          </Text>
          <Text style={styles.heroBody}>
            One shared component system with role-specific visual identity.
          </Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        5-color brand palette
      </Text>

      <View style={styles.grid}>
        <TokenCard
          title="Text"
          value={theme.colors.text}
          color={theme.colors.text}
          borderColor={theme.colors.border}
          textColor={theme.colors.text}
          surface={theme.colors.surface}
        />
        <TokenCard
          title="Background"
          value={theme.colors.background}
          color={theme.colors.background}
          borderColor={theme.colors.border}
          textColor={theme.colors.text}
          surface={theme.colors.surface}
        />
        <TokenCard
          title="Primary"
          value={theme.colors.primary}
          color={theme.colors.primary}
          borderColor={theme.colors.border}
          textColor={theme.colors.text}
          surface={theme.colors.surface}
        />
        <TokenCard
          title="Secondary"
          value={theme.colors.secondary}
          color={theme.colors.secondary}
          borderColor={theme.colors.border}
          textColor={theme.colors.text}
          surface={theme.colors.surface}
        />
        <TokenCard
          title="Accent"
          value={theme.colors.accent}
          color={theme.colors.accent}
          borderColor={theme.colors.border}
          textColor={theme.colors.text}
          surface={theme.colors.surface}
        />
      </View>

      {premium ? (
        <View
          style={[
            styles.premiumDetails,
            {
              backgroundColor:
                theme.colors.premiumIvorySurface ?? theme.colors.surface,
              borderColor: theme.colors.accent,
            },
          ]}
        >
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
            Premium visual language
          </Text>
          <Text
            style={[styles.infoBody, { color: theme.colors.textSecondary }]}
          >
            Deep emerald anchors the Localsewa identity, royal aubergine gives
            the workspace a richer character, and champagne gold is reserved for
            Localsewa+ entitlement, rank and premium emphasis.
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
            Design rule
          </Text>
          <Text
            style={[styles.infoBody, { color: theme.colors.textSecondary }]}
          >
            Brand colors stay separate from semantic colors such as success,
            warning, error and information states.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function PremiumHero({
  theme,
}: {
  theme: (typeof themes)['providerPremium'];
}): React.JSX.Element {
  return (
    <View
      style={[
        styles.premiumHero,
        {
          backgroundColor: theme.colors.premiumSecondaryDeep,
          borderColor: theme.colors.accent,
        },
      ]}
    >
      <View
        style={[
          styles.premiumTopLine,
          { backgroundColor: theme.colors.accent },
        ]}
      />

      <View style={styles.premiumHeroHeader}>
        <View style={styles.premiumHeroCopy}>
          <Text style={styles.heroEyebrow}>LOCALSEWA+ PROVIDER</Text>
          <Text style={styles.premiumHeroTitle}>Premium workspace</Text>
        </View>

        <View
          style={[
            styles.premiumBadge,
            { backgroundColor: theme.colors.premiumGoldSoft },
          ]}
        >
          <Text
            style={[
              styles.premiumBadgeText,
              { color: theme.colors.premiumGoldStrong },
            ]}
          >
            PLUS
          </Text>
        </View>
      </View>

      <Text style={styles.premiumHeroBody}>
        Royal, distinctive and visibly separate from the standard provider
        workspace.
      </Text>

      <View
        style={[
          styles.premiumIdentityStrip,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <View>
          <Text style={styles.premiumIdentityLabel}>IDENTITY</Text>
          <Text style={styles.premiumIdentityValue}>
            Emerald • Aubergine • Gold
          </Text>
        </View>

        <View
          style={[styles.goldDot, { backgroundColor: theme.colors.accent }]}
        />
      </View>
    </View>
  );
}

type TokenCardProps = {
  title: string;
  value: string;
  color: string;
  surface: string;
  borderColor: string;
  textColor: string;
};

function TokenCard({
  title,
  value,
  color,
  surface,
  borderColor,
  textColor,
}: TokenCardProps): React.JSX.Element {
  return (
    <View style={[styles.tokenCard, { backgroundColor: surface, borderColor }]}>
      <View style={[styles.swatch, { backgroundColor: color, borderColor }]} />
      <Text style={[styles.tokenTitle, { color: textColor }]}>{title}</Text>
      <Text style={styles.tokenValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[6],
    paddingBottom: spacing[12],
  },
  overline: {
    ...typography.overline,
    letterSpacing: 1.3,
  },
  heading: {
    ...typography.h1,
    marginTop: spacing[2],
  },
  description: {
    ...typography.body,
    marginTop: spacing[2],
  },
  switcher: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[6],
  },
  modeButton: {
    minHeight: layout.minTouchTarget,
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
  },
  modeButtonText: {
    ...typography.label,
    textAlign: 'center',
  },
  heroCard: {
    marginTop: spacing[6],
    borderRadius: radius.xl,
    padding: spacing[5],
  },
  heroEyebrow: {
    ...typography.overline,
    color: '#FFFFFF',
    opacity: 0.82,
    letterSpacing: 1.2,
  },
  heroTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    marginTop: spacing[2],
  },
  heroBody: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: spacing[2],
  },
  sectionTitle: {
    ...typography.title,
    marginTop: spacing[8],
    marginBottom: spacing[3],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  tokenCard: {
    width: '47%',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing[3],
  },
  swatch: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  tokenTitle: {
    ...typography.label,
    marginTop: spacing[3],
  },
  tokenValue: {
    ...typography.caption,
    color: '#66776E',
    marginTop: spacing[1],
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginTop: spacing[8],
  },
  infoTitle: {
    ...typography.title,
  },
  infoBody: {
    ...typography.bodySmall,
    marginTop: spacing[2],
  },
  premiumHero: {
    marginTop: spacing[6],
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing[5],
    overflow: 'hidden',
  },
  premiumTopLine: {
    height: 4,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  premiumHeroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  premiumHeroCopy: {
    flex: 1,
  },
  premiumHeroTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    marginTop: spacing[2],
  },
  premiumHeroBody: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: spacing[3],
  },
  premiumBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  premiumBadgeText: {
    ...typography.overline,
    letterSpacing: 0.9,
  },
  premiumIdentityStrip: {
    marginTop: spacing[5],
    borderRadius: radius.md,
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumIdentityLabel: {
    ...typography.overline,
    color: '#FFFFFF',
    opacity: 0.7,
    letterSpacing: 1,
  },
  premiumIdentityValue: {
    ...typography.label,
    color: '#FFFFFF',
    marginTop: spacing[1],
  },
  goldDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  premiumDetails: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginTop: spacing[8],
  },
});

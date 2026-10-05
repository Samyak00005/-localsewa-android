import React, { PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, useAppTheme } from '../../theme';
import { AppIcon, AppIconName, iconSize } from '../icons';
import { AppText, Card } from '../ui';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  icon?: AppIconName;
}>;

export function AccordionCard({
  title,
  subtitle,
  defaultOpen = false,
  icon,
  children,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(value => !value)}
        style={styles.header}
      >
        {icon ? (
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: theme.colors.secondary },
            ]}
          >
            <AppIcon
              name={icon}
              size={iconSize.sm}
              color={theme.colors.primary}
            />
          </View>
        ) : null}

        <View style={styles.copy}>
          <AppText variant="title">{title}</AppText>

          {subtitle ? (
            <AppText variant="caption" muted style={styles.subtitle}>
              {subtitle}
            </AppText>
          ) : null}
        </View>

        <View style={[styles.chevron, { borderColor: theme.colors.border }]}>
          <AppIcon
            name={open ? 'chevronUp' : 'chevronDown'}
            size={iconSize.sm}
            color={theme.colors.primary}
          />
        </View>
      </Pressable>

      {open ? <View style={styles.body}>{children}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing[1],
  },
  chevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    marginTop: spacing[4],
  },
});

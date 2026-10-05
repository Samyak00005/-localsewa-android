import React from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, spacing, useAppTheme } from '../../theme';
import { ChatMessage } from '../../types/chat';
import { AppText } from '../ui';

type Props = {
  item: ChatMessage;
};

function displayTime(value: string): string {
  if (!value) {
    return '';
  }

  const match = value.match(/(?:T|\s)(\d{2}):(\d{2})/);

  if (match) {
    const hours = Number(match[1]);
    const minutes = match[2];
    const suffix = hours >= 12 ? 'pm' : 'am';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${suffix}`;
  }

  return value;
}

export function ChatMessageBubble({ item }: Props): React.JSX.Element {
  const { theme } = useAppTheme();
  const mine = item.sentByMe;

  return (
    <View style={[styles.row, mine ? styles.mineRow : styles.theirRow]}>
      <View
        style={[
          styles.bubble,
          mine
            ? [
                styles.mineBubble,
                {
                  backgroundColor: theme.colors.primary,
                },
              ]
            : [
                styles.theirBubble,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ],
        ]}
      >
        <AppText variant="body" color={mine ? '#FFFFFF' : theme.colors.text}>
          {item.message}
        </AppText>

        <View style={styles.meta}>
          <AppText
            variant="caption"
            color={mine ? '#DCF4E5' : theme.colors.textMuted}
          >
            {displayTime(item.createdAt)}
          </AppText>

          {mine ? (
            <AppText variant="caption" color="#DCF4E5">
              {item.readAt ? 'Read' : 'Sent'}
            </AppText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    marginVertical: 3,
  },
  mineRow: {
    alignItems: 'flex-end',
  },
  theirRow: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '84%',
    paddingHorizontal: spacing[3],
    paddingVertical: 10,
  },
  mineBubble: {
    borderRadius: radius.lg,
    borderBottomRightRadius: 6,
  },
  theirBubble: {
    borderWidth: 1,
    borderRadius: radius.lg,
    borderBottomLeftRadius: 6,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
    marginTop: spacing[1],
  },
});

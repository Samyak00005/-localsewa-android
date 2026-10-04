import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import {
  AppText,
} from '../ui';
import {
  radius,
  spacing,
  useAppTheme,
} from '../../theme';
import {ChatMessage} from '../../types/chat';

type Props = {
  item: ChatMessage;
};

function displayTime(
  value: string,
): string {
  if (!value) {
    return '';
  }

  const match =
    value.match(
      /(?:T|\s)(\d{2}):(\d{2})/,
    );

  if (match) {
    return `${match[1]}:${match[2]}`;
  }

  return value;
}

export function ChatMessageBubble({
  item,
}: Props): React.JSX.Element {
  const {theme} = useAppTheme();

  const mine =
    item.sentByMe;

  return (
    <View
      style={[
        styles.row,
        mine
          ? styles.mineRow
          : styles.theirRow,
      ]}>
      <View
        style={[
          styles.bubble,
          mine
            ? {
                backgroundColor:
                  theme.colors.primary,
              }
            : {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
                borderWidth: 1,
              },
        ]}>
        <AppText
          variant="body"
          color={
            mine
              ? '#FFFFFF'
              : theme.colors.text
          }>
          {item.message}
        </AppText>

        <View style={styles.meta}>
          <AppText
            variant="caption"
            color={
              mine
                ? '#DCF4E5'
                : theme.colors.textMuted
            }>
            {displayTime(
              item.createdAt,
            )}
          </AppText>

          {mine ? (
            <AppText
              variant="caption"
              color="#DCF4E5">
              {item.readAt
                ? 'Read'
                : 'Sent'}
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
    marginVertical: spacing[1],
  },
  mineRow: {
    alignItems: 'flex-end',
  },
  theirRow: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
    marginTop: spacing[1],
  },
});

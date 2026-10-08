import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '../../api/apiClient';
import {
  useMarkNotificationRead,
  useNotifications,
} from '../../hooks/useNotifications';
import { resolveNotificationTarget } from '../../utils/notificationRoute';
import { layout, radius, spacing, useAppTheme } from '../../theme';
import { AppIcon, iconSize } from '../icons';
import { NotificationRow } from '../customer/NotificationRow';
import { AlertBanner, AppText, Skeleton } from '../ui';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ProviderNotificationsModal({
  visible,
  onClose,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();
  const { data, isLoading, error, refetch, isRefetching } = useNotifications();
  const markRead = useMarkNotificationRead();
  const [actionError, setActionError] = useState<string | null>(null);

  const notifications = useMemo(
    () =>
      (data?.notifications ?? []).filter(
        item => resolveNotificationTarget(item).workspace === 'provider',
      ),
    [data?.notifications],
  );

  async function openItem(notificationId: number) {
    const item = notifications.find(value => value.id === notificationId);

    if (!item || item.read) {
      return;
    }

    setActionError(null);

    try {
      await markRead.mutateAsync(notificationId);
    } catch (mutationError) {
      setActionError(errorMessage(mutationError));
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <SafeAreaView
          edges={['top', 'left', 'right', 'bottom']}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.headingRow}>
            <View style={styles.headingCopy}>
              <AppText variant="h2">Provider notifications</AppText>
              <AppText variant="caption" muted style={styles.headingSubtitle}>
                Booking and provider-workspace updates from Localsewa.
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close notifications"
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <AppIcon
                name="x"
                size={iconSize.sm}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          {actionError ? (
            <AlertBanner variant="error">{actionError}</AlertBanner>
          ) : null}

          {error ? (
            <AlertBanner variant="error">{errorMessage(error)}</AlertBanner>
          ) : null}

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
                tintColor={theme.colors.primary}
              />
            }
          >
            {isLoading ? (
              <View style={styles.skeletonList}>
                <Skeleton height={82} radiusValue={18} />
                <Skeleton height={82} radiusValue={18} />
                <Skeleton height={82} radiusValue={18} />
              </View>
            ) : notifications.length ? (
              <View style={styles.rows}>
                {notifications.map(item => (
                  <NotificationRow
                    key={item.id}
                    notification={item}
                    onPress={() => openItem(item.id)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View
                  style={[
                    styles.emptyIcon,
                    { backgroundColor: theme.colors.secondary },
                  ]}
                >
                  <AppIcon
                    name="bell"
                    size={iconSize.lg}
                    color={theme.colors.primary}
                  />
                </View>
                <AppText variant="title" style={styles.emptyTitle}>
                  No provider notifications
                </AppText>
                <AppText variant="bodySmall" muted style={styles.emptyCopy}>
                  Provider booking and workspace updates will appear here.
                </AppText>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 17, 13, 0.42)',
    paddingHorizontal: layout.bottomSheetMargin,
    paddingBottom: layout.bottomSheetMargin,
  },
  sheet: {
    width: '100%',
    maxHeight: '86%',
    minHeight: '54%',
    borderRadius: 28,
    borderWidth: 1,
    paddingTop: spacing[5],
    overflow: 'hidden',
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
  },
  headingSubtitle: {
    marginTop: spacing[1],
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[8],
  },
  rows: {
    gap: spacing[3],
  },
  skeletonList: {
    gap: spacing[3],
  },
  emptyState: {
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: spacing[4],
    textAlign: 'center',
  },
  emptyCopy: {
    marginTop: spacing[2],
    textAlign: 'center',
    maxWidth: 300,
  },
});

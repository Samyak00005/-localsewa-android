import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { useAppShell } from '../../app/AppShellProvider';
import { AppIcon, AppIconName, iconSize } from '../../components/icons';
import {
  AlertBanner,
  AppText,
  Avatar,
  Card,
  Skeleton,
} from '../../components/ui';
import { useManualRefresh } from '../../hooks/useManualRefresh';
import {
  useProviderBookings,
  useProviderDashboard,
  useProviderRequestCount,
  useProviderServices,
} from '../../hooks/useProviderWorkspace';
import {
  ProviderStackParamList,
  ProviderTabParamList,
} from '../../navigation/types';
import { Booking, BookingStatus } from '../../types/booking';
import { layout, localsewaPlusPalette, spacing, useAppTheme } from '../../theme';

const PROVIDER_SURFACE_RADIUS = 28;

type Props = BottomTabScreenProps<ProviderTabParamList, 'ProviderHome'>;

type StatItem = {
  label: string;
  value: string;
  icon: AppIconName;
  color: string;
  background: string;
};

export function ProviderHomeScreen({
  navigation,
}: Props): React.JSX.Element {
  const { theme } = useAppTheme();
  const { providerTier } = useAppShell();
  const premium = providerTier === 'LOCALSEWA_PLUS';
  const stack =
    navigation.getParent<NativeStackNavigationProp<ProviderStackParamList>>();

  const dashboardQuery = useProviderDashboard();
  const requestCountQuery = useProviderRequestCount();
  const bookingsQuery = useProviderBookings();
  const servicesQuery = useProviderServices();

  const dashboard = dashboardQuery.data;
  const profile = dashboard?.profile;
  const bookings = bookingsQuery.data ?? [];
  const services = servicesQuery.data?.services ?? dashboard?.services ?? [];

  const pendingBookings = useMemo(
    () => bookings.filter(booking => booking.status === 'pending').slice(0, 3),
    [bookings],
  );
  const activeBookings = useMemo(
    () =>
      bookings
        .filter(booking =>
          booking.status === 'accepted' || booking.status === 'in_progress',
        )
        .slice(0, 3),
    [bookings],
  );
  const recentActivity = useMemo(
    () =>
      bookings
        .filter(booking =>
          ['completed', 'rejected', 'cancelled', 'not_completed'].includes(
            booking.status,
          ),
        )
        .slice(0, 3),
    [bookings],
  );

  const pendingCount =
    requestCountQuery.data?.pendingCount ?? dashboard?.stats.pendingRequests ?? 0;
  const activeCount = bookings.filter(booking =>
    booking.status === 'accepted' || booking.status === 'in_progress',
  ).length;
  const completedJobs = dashboard?.stats.completedJobs ?? 0;
  const rating = profile?.averageRating;
  const membershipStatus = (profile?.premium.status || '').toUpperCase();
  const membershipPlan = formatMembershipPlan(profile?.premium.plan);
  const isTrialMembership = premium && membershipStatus === 'TRIAL';

  const statItems: StatItem[] = [
    {
      label: 'Pending requests',
      value: String(pendingCount),
      icon: 'clock',
      color: theme.colors.warning,
      background: '#FFF8E8',
    },
    {
      label: 'Active jobs',
      value: String(activeCount),
      icon: 'briefcase',
      color: theme.colors.info,
      background: '#EEF4FF',
    },
    {
      label: 'Completed jobs',
      value: String(completedJobs),
      icon: 'checkCircle',
      color: theme.colors.success,
      background: '#EDF8F0',
    },
    {
      label: 'Rating',
      value: rating == null ? '—' : rating.toFixed(1),
      icon: 'star',
      color: theme.colors.rating,
      background: '#FFF7E6',
    },
  ];

  const refresh = useCallback(async () => {
    await Promise.allSettled([
      dashboardQuery.refetch(),
      requestCountQuery.refetch(),
      bookingsQuery.refetch(),
      servicesQuery.refetch(),
    ]);
  }, [
    bookingsQuery.refetch,
    dashboardQuery.refetch,
    requestCountQuery.refetch,
    servicesQuery.refetch,
  ]);

  const pullRefresh = useManualRefresh(refresh);

  useFocusEffect(
    useCallback(() => {
      const refreshLiveData = () => {
        void Promise.all([
          dashboardQuery.refetch(),
          requestCountQuery.refetch(),
          bookingsQuery.refetch(),
        ]);
      };

      refreshLiveData();
      const timer = setInterval(refreshLiveData, 30_000);

      return () => clearInterval(timer);
    }, [
      bookingsQuery.refetch,
      dashboardQuery.refetch,
      requestCountQuery.refetch,
    ]),
  );

  if (dashboardQuery.isLoading && !dashboard) {
    return <DashboardSkeleton />;
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={pullRefresh.refreshing}
          onRefresh={pullRefresh.onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
          progressBackgroundColor={theme.colors.surface}
        />
      }
    >
      {dashboardQuery.error ? (
        <AlertBanner variant="error">
          {errorMessage(dashboardQuery.error)}
        </AlertBanner>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('ProviderProfile')}
        style={({ pressed }) => [
          styles.businessCard,
          {
            backgroundColor: pressed
              ? theme.colors.secondary
              : theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.businessTop}>
          <Avatar
            size="lg"
            source={
              profile?.profileImageUrl
                ? { uri: profile.profileImageUrl }
                : undefined
            }
            initials={profile?.businessName || 'LS'}
          />

          <View style={styles.flex}>
            <AppText variant="overline" muted>
              BUSINESS OVERVIEW
            </AppText>
            <AppText variant="h2" numberOfLines={2} style={styles.businessName}>
              {profile?.businessName || 'Provider business'}
            </AppText>
            <AppText variant="bodySmall" muted numberOfLines={1}>
              {[profile?.category, profile?.location].filter(Boolean).join(' • ') ||
                'Complete your business profile'}
            </AppText>
          </View>

          <View
            style={[
              styles.availabilityPill,
              {
                backgroundColor: profile?.available ? '#EDF8F0' : theme.colors.surfaceMuted,
                borderColor: profile?.available
                  ? '#B9DEC3'
                  : theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.availabilityDot,
                {
                  backgroundColor: profile?.available
                    ? theme.colors.success
                    : theme.colors.disabled,
                },
              ]}
            />
            <AppText
              variant="overline"
              color={profile?.available ? theme.colors.success : theme.colors.textMuted}
            >
              {profile?.available ? 'AVAILABLE' : 'OFFLINE'}
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.businessFooter,
            { borderTopColor: theme.colors.border },
          ]}
        >
          <View style={styles.businessRequestMeta}>
            <AppIcon name="clock" size={13} color={theme.colors.textMuted} />
            <AppText variant="caption" muted>
              {dashboard?.stats.todayRequests ?? 0} new request
              {(dashboard?.stats.todayRequests ?? 0) === 1 ? '' : 's'} today
            </AppText>
          </View>
          <View style={styles.inlineAction}>
            <AppText variant="label" color={theme.colors.primary}>
              View profile
            </AppText>
            <AppIcon
              name="chevronRight"
              size={iconSize.xs}
              color={theme.colors.primary}
            />
          </View>
        </View>
      </Pressable>

      <View style={styles.statsGrid}>
        {statItems.map(item => (
          <Card key={item.label} style={styles.statCard}>
            <View style={styles.statMetricRow}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: item.background },
                ]}
              >
                <AppIcon name={item.icon} size={iconSize.md} color={item.color} />
              </View>
              <AppText variant="h2" style={styles.statValue}>
                {item.value}
              </AppText>
            </View>
            <AppText variant="caption" muted numberOfLines={1} style={styles.statLabel}>
              {item.label}
            </AppText>
          </Card>
        ))}
      </View>

      {bookingsQuery.error ? (
        <AlertBanner variant="error">
          Work activity could not refresh. {errorMessage(bookingsQuery.error)}
        </AlertBanner>
      ) : null}

      <DashboardSection title="Needs attention">
        {pendingBookings.length ? (
          <View style={styles.stack}>
            {pendingBookings.map(booking => (
              <WorkCard key={booking.id} booking={booking} />
            ))}
          </View>
        ) : (
          <CaughtUpCard />
        )}
      </DashboardSection>

      <DashboardSection title="Active work">
        {activeBookings.length ? (
          <View style={styles.stack}>
            {activeBookings.map(booking => (
              <WorkCard
                key={booking.id}
                booking={booking}
                onChat={
                  booking.chatEnabled
                    ? () =>
                        stack?.navigate('ProviderBookingChat', {
                          bookingId: booking.id,
                        })
                    : undefined
                }
                onCall={
                  booking.chatEnabled
                    ? () =>
                        stack?.navigate('ProviderVoiceCallPreview', {
                          bookingId: booking.id,
                        })
                    : undefined
                }
              />
            ))}
          </View>
        ) : (
          <EmptyMiniCard
            icon="briefcase"
            title="No active jobs"
            copy="Accepted jobs will stay visible here while work is active."
          />
        )}
      </DashboardSection>

      <DashboardSection title="Business performance">
        <Card style={styles.performanceCard}>
          <PerformanceItem
            label="Reviews"
            value={String(dashboard?.stats.totalReviews ?? profile?.reviewCount ?? 0)}
            icon="message"
            color={theme.colors.primary}
          />
          <PerformanceDivider />
          <PerformanceItem
            label="Services"
            value={String(services.length)}
            icon="wrench"
            color={theme.colors.primary}
          />
          <PerformanceDivider />
          <PerformanceItem
            label="Experience"
            value={
              profile?.experienceYears == null
                ? '—'
                : `${Math.max(0, profile.experienceYears)}y`
            }
            icon="briefcase"
            color={theme.colors.accent}
          />
          <PerformanceDivider />
          <PerformanceItem
            label="Availability"
            value={profile?.available ? 'On' : 'Off'}
            icon="checkCircle"
            color={profile?.available ? theme.colors.success : theme.colors.textMuted}
          />
        </Card>
      </DashboardSection>

      <DashboardSection title="Quick actions">
        <View style={styles.quickGrid}>
          <QuickAction
            icon="plus"
            label="Add service"
            onPress={() =>
              navigation.navigate('ProviderServices', { action: 'add' })
            }
          />
          <QuickAction
            icon="wrench"
            label="Services"
            onPress={() => navigation.navigate('ProviderServices')}
          />
          <QuickAction
            icon="camera"
            label="Photos"
            onPress={() =>
              navigation.navigate('ProviderProfile', { action: 'managePhotos' })
            }
          />
          <QuickAction
            icon="userEdit"
            label="Edit profile"
            onPress={() =>
              navigation.navigate('ProviderProfile', { action: 'edit' })
            }
          />
        </View>
      </DashboardSection>

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('ProviderProfile')}
        style={({ pressed }) => [
          styles.membershipCard,
          {
            backgroundColor: premium
              ? localsewaPlusPalette.premiumIvory
              : pressed
                ? theme.colors.secondary
                : theme.colors.surface,
            borderColor: premium
              ? localsewaPlusPalette.softGold
              : theme.colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.membershipIcon,
            {
              backgroundColor: premium
                ? localsewaPlusPalette.softGold
                : theme.colors.secondary,
            },
          ]}
        >
          <AppIcon
            name="sparkles"
            size={iconSize.md}
            color={
              premium ? localsewaPlusPalette.strongGold : theme.colors.primary
            }
          />
        </View>
        <View style={styles.flex}>
          <AppText
            variant="overline"
            color={premium ? localsewaPlusPalette.strongGold : theme.colors.primary}
          >
            LOCALSEWA+
          </AppText>
          <AppText variant="title" style={styles.membershipTitle}>
            {isTrialMembership
              ? 'Localsewa+ Trial'
              : premium
                ? 'Localsewa+ Active'
                : 'Grow with Localsewa+'}
          </AppText>
          <AppText variant="caption" muted>
            {isTrialMembership
              ? `${membershipPlan} plan • Trial active`
              : premium
                ? `${membershipPlan} plan • Membership active`
                : 'Premium business tools and category controls when you need them.'}
          </AppText>
        </View>
        <AppIcon
          name="chevronRight"
          size={iconSize.sm}
          color={theme.colors.textMuted}
        />
      </Pressable>

      <DashboardSection title="Recent activity">
        {recentActivity.length ? (
          <Card style={styles.activityCard}>
            {recentActivity.map((booking, index) => (
              <React.Fragment key={booking.id}>
                {index > 0 ? (
                  <View
                    style={[
                      styles.activityDivider,
                      { backgroundColor: theme.colors.border },
                    ]}
                  />
                ) : null}
                <View style={styles.activityRow}>
                  <View
                    style={[
                      styles.activityIcon,
                      {
                        backgroundColor: statusPalette(booking.status, theme).background,
                      },
                    ]}
                  >
                    <AppIcon
                      name={statusIcon(booking.status)}
                      size={iconSize.xs}
                      color={statusPalette(booking.status, theme).text}
                    />
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="label" numberOfLines={1}>
                      {booking.serviceName}
                    </AppText>
                    <AppText variant="caption" muted numberOfLines={1}>
                      {statusLabel(booking.status)}
                      {booking.customerName ? ` • ${booking.customerName}` : ''}
                    </AppText>
                  </View>
                  {formatDashboardDate(booking.date) ? (
                    <AppText variant="caption" muted>
                      {formatDashboardDate(booking.date)}
                    </AppText>
                  ) : null}
                </View>
              </React.Fragment>
            ))}
          </Card>
        ) : (
          <EmptyMiniCard
            icon="clock"
            title="No recent closed activity"
            copy="Completed or closed requests will appear here."
          />
        )}
      </DashboardSection>
    </ScrollView>
  );
}

function DashboardSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <AppText variant="h3">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" muted style={styles.smallGap}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function WorkCard({
  booking,
  onChat,
  onCall,
}: {
  booking: Booking;
  onChat?: () => void;
  onCall?: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();
  const palette = statusPalette(booking.status, theme);
  const dateLabel = formatDashboardDate(booking.date);
  const timeLabel = formatDashboardTime(booking.time);

  return (
    <Card style={styles.workCard}>
      <View style={styles.workTop}>
        <View style={styles.flex}>
          <AppText variant="title" numberOfLines={1}>
            {booking.serviceName}
          </AppText>
          <AppText variant="bodySmall" muted numberOfLines={1} style={styles.smallGap}>
            {booking.customerName || 'Customer'}
          </AppText>
        </View>
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: palette.background,
              borderColor: palette.border,
            },
          ]}
        >
          <AppText variant="overline" color={palette.text}>
            {statusLabel(booking.status).toUpperCase()}
          </AppText>
        </View>
      </View>

      {dateLabel || timeLabel ? (
        <View style={styles.workMeta}>
          {dateLabel ? <Meta icon="calendar" text={dateLabel} compact /> : null}
          {timeLabel ? <Meta icon="clock" text={timeLabel} compact /> : null}
        </View>
      ) : null}
      {booking.area || booking.location ? (
        <Meta icon="mapPin" text={booking.area || booking.location || ''} />
      ) : null}

      {onChat || onCall ? (
        <View
          style={[
            styles.communicationRow,
            { borderTopColor: theme.colors.border },
          ]}
        >
          {onChat ? (
            <CommunicationAction
              icon="message"
              label="Chat"
              onPress={onChat}
            />
          ) : null}
          {onCall ? (
            <CommunicationAction
              icon="phone"
              label="Call"
              onPress={onCall}
            />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

function CommunicationAction({
  icon,
  label,
  onPress,
}: {
  icon: AppIconName;
  label: string;
  onPress: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.communicationAction,
        {
          backgroundColor: pressed
            ? theme.colors.secondary
            : theme.colors.surfaceMuted,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <AppIcon name={icon} size={iconSize.sm} color={theme.colors.primary} />
      <AppText variant="label" color={theme.colors.primary}>
        {label}
      </AppText>
    </Pressable>
  );
}

function Meta({
  icon,
  text,
  compact = false,
}: {
  icon: AppIconName;
  text: string;
  compact?: boolean;
}): React.JSX.Element {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.metaRow, compact && styles.metaCompact]}>
      <AppIcon name={icon} size={14} color={theme.colors.textMuted} />
      <AppText variant="caption" muted numberOfLines={1} style={styles.metaText}>
        {text}
      </AppText>
    </View>
  );
}

function PerformanceItem({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: AppIconName;
  color: string;
}): React.JSX.Element {
  return (
    <View style={styles.performanceItem}>
      <AppIcon name={icon} size={iconSize.sm} color={color} />
      <AppText variant="title" style={styles.performanceValue}>
        {value}
      </AppText>
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </View>
  );
}

function PerformanceDivider(): React.JSX.Element {
  const { theme } = useAppTheme();
  return (
    <View
      style={[styles.performanceDivider, { backgroundColor: theme.colors.border }]}
    />
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: AppIconName;
  label: string;
  onPress: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        {
          backgroundColor: pressed ? theme.colors.secondary : theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: theme.colors.secondary }]}> 
        <AppIcon name={icon} size={iconSize.sm} color={theme.colors.primary} />
      </View>
      <AppText variant="label" numberOfLines={1} style={styles.quickLabel}>
        {label}
      </AppText>
      <AppIcon
        name="chevronRight"
        size={iconSize.xs}
        color={theme.colors.textMuted}
      />
    </Pressable>
  );
}

function CaughtUpCard(): React.JSX.Element {
  const { theme } = useAppTheme();
  return (
    <Card style={styles.caughtUpCard}>
      <View style={[styles.caughtUpIcon, { backgroundColor: '#EDF8F0' }]}> 
        <AppIcon name="checkCircle" size={iconSize.xs} color={theme.colors.success} />
      </View>
      <View style={styles.flex}>
        <AppText variant="label">You're all caught up</AppText>
        <AppText variant="caption" muted numberOfLines={1}>
          No pending requests right now.
        </AppText>
      </View>
    </Card>
  );
}

function EmptyMiniCard({
  icon,
  title,
  copy,
}: {
  icon: AppIconName;
  title: string;
  copy: string;
}): React.JSX.Element {
  const { theme } = useAppTheme();
  return (
    <Card style={styles.emptyCard}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.colors.secondary }]}> 
        <AppIcon name={icon} size={iconSize.sm} color={theme.colors.primary} />
      </View>
      <View style={styles.flex}>
        <AppText variant="label">{title}</AppText>
        <AppText variant="caption" muted style={styles.smallGap}>
          {copy}
        </AppText>
      </View>
    </Card>
  );
}

function statusLabel(status: BookingStatus): string {
  switch (status) {
    case 'in_progress':
      return 'In progress';
    case 'not_completed':
      return 'Not completed';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function statusIcon(status: BookingStatus): AppIconName {
  switch (status) {
    case 'completed':
      return 'checkCircle';
    case 'rejected':
    case 'cancelled':
    case 'not_completed':
      return 'x';
    case 'accepted':
    case 'in_progress':
      return 'briefcase';
    default:
      return 'clock';
  }
}

function statusPalette(
  status: BookingStatus,
  theme: ReturnType<typeof useAppTheme>['theme'],
) {
  if (status === 'completed') {
    return { text: theme.colors.success, background: '#EDF8F0', border: '#B9DEC3' };
  }
  if (status === 'accepted' || status === 'in_progress') {
    return { text: theme.colors.info, background: '#EEF4FF', border: '#C9D8F5' };
  }
  if (status === 'rejected' || status === 'not_completed') {
    return { text: theme.colors.error, background: '#FFF1F0', border: '#F0C5C0' };
  }
  if (status === 'cancelled') {
    return {
      text: theme.colors.textMuted,
      background: theme.colors.surfaceMuted,
      border: theme.colors.border,
    };
  }
  return { text: theme.colors.warning, background: '#FFF8E8', border: '#EBD9A8' };
}

function formatMembershipPlan(value?: string | null): string {
  const normalized = value?.trim();

  if (!normalized) {
    return 'Premium';
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

function formatDashboardDate(value?: string | null): string {
  const raw = value?.trim();

  if (!raw) {
    return '';
  }

  const matched = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!matched) {
    return raw;
  }

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const monthIndex = Number(matched[2]) - 1;

  if (monthIndex < 0 || monthIndex >= monthNames.length) {
    return raw;
  }

  return `${Number(matched[3])} ${monthNames[monthIndex]} ${matched[1]}`;
}

function formatDashboardTime(value?: string | null): string {
  const raw = value?.trim();

  if (!raw) {
    return '';
  }

  const matched = raw.match(/^(\d{1,2}):(\d{2})/);

  if (!matched) {
    return raw;
  }

  const hour = Number(matched[1]);
  const minute = Number(matched[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return raw;
  }

  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function DashboardSkeleton(): React.JSX.Element {
  const { theme } = useAppTheme();
  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Skeleton height={156} borderRadius={PROVIDER_SURFACE_RADIUS} />
      <View style={styles.statsGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} height={100} borderRadius={PROVIDER_SURFACE_RADIUS} />
        ))}
      </View>
      <Skeleton height={220} borderRadius={PROVIDER_SURFACE_RADIUS} />
      <Skeleton height={180} borderRadius={PROVIDER_SURFACE_RADIUS} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[4],
  },
  flex: { flex: 1, minWidth: 0 },
  smallGap: { marginTop: spacing[1] },
  businessCard: {
    borderWidth: 1,
    borderRadius: PROVIDER_SURFACE_RADIUS,
    padding: spacing[4],
  },
  businessTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  businessName: { marginTop: 2, marginBottom: 2 },
  availabilityPill: {
    minHeight: 28,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  availabilityDot: { width: 7, height: 7, borderRadius: 4 },
  businessFooter: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  businessRequestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
  },
  inlineAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  statCard: {
    width: '48%',
    minHeight: 94,
    borderRadius: 22,
    padding: spacing[3],
  },
  statMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { marginTop: 0, marginBottom: 0 },
  statLabel: { marginTop: spacing[2] },
  section: { gap: spacing[2] },
  sectionHeading: { paddingHorizontal: 2 },
  stack: { gap: spacing[3] },
  workCard: {
    borderRadius: PROVIDER_SURFACE_RADIUS,
    padding: spacing[4],
  },
  workTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing[2],
    paddingVertical: 5,
  },
  workMeta: {
    marginTop: spacing[2],
    flexDirection: 'row',
    gap: spacing[3],
  },
  communicationRow: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing[2],
  },
  communicationAction: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  metaRow: {
    marginTop: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
  },
  metaCompact: {
    flex: 1,
    marginTop: 0,
  },
  metaText: {
    flexShrink: 1,
    minWidth: 0,
  },
  performanceCard: {
    borderRadius: PROVIDER_SURFACE_RADIUS,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[2],
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  performanceValue: { marginTop: spacing[1] },
  performanceDivider: { width: 1, marginVertical: 4 },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  quickAction: {
    width: '48%',
    minHeight: 62,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { flex: 1, fontSize: 12, lineHeight: 16 },
  membershipCard: {
    borderWidth: 1,
    borderRadius: PROVIDER_SURFACE_RADIUS,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  membershipIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipTitle: { marginTop: 2, marginBottom: 2 },
  activityCard: {
    borderRadius: PROVIDER_SURFACE_RADIUS,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  activityRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityDivider: { height: 1, marginLeft: 46 },
  caughtUpCard: {
    borderRadius: PROVIDER_SURFACE_RADIUS,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  caughtUpIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: PROVIDER_SURFACE_RADIUS,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

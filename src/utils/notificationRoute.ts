import {
  AppNotification,
} from '../types/notification';

export type NotificationTarget =
  | {
      workspace: 'customer';
      route:
        | 'BookingDetails'
        | 'BookingChat'
        | 'CustomerBookings';
      bookingId?: number;
    }
  | {
      workspace: 'provider';
      route: 'ProviderHome';
    }
  | {
      workspace: 'customer';
      route: 'Notifications';
    };

function positiveInteger(
  value: string | null | undefined,
): number | null {
  if (!value) {
    return null;
  }

  const parsed =
    Number(value);

  return (
    Number.isInteger(parsed) &&
    parsed > 0
  )
    ? parsed
    : null;
}

function parseUrl(
  raw: string | null,
): {
  path: string;
  params: URLSearchParams;
} {
  if (!raw) {
    return {
      path: '',
      params:
        new URLSearchParams(),
    };
  }

  try {
    const url =
      raw.startsWith(
        'http://',
      ) ||
      raw.startsWith(
        'https://',
      )
        ? new URL(raw)
        : new URL(
            raw,
            'https://localsewa.com',
          );

    return {
      path:
        url.pathname
          .toLowerCase(),
      params:
        url.searchParams,
    };
  } catch {
    const [
      path,
      query = '',
    ] =
      raw.split('?');

    return {
      path:
        path.toLowerCase(),
      params:
        new URLSearchParams(
          query,
        ),
    };
  }
}

function bookingIdFromNotification(
  notification: AppNotification,
  params: URLSearchParams,
): number | null {
  const entityType =
    notification.entityType
      ?.toLowerCase() ??
    '';

  if (
    entityType.includes(
      'booking',
    )
  ) {
    const fromEntity =
      positiveInteger(
        notification.entityId,
      );

    if (fromEntity) {
      return fromEntity;
    }
  }

  const keys = [
    'booking',
    'booking_id',
    'bookingId',
    'id',
  ];

  for (const key of keys) {
    const candidate =
      positiveInteger(
        params.get(key),
      );

    if (candidate) {
      return candidate;
    }
  }

  return null;
}

export function resolveNotificationTarget(
  notification: AppNotification,
): NotificationTarget {
  const {
    path,
    params,
  } = parseUrl(
    notification.actionUrl,
  );

  const type =
    notification.type
      .toLowerCase();

  const entityType =
    notification.entityType
      ?.toLowerCase() ??
    '';

  const roleParam =
    (
      params.get('role') ??
      params.get(
        'workspace',
      ) ??
      ''
    ).toLowerCase();

  const providerTarget =
    path.includes(
      '/provider',
    ) ||
    roleParam ===
      'provider' ||
    type.startsWith(
      'provider_',
    ) ||
    entityType.startsWith(
      'provider',
    );

  if (providerTarget) {
    return {
      workspace:
        'provider',
      route:
        'ProviderHome',
    };
  }

  const bookingId =
    bookingIdFromNotification(
      notification,
      params,
    );

  if (bookingId) {
    const chatTarget =
      path.includes(
        'chat',
      ) ||
      type.includes(
        'message',
      ) ||
      type.includes(
        'chat',
      ) ||
      params.get(
        'chat',
      ) === '1' ||
      params.get(
        'view',
      )?.toLowerCase() ===
        'chat';

    return {
      workspace:
        'customer',
      route:
        chatTarget
          ? 'BookingChat'
          : 'BookingDetails',
      bookingId,
    };
  }

  if (
    path.includes(
      'booking',
    ) ||
    type.includes(
      'booking',
    )
  ) {
    return {
      workspace:
        'customer',
      route:
        'CustomerBookings',
    };
  }

  return {
    workspace:
      'customer',
    route:
      'Notifications',
  };
}

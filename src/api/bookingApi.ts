import { Booking, BookingStatus } from '../types/booking';
import { VerifiedLocation } from '../types/location';
import { API_ORIGIN, apiRequest } from './apiClient';

type ApiBooking = Record<string, unknown>;

type CreateBookingInput = {
  providerId: string;
  providerServiceId?: number;
  customServiceName?: string;
  bookingDate: string;
  bookingTime: string;
  note?: string;
  location: VerifiedLocation;
  requestId: string;
};

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function nullableText(value: unknown): string | null {
  const result = text(value).trim();

  return result || null;
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function mediaUrl(value: unknown): string | undefined {
  const path = text(value).trim();

  if (!path) {
    return undefined;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}/${path.replace(/^\/+/, '')}`;
}

function bookingStatus(value: unknown): BookingStatus {
  const status = text(value, 'pending').toLowerCase();

  switch (status) {
    case 'accepted':
    case 'in_progress':
    case 'completed':
    case 'rejected':
    case 'cancelled':
    case 'not_completed':
      return status;
    default:
      return 'pending';
  }
}

export function parseBooking(value: ApiBooking): Booking {
  return {
    id: Number(value.id),
    bookingCode: text(value.booking_code, `#${String(value.id ?? '')}`),
    providerId: text(value.provider_id),
    providerName: text(value.helper, 'Service provider'),
    providerImage: mediaUrl(value.providerImage),
    serviceName: text(value.service, 'Service'),
    providerServiceId: numberOrNull(value.providerServiceId),
    servicePrice: numberOrNull(value.servicePrice),
    isCustomService: Boolean(value.isCustomService),

    location: nullableText(value.location),
    area: nullableText(value.area),
    latitude: numberOrNull(value.latitude),
    longitude: numberOrNull(value.longitude),
    mapsUrl: nullableText(value.mapsUrl),
    locationSource: text(value.locationSource),
    exactLocationUnlocked: Boolean(value.exactLocationUnlocked),

    distanceKm: numberOrNull(value.distanceKm),
    distanceLabel: nullableText(value.distanceLabel),

    providerLocation: nullableText(value.providerLocation),
    providerLatitude: numberOrNull(value.providerLatitude),
    providerLongitude: numberOrNull(value.providerLongitude),
    providerMapsUrl: nullableText(value.providerMapsUrl),

    date: text(value.date),
    time: text(value.time),
    status: bookingStatus(value.status),
    reason: nullableText(value.reason),

    rating: numberOrNull(value.rating),
    reviewComment: nullableText(value.reviewComment),

    canRate: Boolean(value.canRate),
    canRebook: Boolean(value.canRebook),
    canCancel: Boolean(value.canCancel),
    chatEnabled: Boolean(value.chatEnabled),

    customerName: nullableText(value.customerName),
    note: nullableText(value.note),
  };
}

export const bookingApi = {
  async listCustomer(token: string): Promise<Booking[]> {
    const result = await apiRequest<{
      success: true;
      bookings: ApiBooking[];
    }>('/api/bookings?scope=customer', { token });

    return Array.isArray(result.bookings)
      ? result.bookings
          .map(parseBooking)
          .filter(booking => Number.isInteger(booking.id) && booking.id > 0)
      : [];
  },

  async listProvider(token: string): Promise<Booking[]> {
    const result = await apiRequest<{
      success: true;
      bookings: ApiBooking[];
    }>('/api/bookings?scope=provider', { token });

    return Array.isArray(result.bookings)
      ? result.bookings
          .map(parseBooking)
          .filter(booking => Number.isInteger(booking.id) && booking.id > 0)
      : [];
  },

  async create(
    input: CreateBookingInput,
    token: string,
  ): Promise<{
    bookingId: number | null;
  }> {
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(input.requestId)) {
      throw new Error('Booking request ID is invalid.');
    }

    const body: Record<string, unknown> = {
      provider_id: input.providerId,
      address: input.location.address,
      booking_date: input.bookingDate,
      booking_time: input.bookingTime,
      note: input.note?.trim() || undefined,

      latitude: input.location.latitude,
      longitude: input.location.longitude,
      area_label: input.location.areaLabel,
      location_source: 'NEW',
      verification_token: input.location.verificationToken,
      request_id: input.requestId,
    };

    if (input.providerServiceId) {
      body.provider_service_id = input.providerServiceId;
    } else {
      const custom = input.customServiceName?.trim();

      if (!custom) {
        throw new Error(
          'Choose a provider service or describe the custom service you need.',
        );
      }

      body.is_custom_service = true;
      body.custom_service_name = custom;
    }

    const result = await apiRequest<Record<string, unknown>>('/api/bookings', {
      method: 'POST',
      token,
      body,
      // Never automatically retry a POST.
      retryGet: false,
    });

    const nested =
      result.booking &&
      typeof result.booking === 'object' &&
      !Array.isArray(result.booking)
        ? (result.booking as ApiBooking)
        : null;

    const candidate =
      nested?.id ?? result.booking_id ?? result.bookingId ?? result.id;

    const bookingId = Number(candidate);

    return {
      bookingId:
        Number.isInteger(bookingId) && bookingId > 0 ? bookingId : null,
    };
  },

  async cancel(bookingId: number, token: string): Promise<void> {
    await apiRequest(`/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      token,
      body: {
        status: 'CANCELLED',
      },
    });
  },

  async review(
    bookingId: number,
    rating: number,
    comment: string,
    token: string,
  ): Promise<void> {
    await apiRequest(`/api/bookings/${bookingId}/review`, {
      method: 'POST',
      token,
      body: {
        rating,
        comment: comment.trim() || undefined,
      },
    });
  },
};

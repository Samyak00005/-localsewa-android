import { AccountDeletionStatus, CustomerProfile, ProfileImageUpload } from '../types/account';
import { VerifiedLocation } from '../types/location';
import { API_ORIGIN, ApiError, apiRequest } from './apiClient';

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
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

function mediaUrl(value: unknown): string | null {
  const path = nullableText(value);

  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}/${path.replace(/^\/+/, '')}`;
}

function profileRecord(result: ApiRecord): ApiRecord {
  if (isRecord(result.user)) {
    return result.user;
  }

  if (isRecord(result.profile)) {
    return result.profile;
  }

  return result;
}

function parseProfile(result: ApiRecord): CustomerProfile {
  const row = profileRecord(result);

  const id = Number(row.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError('Localsewa returned an invalid profile response.');
  }

  const roles = Array.isArray(row.roles)
    ? row.roles
        .filter(item => typeof item === 'string')
        .map(item => item.toUpperCase())
    : [];

  return {
    id,
    fullName: text(row.full_name).trim() || 'Localsewa user',
    phone: nullableText(row.phone),
    email: nullableText(row.email),
    whatsapp: nullableText(row.whatsapp),
    location: nullableText(row.location),
    latitude: numberOrNull(row.latitude),
    longitude: numberOrNull(row.longitude),
    profileImage: mediaUrl(row.profile_image),
    phoneVerified: Boolean(row.phone_verified),
    emailVerified: Boolean(row.email_verified),
    status: text(row.status) || 'ACTIVE',
    roles,
    googleLinked: Boolean(row.google_linked),
    createdAt: nullableText(row.created_at),
    updatedAt: nullableText(row.updated_at),
  };
}

function deletionRecord(result: ApiRecord): ApiRecord | null {
  const candidates = [result.deletion, result.account_deletion, result.request];

  for (const candidate of candidates) {
    if (isRecord(candidate)) {
      return candidate;
    }
  }

  if ('state' in result) {
    return result;
  }

  return null;
}

function parseDeletion(result: ApiRecord): AccountDeletionStatus | null {
  const row = deletionRecord(result);

  if (!row) {
    return null;
  }

  const stateRaw = text(row.state).toLowerCase();

  if (!['pending', 'due', 'cancelled', 'completed'].includes(stateRaw)) {
    return null;
  }

  return {
    state: stateRaw as AccountDeletionStatus['state'],
    requestedAt: nullableText(row.requested_at),
    scheduledFor: nullableText(row.scheduled_for),
    cancelledAt: nullableText(row.cancelled_at),
    completedAt: nullableText(row.completed_at),
    remainingSeconds: Math.max(0, Number(row.remaining_seconds ?? 0) || 0),
    remainingDays: Math.max(0, Number(row.remaining_days ?? 0) || 0),
    canRestoreByLogin: Boolean(row.can_restore_by_login),
    gracePeriodDays: Math.max(0, Number(row.grace_period_days ?? 30) || 30),
  };
}

export const accountApi = {
  async profile(token: string): Promise<CustomerProfile> {
    const result = await apiRequest<ApiRecord>('/api/profile', { token });

    return parseProfile(result);
  },

  async updateProfile(
    token: string,
    input: {
      fullName: string;
      phone: string;
      whatsapp: string;
    },
  ): Promise<CustomerProfile> {
    const result = await apiRequest<ApiRecord>('/api/profile', {
      method: 'PUT',
      token,
      body: {
        full_name: input.fullName.trim(),
        phone: input.phone.trim(),
        whatsapp: input.whatsapp.trim() || null,
      },
    });

    return parseProfile(result);
  },

  async uploadProfileImage(
    token: string,
    image: ProfileImageUpload,
  ): Promise<CustomerProfile> {
    const form = new FormData();

    form.append(
      'image',
      {
        uri: image.uri,
        name: image.name || 'profile.jpg',
        type: image.type || 'image/jpeg',
      } as any,
    );

    await apiRequest<ApiRecord>('/api/profile/image', {
      method: 'POST',
      token,
      body: form,
      timeoutMs: 45_000,
    });

    // The upload endpoint is allowed to return only upload metadata.
    // Re-read the canonical profile so the UI always receives the same shape.
    return accountApi.profile(token);
  },

  async updateDefaultLocation(
    token: string,
    location: VerifiedLocation,
  ): Promise<CustomerProfile> {
    const result = await apiRequest<ApiRecord>('/api/profile/location', {
      method: 'PUT',
      token,
      body: {
        location: location.address,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        area_label: location.areaLabel,
        location_source: 'DEFAULT',
        verification_token: location.verificationToken,
      },
    });

    return parseProfile(result);
  },

  async deletionStatus(token: string): Promise<AccountDeletionStatus | null> {
    const result = await apiRequest<ApiRecord>('/api/account/deletion', {
      token,
    });

    return parseDeletion(result);
  },
};

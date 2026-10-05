import { VerifiedLocation } from '../types/location';
import { ApiError, apiRequest } from './apiClient';

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function number(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function locationRecord(result: ApiRecord): ApiRecord {
  const candidates = [
    result.location,
    result.verified_location,
    result.verifiedLocation,
    result.data,
  ];

  for (const candidate of candidates) {
    if (isRecord(candidate)) {
      return candidate;
    }
  }

  return result;
}

function parseVerifiedLocation(result: ApiRecord): VerifiedLocation {
  const source = locationRecord(result);

  const latitude = number(source.latitude ?? source.lat);

  const longitude = number(source.longitude ?? source.lng ?? source.lon);

  const verificationToken = text(
    source.verification_token ?? source.verificationToken,
  );

  const address = text(
    source.formatted_address ??
      source.formattedAddress ??
      source.address ??
      source.label,
  );

  const areaLabel =
    text(source.area_label ?? source.areaLabel ?? source.area) || address;

  if (latitude == null || longitude == null || !verificationToken || !address) {
    throw new ApiError(
      'Localsewa could not verify this address. Try a more complete address with area, city, state and PIN code.',
    );
  }

  return {
    address,
    areaLabel,
    latitude,
    longitude,
    verificationToken,
  };
}

async function validateWithKey(
  key: 'address' | 'q',
  address: string,
): Promise<VerifiedLocation> {
  const query = new URLSearchParams({
    [key]: address,
  }).toString();

  const result = await apiRequest<ApiRecord>(`/api/location/validate?${query}`);

  return parseVerifiedLocation(result);
}

export const locationApi = {
  async validateAddress(address: string): Promise<VerifiedLocation> {
    const clean = address.trim();

    if (clean.length < 8) {
      throw new Error('Enter a complete service address before verification.');
    }

    try {
      return await validateWithKey('address', clean);
    } catch (error) {
      // Current backend documentation identifies this endpoint as
      // address-text validation. q fallback keeps compatibility with
      // older map-router parameter naming without hiding server errors.
      if (error instanceof ApiError && [400, 422].includes(error.status)) {
        return validateWithKey('q', clean);
      }

      throw error;
    }
  },
};

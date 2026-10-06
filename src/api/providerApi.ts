import { Provider, ProviderReview, ProviderService } from '../types/provider';
import { API_ORIGIN, ApiError, apiRequest } from './apiClient';

type ApiRecord = Record<string, unknown>;

export type ProviderListOptions = {
  q?: string;
  category?: string;
  latitude?: number | null;
  longitude?: number | null;
  limit?: number;
};

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function normalizeProviderRef(value: unknown): string {
  const raw =
    typeof value === 'number'
      ? String(value)
      : text(value).trim();

  if (!raw) {
    return '';
  }

  if (/^provider-\d+$/i.test(raw)) {
    return raw.toLowerCase();
  }

  if (/^\d+$/.test(raw)) {
    return `provider-${raw}`;
  }

  return raw;
}

function number(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function titleCase(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
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

function parseServices(value: unknown): ProviderService[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is ApiRecord => Boolean(item) && typeof item === 'object',
    )
    .map(item => {
      const rawPrice = number(item.price, NaN);

      return {
        id: String(item.id ?? ''),
        name: text(item.name, 'Service'),
        description: text(item.description) || undefined,
        price: Number.isFinite(rawPrice) ? rawPrice : undefined,
      };
    })
    .filter(item => Boolean(item.id) && Boolean(item.name));
}

function parseReviews(value: unknown): ProviderReview[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is ApiRecord => Boolean(item) && typeof item === 'object',
    )
    .map(item => ({
      id: String(item.id ?? ''),
      rating: number(item.rating),
      comment: text(item.comment) || undefined,
      createdAt: text(item.created_at) || undefined,
    }))
    .filter(item => Boolean(item.id));
}

function parseImageUrls(value: ApiRecord, primary?: string): string[] {
  const urls = Array.isArray(value.business_images)
    ? value.business_images
        .map(item =>
          item && typeof item === 'object'
            ? mediaUrl(
                (item as ApiRecord).url ?? (item as ApiRecord).image_path,
              )
            : mediaUrl(item),
        )
        .filter((url): url is string => Boolean(url))
    : [];

  if (primary && !urls.includes(primary)) {
    urls.unshift(primary);
  }

  return urls;
}

function distanceLabel(value: ApiRecord): string | undefined {
  const direct = text(value.distanceLabel ?? value.distance_label).trim();

  if (direct) {
    return direct;
  }

  const rawKm = number(
    value.distance_km ?? value.distanceKm ?? value.distance,
    NaN,
  );

  if (Number.isFinite(rawKm) && rawKm >= 0) {
    const rounded = rawKm < 10 ? rawKm.toFixed(1) : String(Math.round(rawKm));

    return `About ${rounded} km away (approx. area)`;
  }

  return undefined;
}

export function parseProvider(value: ApiRecord): Provider {
  const parsedServices = parseServices(value.services);

  const reviewCount = Math.max(0, number(value.reviews ?? value.review_count));

  const serviceCount = Math.max(
    parsedServices.length,
    Math.max(0, number(value.service_count)),
  );

  const imageUrl =
    mediaUrl(value.business_image) ?? mediaUrl(value.profile_image);

  const rawRating = number(value.rating, NaN);

  const providerRef = normalizeProviderRef(
    value.provider_ref ?? value.providerRef ?? value.id,
  );

  return {
    id: providerRef,
    name: text(value.name, 'Service provider'),
    category: titleCase(text(value.category, 'Local service')),
    location: text(value.location, 'Service area unavailable'),
    distanceLabel: distanceLabel(value),
    startingPrice: Number.isFinite(
      number(value.starting_price ?? value.startingPrice, NaN),
    )
      ? number(value.starting_price ?? value.startingPrice)
      : undefined,
    rating: reviewCount > 0 && Number.isFinite(rawRating) ? rawRating : null,
    reviewCount,
    experienceYears: Math.max(
      0,
      number(value.experience ?? value.experience_years),
    ),
    verified: Boolean(value.verified),
    available: value.available !== false && value.available !== 0,
    imageUrl,
    imageUrls: parseImageUrls(value, imageUrl),
    description: text(value.description) || undefined,
    services: parsedServices,
    serviceCount,
    reviews: parseReviews(value.review_items),
    homeService:
      value.home_service == null ? undefined : Boolean(value.home_service),
    shopService:
      value.shop_service == null ? undefined : Boolean(value.shop_service),
  };
}

function listPath(options: ProviderListOptions): string {
  const params = new URLSearchParams();

  params.set(
    'limit',
    String(Math.max(1, Math.min(150, Math.trunc(options.limit ?? 150)))),
  );

  const query = options.q?.trim();

  if (query) {
    params.set('q', query);
  }

  const category = options.category?.trim();

  if (category) {
    params.set('category', category);
  }

  if (
    typeof options.latitude === 'number' &&
    Number.isFinite(options.latitude) &&
    typeof options.longitude === 'number' &&
    Number.isFinite(options.longitude)
  ) {
    params.set('lat', String(options.latitude));

    params.set('lng', String(options.longitude));
  }

  return `/api/providers?${params.toString()}`;
}

export const providerApi = {
  async list(
    token?: string | null,
    options: ProviderListOptions = {},
  ): Promise<Provider[]> {
    const result = await apiRequest<{
      success: true;
      providers: ApiRecord[];
    }>(listPath(options), { token });

    return Array.isArray(result.providers)
      ? result.providers
          .map(parseProvider)
          .filter(provider => Boolean(provider.id))
      : [];
  },

  async details(providerId: string, token?: string | null): Promise<Provider> {
    const providerRef = normalizeProviderRef(providerId);

    if (!providerRef) {
      throw new ApiError('Provider ID is missing.');
    }

    const result = await apiRequest<{
      success: true;
      provider: ApiRecord;
    }>(`/api/providers/${encodeURIComponent(providerRef)}`, { token });

    return parseProvider(result.provider);
  },
};

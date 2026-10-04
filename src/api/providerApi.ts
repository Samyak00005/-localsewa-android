import {
  API_ORIGIN,
  ApiError,
  apiRequest,
} from './apiClient';
import {
  Provider,
  ProviderReview,
  ProviderService,
} from '../types/provider';

type ApiRecord =
  Record<string, unknown>;

function text(
  value: unknown,
  fallback = '',
): string {
  return typeof value === 'string'
    ? value
    : fallback;
}

function number(
  value: unknown,
  fallback = 0,
): number {
  const parsed =
    typeof value === 'number'
      ? value
      : Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function titleCase(
  value: string,
): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(
      /\b\w/g,
      letter => letter.toUpperCase(),
    );
}

function mediaUrl(
  value: unknown,
): string | undefined {
  const path = text(value).trim();

  if (!path) {
    return undefined;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}/${path.replace(
    /^\/+/,
    '',
  )}`;
}

function parseServices(
  value: unknown,
): ProviderService[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is ApiRecord =>
        Boolean(item) &&
        typeof item === 'object',
    )
    .map(item => {
      const rawPrice =
        number(item.price, NaN);

      return {
        id: String(item.id ?? ''),
        name: text(
          item.name,
          'Service',
        ),
        description:
          text(item.description) ||
          undefined,
        price:
          Number.isFinite(rawPrice)
            ? rawPrice
            : undefined,
      };
    })
    .filter(
      item =>
        Boolean(item.id) &&
        Boolean(item.name),
    );
}

function parseReviews(
  value: unknown,
): ProviderReview[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is ApiRecord =>
        Boolean(item) &&
        typeof item === 'object',
    )
    .map(item => ({
      id: String(item.id ?? ''),
      rating: number(item.rating),
      comment:
        text(item.comment) ||
        undefined,
      createdAt:
        text(item.created_at) ||
        undefined,
    }))
    .filter(item => Boolean(item.id));
}

function parseImageUrls(
  value: ApiRecord,
  primary?: string,
): string[] {
  const urls = Array.isArray(
    value.business_images,
  )
    ? value.business_images
        .map(item =>
          item &&
          typeof item === 'object'
            ? mediaUrl(
                (item as ApiRecord).url ??
                  (item as ApiRecord)
                    .image_path,
              )
            : mediaUrl(item),
        )
        .filter(
          (url): url is string =>
            Boolean(url),
        )
    : [];

  if (
    primary &&
    !urls.includes(primary)
  ) {
    urls.unshift(primary);
  }

  return urls;
}

export function parseProvider(
  value: ApiRecord,
): Provider {
  const parsedServices =
    parseServices(value.services);

  const reviewCount =
    Math.max(
      0,
      number(value.reviews),
    );

  const serviceCount =
    Math.max(
      parsedServices.length,
      Math.max(
        0,
        number(
          value.service_count,
        ),
      ),
    );

  const imageUrl =
    mediaUrl(
      value.business_image,
    ) ??
    mediaUrl(
      value.profile_image,
    );

  const rawRating =
    number(value.rating, NaN);

  return {
    id: text(value.id),
    name: text(
      value.name,
      'Service provider',
    ),
    category: titleCase(
      text(
        value.category,
        'Local service',
      ),
    ),
    location: text(
      value.location,
      'Service area unavailable',
    ),
    distanceLabel:
      text(
        value.distanceLabel,
      ) || undefined,
    startingPrice: Number.isFinite(
      number(
        value.starting_price,
        NaN,
      ),
    )
      ? number(
          value.starting_price,
        )
      : undefined,
    rating:
      reviewCount > 0 &&
      Number.isFinite(rawRating)
        ? rawRating
        : null,
    reviewCount,
    experienceYears:
      Math.max(
        0,
        number(value.experience),
      ),
    verified:
      Boolean(value.verified),
    available:
      value.available !== false &&
      value.available !== 0,
    imageUrl,
    imageUrls:
      parseImageUrls(
        value,
        imageUrl,
      ),
    description:
      text(value.description) ||
      undefined,
    services: parsedServices,
    serviceCount,
    reviews:
      parseReviews(
        value.review_items,
      ),
    homeService:
      value.home_service == null
        ? undefined
        : Boolean(
            value.home_service,
          ),
    shopService:
      value.shop_service == null
        ? undefined
        : Boolean(
            value.shop_service,
          ),
  };
}

export const providerApi = {
  async list(
    token?: string | null,
  ): Promise<Provider[]> {
    const result =
      await apiRequest<{
        success: true;
        providers: ApiRecord[];
      }>(
        '/api/providers?limit=150',
        {token},
      );

    return Array.isArray(
      result.providers,
    )
      ? result.providers
          .map(parseProvider)
          .filter(
            provider =>
              Boolean(provider.id),
          )
      : [];
  },

  async details(
    providerId: string,
    token?: string | null,
  ): Promise<Provider> {
    if (!providerId) {
      throw new ApiError(
        'Provider ID is missing.',
      );
    }

    const result =
      await apiRequest<{
        success: true;
        provider: ApiRecord;
      }>(
        `/api/providers/${encodeURIComponent(
          providerId,
        )}`,
        {token},
      );

    return parseProvider(
      result.provider,
    );
  },
};

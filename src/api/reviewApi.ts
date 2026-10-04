import {
  API_ORIGIN,
  apiRequest,
} from './apiClient';
import {HomeReview} from '../types/home';

type ApiRecord =
  Record<string, unknown>;

function record(
  value: unknown,
): ApiRecord | null {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  )
    ? (value as ApiRecord)
    : null;
}

function text(
  value: unknown,
): string {
  return typeof value === 'string'
    ? value.trim()
    : '';
}

function number(
  value: unknown,
): number {
  const parsed =
    typeof value === 'number'
      ? value
      : Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function mediaUrl(
  value: unknown,
): string | undefined {
  const path = text(value);

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

function parseReview(
  value: unknown,
): HomeReview | null {
  const row = record(value);

  if (!row) {
    return null;
  }

  const rating = number(
    row.rating ??
      row.stars,
  );

  const comment =
    text(
      row.comment ??
        row.review ??
        row.message,
    );

  if (
    rating < 4.5 ||
    !comment
  ) {
    return null;
  }

  const customer =
    record(row.customer);

  const provider =
    record(row.provider);

  const customerName =
    text(
      row.customer_name ??
        row.customerName ??
        row.reviewer_name ??
        row.reviewerName ??
        customer?.name ??
        customer?.full_name,
    ) ||
    'Localsewa customer';

  const id =
    text(row.id) ||
    `${customerName}-${rating}-${comment.slice(0, 24)}`;

  return {
    id,
    customerName,
    customerImage:
      mediaUrl(
        row.customer_image ??
          row.customerImage ??
          row.profile_image ??
          customer?.profile_image ??
          customer?.image,
      ),
    rating,
    comment,
    providerName:
      text(
        row.provider_name ??
          row.providerName ??
          provider?.name ??
          provider?.business_name,
      ) ||
      undefined,
    createdAt:
      text(
        row.created_at ??
          row.createdAt,
      ) ||
      undefined,
  };
}

export const reviewApi = {
  async highlights(): Promise<HomeReview[]> {
    const result =
      await apiRequest<{
        success: true;
        reviews?: unknown[];
        highlights?: unknown[];
        items?: unknown[];
      }>(
        '/api/reviews/highlights',
      );

    const rows =
      Array.isArray(
        result.reviews,
      )
        ? result.reviews
        : Array.isArray(
              result.highlights,
            )
          ? result.highlights
          : Array.isArray(
                result.items,
              )
            ? result.items
            : [];

    return rows
      .map(parseReview)
      .filter(
        (
          item,
        ): item is HomeReview =>
          Boolean(item),
      );
  },
};

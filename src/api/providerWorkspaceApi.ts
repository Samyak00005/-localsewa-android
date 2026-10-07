import {
  API_ORIGIN,
  apiRequest,
} from './apiClient';
import {
  ProviderDashboardData,
  ProviderReviewsData,
  ProviderWorkspaceProfile,
  ProviderWorkspaceReview,
} from '../types/providerWorkspace';

type ApiRecord =
  Record<string, unknown>;

function isRecord(
  value: unknown,
): value is ApiRecord {
  return (
    typeof value ===
      'object' &&
    value !== null &&
    !Array.isArray(
      value,
    )
  );
}

function text(
  value: unknown,
): string | undefined {
  return typeof value ===
    'string'
    ? value.trim() ||
        undefined
    : undefined;
}

function number(
  value: unknown,
): number | undefined {
  const parsed =
    typeof value ===
    'number'
      ? value
      : Number(value);

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : undefined;
}

function boolean(
  value: unknown,
): boolean | undefined {
  if (
    value === true ||
    value === 1 ||
    value === '1'
  ) {
    return true;
  }

  if (
    value === false ||
    value === 0 ||
    value === '0'
  ) {
    return false;
  }

  return undefined;
}

function mediaUrl(
  value: unknown,
): string | undefined {
  const path =
    text(value);

  if (!path) {
    return undefined;
  }

  if (
    /^https?:\/\//i.test(
      path,
    )
  ) {
    return path;
  }

  return `${API_ORIGIN}/${path.replace(
    /^\/+/,
    '',
  )}`;
}

function record(
  value: unknown,
): ApiRecord {
  return isRecord(value)
    ? value
    : {};
}

function firstRecord(
  ...values: unknown[]
): ApiRecord {
  for (const value of values) {
    if (isRecord(value)) {
      return value;
    }
  }

  return {};
}

function categoryName(
  value: unknown,
): string | undefined {
  if (
    typeof value ===
    'string'
  ) {
    return (
      value.trim() ||
      undefined
    );
  }

  if (isRecord(value)) {
    return (
      text(value.name) ??
      text(
        value.category_name,
      )
    );
  }

  return undefined;
}

function parseDashboard(
  result: ApiRecord,
): ProviderDashboardData {
  const dashboard =
    record(
      result.dashboard,
    );

  const profile =
    firstRecord(
      result.provider,
      result.profile,
      dashboard.provider,
      dashboard.profile,
    );

  const stats =
    firstRecord(
      result.stats,
      dashboard.stats,
      profile.stats,
    );

  const provider: ProviderWorkspaceProfile = {
    businessName:
      text(
        profile.business_name,
      ) ??
      text(profile.name) ??
      text(
        dashboard.business_name,
      ) ??
      'Provider',
    ownerName:
      text(
        profile.owner_name,
      ) ??
      text(
        profile.full_name,
      ) ??
      text(
        dashboard.owner_name,
      ),
    category:
      categoryName(
        profile.category,
      ) ??
      text(
        profile.category_name,
      ) ??
      categoryName(
        dashboard.category,
      ) ??
      text(
        dashboard.category_name,
      ),
    location:
      text(
        profile.location,
      ) ??
      text(
        dashboard.location,
      ),
    description:
      text(
        profile.business_description,
      ) ??
      text(
        profile.description,
      ) ??
      text(
        dashboard.business_description,
      ),
    profileImageUrl:
      mediaUrl(
        profile.profile_image,
      ) ??
      mediaUrl(
        profile.owner_image,
      ),
    businessImageUrl:
      mediaUrl(
        profile.business_image,
      ) ??
      mediaUrl(
        dashboard.business_image,
      ),
    available:
      boolean(
        profile.available_now,
      ) ??
      boolean(
        profile.available,
      ) ??
      boolean(
        dashboard.available_now,
      ),
    verificationStatus:
      text(
        profile.verification_status,
      ) ??
      text(
        dashboard.verification_status,
      ),
    experienceYears:
      number(
        profile.experience_years,
      ) ??
      number(
        profile.experience,
      ) ??
      number(
        dashboard.experience_years,
      ),
    averageRating:
      number(
        profile.average_rating,
      ) ??
      number(
        profile.rating,
      ) ??
      number(
        stats.average_rating,
      ) ??
      null,
    reviewCount:
      number(
        profile.total_reviews,
      ) ??
      number(
        profile.review_count,
      ) ??
      number(
        stats.total_reviews,
      ) ??
      0,
    completedJobs:
      number(
        profile.total_completed_jobs,
      ) ??
      number(
        stats.completed_jobs,
      ) ??
      number(
        stats.total_completed_jobs,
      ),
    serviceCount:
      number(
        stats.service_count,
      ) ??
      number(
        profile.service_count,
      ),
    homeService:
      boolean(
        profile.home_service,
      ),
    shopService:
      boolean(
        profile.shop_service,
      ),
  };

  return {
    profile: provider,
  };
}

function parseReview(
  value: ApiRecord,
  index: number,
): ProviderWorkspaceReview {
  return {
    id:
      String(
        value.id ??
          value.review_id ??
          `review-${index}`,
      ),
    rating:
      Math.max(
        1,
        Math.min(
          5,
          number(
            value.rating,
          ) ?? 0,
        ),
      ),
    comment:
      text(
        value.comment,
      ) ??
      text(
        value.review,
      ),
    customerName:
      text(
        value.customer_name,
      ) ??
      text(
        value.reviewer_name,
      ) ??
      text(
        value.customer,
      ),
    serviceName:
      text(
        value.service_name,
      ) ??
      text(
        value.service,
      ),
    bookingCode:
      text(
        value.booking_code,
      ),
    createdAt:
      text(
        value.created_at,
      ) ??
      text(
        value.date,
      ),
  };
}

function parseReviews(
  result: ApiRecord,
): ProviderReviewsData {
  const source =
    Array.isArray(
      result.reviews,
    )
      ? result.reviews
      : Array.isArray(
            result.items,
          )
        ? result.items
        : Array.isArray(
              result.review_items,
            )
          ? result.review_items
          : [];

  const reviews =
    source
      .filter(
        (
          value,
        ): value is ApiRecord =>
          isRecord(value),
      )
      .map(
        (
          value,
          index,
        ) =>
          parseReview(
            value,
            index,
          ),
      )
      .filter(
        value =>
          value.rating >=
            1 &&
          value.rating <=
            5,
      );

  const summary =
    firstRecord(
      result.summary,
      result.stats,
    );

  const totalReviews =
    number(
      summary.total_reviews,
    ) ??
    number(
      result.total_reviews,
    ) ??
    reviews.length;

  const calculatedAverage =
    reviews.length
      ? reviews.reduce(
          (
            total,
            review,
          ) =>
            total +
            review.rating,
          0,
        ) /
        reviews.length
      : null;

  const averageRating =
    number(
      summary.average_rating,
    ) ??
    number(
      result.average_rating,
    ) ??
    calculatedAverage;

  const distribution: Record<
    1 | 2 | 3 | 4 | 5,
    number
  > = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  reviews.forEach(
    review => {
      const key =
        Math.round(
          review.rating,
        ) as
          | 1
          | 2
          | 3
          | 4
          | 5;

      distribution[key] +=
        1;
    },
  );

  const fiveStarCount =
    number(
      summary.five_star_count,
    ) ??
    number(
      result.five_star_count,
    ) ??
    distribution[5];

  return {
    reviews,
    averageRating:
      averageRating ==
      null
        ? null
        : Math.max(
            0,
            Math.min(
              5,
              averageRating,
            ),
          ),
    totalReviews:
      Math.max(
        0,
        totalReviews,
      ),
    fiveStarCount:
      Math.max(
        0,
        fiveStarCount,
      ),
    distribution,
  };
}

export const providerWorkspaceApi = {
  async dashboard(
    token: string,
  ): Promise<ProviderDashboardData> {
    const result =
      await apiRequest<ApiRecord>(
        '/api/provider/dashboard',
        {
          token,
        },
      );

    return parseDashboard(
      result,
    );
  },

  async reviews(
    token: string,
  ): Promise<ProviderReviewsData> {
    const result =
      await apiRequest<ApiRecord>(
        '/api/provider/reviews',
        {
          token,
        },
      );

    return parseReviews(
      result,
    );
  },
};

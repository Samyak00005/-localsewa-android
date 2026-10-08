import {
  ProviderBusinessImage,
  ProviderDashboardData,
  ProviderMembership,
  ProviderProfileUpdate,
  ProviderReviewsData,
  ProviderServiceInput,
  ProviderServicesData,
  ProviderWorkspaceReview,
  ProviderWorkspaceService,
} from '../types/providerWorkspace';
import { API_ORIGIN, ApiError, apiRequest } from './apiClient';

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized || undefined;
}

function number(value: unknown): number | undefined {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function boolean(value: unknown, fallback = false): boolean {
  if (value === true || value === 1 || value === '1') {
    return true;
  }

  if (value === false || value === 0 || value === '0') {
    return false;
  }

  return fallback;
}

function mediaUrl(value: unknown): string | undefined {
  const path = text(value);

  if (!path) {
    return undefined;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}/${path.replace(/^\/+/, '')}`;
}

function normalizeMembership(value: unknown): ProviderMembership {
  const membership = isRecord(value) ? value : {};
  const status = (text(membership.status) ?? 'NONE').toUpperCase();
  const serverActive = boolean(membership.active, false);
  const trialEndsAt = text(membership.trialEndsAt) ?? null;
  const currentPeriodEnd = text(membership.currentPeriodEnd) ?? null;

  let active = serverActive && (status === 'TRIAL' || status === 'ACTIVE');
  const accessEnd = status === 'TRIAL' ? trialEndsAt : currentPeriodEnd;

  if (active && accessEnd) {
    const normalizedDate = /^\d{4}-\d{2}-\d{2} \d/.test(accessEnd)
      ? `${accessEnd.replace(' ', 'T')}+05:30`
      : accessEnd;
    const expiry = new Date(normalizedDate).getTime();

    if (!Number.isFinite(expiry) || expiry <= Date.now()) {
      active = false;
    }
  }

  return {
    status,
    active,
    plan: text(membership.plan) ?? null,
    trialEndsAt,
    currentPeriodEnd,
  };
}

function parseBusinessImages(value: unknown): ProviderBusinessImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is ApiRecord => isRecord(item))
    .map((item, index) => {
      const url = mediaUrl(item.url);
      const id = number(item.id);

      if (!url || id == null) {
        return null;
      }

      return {
        id,
        url,
        sortOrder: number(item.sortOrder) ?? index,
        isCover: boolean(item.isCover, false),
      } satisfies ProviderBusinessImage;
    })
    .filter((item): item is ProviderBusinessImage => item !== null)
    .sort((first, second) => {
      if (first.isCover !== second.isCover) {
        return first.isCover ? -1 : 1;
      }

      return first.sortOrder - second.sortOrder;
    });
}

function parseDashboard(result: ApiRecord): ProviderDashboardData {
  // Current web Provider workspace consumes data.provider from this endpoint.
  const provider = result.provider;

  if (!isRecord(provider)) {
    throw new ApiError('Provider dashboard data is unavailable.');
  }

  const rawReviewCount = Math.max(0, number(provider.reviews) ?? 0);
  const rawRating = number(provider.rating);

  return {
    profile: {
      id: number(provider.id),
      businessName: text(provider.businessName) ?? 'Provider',
      categoryId: number(provider.categoryId),
      ownerName: text(provider.ownerName),
      category: text(provider.category),
      location: text(provider.location),
      description: text(provider.description),
      email: text(provider.email),
      phone: text(provider.phone),
      whatsapp: text(provider.whatsapp),
      latitude: number(provider.latitude) ?? null,
      longitude: number(provider.longitude) ?? null,
      profileImageUrl: mediaUrl(provider.profileImage),
      businessImages: parseBusinessImages(provider.businessImages),
      available: boolean(provider.available, false),
      experienceYears:
        number(provider.experienceYears) ?? number(provider.experience),
      averageRating:
        rawReviewCount > 0 && rawRating != null
          ? Math.max(0, Math.min(5, rawRating))
          : null,
      reviewCount: rawReviewCount,
      profileCompletion: number(provider.profileCompletion),
      premium: normalizeMembership(provider.premium),
    },
  };
}


function parseService(value: ApiRecord): ProviderWorkspaceService | null {
  const id = number(value.id);
  const name = text(value.name);

  if (id == null || !name) {
    return null;
  }

  return {
    id,
    name,
    description: text(value.description),
    price: Math.max(0, number(value.price) ?? 0),
    active: boolean(value.is_active ?? value.active, true),
  };
}

function parseServices(result: ApiRecord): ProviderServicesData {
  const services = Array.isArray(result.services)
    ? result.services
        .filter((item): item is ApiRecord => isRecord(item))
        .map(parseService)
        .filter((item): item is ProviderWorkspaceService => item !== null)
    : [];

  return { services };
}

function parseServiceResult(result: ApiRecord): ProviderWorkspaceService {
  if (!isRecord(result.service)) {
    throw new ApiError('Localsewa returned an invalid service response.');
  }

  const service = parseService(result.service);

  if (!service) {
    throw new ApiError('Localsewa returned an invalid service response.');
  }

  return service;
}

function parseReview(value: ApiRecord): ProviderWorkspaceReview | null {
  const id = value.id;
  const rating = number(value.rating);

  if (id == null || rating == null || rating < 1 || rating > 5) {
    return null;
  }

  const customer = isRecord(value.customer) ? value.customer : null;
  const service = isRecord(value.service) ? value.service : null;

  const customerName =
    text(
      value.customer_name ??
        value.customerName ??
        (typeof value.customer === 'string' ? value.customer : undefined) ??
        customer?.name ??
        customer?.full_name,
    ) || undefined;

  const customerImage = mediaUrl(
    value.customer_image ??
      value.customerImage ??
      value.profile_image ??
      customer?.profile_image ??
      customer?.profileImage ??
      customer?.image,
  );

  const serviceName =
    text(
      value.service_name ??
        value.serviceName ??
        (typeof value.service === 'string' ? value.service : undefined) ??
        service?.name,
    ) || undefined;

  return {
    id: String(id),
    rating,
    comment: text(value.comment) || undefined,
    customerName,
    customerImage,
    serviceName,
    createdAt: text(value.created_at ?? value.createdAt) || undefined,
  };
}

function parseReviews(result: ApiRecord): ProviderReviewsData {
  // Current web Provider reviews page consumes data.reviews from this endpoint.
  const reviews = Array.isArray(result.reviews)
    ? result.reviews
        .filter((item): item is ApiRecord => isRecord(item))
        .map(parseReview)
        .filter((item): item is ProviderWorkspaceReview => item !== null)
    : [];

  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : null;

  return {
    reviews,
    averageRating,
  };
}

export const providerWorkspaceApi = {
  async dashboard(token: string): Promise<ProviderDashboardData> {
    const result = await apiRequest<ApiRecord>('/api/provider/dashboard', {
      token,
    });

    return parseDashboard(result);
  },

  async reviews(token: string): Promise<ProviderReviewsData> {
    const result = await apiRequest<ApiRecord>('/api/provider/reviews', {
      token,
    });

    return parseReviews(result);
  },


  async services(token: string): Promise<ProviderServicesData> {
    const result = await apiRequest<ApiRecord>('/api/provider/services', {
      token,
    });

    return parseServices(result);
  },

  async createService(
    token: string,
    input: ProviderServiceInput,
  ): Promise<ProviderWorkspaceService> {
    const result = await apiRequest<ApiRecord>('/api/provider/services', {
      method: 'POST',
      token,
      body: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        price: input.price,
      },
    });

    return parseServiceResult(result);
  },

  async updateService(
    token: string,
    serviceId: number,
    input: ProviderServiceInput,
  ): Promise<ProviderWorkspaceService> {
    const result = await apiRequest<ApiRecord>(
      `/api/provider/services/${serviceId}`,
      {
        method: 'PUT',
        token,
        body: {
          name: input.name.trim(),
          description: input.description?.trim() || null,
          price: input.price,
        },
      },
    );

    return parseServiceResult(result);
  },

  async deleteService(token: string, serviceId: number): Promise<void> {
    await apiRequest<ApiRecord>(`/api/provider/services/${serviceId}`, {
      method: 'DELETE',
      token,
    });
  },

  async updateCategory(token: string, categoryId: number): Promise<void> {
    await apiRequest<ApiRecord>('/api/provider/category', {
      method: 'PUT',
      token,
      body: { category_id: categoryId },
    });
  },

  async uploadBusinessImage(
    token: string,
    image: {
      uri: string;
      name: string;
      type: string;
    },
  ): Promise<ProviderBusinessImage[]> {
    const form = new FormData();

    form.append(
      'image',
      {
        uri: image.uri,
        name: image.name || 'business-photo.jpg',
        type: image.type || 'image/jpeg',
      } as any,
    );

    const result = await apiRequest<ApiRecord>('/api/provider/images', {
      method: 'POST',
      token,
      body: form,
      timeoutMs: 45_000,
    });

    return parseBusinessImages(result.images);
  },

  async setBusinessImageFirst(
    token: string,
    imageId: number,
  ): Promise<ProviderBusinessImage[]> {
    const result = await apiRequest<ApiRecord>(
      `/api/provider/images/${imageId}/cover`,
      {
        method: 'PATCH',
        token,
      },
    );

    return parseBusinessImages(result.images);
  },

  async deleteBusinessImage(
    token: string,
    imageId: number,
  ): Promise<ProviderBusinessImage[]> {
    const result = await apiRequest<ApiRecord>(
      `/api/provider/images/${imageId}`,
      {
        method: 'DELETE',
        token,
      },
    );

    return parseBusinessImages(result.images);
  },

  async membership(token: string): Promise<ProviderMembership> {
    const result = await apiRequest<ApiRecord>('/api/provider/premium', {
      token,
    });

    return normalizeMembership(result.membership);
  },


  async updateProfile(token: string, profile: ProviderProfileUpdate): Promise<void> {
    await apiRequest<ApiRecord>('/api/provider/profile', {
      method: 'PUT',
      token,
      body: {
        business_name: profile.businessName,
        owner_name: profile.ownerName,
        business_description: profile.description,
        location: profile.location,
        latitude: profile.latitude,
        longitude: profile.longitude,
        whatsapp: profile.whatsapp,
      },
    });
  },

  async setAvailability(token: string, available: boolean): Promise<void> {
    await apiRequest('/api/provider/availability', {
      method: 'PATCH',
      token,
      body: { available },
    });
  },
};

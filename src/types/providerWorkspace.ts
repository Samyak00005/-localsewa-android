export type ProviderMembership = {
  status: string;
  active: boolean;
  plan?: string | null;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
};

export type ProviderBusinessImage = {
  id: number;
  url: string;
  sortOrder: number;
  isCover: boolean;
};

export type ProviderWorkspaceProfile = {
  id?: number;
  categoryId?: number;
  businessName: string;
  ownerName?: string;
  category?: string;
  location?: string;
  description?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  latitude?: number | null;
  longitude?: number | null;
  profileImageUrl?: string;
  businessImages: ProviderBusinessImage[];
  available: boolean;
  experienceYears?: number;
  averageRating: number | null;
  reviewCount: number;
  profileCompletion?: number;
  premium: ProviderMembership;
};

export type ProviderDashboardData = {
  profile: ProviderWorkspaceProfile;
};


export type ProviderWorkspaceService = {
  id: number;
  name: string;
  description?: string;
  price: number;
  active: boolean;
};

export type ProviderServicesData = {
  services: ProviderWorkspaceService[];
};

export type ProviderServiceInput = {
  name: string;
  description?: string;
  price: number;
};

export type ProviderWorkspaceReview = {
  id: string;
  rating: number;
  comment?: string;
  customerName?: string;
  customerImage?: string;
  serviceName?: string;
  createdAt?: string;
};

export type ProviderReviewsData = {
  reviews: ProviderWorkspaceReview[];
  averageRating: number | null;
};

export type ProviderProfileUpdate = {
  businessName: string;
  ownerName?: string;
  description?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  whatsapp?: string;
};

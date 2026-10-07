export type ProviderWorkspaceProfile = {
  businessName: string;
  ownerName?: string;
  category?: string;
  location?: string;
  description?: string;
  profileImageUrl?: string;
  businessImageUrl?: string;
  available?: boolean;
  verificationStatus?: string;
  experienceYears?: number;
  averageRating?: number | null;
  reviewCount: number;
  completedJobs?: number;
  serviceCount?: number;
  homeService?: boolean;
  shopService?: boolean;
};

export type ProviderDashboardData = {
  profile: ProviderWorkspaceProfile;
};

export type ProviderWorkspaceReview = {
  id: string;
  rating: number;
  comment?: string;
  customerName?: string;
  serviceName?: string;
  bookingCode?: string;
  createdAt?: string;
};

export type ProviderReviewsData = {
  reviews: ProviderWorkspaceReview[];
  averageRating: number | null;
  totalReviews: number;
  fiveStarCount: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

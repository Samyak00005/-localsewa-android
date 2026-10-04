export type ProviderService = {
  id: string;
  name: string;
  description?: string;
  price?: number;
};

export type ProviderReview = {
  id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
};

export type Provider = {
  id: string;
  name: string;
  category: string;
  location: string;
  distanceLabel?: string;
  startingPrice?: number;
  rating: number | null;
  reviewCount: number;
  experienceYears: number;
  verified: boolean;
  available: boolean;
  imageUrl?: string;
  imageUrls: string[];
  description?: string;
  services: ProviderService[];
  serviceCount: number;
  reviews: ProviderReview[];
  homeService?: boolean;
  shopService?: boolean;
};

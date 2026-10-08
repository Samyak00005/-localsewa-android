export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'not_completed';

export type Booking = {
  id: number;
  bookingCode: string;
  providerId: string;
  providerName: string;
  providerImage?: string;
  serviceName: string;
  providerServiceId: number | null;
  servicePrice: number | null;
  isCustomService: boolean;

  location: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  mapsUrl: string | null;
  locationSource: string;
  exactLocationUnlocked: boolean;

  distanceKm: number | null;
  distanceLabel: string | null;

  providerLocation: string | null;
  providerLatitude: number | null;
  providerLongitude: number | null;
  providerMapsUrl: string | null;

  date: string;
  time: string;
  status: BookingStatus;
  reason: string | null;

  rating: number | null;
  reviewComment: string | null;

  canRate: boolean;
  canRebook: boolean;
  canCancel: boolean;
  chatEnabled: boolean;

  customerName: string | null;
  customerImage?: string;
  note: string | null;
};

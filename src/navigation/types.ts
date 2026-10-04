import type {
  NavigatorScreenParams,
} from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Customer: undefined;
  Provider: undefined;
};

export type AuthOtpPurpose =
  | 'registration'
  | 'password';

export type AuthStackParamList = {
  Splash: undefined;
  AuthLanding: undefined;
  Login:
    | {
        notice?: string;
      }
    | undefined;
  Register: undefined;
  Otp: {
    purpose: AuthOtpPurpose;
    identifier?: string;
    resendAfter?: number;
  };
  ForgotPassword: undefined;
  ResetPassword: {
    identifier?: string;
  };
};

export type CustomerStackParamList = {
  CustomerTabs:
    | NavigatorScreenParams<CustomerTabParamList>
    | undefined;
  ProviderDetails: {
    providerId: string;
  };
  BookingRequest: {
    providerId: string;
  };
  BookingDetails: {
    bookingId: number;
  };
  BookingReview: {
    bookingId: number;
  };
};

export type CustomerTabParamList = {
  CustomerHome: undefined;
  CustomerServices: undefined;
  CustomerBookings: undefined;
  CustomerSaved: undefined;
  CustomerProfile: undefined;
};

export type ProviderTabParamList = {
  ProviderHome: undefined;
  ProviderRequests: undefined;
  ProviderServices: undefined;
  ProviderReviews: undefined;
  ProviderProfile: undefined;
};

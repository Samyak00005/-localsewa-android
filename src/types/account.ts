export type CustomerProfile = {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  profileImage: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  status: string;
  roles: string[];
  googleLinked: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AccountDeletionState =
  | 'pending'
  | 'due'
  | 'cancelled'
  | 'completed';

export type AccountDeletionStatus = {
  state: AccountDeletionState;
  requestedAt: string | null;
  scheduledFor: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  remainingSeconds: number;
  remainingDays: number;
  canRestoreByLogin: boolean;
  gracePeriodDays: number;
};

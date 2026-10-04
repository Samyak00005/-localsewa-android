export type ChatSenderRole =
  | 'customer'
  | 'provider';

export type ChatMessage = {
  id: number;
  message: string;
  sentByMe: boolean;
  senderRole: ChatSenderRole;
  createdAt: string;
  readAt: string | null;
};

export type ChatCounterpart = {
  name: string;
  imageUrl?: string;
  role?: ChatSenderRole;
};

export type BookingChat = {
  messages: ChatMessage[];
  counterpart: ChatCounterpart | null;
};

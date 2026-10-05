import {
  BookingChat,
  ChatCounterpart,
  ChatMessage,
  ChatSenderRole,
} from '../types/chat';
import { API_ORIGIN, ApiError, apiRequest } from './apiClient';

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function number(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function mediaUrl(value: unknown): string | undefined {
  const path = text(value).trim();

  if (!path) {
    return undefined;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}/${path.replace(/^\/+/, '')}`;
}

function senderRole(value: unknown): ChatSenderRole {
  return text(value).toLowerCase() === 'provider' ? 'provider' : 'customer';
}

function parseMessage(value: unknown): ChatMessage | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = number(value.id);
  const message = text(value.message);

  if (!Number.isInteger(id) || id <= 0 || !message) {
    return null;
  }

  return {
    id,
    message,
    sentByMe: Boolean(value.sentByMe),
    senderRole: senderRole(value.senderRole),
    createdAt: text(value.createdAt),
    readAt: text(value.readAt) || null,
  };
}

function parseCounterpart(result: ApiRecord): ChatCounterpart | null {
  const raw = isRecord(result.counterpart)
    ? result.counterpart
    : isRecord(result.otherUser)
    ? result.otherUser
    : null;

  if (!raw) {
    return null;
  }

  const name = text(raw.name ?? raw.displayName ?? raw.businessName).trim();

  if (!name) {
    return null;
  }

  const roleText = text(raw.role).toLowerCase();

  return {
    name,
    imageUrl: mediaUrl(
      raw.image ?? raw.imageUrl ?? raw.profileImage ?? raw.businessImage,
    ),
    role:
      roleText === 'provider' || roleText === 'customer'
        ? (roleText as ChatSenderRole)
        : undefined,
  };
}

export const chatApi = {
  async history(bookingId: number, token: string): Promise<BookingChat> {
    const result = await apiRequest<ApiRecord>(
      `/api/bookings/${bookingId}/messages`,
      { token },
    );

    const messages = Array.isArray(result.messages)
      ? result.messages
          .map(parseMessage)
          .filter((item): item is ChatMessage => Boolean(item))
      : [];

    return {
      messages,
      counterpart: parseCounterpart(result),
    };
  },

  async send(bookingId: number, message: string, token: string): Promise<void> {
    const clean = message.trim();

    if (!clean) {
      throw new Error('Type a message first.');
    }

    if (clean.length > 1000) {
      throw new Error('Message cannot exceed 1,000 characters.');
    }

    await apiRequest(`/api/bookings/${bookingId}/messages`, {
      method: 'POST',
      token,
      body: {
        message: clean,
      },
      // Message POST is not idempotent.
      // Never retry automatically.
      retryGet: false,
    });
  },
};

export function isAmbiguousChatSendError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 0;
}

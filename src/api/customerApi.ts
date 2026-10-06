import { Provider } from '../types/provider';
import { apiRequest } from './apiClient';
import { normalizeProviderRef, parseProvider } from './providerApi';

type ApiRecord = Record<string, unknown>;

export const customerApi = {
  async savedProviders(token: string): Promise<Provider[]> {
    const result = await apiRequest<{
      success: true;
      providers: ApiRecord[];
    }>('/api/saved', {
      token,
    });

    return Array.isArray(result.providers)
      ? result.providers
          .map(parseProvider)
          .filter(provider => Boolean(provider.id))
      : [];
  },

  async saveProvider(providerRef: string, token: string): Promise<void> {
    const normalizedRef = normalizeProviderRef(providerRef);

    if (!normalizedRef) {
      throw new Error('Provider reference is unavailable.');
    }

    await apiRequest('/api/saved', {
      method: 'POST',
      token,
      body: {
        provider_id: normalizedRef,
      },
    });
  },

  async removeSavedProvider(providerRef: string, token: string): Promise<void> {
    const normalizedRef = normalizeProviderRef(providerRef);

    if (!normalizedRef) {
      throw new Error('Provider reference is unavailable.');
    }

    await apiRequest(`/api/saved/${encodeURIComponent(normalizedRef)}`, {
      method: 'DELETE',
      token,
    });
  },
};

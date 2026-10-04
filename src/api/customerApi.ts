import {
  apiRequest,
} from './apiClient';
import {
  parseProvider,
} from './providerApi';
import {Provider} from '../types/provider';

type ApiRecord =
  Record<string, unknown>;

export const customerApi = {
  async savedProviders(
    token: string,
  ): Promise<Provider[]> {
    const result =
      await apiRequest<{
        success: true;
        providers: ApiRecord[];
      }>('/api/saved', {
        token,
      });

    return Array.isArray(
      result.providers,
    )
      ? result.providers
          .map(parseProvider)
          .filter(
            provider =>
              Boolean(provider.id),
          )
      : [];
  },

  async saveProvider(
    providerRef: string,
    token: string,
  ): Promise<void> {
    await apiRequest(
      '/api/saved',
      {
        method: 'POST',
        token,
        body: {
          provider_ref:
            providerRef,
        },
      },
    );
  },

  async removeSavedProvider(
    providerRef: string,
    token: string,
  ): Promise<void> {
    await apiRequest(
      `/api/saved/${encodeURIComponent(
        providerRef,
      )}`,
      {
        method: 'DELETE',
        token,
      },
    );
  },
};

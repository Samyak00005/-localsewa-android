import {apiRequest} from './apiClient';
import {parseProvider} from './providerApi';
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
};

import { ServiceCategory } from '../types/category';
import { apiRequest } from './apiClient';

type ApiCategory = {
  id?: unknown;
  slug?: unknown;
  name?: unknown;
};

export const categoryApi = {
  async list(): Promise<ServiceCategory[]> {
    const result = await apiRequest<{
      success: true;
      categories: ApiCategory[];
    }>('/api/categories');

    if (!Array.isArray(result.categories)) {
      return [];
    }

    return result.categories
      .map(category => ({
        id: Number(category.id),
        slug: typeof category.slug === 'string' ? category.slug : '',
        name: typeof category.name === 'string' ? category.name : '',
      }))
      .filter(
        category =>
          Number.isInteger(category.id) &&
          category.id > 0 &&
          Boolean(category.slug) &&
          Boolean(category.name),
      );
  },
};

import { useQuery } from '@tanstack/react-query';

import { reviewApi } from '../api/reviewApi';

export function useHomeReviews() {
  return useQuery({
    queryKey: ['home-review-highlights'],
    queryFn: reviewApi.highlights,
    staleTime: 5 * 60_000,
  });
}

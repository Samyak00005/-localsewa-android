import { useCallback, useState } from 'react';

export function useManualRefresh(
  refresh: () => Promise<unknown> | unknown,
): {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
} {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh, refreshing]);

  return { refreshing, onRefresh };
}

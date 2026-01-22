import { useCallback } from 'react';
import { cacheService } from '@/services/cache/cacheService';

export function useOptimizedFetch() {
  const fetchWithCache = useCallback(
    async <T>(key: string, fetcher: () => Promise<T>, ttl = 300000): Promise<T> => {
      const cached = cacheService.get<T>(key);
      if (cached) {
        return cached;
      }

      const data = await fetcher();
      cacheService.set(key, data, ttl);
      return data;
    },
    []
  );

  const invalidateCache = useCallback((key: string) => {
    cacheService.delete(key);
  }, []);

  return { fetchWithCache, invalidateCache };
}

import { useEffect, useState, useCallback } from 'react';
import { fetchBeeData } from '../services/firebaseService';
import type { BeeData } from '../types';

export function useBee(beeId?: string) {
  const [data, setData] = useState<BeeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async (id?: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const d = await fetchBeeData(id);
      setData(d);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!beeId) return;
    load(beeId);
  }, [beeId, load]);

  return { data, loading, error, refetch: () => load(beeId) };
}

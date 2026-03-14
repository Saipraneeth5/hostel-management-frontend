import { useState, useEffect, useCallback } from 'react';

/**
 * Generic data-fetch hook.
 * Usage:  const { data, loading, error, refetch } = useApi(roomAPI.getAll);
 */
export function useApi(apiFn, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFn()
      .then(r => setData(r.data))
      .catch(err => setError(err.response?.data?.message || err.message || 'Request failed'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Async action hook (for mutations).
 * Usage:  const { run, loading } = useAction(roomAPI.create, { onSuccess });
 */
export function useAction(apiFn, { onSuccess, onError } = {}) {
  const [loading, setLoading] = useState(false);

  const run = async (...args) => {
    setLoading(true);
    try {
      const result = await apiFn(...args);
      onSuccess?.(result.data);
      return result.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Action failed';
      onError?.(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { run, loading };
}

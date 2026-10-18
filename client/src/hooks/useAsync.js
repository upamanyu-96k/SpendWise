import { useCallback, useEffect, useState } from 'react';

// Runs an async loader whenever deps change; exposes data, loading, error and reload
export function useAsync(loader, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const run = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: '' }));
    loader()
      .then((data) => !cancelled && setState({ data, loading: false, error: '' }))
      .catch((e) => !cancelled && setState({ data: null, loading: false, error: e.message }));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => run(), [run]);
  return { ...state, reload: run };
}

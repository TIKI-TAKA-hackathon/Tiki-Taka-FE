import { useEffect, useState } from 'react';

type AsyncState<T> = { data: T | null; loading: boolean; error: string | null };

// `loader` must be a stable reference (e.g. a module-level function) so the effect does not re-run every render.
export function useAsync<T>(loader: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: null });
    loader().then(
      (data) => {
        if (active) {
          setState({ data, loading: false, error: null });
        }
      },
      (error: unknown) => {
        if (active) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류',
          });
        }
      },
    );
    return () => {
      active = false;
    };
  }, [loader]);

  return state;
}

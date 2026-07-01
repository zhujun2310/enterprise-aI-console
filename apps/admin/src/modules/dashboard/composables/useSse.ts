import { useEffect, useMemo, useRef, useState } from 'react';

export type SseStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

export interface UseSseOptions<T> {
  url: string;
  parse: (raw: MessageEvent<string>) => T | null;
  onMessage: (value: T) => void;
}

export function useSse<T>({ url, parse, onMessage }: UseSseOptions<T>) {
  const onMessageRef = useRef(onMessage);
  const parseRef = useRef(parse);
  const [status, setStatus] = useState<SseStatus>('idle');
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    parseRef.current = parse;
  }, [parse]);

  const state = useMemo(
    () => ({
      status,
      lastEventAt,
      error
    }),
    [error, lastEventAt, status]
  );

  useEffect(() => {
    if (!url) {
      setStatus('idle');
      setError(null);
      return;
    }

    let active = true;
    setStatus('connecting');
    setError(null);

    const source = new EventSource(url);

    source.onopen = () => {
      if (!active) {
        return;
      }
      setStatus('open');
      setError(null);
    };

    source.onmessage = (event) => {
      if (!active) {
        return;
      }

      const parsed = parseRef.current(event);
      if (!parsed) {
        return;
      }

      setLastEventAt(new Date().toISOString());
      onMessageRef.current(parsed);
    };

    source.onerror = () => {
      if (!active) {
        return;
      }

      setStatus('error');
      setError('SSE connection lost.');
    };

    return () => {
      active = false;
      setStatus('closed');
      try {
        source?.close();
      } catch {
        // ignore
      }
    };
  }, [url]);

  return state;
}

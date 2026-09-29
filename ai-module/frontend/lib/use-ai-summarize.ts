'use client';

import { useState, useCallback } from 'react';
import { SummarizeMode, SummarizeResponse } from './ai.types';
import { authorizedFetch }                   from './auth';

const API = process.env.NEXT_PUBLIC_AI_API_URL ?? 'http://localhost:4003/api';

interface UseAISummarizeReturn {
  result:     SummarizeResponse | null;
  isLoading:  boolean;
  error:      string | null;
  summarize:  (text: string, mode?: SummarizeMode) => Promise<void>;
  reset:      () => void;
}

export function useAISummarize(): UseAISummarizeReturn {
  const [result,    setResult]    = useState<SummarizeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const summarize = useCallback(async (text: string, mode: SummarizeMode = 'brief') => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await authorizedFetch(`${API}/ai/summarize`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text, mode }),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired — please sign in again');
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? `HTTP ${res.status}`);
      }
      const data: SummarizeResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message ?? 'Summarization failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, isLoading, error, summarize, reset };
}

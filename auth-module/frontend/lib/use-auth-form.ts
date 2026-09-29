'use client';

import { useState, FormEvent } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit:      (values: T) => Promise<void>;
}

export function useAuthForm<T extends Record<string, string>>({
  initialValues, onSubmit,
}: UseFormOptions<T>) {
  const [values,  setValues]  = useState<T>(initialValues);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues(v => ({ ...v, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return { values, error, loading, handleChange, handleSubmit };
}

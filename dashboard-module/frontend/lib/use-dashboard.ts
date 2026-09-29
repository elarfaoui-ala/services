'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardData, DateFilter } from './dashboard.types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4002/api';
const AUTO_REFRESH_MS = 30_000;

interface UseDashboardOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialFilter?: DateFilter;
}

interface UseDashboardReturn {
  data: DashboardData | null;
  filter: DateFilter;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  setFilter: (f: DateFilter) => void;
  refresh: () => void;
}

export function useDashboard(opts: UseDashboardOptions = {}): UseDashboardReturn {
  const {
    autoRefresh = true,
    refreshInterval = AUTO_REFRESH_MS,
    initialFilter = { range: '30d' },
  } = opts;

  const [data, setData] = useState<DashboardData | null>(null);
  const [filter, setFilterState] = useState<DateFilter>(initialFilter);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const filterRef = useRef(filter);
  filterRef.current = filter;

  const buildUrl = useCallback((f: DateFilter) => {
    const params = new URLSearchParams({ range: f.range });
    if (f.from) params.set('from', f.from);
    if (f.to) params.set('to', f.to);
    return `${API}/dashboard?${params}`;
  }, []);

  const fetchData = useCallback(
    async (f: DateFilter, silent = false) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const res = await fetch(buildUrl(f));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: DashboardData = await res.json();
        setData(json);
        setLastUpdated(new Date());
      } catch (err: any) {
        const msg = err.message ?? 'Failed to load dashboard data';
        setError(msg);
        if (!silent) setData(null);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [buildUrl],
  );

  useEffect(() => {
    fetchData(filter);
  }, [filter, fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => fetchData(filterRef.current, true), refreshInterval);
    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval, fetchData]);

  const setFilter = useCallback((f: DateFilter) => setFilterState(f), []);
  const refresh = useCallback(() => fetchData(filterRef.current, true), [fetchData]);

  return { data, filter, isLoading, isRefreshing, error, lastUpdated, setFilter, refresh };
}

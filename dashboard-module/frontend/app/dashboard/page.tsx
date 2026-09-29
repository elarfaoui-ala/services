'use client';

import { useDashboard } from '../../lib/use-dashboard';
import { KpiCard, KpiCardSkeleton } from '../../components/kpi/kpi-card';
import { ChartCard, ChartCardSkeleton } from '../../components/charts/chart-card';
import { DateRangeFilter } from '../../components/filters/date-range-filter';
import { DashboardHeader } from '../../components/layout/dashboard-header';

export default function DashboardPage() {
  const { data, filter, isLoading, isRefreshing, error, lastUpdated, setFilter, refresh } =
    useDashboard({ autoRefresh: true });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <DashboardHeader
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={refresh}
        />

        {/* Date filter */}
        <DateRangeFilter filter={filter} onChange={setFilter} isLoading={isLoading} />

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error} — make sure the backend is running on port 4002.
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
            : data?.kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <ChartCardSkeleton key={i} />)
            : data?.charts.map((chart, i) => (
                <div key={chart.id} className={i === 0 ? 'lg:col-span-2' : ''}>
                  <ChartCard chart={chart} />
                </div>
              ))}
        </div>

        {/* Period info */}
        {data && (
          <p className="text-xs text-gray-400 text-center">
            Period: {new Date(data.period.from).toLocaleDateString()} to{' '}
            {new Date(data.period.to).toLocaleDateString()} · Auto-refreshes every 30s
          </p>
        )}
      </div>
    </main>
  );
}

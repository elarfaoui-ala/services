'use client';

interface DashboardHeaderProps {
  lastUpdated:  Date | null;
  isRefreshing: boolean;
  onRefresh:    () => void;
}

export function DashboardHeader({ lastUpdated, isRefreshing, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        {lastUpdated && (
          <p className="text-xs text-gray-400 mt-0.5">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600
                   bg-white border border-gray-200 rounded-xl hover:bg-gray-50
                   disabled:opacity-50 transition-colors"
      >
        <span className={isRefreshing ? 'animate-spin' : ''}>↻</span>
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  );
}

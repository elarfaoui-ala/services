'use client';

import { KpiData } from '../../lib/dashboard.types';

function Sparkline({ values, trend }: { values: number[]; trend: string }) {
  if (!values.length) return null;
  const max  = Math.max(...values);
  const min  = Math.min(...values);
  const range = max - min || 1;
  const W = 80; const H = 28;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  }).join(' ');

  const color = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280';

  return (
    <svg width={W} height={H} className="opacity-70">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatValue(value: number, unit?: string): string {
  const formatted = value >= 1000
    ? `${(value / 1000).toFixed(1)}k`
    : value.toFixed(unit === '%' ? 1 : 0);
  return unit === '$' ? `$${formatted}` : `${formatted}${unit ?? ''}`;
}

interface KpiCardProps { kpi: KpiData }

export function KpiCard({ kpi }: KpiCardProps) {
  const isUp   = kpi.trend === 'up';
  const isDown = kpi.trend === 'down';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
          ${isUp   ? 'bg-green-50 text-green-700' :
            isDown ? 'bg-red-50   text-red-700'   :
                     'bg-gray-50  text-gray-500'}`}>
          {isUp ? '+' : ''}{kpi.change}%
        </span>
      </div>

      <p className="text-2xl font-bold text-gray-900 tracking-tight">
        {formatValue(kpi.value, kpi.unit)}
      </p>

      <div className="flex items-end justify-between">
        <p className="text-xs text-gray-400">vs previous period</p>
        {kpi.sparkline && <Sparkline values={kpi.sparkline} trend={kpi.trend} />}
      </div>
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-100 rounded w-24" />
        <div className="h-4 bg-gray-100 rounded w-12" />
      </div>
      <div className="h-8 bg-gray-100 rounded w-32" />
      <div className="h-4 bg-gray-100 rounded w-20" />
    </div>
  );
}

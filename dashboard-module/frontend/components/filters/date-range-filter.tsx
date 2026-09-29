'use client';

import { DateFilter, DateRange } from '../../lib/dashboard.types';

const RANGES: { label: string; value: DateRange }[] = [
  { label: 'Today', value: 'today' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: 'Custom', value: 'custom' },
];

interface DateFilterProps {
  filter: DateFilter;
  onChange: (f: DateFilter) => void;
  isLoading: boolean;
}

export function DateRangeFilter({ filter, onChange, isLoading }: DateFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {RANGES.filter((r) => r.value !== 'custom').map((r) => (
          <button
            key={r.value}
            onClick={() => onChange({ range: r.value })}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${
                filter.range === r.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {filter.range === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filter.from ?? ''}
            onChange={(e) => onChange({ ...filter, from: e.target.value })}
            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="date"
            value={filter.to ?? ''}
            onChange={(e) => onChange({ ...filter, to: e.target.value })}
            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <button
        onClick={() => onChange({ range: 'custom' })}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
          ${
            filter.range === 'custom'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-gray-200 text-gray-500 hover:text-gray-700'
          }`}
      >
        Custom
      </button>
    </div>
  );
}

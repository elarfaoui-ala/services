'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartData } from '../../lib/dashboard.types';

const DEFAULT_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

function getColor(colors: string[] | undefined, idx: number): string {
  return (colors ?? DEFAULT_COLORS)[idx % (colors ?? DEFAULT_COLORS).length];
}

interface TooltipEntry {
  value: number;
  color?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {unit === '$' ? '$' : ''}
          {p.value.toLocaleString()}
          {unit === '%' ? '%' : ''}
        </p>
      ))}
    </div>
  );
}

function DashAreaChart({ chart }: { chart: ChartData }) {
  const hasSecond = chart.data.some((d) => d.value2 !== undefined);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chart.data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id={`ag-${chart.id}-1`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={getColor(chart.colors, 0)} stopOpacity={0.2} />
            <stop offset="95%" stopColor={getColor(chart.colors, 0)} stopOpacity={0} />
          </linearGradient>
          {hasSecond && (
            <linearGradient id={`ag-${chart.id}-2`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={getColor(chart.colors, 1)} stopOpacity={0.2} />
              <stop offset="95%" stopColor={getColor(chart.colors, 1)} stopOpacity={0} />
            </linearGradient>
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
        />
        <Tooltip content={<CustomTooltip unit={chart.unit} />} />
        {hasSecond && <Legend iconType="circle" iconSize={8} />}
        <Area
          type="monotone"
          dataKey="value"
          name="Revenue"
          stroke={getColor(chart.colors, 0)}
          fill={`url(#ag-${chart.id}-1)`}
          strokeWidth={2}
          dot={false}
        />
        {hasSecond && (
          <Area
            type="monotone"
            dataKey="value2"
            name="Expenses"
            stroke={getColor(chart.colors, 1)}
            fill={`url(#ag-${chart.id}-2)`}
            strokeWidth={2}
            dot={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function DashBarChart({ chart }: { chart: ChartData }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chart.data}
        margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
        barSize={chart.data.length > 20 ? 6 : 12}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip unit={chart.unit} />} cursor={{ fill: '#f9fafb' }} />
        <Bar dataKey="value" fill={getColor(chart.colors, 0)} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function DashLineChart({ chart }: { chart: ChartData }) {
  const hasSecond = chart.data.some((d) => d.value2 !== undefined);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chart.data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
        />
        <Tooltip content={<CustomTooltip unit={chart.unit} />} />
        {hasSecond && <Legend iconType="circle" iconSize={8} />}
        <Line
          type="monotone"
          dataKey="value"
          name="Series 1"
          stroke={getColor(chart.colors, 0)}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        {hasSecond && (
          <Line
            type="monotone"
            dataKey="value2"
            name="Series 2"
            stroke={getColor(chart.colors, 1)}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

function DashPieChart({ chart }: { chart: ChartData }) {
  const total = chart.data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="60%" height={200}>
        <PieChart>
          <Pie
            data={chart.data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={50}
            paddingAngle={2}
          >
            {chart.data.map((_, i) => (
              <Cell key={i} fill={getColor(chart.colors, i)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => [`$${v.toLocaleString()}`, '']}
            contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2">
        {chart.data.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: getColor(chart.colors, i) }}
              />
              <span className="text-gray-600">{d.label}</span>
            </div>
            <span className="font-medium text-gray-900">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartCard({ chart }: { chart: ChartData }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{chart.title}</h3>
      {chart.type === 'area' && <DashAreaChart chart={chart} />}
      {chart.type === 'bar' && <DashBarChart chart={chart} />}
      {chart.type === 'line' && <DashLineChart chart={chart} />}
      {chart.type === 'pie' && <DashPieChart chart={chart} />}
    </div>
  );
}

export function ChartCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-40 mb-4" />
      <div className="h-[220px] bg-gray-50 rounded-xl" />
    </div>
  );
}

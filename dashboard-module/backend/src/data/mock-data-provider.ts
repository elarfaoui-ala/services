import { Injectable } from '@nestjs/common';
import { DataProvider } from './data-provider.interface';
import { DashboardData, DashboardQuery, KpiData, ChartData, ChartPoint } from '../dashboard/dashboard.types';
import { getDateRange, daysBetween, formatDate, generateTimeSeries } from './generator';

@Injectable()
export class MockDataProvider implements DataProvider {

  getDashboardData(query: DashboardQuery): DashboardData {
    const { start, end } = getDateRange(query.range ?? '30d', query.from, query.to);
    const days = daysBetween(start, end);
    return {
      kpis:       this.makeKpis(days),
      charts:     this.makeCharts(start, days),
      updatedAt:  new Date().toISOString(),
      period:     { from: start.toISOString(), to: end.toISOString() },
    };
  }

  getKpis(query: DashboardQuery): KpiData[] {
    const { start, end } = getDateRange(query.range ?? '30d', query.from, query.to);
    return this.makeKpis(daysBetween(start, end));
  }

  getCharts(query: DashboardQuery): ChartData[] {
    const { start, end } = getDateRange(query.range ?? '30d', query.from, query.to);
    return this.makeCharts(start, daysBetween(start, end));
  }

  // ── private helpers ────────────────────────────────────────────────────────

  private makeKpis(days: number): KpiData[] {
    const revenue     = generateTimeSeries(days, 4200, 800, 10);
    const orders      = generateTimeSeries(days, 120,  30,  20);
    const users       = generateTimeSeries(days, 340,  50,  30);
    const conversion  = generateTimeSeries(days, 38,   8,   40);

    const sum    = (a: number[]) => a.reduce((x, y) => x + y, 0);
    const avg    = (a: number[]) => sum(a) / a.length;
    const change = (curr: number[], prev: number[]) => {
      const c = avg(curr); const p = avg(prev) || 1;
      return Math.round(((c - p) / p) * 100);
    };
    const half = Math.max(1, Math.floor(days / 2));
    const curr = (a: number[]) => a.slice(half);
    const prev = (a: number[]) => a.slice(0, half);

    const makeTrend = (v: number) => v >= 0 ? 'up' as const : 'down' as const;

    return [
      { id: 'revenue',    label: 'Total Revenue',    value: sum(revenue),    unit: '$', change: change(curr(revenue), prev(revenue)),    trend: makeTrend(change(curr(revenue), prev(revenue))),    sparkline: revenue.slice(-7) },
      { id: 'orders',     label: 'Total Orders',     value: sum(orders),     change: change(curr(orders), prev(orders)),               trend: makeTrend(change(curr(orders), prev(orders))),        sparkline: orders.slice(-7) },
      { id: 'users',      label: 'Active Users',      value: Math.round(avg(users)), change: change(curr(users), prev(users)),        trend: makeTrend(change(curr(users), prev(users))),           sparkline: users.slice(-7) },
      { id: 'conversion', label: 'Conversion Rate',   value: Math.round(avg(conversion) * 10) / 10, unit: '%', change: change(curr(conversion), prev(conversion)), trend: makeTrend(change(curr(conversion), prev(conversion))), sparkline: conversion.slice(-7) },
    ];
  }

  private makeCharts(start: Date, days: number): ChartData[] {
    const labels = Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + Math.floor(i * (days / Math.min(days, 30))));
      return formatDate(d);
    });

    const revenue  = generateTimeSeries(labels.length, 4200, 800, 10);
    const expenses = generateTimeSeries(labels.length, 2800, 500, 50);
    const orders   = generateTimeSeries(labels.length, 120,  30,  20);

    const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Other'];
    const catValues  = [4200, 3100, 2800, 1500, 900];

    return [
      {
        id: 'revenue_vs_expenses', title: 'Revenue vs Expenses', type: 'area', unit: '$',
        data:  labels.map((label, i): ChartPoint => ({ label, value: revenue[i], value2: expenses[i] })),
        colors: ['#3b82f6', '#ef4444'],
      },
      {
        id: 'orders_over_time', title: 'Orders Over Time', type: 'bar',
        data:  labels.map((label, i): ChartPoint => ({ label, value: orders[i] })),
        colors: ['#8b5cf6'],
      },
      {
        id: 'revenue_by_category', title: 'Revenue by Category', type: 'pie', unit: '$',
        data:  categories.map((label, i): ChartPoint => ({ label, value: catValues[i] })),
        colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#6b7280'],
      },
    ];
  }
}

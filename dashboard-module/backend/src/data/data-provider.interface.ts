import { DashboardData, DashboardQuery, KpiData, ChartData } from '../dashboard/dashboard.types';

export interface DataProvider {
  getDashboardData(query: DashboardQuery): DashboardData;
  getKpis(query: DashboardQuery): KpiData[];
  getCharts(query: DashboardQuery): ChartData[];
}

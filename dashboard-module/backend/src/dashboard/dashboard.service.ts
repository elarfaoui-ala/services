import { Injectable, Inject } from '@nestjs/common';
import { DashboardData, DashboardQuery } from './dashboard.types';
import { DataProvider } from '../data/data-provider.interface';
import { DATA_PROVIDER } from '../data/data-provider.token';

@Injectable()
export class DashboardService {
  constructor(@Inject(DATA_PROVIDER) private readonly dataProvider: DataProvider) {}

  getData(query: DashboardQuery): DashboardData {
    return this.dataProvider.getDashboardData(query);
  }

  getKpis(query: DashboardQuery) {
    return this.dataProvider.getKpis(query);
  }

  getCharts(query: DashboardQuery) {
    return this.dataProvider.getCharts(query);
  }
}

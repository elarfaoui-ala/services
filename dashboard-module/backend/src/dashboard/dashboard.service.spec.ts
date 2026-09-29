import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService }   from './dashboard.service';
import { DataProvider }       from '../data/data-provider.interface';
import { DATA_PROVIDER }     from '../data/data-provider.token';
import { DashboardData }      from './dashboard.types';

describe('DashboardService', () => {
  let service: DashboardService;
  let provider: DataProvider;

  const mockData: DashboardData = {
    kpis:      [{ id: 'revenue', label: 'Revenue', value: 1000, change: 10, trend: 'up' }],
    charts:    [],
    updatedAt: new Date().toISOString(),
    period:    { from: '2024-01-01', to: '2024-01-31' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: DATA_PROVIDER, useValue: { getDashboardData: jest.fn().mockReturnValue(mockData), getKpis: jest.fn().mockReturnValue(mockData.kpis), getCharts: jest.fn().mockReturnValue(mockData.charts) } },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    provider = module.get<DataProvider>(DATA_PROVIDER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return dashboard data', () => {
    const result = service.getData({ range: '30d' });
    expect(result).toEqual(mockData);
  });

  it('should delegate to data provider', () => {
    const spy = jest.spyOn(provider, 'getDashboardData');
    service.getData({ range: '7d' });
    expect(spy).toHaveBeenCalledWith({ range: '7d' });
  });
});

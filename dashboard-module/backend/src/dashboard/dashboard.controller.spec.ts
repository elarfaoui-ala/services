import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DATA_PROVIDER } from '../data/data-provider.token';

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        DashboardService,
        {
          provide: DATA_PROVIDER,
          useValue: {
            getDashboardData: jest.fn().mockReturnValue({
              kpis: [],
              charts: [],
              updatedAt: '',
              period: { from: '', to: '' },
            }),
            getKpis: jest.fn().mockReturnValue([]),
            getCharts: jest.fn().mockReturnValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return data on GET /', () => {
    const result = controller.getData({});
    expect(result).toBeDefined();
    expect(result.kpis).toEqual([]);
  });

  it('should return kpis on GET /kpis', () => {
    const result = controller.getKpis({});
    expect(result).toEqual([]);
  });
});

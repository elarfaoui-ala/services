import { MockDataProvider } from './mock-data-provider';

describe('MockDataProvider', () => {
  let provider: MockDataProvider;

  beforeEach(() => {
    provider = new MockDataProvider();
  });

  describe('getDashboardData', () => {
    it('should return dashboard data with kpis, charts, and period', () => {
      const result = provider.getDashboardData({ range: '30d' });
      expect(result.kpis).toBeDefined();
      expect(result.charts).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.period.from).toBeDefined();
      expect(result.period.to).toBeDefined();
    });

    it('should return 4 KPI cards', () => {
      const result = provider.getDashboardData({ range: '7d' });
      expect(result.kpis).toHaveLength(4);
    });

    it('should return 3 charts', () => {
      const result = provider.getDashboardData({ range: '30d' });
      expect(result.charts).toHaveLength(3);
    });
  });

  describe('getKpis', () => {
    it('should return KPI array', () => {
      const result = provider.getKpis({ range: '30d' });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have required KPI fields', () => {
      const result = provider.getKpis({ range: '7d' });
      const kpi = result[0];
      expect(kpi.id).toBeDefined();
      expect(kpi.label).toBeDefined();
      expect(kpi.value).toBeDefined();
      expect(kpi.change).toBeDefined();
      expect(kpi.trend).toMatch(/^(up|down|flat)$/);
    });
  });

  describe('getCharts', () => {
    it('should return chart array', () => {
      const result = provider.getCharts({ range: '30d' });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have required chart fields', () => {
      const result = provider.getCharts({ range: '30d' });
      const chart = result[0];
      expect(chart.id).toBeDefined();
      expect(chart.title).toBeDefined();
      expect(chart.type).toBeDefined();
      expect(Array.isArray(chart.data)).toBe(true);
    });
  });

  describe('custom date range', () => {
    it('should handle custom from/to dates', () => {
      const result = provider.getDashboardData({
        range: 'custom',
        from: '2024-01-01',
        to: '2024-01-31',
      });
      expect(result.period.from).toContain('2024');
      expect(result.period.to).toContain('2024');
    });
  });
});

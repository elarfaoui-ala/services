import { render, screen } from '@testing-library/react';
import { KpiCard, KpiCardSkeleton } from '../components/kpi/kpi-card';

describe('KpiCard', () => {
  it('renders label and formatted value with $', () => {
    render(
      <KpiCard
        kpi={{
          id: 'revenue',
          label: 'Revenue',
          value: 42000,
          unit: '$',
          change: 12,
          trend: 'up',
          sparkline: [1, 2, 3],
        }}
      />,
    );
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$42.0k')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('renders skeleton', () => {
    const { container } = render(<KpiCardSkeleton />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

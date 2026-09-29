import { Module }              from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService }    from './dashboard.service';
import { MockDataProvider }    from '../data/mock-data-provider';
import { DATA_PROVIDER }      from '../data/data-provider.token';

@Module({
  controllers: [DashboardController],
  providers: [
    DashboardService,
    { provide: DATA_PROVIDER, useClass: MockDataProvider },
  ],
  exports: [DashboardService],
})
export class DashboardModule {}

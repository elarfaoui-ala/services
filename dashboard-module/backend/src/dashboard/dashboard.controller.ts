import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get full dashboard data (KPIs + charts)' })
  @ApiQuery({ name: 'range', required: false, enum: ['today', '7d', '30d', '90d', 'custom'] })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date (for custom range)' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date (for custom range)' })
  @ApiResponse({ status: 200, description: 'Dashboard data with KPIs, charts, and period info' })
  getData(@Query() query: DashboardQueryDto) {
    return this.svc.getData(query);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get KPI cards only' })
  @ApiQuery({ name: 'range', required: false, enum: ['today', '7d', '30d', '90d', 'custom'] })
  @ApiResponse({ status: 200, description: 'Array of KPI data with sparklines' })
  getKpis(@Query() query: DashboardQueryDto) {
    return this.svc.getKpis(query);
  }

  @Get('charts')
  @ApiOperation({ summary: 'Get chart data only' })
  @ApiQuery({ name: 'range', required: false, enum: ['today', '7d', '30d', '90d', 'custom'] })
  @ApiResponse({ status: 200, description: 'Array of chart data' })
  getCharts(@Query() query: DashboardQueryDto) {
    return this.svc.getCharts(query);
  }
}

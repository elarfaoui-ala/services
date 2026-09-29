import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check dashboard service health' })
  @ApiResponse({ status: 200, description: 'Service healthy with uptime info' })
  check() {
    return {
      status: 'ok',
      service: 'dashboard',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

import { Controller, Get } from '@nestjs/common';
import { SkipThrottle }    from '@nestjs/throttler';
import { Pool }            from 'pg';
import { ConfigService }   from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private config: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Check service and database health' })
  @ApiResponse({ status: 200, description: 'Service healthy with DB status' })
  async check() {
    let dbStatus = 'unknown';
    try {
      const pool = new Pool({ connectionString: this.config.get('DATABASE_URL'), max: 1, connectionTimeoutMillis: 3000 });
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      await pool.end();
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }
    return { status: 'ok', database: dbStatus, timestamp: new Date().toISOString() };
  }
}

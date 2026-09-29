import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiKeyGuard } from './guards/api-key.guard';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @UseGuards(ApiKeyGuard)
  @Post('broadcast')
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Broadcast notification to all connected clients' })
  @ApiResponse({ status: 200, description: 'Notification sent' })
  broadcast(@Body() dto: CreateNotificationDto) {
    return this.notifications.emit(dto);
  }

  @UseGuards(ApiKeyGuard)
  @Post('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Send notification to a specific user' })
  @ApiResponse({ status: 200, description: 'Notification sent to user' })
  toUser(@Param('userId') userId: string, @Body() dto: CreateNotificationDto) {
    return this.notifications.toUser(userId, dto);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service healthy' })
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @UseGuards(ApiKeyGuard)
  @Post('test/success')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send test success notification' })
  testSuccess() {
    return this.notifications.success('Success!', 'Everything worked perfectly.');
  }

  @UseGuards(ApiKeyGuard)
  @Post('test/error')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send test error notification' })
  testError() {
    return this.notifications.error('Something went wrong', 'Please try again or contact support.');
  }

  @UseGuards(ApiKeyGuard)
  @Post('test/warning')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send test warning notification' })
  testWarning() {
    return this.notifications.warning('Low stock', 'Only 3 items remaining in inventory.');
  }

  @UseGuards(ApiKeyGuard)
  @Post('test/info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send test info notification' })
  testInfo() {
    return this.notifications.info('System update', 'A new version is available.');
  }
}

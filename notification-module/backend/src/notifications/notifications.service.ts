import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { EmitNotificationDto }  from './notification.types';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  private send(type: EmitNotificationDto['type'], title: string, message?: string, opts?: Partial<EmitNotificationDto>) {
    const dto: EmitNotificationDto = { type, title, message, ...opts };
    return this.gateway.broadcast(dto);
  }

  success(title: string, message?: string, opts?: Partial<EmitNotificationDto>) {
    return this.send('success', title, message, opts);
  }

  error(title: string, message?: string, opts?: Partial<EmitNotificationDto>) {
    return this.send('error', title, message, { duration: 0, ...opts });
  }

  warning(title: string, message?: string, opts?: Partial<EmitNotificationDto>) {
    return this.send('warning', title, message, opts);
  }

  info(title: string, message?: string, opts?: Partial<EmitNotificationDto>) {
    return this.send('info', title, message, opts);
  }

  toUser(userId: string, dto: Omit<EmitNotificationDto, 'roomId'>) {
    return this.gateway.sendToRoom(userId, dto);
  }

  emit(dto: EmitNotificationDto) {
    return this.gateway.broadcast(dto);
  }
}

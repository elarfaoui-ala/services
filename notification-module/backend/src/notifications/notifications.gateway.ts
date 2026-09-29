import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseFilters }     from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Logger }         from '@nestjs/common';
import {
  Notification,
  EmitNotificationDto,
  WS_EVENTS,
} from './notification.types';
import { WebSocketExceptionFilter } from './filters/ws-exception.filter';

@UseFilters(WebSocketExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: (
      process.env.CORS_ORIGINS ??
      process.env.FRONTEND_URL ??
      'http://localhost:3000'
    )
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    const apiKey = client.handshake?.auth?.apiKey || client.handshake?.headers?.['x-api-key'];
    if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
      client.disconnect();
      return;
    }

    this.logger.log(`Client connected: ${client.id}`);
    client.emit(WS_EVENTS.CONNECTED, { clientId: client.id });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(WS_EVENTS.JOIN_ROOM)
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);
    this.logger.log(`Client ${client.id} joined room: ${roomId}`);
    return { success: true, room: roomId };
  }

  @SubscribeMessage(WS_EVENTS.LEAVE_ROOM)
  handleLeaveRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(roomId);
    return { success: true, room: roomId };
  }

  @SubscribeMessage(WS_EVENTS.EMIT)
  handleEmit(@MessageBody() dto: EmitNotificationDto) {
    this.broadcast(dto);
    return { success: true };
  }

  broadcast(dto: EmitNotificationDto) {
    const notification = this.buildNotification(dto);
    if (dto.roomId) {
      this.server.to(dto.roomId).emit(WS_EVENTS.NOTIFY, notification);
    } else {
      this.server.emit(WS_EVENTS.NOTIFY, notification);
    }
    return notification;
  }

  sendToRoom(roomId: string, dto: Omit<EmitNotificationDto, 'roomId'>) {
    return this.broadcast({ ...dto, roomId });
  }

  sendToClient(clientId: string, dto: Omit<EmitNotificationDto, 'roomId'>) {
    const notification = this.buildNotification(dto);
    this.server.to(clientId).emit(WS_EVENTS.NOTIFY, notification);
    return notification;
  }

  private buildNotification(dto: EmitNotificationDto): Notification {
    return {
      id:        crypto.randomUUID(),
      type:      dto.type,
      title:     dto.title,
      message:   dto.message,
      duration:  dto.duration ?? 4000,
      createdAt: Date.now(),
    };
  }
}

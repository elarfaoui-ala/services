import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { WS_EVENTS } from './notification.types';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;

  const mockServer = {
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
  };

  const mockClient = {
    id: 'test-client',
    emit: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsGateway],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    (gateway as any).server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('broadcast emits to all clients', () => {
    const result = gateway.broadcast({ type: 'success', title: 'Test' });
    expect(mockServer.emit).toHaveBeenCalledWith(WS_EVENTS.NOTIFY, result);
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
  });

  it('broadcast to room emits only to that room', () => {
    gateway.broadcast({ type: 'info', title: 'Room test', roomId: 'room-1' });
    expect(mockServer.to).toHaveBeenCalledWith('room-1');
    expect(mockServer.emit).toHaveBeenCalled();
  });

  it('sendToClient emits to specific socket', () => {
    gateway.sendToClient('client-1', { type: 'error', title: 'Ouch' });
    expect(mockServer.to).toHaveBeenCalledWith('client-1');
  });

  it('handleJoinRoom joins a room', () => {
    const result = gateway.handleJoinRoom('room-1', mockClient as any);
    expect(mockClient.join).toHaveBeenCalledWith('room-1');
    expect(result).toEqual({ success: true, room: 'room-1' });
  });

  it('handleLeaveRoom leaves a room', () => {
    const result = gateway.handleLeaveRoom('room-1', mockClient as any);
    expect(mockClient.leave).toHaveBeenCalledWith('room-1');
    expect(result).toEqual({ success: true, room: 'room-1' });
  });
});

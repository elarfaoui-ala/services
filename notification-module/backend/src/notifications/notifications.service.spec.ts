import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let gateway: jest.Mocked<NotificationsGateway>;

  beforeEach(async () => {
    const mockGateway = {
      broadcast: jest.fn(),
      sendToRoom: jest.fn(),
      sendToClient: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NotificationsGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    gateway = module.get(NotificationsGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('success() calls broadcast with type success', () => {
    service.success('Done!', 'All good.');
    expect(gateway.broadcast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success', title: 'Done!', message: 'All good.' }),
    );
  });

  it('error() sets duration to 0', () => {
    service.error('Oops');
    expect(gateway.broadcast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', title: 'Oops', duration: 0 }),
    );
  });

  it('toUser() calls sendToRoom', () => {
    service.toUser('user-1', { type: 'info', title: 'Hey' });
    expect(gateway.sendToRoom).toHaveBeenCalledWith('user-1', { type: 'info', title: 'Hey' });
  });

  it('emit() calls broadcast with full dto', () => {
    const dto = { type: 'warning' as const, title: 'Warning', message: 'Careful!' };
    service.emit(dto);
    expect(gateway.broadcast).toHaveBeenCalledWith(dto);
  });
});

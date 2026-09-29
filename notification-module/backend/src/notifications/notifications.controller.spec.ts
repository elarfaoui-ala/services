import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ApiKeyGuard } from './guards/api-key.guard';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockService = {
    emit: jest.fn().mockReturnValue({ id: '1', type: 'info', title: 'Test' }),
    toUser: jest.fn().mockReturnValue({ id: '2', type: 'info', title: 'Test' }),
    success: jest.fn().mockReturnValue({ id: '3', type: 'success' }),
    error: jest.fn().mockReturnValue({ id: '4', type: 'error' }),
    warning: jest.fn().mockReturnValue({ id: '5', type: 'warning' }),
    info: jest.fn().mockReturnValue({ id: '6', type: 'info' }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return ok status', () => {
      const result = controller.health();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('broadcast', () => {
    it('should call service.emit', () => {
      const dto = { type: 'info' as const, title: 'Broadcast' };
      controller.broadcast(dto);
      expect(mockService.emit).toHaveBeenCalledWith(dto);
    });
  });

  describe('toUser', () => {
    it('should call service.toUser with userId', () => {
      const dto = { type: 'info' as const, title: 'User msg' };
      controller.toUser('user-1', dto);
      expect(mockService.toUser).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('test endpoints', () => {
    it('testSuccess should call service.success', () => {
      controller.testSuccess();
      expect(mockService.success).toHaveBeenCalled();
    });

    it('testError should call service.error', () => {
      controller.testError();
      expect(mockService.error).toHaveBeenCalled();
    });

    it('testWarning should call service.warning', () => {
      controller.testWarning();
      expect(mockService.warning).toHaveBeenCalled();
    });

    it('testInfo should call service.info', () => {
      controller.testInfo();
      expect(mockService.info).toHaveBeenCalled();
    });
  });
});

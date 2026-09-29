import { EventBus, EventPayload } from '../event-bus';

const createMockRedis = () => ({
  publish: jest.fn().mockResolvedValue(1),
  duplicate: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  disconnect: jest.fn(),
});

describe('EventBus', () => {
  let eventBus: EventBus;
  let mockRedis: ReturnType<typeof createMockRedis>;

  beforeEach(() => {
    mockRedis = createMockRedis();
    eventBus = new EventBus(mockRedis as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('publish', () => {
    it('should publish an event with correct payload', async () => {
      await eventBus.publish('user.created', { id: '123' }, 'auth-service');

      expect(mockRedis.publish).toHaveBeenCalledTimes(1);
      const [channel, payload] = mockRedis.publish.mock.calls[0];
      expect(channel).toBe('user.created');

      const parsed: EventPayload = JSON.parse(payload);
      expect(parsed.event).toBe('user.created');
      expect(parsed.data).toEqual({ id: '123' });
      expect(parsed.source).toBe('auth-service');
      expect(parsed.publishedAt).toBeDefined();
    });

    it('should publish with empty data', async () => {
      await eventBus.publish('ping', {}, 'healthcheck');
      expect(mockRedis.publish).toHaveBeenCalled();
    });

    it('should publish with complex nested data', async () => {
      const complexData = { users: [{ id: 1, roles: ['admin'] }], meta: { count: 1 } };
      await eventBus.publish('bulk.update', complexData, 'batch-service');

      const payload: EventPayload = JSON.parse(mockRedis.publish.mock.calls[0][1]);
      expect(payload.data).toEqual(complexData);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to an event channel', async () => {
      await eventBus.subscribe('user.created', jest.fn());

      expect(mockRedis.subscribe).toHaveBeenCalledWith('user.created');
    });

    it('should not re-subscribe to already subscribed channel', async () => {
      await eventBus.subscribe('user.created', jest.fn());
      await eventBus.subscribe('user.created', jest.fn());

      expect(mockRedis.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should register multiple handlers for the same event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      await eventBus.subscribe('user.created', handler1);
      await eventBus.subscribe('user.created', handler2);

      expect(mockRedis.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should set up message listener on first subscribe', async () => {
      await eventBus.subscribe('user.created', jest.fn());

      expect(mockRedis.on).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should not re-register message listener on subsequent subscribes', async () => {
      await eventBus.subscribe('event.a', jest.fn());
      await eventBus.subscribe('event.b', jest.fn());

      expect(mockRedis.on).toHaveBeenCalledTimes(1);
    });
  });

  describe('message handling', () => {
    it('should invoke handler with parsed event data', async () => {
      const handler = jest.fn();
      await eventBus.subscribe('user.created', handler);

      const messageHandler = mockRedis.on.mock.calls[0][1];
      const payload: EventPayload = {
        event: 'user.created',
        data: { id: '123' },
        publishedAt: new Date().toISOString(),
        source: 'auth-service',
      };
      await messageHandler('user.created', JSON.stringify(payload));

      expect(handler).toHaveBeenCalledWith({ id: '123' });
    });

    it('should invoke multiple handlers for the same event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      await eventBus.subscribe('user.created', handler1);
      await eventBus.subscribe('user.created', handler2);

      const messageHandler = mockRedis.on.mock.calls[0][1];
      const payload: EventPayload = {
        event: 'user.created',
        data: { id: '123' },
        publishedAt: new Date().toISOString(),
        source: 'auth-service',
      };
      await messageHandler('user.created', JSON.stringify(payload));

      expect(handler1).toHaveBeenCalledWith({ id: '123' });
      expect(handler2).toHaveBeenCalledWith({ id: '123' });
    });

    it('should not throw when handler throws', async () => {
      const badHandler = jest.fn().mockRejectedValue(new Error('handler failed'));
      await eventBus.subscribe('user.created', badHandler);

      const messageHandler = mockRedis.on.mock.calls[0][1];
      const payload: EventPayload = {
        event: 'user.created',
        data: { id: '123' },
        publishedAt: new Date().toISOString(),
        source: 'auth-service',
      };

      await expect(messageHandler('user.created', JSON.stringify(payload))).resolves.not.toThrow();
    });

    it('should handle async handlers', async () => {
      const asyncHandler = jest
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 10)));
      await eventBus.subscribe('user.created', asyncHandler);

      const messageHandler = mockRedis.on.mock.calls[0][1];
      const payload: EventPayload = {
        event: 'user.created',
        data: { id: '123' },
        publishedAt: new Date().toISOString(),
        source: 'auth-service',
      };
      await messageHandler('user.created', JSON.stringify(payload));

      expect(asyncHandler).toHaveBeenCalledWith({ id: '123' });
    });

    it('should ignore messages for unsubscribed channels', async () => {
      await eventBus.subscribe('event.a', jest.fn());

      const messageHandler = mockRedis.on.mock.calls[0][1];
      const payload: EventPayload = {
        event: 'event.b',
        data: {},
        publishedAt: new Date().toISOString(),
        source: 'test',
      };

      await expect(messageHandler('event.b', JSON.stringify(payload))).resolves.not.toThrow();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect the subscriber', () => {
      eventBus.onModuleDestroy();
      expect(mockRedis.disconnect).toHaveBeenCalled();
    });
  });
});

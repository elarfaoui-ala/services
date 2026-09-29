import { RequestIdMiddleware } from '../request-id.middleware';

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new RequestIdMiddleware();
    req = { headers: {} };
    res = { setHeader: jest.fn() };
    next = jest.fn();
  });

  it('should generate a UUID when no x-request-id header', () => {
    middleware.use(req, res, next);
    expect(req.requestId).toBeDefined();
    expect(req.requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(next).toHaveBeenCalled();
  });

  it('should use incoming x-request-id header', () => {
    req.headers['x-request-id'] = 'incoming-id-123';
    middleware.use(req, res, next);
    expect(req.requestId).toBe('incoming-id-123');
  });

  it('should set x-request-id on response', () => {
    middleware.use(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', req.requestId);
  });

  it('should call next after setting request id', () => {
    middleware.use(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle non-string header values by generating UUID', () => {
    req.headers['x-request-id'] = ['array-value'] as any;
    middleware.use(req, res, next);
    expect(req.requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});

import { AllExceptionsFilter } from '../exception-filter';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let response: any;
  let request: any;
  let host: any;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    request = {
      method: 'GET',
      url: '/test',
      headers: {},
      requestId: 'req-123',
      user: { id: 'user-1' },
    };
    host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => response,
        getRequest: () => request,
      }),
    };
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    process.env.SERVICE_NAME = 'test-service';
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    delete process.env.SERVICE_NAME;
  });

  it('should handle HttpException with 400 status', () => {
    const exception = new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalled();
    const body = response.json.mock.calls[0][0];
    expect(body.statusCode).toBe(400);
    expect(body.message).toBe('Bad request');
  });

  it('should handle HttpException with 404 status', () => {
    const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);
    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(404);
    const body = response.json.mock.calls[0][0];
    expect(body.statusCode).toBe(404);
  });

  it('should write 4xx errors to stdout', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    filter.catch(exception, host);

    expect(stdoutSpy).toHaveBeenCalled();
    const log = JSON.parse(stdoutSpy.mock.calls[0][0]);
    expect(log.level).toBe('warn');
    expect(log.statusCode).toBe(403);
  });

  it('should handle standard Error and write to stderr', () => {
    const exception = new Error('Something broke');
    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(stderrSpy).toHaveBeenCalled();
    const log = JSON.parse(stderrSpy.mock.calls[0][0]);
    expect(log.level).toBe('error');
    expect(log.error).toBe('Error');
  });

  it('should handle unknown exception types', () => {
    filter.catch('string error', host);

    expect(response.status).toHaveBeenCalledWith(500);
    const body = response.json.mock.calls[0][0];
    expect(body.statusCode).toBe(500);
    expect(body.message).toBe('Internal server error');
  });

  it('should include requestId in response', () => {
    const exception = new HttpException('test', HttpStatus.BAD_REQUEST);
    filter.catch(exception, host);

    const body = response.json.mock.calls[0][0];
    expect(body.requestId).toBe('req-123');
  });

  it('should include userId in log when user is present', () => {
    const exception = new HttpException('test', HttpStatus.BAD_REQUEST);
    filter.catch(exception, host);

    const log = JSON.parse(stdoutSpy.mock.calls[0][0]);
    expect(log.userId).toBe('user-1');
  });

  it('should handle HttpException with object response', () => {
    const exception = new HttpException(
      { message: ['field is required', 'field is invalid'], error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, host);

    const body = response.json.mock.calls[0][0];
    expect(body.statusCode).toBe(400);
    expect(Array.isArray(body.message)).toBe(true);
  });

  it('should default SERVICE_NAME to unknown', () => {
    delete process.env.SERVICE_NAME;
    filter = new AllExceptionsFilter();
    filter.catch(new Error('test'), host);

    const log = JSON.parse(stderrSpy.mock.calls[0][0]);
    expect(log.service).toBe('unknown');
  });

  it('should set error level to warn for 4xx status codes', () => {
    const exception = new HttpException('Client error', HttpStatus.UNPROCESSABLE_ENTITY);
    filter.catch(exception, host);

    expect(stdoutSpy).toHaveBeenCalled();
    const log = JSON.parse(stdoutSpy.mock.calls[0][0]);
    expect(log.level).toBe('warn');
  });

  it('should set error level to error for 5xx status codes', () => {
    filter.catch(new Error('Internal failure'), host);

    const log = JSON.parse(stderrSpy.mock.calls[0][0]);
    expect(log.level).toBe('error');
  });
});

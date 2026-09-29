import { StructuredLogger } from '../structured-logger';

describe('StructuredLogger', () => {
  let logger: StructuredLogger;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new StructuredLogger('test-service');
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    process.env.LOG_LEVEL = 'debug';
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    delete process.env.LOG_LEVEL;
  });

  it('should log info messages as JSON to stdout', () => {
    logger.log('test message');
    expect(stdoutSpy).toHaveBeenCalled();
    const output = JSON.parse(stdoutSpy.mock.calls[0][0]);
    expect(output.level).toBe('info');
    expect(output.message).toBe('test message');
    expect(output.service).toBe('test-service');
    expect(output.timestamp).toBeDefined();
  });

  it('should log error messages to stderr', () => {
    logger.error('error message');
    expect(stderrSpy).toHaveBeenCalled();
    const output = JSON.parse(stderrSpy.mock.calls[0][0]);
    expect(output.level).toBe('error');
  });

  it('should log fatal messages to stderr', () => {
    logger.fatal('fatal message');
    expect(stderrSpy).toHaveBeenCalled();
    const output = JSON.parse(stderrSpy.mock.calls[0][0]);
    expect(output.level).toBe('fatal');
  });

  it('should log warn messages to stdout', () => {
    logger.warn('warn message');
    expect(stdoutSpy).toHaveBeenCalled();
    const output = JSON.parse(stdoutSpy.mock.calls[0][0]);
    expect(output.level).toBe('warn');
  });

  it('should log debug messages to stdout', () => {
    logger.debug('debug message');
    expect(stdoutSpy).toHaveBeenCalled();
    const output = JSON.parse(stdoutSpy.mock.calls[0][0]);
    expect(output.level).toBe('debug');
  });

  it('should map verbose to debug level', () => {
    logger.verbose('verbose message');
    expect(stdoutSpy).toHaveBeenCalled();
    const output = JSON.parse(stdoutSpy.mock.calls[0][0]);
    expect(output.level).toBe('debug');
  });

  it('should filter messages below LOG_LEVEL', () => {
    process.env.LOG_LEVEL = 'warn';
    logger = new StructuredLogger('test-service');
    logger.log('should not appear');
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it('should include context fields when provided', () => {
    logger.log('with context', 'MyContext');
    const output = JSON.parse(stdoutSpy.mock.calls[0][0]);
    expect(output.context).toBe('MyContext');
  });

  it('should include trace in error messages', () => {
    logger.error('error with trace', 'stack trace here');
    const output = JSON.parse(stderrSpy.mock.calls[0][0]);
    expect(output.trace).toBe('stack trace here');
  });

  it('should default LOG_LEVEL to info', () => {
    delete process.env.LOG_LEVEL;
    logger = new StructuredLogger('test-service');
    logger.debug('debug msg');
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it('should produce valid JSON with ISO timestamp', () => {
    logger.log('check timestamp');
    const output = JSON.parse(stdoutSpy.mock.calls[0][0]);
    expect(new Date(output.timestamp).toISOString()).toBe(output.timestamp);
  });
});

import { LoggerService, LogLevel } from '@nestjs/common';

export type LogEntryInput = {
  level: string;
  message: string;
  service: string;
  requestId?: string;
  userId?: string;
  context?: string;
  trace?: string;
};

export type LogEntry = LogEntryInput & {
  timestamp: string;
  [key: string]: unknown;
};

type NestLogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal';

const LEVEL_MAP: Record<NestLogLevel, string> = {
  log: 'info',
  error: 'error',
  warn: 'warn',
  debug: 'debug',
  verbose: 'debug',
  fatal: 'fatal',
};

export class StructuredLogger implements LoggerService {
  private readonly serviceName: string;
  private readonly minLevel: string;
  private static readonly LEVEL_ORDER = ['debug', 'info', 'warn', 'error', 'fatal'];

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.minLevel = process.env.LOG_LEVEL ?? 'info';
  }

  private shouldLog(level: string): boolean {
    const minIdx = StructuredLogger.LEVEL_ORDER.indexOf(this.minLevel);
    const curIdx = StructuredLogger.LEVEL_ORDER.indexOf(level);
    return curIdx >= minIdx;
  }

  private write(entry: LogEntryInput) {
    if (!this.shouldLog(entry.level)) return;

    const full: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    const line = JSON.stringify(full);

    if (entry.level === 'error' || entry.level === 'fatal') {
      process.stderr.write(line + '\n');
    } else {
      process.stdout.write(line + '\n');
    }
  }

  log(message: string, context?: string) {
    this.write({ level: 'info', message, service: this.serviceName, context });
  }

  error(message: string, trace?: string, context?: string) {
    this.write({ level: 'error', message, service: this.serviceName, context, trace });
  }

  warn(message: string, context?: string) {
    this.write({ level: 'warn', message, service: this.serviceName, context });
  }

  debug(message: string, context?: string) {
    this.write({ level: 'debug', message, service: this.serviceName, context });
  }

  verbose(message: string, context?: string) {
    this.write({ level: 'debug', message, service: this.serviceName, context });
  }

  fatal(message: string, trace?: string, context?: string) {
    this.write({ level: 'fatal', message, service: this.serviceName, context, trace });
  }
}

import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.module';

export interface EventPayload<T = unknown> {
  event: string;
  data: T;
  publishedAt: string;
  source: string;
}

type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

@Injectable()
export class EventBus implements OnModuleDestroy {
  private readonly logger = new Logger(EventBus.name);
  private readonly subscribers = new Map<string, Set<EventHandler>>();
  private readonly subscriber: Redis;
  private listening = false;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {
    this.subscriber = redis.duplicate();
  }

  async publish<T>(event: string, data: T, source: string): Promise<void> {
    const payload: EventPayload<T> = {
      event,
      data,
      publishedAt: new Date().toISOString(),
      source,
    };
    await this.redis.publish(event, JSON.stringify(payload));
    this.logger.log(`Published event: ${event} from ${source}`);
  }

  async subscribe<T>(event: string, handler: EventHandler<T>): Promise<void> {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
      await this.subscriber.subscribe(event);
    }
    this.subscribers.get(event)!.add(handler as EventHandler);

    if (!this.listening) {
      this.listening = true;
      this.subscriber.on('message', async (channel: string, message: string) => {
        const handlers = this.subscribers.get(channel);
        if (!handlers) return;

        try {
          const payload: EventPayload = JSON.parse(message);
          await Promise.allSettled(
            Array.from(handlers).map((handler) => handler(payload.data)),
          );
        } catch (err) {
          this.logger.error(`Failed to process event ${channel}: ${err}`);
        }
      });
    }

    this.logger.log(`Subscribed to event: ${event}`);
  }

  onModuleDestroy() {
    this.subscriber.disconnect();
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  EventBus,
  EVENTS,
  UserRegisteredEvent,
  UserLoggedInEvent,
  UserPasswordResetEvent,
} from '@services/core';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EventsListener implements OnModuleInit {
  private readonly logger = new Logger(EventsListener.name);

  constructor(
    private readonly eventBus: EventBus,
    private readonly notifications: NotificationsService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe<UserRegisteredEvent>(EVENTS.USER_REGISTERED, (data) => {
      this.logger.log(`Received USER_REGISTERED for ${data.email}`);
      this.notifications.success('Welcome!', `New user registered: ${data.name} (${data.email})`);
    });

    await this.eventBus.subscribe<UserLoggedInEvent>(EVENTS.USER_LOGGED_IN, (data) => {
      this.logger.log(`Received USER_LOGGED_IN for ${data.email}`);
      this.notifications.info('Login Activity', `User logged in: ${data.email}`);
    });

    await this.eventBus.subscribe<UserPasswordResetEvent>(EVENTS.USER_PASSWORD_RESET, (data) => {
      this.logger.log(`Received USER_PASSWORD_RESET`);
      this.notifications.warning('Security Alert', `Password was reset for ${data.email}`);
    });

    this.logger.log('Event listeners registered');
  }
}

import { Module } from '@nestjs/common';
import { NotificationSocketClient } from './notification-socket.client';

@Module({
  providers: [NotificationSocketClient],
  exports: [NotificationSocketClient]
})
export class NotificationSocketModule {}

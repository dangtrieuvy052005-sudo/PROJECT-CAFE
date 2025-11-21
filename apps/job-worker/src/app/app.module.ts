import { Module, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { InventoryProcessor } from './inventory.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    BullModule.registerQueue({
      name: 'inventory-queue',
    }),
  ],
  controllers: [],
  providers: [InventoryProcessor],
})
export class AppModule {
  constructor() {
    Logger.log('✅ Worker Module Loaded with Redis: ' + (process.env.REDIS_HOST || 'localhost'));
  }
}
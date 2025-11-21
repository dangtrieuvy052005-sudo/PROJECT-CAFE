// apps/job-worker/src/app/app.module.ts
import { Module, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { InventoryProcessor } from './inventory.processor';

@Module({
  imports: [
    // 1. Cấu hình kết nối Redis
    BullModule.forRoot({
      connection: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),

    // 2. QUAN TRỌNG: Phải đăng ký Queue tên là 'inventory-queue' thì Processor mới nhận việc!
    BullModule.registerQueue({
      name: 'inventory-queue',
    }),
  ],
  controllers: [],
  providers: [InventoryProcessor],
})
export class AppModule {
  constructor() {
    Logger.log('✅ AppModule Worker đã load thành công!', 'JobWorker');
  }
}

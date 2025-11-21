// apps/api-server/src/app/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [
    // Đăng ký Queue tên là 'inventory-queue'
    BullModule.registerQueue({
      name: 'inventory-queue',
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}

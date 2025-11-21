// apps/api-server/src/app/app.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq'; // Import BullMQ
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    // 1. Kết nối Redis cho Queue
    BullModule.forRoot({
      connection: {
        host: '127.0.0.1', // Hoặc 'localhost'
        port: 6379,
      },
    }),
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

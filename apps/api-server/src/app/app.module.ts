import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module'; // <-- Thêm dòng này

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
    OrdersModule,
    ProductsModule, // <-- Đăng ký Module Products vào đây
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
// apps/job-worker/src/main.ts
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();

  const logger = new Logger('JobWorker');
  logger.log('🚀 Job Worker đã khởi động và đang lắng nghe Redis...');

  // --- THỦ THUẬT GIỮ PROCESS ---
  // Tạo một interval rỗng chạy mỗi giây để giữ cho Node.js không bao giờ tự tắt
  // Điều này giúp Worker luôn sống để chờ job từ Redis
  setInterval(() => {
    // Keep-alive process
  }, 100000);
}

bootstrap();

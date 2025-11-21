// apps/api-server/src/main.ts
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api/v1'; // Chuẩn versioning v1 [cite: 274, 427]

  app.setGlobalPrefix(globalPrefix);

  // 1. Kích hoạt Validation Pipe (Tự động validate DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Tự động convert payload theo DTO
      whitelist: true, // Loại bỏ các field thừa không có trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu gửi field lạ
    })
  );

  // 2. Cấu hình CORS (Cho phép Web Admin/POS gọi API)
  app.enableCors();

  // 3. Cấu hình Swagger (API Documentation) [cite: 443-449]
  const config = new DocumentBuilder()
    .setTitle('Coffee-Tech Pro API')
    .setDescription('Hệ thống quản lý chuỗi F&B Enterprise')
    .setVersion('1.0')
    .addBearerAuth() // Hỗ trợ JWT Auth sau này
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // Truy cập tại /docs

  const port = process.env.PORT || 3333; // Đổi sang 3333
  await app.listen(port);
  Logger.log(
    `🚀 API Server đang chạy tại: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(`📑 Swagger Docs sẵn sàng tại: http://localhost:${port}/docs`);
}

bootstrap();

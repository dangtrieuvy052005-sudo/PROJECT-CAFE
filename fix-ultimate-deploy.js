const fs = require('fs');

console.log('🚀 Đang thực hiện GIẢI PHÁP HẠT NHÂN để Deploy...');

// 1. NÂNG CẤP DOCKERFILE (Chuyển từ Alpine -> Debian Slim)
// Debian Slim tương thích tốt nhất với Prisma & OpenSSL
const dockerfilePath = 'Dockerfile';
const dockerfileContent = `# --- Giai đoạn 1: Build ---
FROM node:20-slim AS builder

WORKDIR /app

# Cài đặt OpenSSL cho Debian (Cần thiết cho Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Copy file cấu hình
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Cài đặt dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build API & Worker
RUN npx nx build api-server --prod
RUN npx nx build job-worker --prod

# --- Giai đoạn 2: Runner ---
FROM node:20-slim AS runner

WORKDIR /app

# Cài đặt OpenSSL cho môi trường chạy
RUN apt-get update -y && apt-get install -y openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Generate lại Client cho môi trường Runner
RUN npx prisma generate

EXPOSE 3333

CMD ["node", "dist/apps/api-server/main.js"]`;

// 2. CẤU HÌNH PRISMA SCHEMA (Thêm target Debian)
const schemaPath = 'prisma/schema.prisma';
// Đọc file cũ để giữ lại phần model, chỉ sửa phần generator
let schemaContent = fs.readFileSync(schemaPath, 'utf8');
if (!schemaContent.includes('debian-openssl-3.0.x')) {
  // Thay thế block generator cũ bằng block mới hỗ trợ Debian
  schemaContent = schemaContent.replace(
    /generator client \{[\s\S]*?\}/,
    `generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}`
  );
}

// 3. SỬA APP MODULE API (Bắt buộc dùng process.env)
const apiAppModulePath = 'apps/api-server/src/app/app.module.ts';
const apiAppModuleContent = `import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    // Cấu hình Redis lấy từ Biến Môi Trường (Bắt buộc cho Railway)
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    OrdersModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}`;

// 4. SỬA APP MODULE WORKER
const workerAppModulePath = 'apps/job-worker/src/app/app.module.ts';
const workerAppModuleContent = `import { Module, Logger } from '@nestjs/common';
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
}`;

// --- THỰC THI GHI FILE ---
try {
  fs.writeFileSync(dockerfilePath, dockerfileContent);
  console.log('✅ Đã thay thế Dockerfile (Node 20 Slim + OpenSSL)');

  fs.writeFileSync(schemaPath, schemaContent);
  console.log('✅ Đã cập nhật Prisma Schema (Debian Target)');

  fs.writeFileSync(apiAppModulePath, apiAppModuleContent);
  console.log('✅ Đã ghi đè API AppModule (Redis Env)');

  fs.writeFileSync(workerAppModulePath, workerAppModuleContent);
  console.log('✅ Đã ghi đè Worker AppModule (Redis Env)');

  console.log("\n🎉 ĐÃ XONG! Code giờ đây 'miễn nhiễm' với lỗi môi trường.");
} catch (e) {
  console.error('❌ Lỗi ghi file:', e);
}

const fs = require('fs');
const path = require('path');

// 1. Nội dung mới cho file app.module.ts (API Server)
const appModulePath = 'apps/api-server/src/app/app.module.ts';
const appModuleContent = `
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
`;

// 2. Đường dẫn file app.tsx (Frontend)
const appTsxPath = 'apps/web-pos/src/app/app.tsx';

// --- BẮT ĐẦU THỰC THI ---
console.log('🔄 Đang tiến hành sửa lỗi...');

try {
  // A. Ghi đè file app.module.ts
  if (fs.existsSync(appModulePath)) {
    fs.writeFileSync(appModulePath, appModuleContent.trim());
    console.log('✅ Đã sửa xong: apps/api-server/src/app/app.module.ts');
  } else {
    console.error('❌ Không tìm thấy file: ' + appModulePath);
  }

  // B. Đọc và sửa file app.tsx (Thay thế Spin)
  if (fs.existsSync(appTsxPath)) {
    let appTsxContent = fs.readFileSync(appTsxPath, 'utf8');

    // Tìm đoạn code Spin bị lỗi và thay thế
    // Lưu ý: Dùng String replace đơn giản để tránh lỗi Regex phức tạp
    const oldSpinCode = '<Spin size="large" tip="Đang pha chế menu..." />';
    const newSpinCode =
      '<Spin size="large" tip="Đang pha chế menu..."><div className="h-64 w-full" /></Spin>';

    if (appTsxContent.includes(oldSpinCode)) {
      appTsxContent = appTsxContent.replace(oldSpinCode, newSpinCode);
      fs.writeFileSync(appTsxPath, appTsxContent);
      console.log('✅ Đã sửa lỗi UI (Spin): apps/web-pos/src/app/app.tsx');
    } else {
      console.log('ℹ️ File app.tsx đã được sửa hoặc không chứa đoạn code lỗi.');
    }
  } else {
    console.error('❌ Không tìm thấy file: ' + appTsxPath);
  }

  console.log('\n🎉 HOÀN TẤT SỬA LỖI! HÃY KHỞI ĐỘNG LẠI SERVER.');
} catch (err) {
  console.error('❌ Đã xảy ra lỗi không mong muốn:', err);
}

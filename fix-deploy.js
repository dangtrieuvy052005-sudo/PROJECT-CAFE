const fs = require('fs');

console.log('🛠️ Đang vá lỗi Deployment...');

// 1. SỬA FILE main.ts (Bắt buộc lắng nghe 0.0.0.0)
const mainPath = 'apps/api-server/src/main.ts';
try {
  let mainContent = fs.readFileSync(mainPath, 'utf8');

  // Tìm đoạn app.listen(port) cũ
  if (mainContent.includes('await app.listen(port);')) {
    mainContent = mainContent.replace(
      'await app.listen(port);',
      "await app.listen(port, '0.0.0.0'); // Fix: Listen on all interfaces for Docker"
    );
    fs.writeFileSync(mainPath, mainContent);
    console.log('✅ Đã sửa main.ts: Lắng nghe IP 0.0.0.0');
  } else {
    console.log(
      'ℹ️ main.ts đã được cấu hình đúng hoặc không tìm thấy đoạn code cũ.'
    );
  }
} catch (e) {
  console.error('❌ Lỗi sửa main.ts:', e.message);
}

// 2. SỬA FILE schema.prisma (Thêm hỗ trợ Linux Alpine)
const schemaPath = 'prisma/schema.prisma';
try {
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');

  // Kiểm tra xem đã có binaryTargets chưa
  if (!schemaContent.includes('linux-musl')) {
    // Thêm binaryTargets vào generator client
    schemaContent = schemaContent.replace(
      'provider = "prisma-client-js"',
      'provider = "prisma-client-js"\n  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]'
    );
    fs.writeFileSync(schemaPath, schemaContent);
    console.log('✅ Đã sửa schema.prisma: Thêm hỗ trợ Linux Alpine');
  } else {
    console.log('ℹ️ schema.prisma đã có cấu hình Linux Alpine.');
  }
} catch (e) {
  console.error('❌ Lỗi sửa schema.prisma:', e.message);
}

console.log('\n🎉 Xong! Hãy commit và push code lên GitHub ngay.');

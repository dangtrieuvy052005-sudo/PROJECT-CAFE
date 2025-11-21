const fs = require('fs');

console.log('🚑 Đang cấp cứu lỗi Deploy...');

// 1. CẬP NHẬT APP MODULE API (Sửa Redis Host)
const apiAppModulePath = 'apps/api-server/src/app/app.module.ts';
try {
  let content = fs.readFileSync(apiAppModulePath, 'utf8');
  // Thay thế hardcode 127.0.0.1 bằng process.env
  content = content.replace(
    "host: '127.0.0.1'",
    "host: process.env.REDIS_HOST || '127.0.0.1'"
  );
  content = content.replace(
    'port: 6379',
    "port: parseInt(process.env.REDIS_PORT || '6379')"
  );
  fs.writeFileSync(apiAppModulePath, content);
  console.log('✅ Đã sửa API App Module: Dùng biến môi trường REDIS_HOST');
} catch (e) {
  console.error('❌ Lỗi sửa API App Module:', e.message);
}

// 2. CẬP NHẬT APP MODULE WORKER (Sửa Redis Host)
const workerAppModulePath = 'apps/job-worker/src/app/app.module.ts';
try {
  let content = fs.readFileSync(workerAppModulePath, 'utf8');
  content = content.replace(
    "host: '127.0.0.1'",
    "host: process.env.REDIS_HOST || '127.0.0.1'"
  );
  content = content.replace(
    'port: 6379',
    "port: parseInt(process.env.REDIS_PORT || '6379')"
  );
  fs.writeFileSync(workerAppModulePath, content);
  console.log('✅ Đã sửa Worker App Module: Dùng biến môi trường REDIS_HOST');
} catch (e) {
  console.error('❌ Lỗi sửa Worker App Module:', e.message);
}

// 3. CẬP NHẬT DOCKERFILE (Cài thêm OpenSSL cho Alpine)
const dockerfilePath = 'Dockerfile';
try {
  let content = fs.readFileSync(dockerfilePath, 'utf8');

  // Thêm lệnh cài openssl vào giai đoạn runner
  if (!content.includes('RUN apk add --no-cache openssl')) {
    content = content.replace(
      'FROM node:20-alpine AS runner\n\nWORKDIR /app',
      'FROM node:20-alpine AS runner\n\nWORKDIR /app\n\n# Fix lỗi Prisma OpenSSL\nRUN apk add --no-cache openssl libc6-compat'
    );
    fs.writeFileSync(dockerfilePath, content);
    console.log('✅ Đã sửa Dockerfile: Cài thêm thư viện OpenSSL');
  } else {
    console.log('ℹ️ Dockerfile đã có OpenSSL.');
  }
} catch (e) {
  console.error('❌ Lỗi sửa Dockerfile:', e.message);
}

console.log('\n🎉 Đã sửa xong! Hãy commit và push lên GitHub ngay.');

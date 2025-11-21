# --- Giai đoạn 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copy các file cấu hình package
COPY package.json package-lock.json* ./
# Copy thư mục prisma để generate client
COPY prisma ./prisma/

# 2. Cài đặt dependencies
RUN npm install --legacy-peer-deps

# 3. Copy toàn bộ mã nguồn
COPY . .

# 4. Generate Prisma Client (Quan trọng)
RUN npx prisma generate

# 5. Build API Server và Worker (Chế độ Production)
RUN npx nx build api-server --prod
RUN npx nx build job-worker --prod

# --- Giai đoạn 2: Runner (Chạy thật) ---
FROM node:20-alpine AS runner

WORKDIR /app

# Copy các file cần thiết từ giai đoạn Build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Cài đặt lại Prisma Client ở môi trường này
RUN npx prisma generate

# Mở cổng mạng
EXPOSE 3333

# Lệnh chạy mặc định (Chạy API Server)
CMD ["node", "dist/apps/api-server/main.js"]
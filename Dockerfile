# --- Giai đoạn 1: Build ---
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

CMD ["node", "dist/apps/api-server/main.js"]
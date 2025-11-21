// apps/job-worker/src/app/inventory.processor.ts
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Processor('inventory-queue') // Đảm bảo tên này khớp 100% với bên API
export class InventoryProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(InventoryProcessor.name);

  // 1. Log kiểm tra xem Class này có được NestJS nạp không
  onModuleInit() {
    this.logger.log(
      '📢 InventoryProcessor đã được khởi tạo! Đang chờ kết nối Redis...'
    );
  }

  // 2. Log kiểm tra kết nối Redis
  @OnWorkerEvent('ready')
  onReady() {
    this.logger.log(
      '✅ Worker đã kết nối THÀNH CÔNG tới Redis và sẵn sàng nhận việc!'
    );
  }

  @OnWorkerEvent('error')
  onError(err: Error) {
    this.logger.error('❌ Lỗi kết nối Redis:', err);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`⚡ Đang bắt đầu xử lý Job ID: ${job.id}...`);
  }

  // 3. Logic xử lý chính
  async process(job: Job<{ orderId: string; storeId: number }>) {
    this.logger.log(
      `⚙️ Logic xử lý đang chạy cho Order ID: ${job.data.orderId}`
    );

    const { orderId } = job.data;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      this.logger.error(`Không tìm thấy đơn hàng ${orderId}`);
      return;
    }

    for (const item of order.items) {
      const recipes = await prisma.recipe.findMany({
        where: { productVariantId: item.productVariantId },
        include: { ingredient: true },
      });

      if (recipes.length === 0) {
        this.logger.warn(
          `⚠️ Món #${item.productVariantId} không có công thức.`
        );
        continue;
      }

      for (const recipe of recipes) {
        const quantityToDeduct = recipe.quantityNeeded * item.quantity;

        await prisma.$transaction(async (tx) => {
          const updated = await tx.ingredient.update({
            where: { id: recipe.ingredientId },
            data: { currentStock: { decrement: quantityToDeduct } },
          });

          await tx.inventoryTransaction.create({
            data: {
              ingredientId: recipe.ingredientId,
              changeAmount: -quantityToDeduct,
              type: 'SALE',
              referenceId: order.code,
              balanceAfter: updated.currentStock,
            },
          });

          this.logger.log(
            `📉 Đã trừ ${quantityToDeduct}${recipe.ingredient.unit} ${recipe.ingredient.name}`
          );
        });
      }
    }
    this.logger.log(`✅ Hoàn tất trừ kho cho đơn ${order.code}`);
  }
}

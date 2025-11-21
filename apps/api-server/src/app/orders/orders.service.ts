// apps/api-server/src/app/orders/orders.service.ts
import { CreateOrderDto } from '@coffee-tech-pro/shared-types';
import { InjectQueue } from '@nestjs/bullmq'; // Decorator lấy Queue
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq'; // Type Queue

const prisma = new PrismaClient();

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    // Inject hàng đợi đã đăng ký
    @InjectQueue('inventory-queue') private inventoryQueue: Queue
  ) {}

  async create(dto: CreateOrderDto) {
    this.logger.log(`🛒 Đang tạo đơn hàng cho Store #${dto.storeId}...`);

    // 1. Lưu đơn hàng vào DB
    const order = await prisma.order.create({
      data: {
        code: `ORD-${Date.now()}`,
        storeId: dto.storeId,
        totalAmount: 0, // TODO: Tính tiền thật
        taxAmount: 0,
        finalAmount: 0,
        items: {
          create: dto.items.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            unitPrice: 0,
            originalPrice: 0,
            note: item.note,
          })),
        },
      },
      include: { items: true },
    });

    this.logger.log(`✅ Đơn hàng #${order.code} đã lưu DB thành công!`);

    // 2. Đẩy job vào Redis để trừ kho (Async) [cite: 790]
    // Tên Job: 'deduct-inventory'
    // Data: { orderId: ... }
    await this.inventoryQueue.add('deduct-inventory', {
      orderId: order.id,
      storeId: order.storeId,
    });

    this.logger.log(
      `🚀 Đã đẩy sự kiện trừ kho vào Redis cho Order #${order.code}`
    );

    return order;
  }
}

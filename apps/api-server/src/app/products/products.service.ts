import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ProductsService {
  async findAll() {
    return await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, variants: true },
      orderBy: { categoryId: 'asc' },
    });
  }
}
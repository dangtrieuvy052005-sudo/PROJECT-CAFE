const fs = require('fs');
const path = require('path');

const files = [
  {
    path: 'apps/api-server/src/app/products/products.module.ts',
    content: `import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}`,
  },
  {
    path: 'apps/api-server/src/app/products/products.controller.ts',
    content: `import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy Menu' })
  async findAll() {
    const products = await this.productsService.findAll();
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Lấy menu thành công',
      data: products,
    };
  }
}`,
  },
  {
    path: 'apps/api-server/src/app/products/products.service.ts',
    content: `import { Injectable } from '@nestjs/common';
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
}`,
  },
];

files.forEach((file) => {
  const fullPath = path.join(__dirname, file.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, file.content, 'utf8');
  console.log(`✅ Đã tạo: ${file.path}`);
});

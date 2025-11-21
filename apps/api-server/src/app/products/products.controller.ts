import { Controller, Get, HttpStatus } from '@nestjs/common';
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
}
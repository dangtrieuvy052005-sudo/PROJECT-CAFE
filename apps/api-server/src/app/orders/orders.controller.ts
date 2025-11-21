// apps/api-server/src/app/orders/orders.controller.ts
import { CreateOrderDto } from '@coffee-tech-pro/shared-types';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng mới' })
  @ApiResponse({ status: 201, description: 'Đơn hàng đã được tạo thành công.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrderDto: CreateOrderDto) {
    const result = await this.ordersService.create(createOrderDto);

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Tạo đơn hàng thành công',
      data: result,
    };
  }
}

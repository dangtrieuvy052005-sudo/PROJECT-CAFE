// libs/shared-types/src/lib/create-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ example: 1, description: 'ID của Product Variant' })
  @IsInt()
  @IsNotEmpty()
  productVariantId!: number;

  @ApiProperty({ example: 2, description: 'Số lượng mua' })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 'Ít đá, nhiều sữa', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'ID cửa hàng' })
  @IsInt()
  @IsNotEmpty()
  storeId!: number;

  @ApiProperty({ type: [OrderItemDto], description: 'Danh sách món' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}

import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrderStatusList } from '../enum/order.enum';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsUUID(4)
  public id: string;

  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `Valid status are ${OrderStatusList}`,
  })
  public status: OrderStatus;
}

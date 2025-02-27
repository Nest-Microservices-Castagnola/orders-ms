import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from '@prisma/client';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { UpdateOrderStatusDto } from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  create(@Payload() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern('findAllOrders')
  findAll(@Payload() orderPaginationDto: OrderPaginationDto): Promise<{
    data: Order[];
    meta: { totalPages: number; currentPage: number; lastPage: number };
  }> {
    return this.ordersService.findAll(orderPaginationDto);
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload() id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @MessagePattern('updateOrderStatus')
  updateOrderStatus(
    @Payload() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateOrderStatus(updateOrderStatusDto);
  }
}

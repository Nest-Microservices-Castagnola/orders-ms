import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from '@prisma/client';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { UpdateOrderStatusDto } from './dto';

@Controller()
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  async create(@Payload() createOrderDto: CreateOrderDto): Promise<any> {
    const order: any = await this.ordersService.create(createOrderDto);
    const paymentSession = await this.ordersService.createPaymentSession(order);

    return { order, paymentSession };
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

  @EventPattern('payment.succeeded')
  paidOrder(@Payload() paydOrderDto: any): void {
    this.logger.log(`Payment succeeded for order ${paydOrderDto.orderId}`);
  }
}

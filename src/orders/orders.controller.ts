import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  create(@Payload() createOrderDto: CreateOrderDto) {
    console.log(
      '🚀 ~ OrdersController ~ create ~ createOrderDto:',
      createOrderDto,
    );
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern('findAllOrders')
  findAll() {
    console.log('🚀 ~ OrdersController ~ findAll ~ findAll');
    return this.ordersService.findAll();
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload() id: number) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern('updateOrderStatus')
  updateOrderStatus() {
    throw new Error('Not implemented');
  }
}

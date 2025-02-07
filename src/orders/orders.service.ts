import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
//import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { UpdateOrderStatusDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    // return await this.order.create({
    //   data: createOrderDto,
    // });
    return {
      service: 'Orders service',
      createOrderDto,
    };
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status,
      },
    });
    const currentPage = orderPaginationDto.page;
    const perPage = orderPaginationDto.limit;

    return {
      data: await this.order.findMany({
        skip: (currentPage - 1) * perPage,
        take: perPage,
        where: {
          status: orderPaginationDto.status,
        },
      }),
      meta: {
        totalPages,
        currentPage,
        lastPage: Math.ceil(totalPages / perPage),
      },
    };
  }

  async findOne(id: string): Promise<Order> {
    console.log('🚀 ~ OrdersService ~ findOne ~ id:', id);
    const order = await this.order.findUnique({
      where: {
        id: id,
      },
    });
    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Resource not found`,
      });
    }

    return order;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async updateOrderStatus(
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const { id, status } = updateOrderStatusDto;
    await this.findOne(id);

    return this.order.update({
      where: { id },
      data: { status: status },
    });
  }
}

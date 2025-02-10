import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
//import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { OrderItemDto, UpdateOrderStatusDto } from './dto';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }
  private readonly logger = new Logger(OrdersService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const { items } = createOrderDto;
      const ids: string[] = items.map((item) => item.productId);

      const products: any[] = await firstValueFrom(
        this.client.send({ cmd: 'validate_products' }, ids),
      );

      const totalAmount: number = items.reduce((acc, orderItem) => {
        const price: number = products.find(
          (product) => product.id === orderItem.productId,
        ).price;
        return acc + price * orderItem.quantity;
      }, 0);

      const totalItems: number = items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity;
      }, 0);

      const detailsOrder: OrderItemDto[] = createOrderDto.items.map(
        (item: OrderItemDto) => {
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: products.find((p) => p.id == item.productId).price,
          };
        },
      );

      const order: Order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          OrderItems: {
            createMany: { data: detailsOrder },
          },
        },
        include: {
          OrderItems: true,
        },
      });

      return order;
    } catch (error) {
      this.logger.error(error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs for detail information',
      });
    }
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalPages: number = await this.order.count({
      where: {
        status: orderPaginationDto.status,
      },
    });
    const currentPage: number = orderPaginationDto.page;
    const perPage: number = orderPaginationDto.limit;

    return {
      data: await this.order.findMany({
        skip: (currentPage - 1) * perPage,
        take: perPage,
        where: {
          status: orderPaginationDto.status,
        },
        include: {
          OrderItems: true,
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
    try {
      const order: Order = await this.order.findUnique({
        where: {
          id: id,
        },
        include: {
          OrderItems: true,
        },
      });
      if (!order) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Resource not found`,
        });
      }

      return order;
    } catch (error) {
      this.logger.error(error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs for detail information',
      });
    }
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
      include: {
        OrderItems: true,
      },
    });
  }
}

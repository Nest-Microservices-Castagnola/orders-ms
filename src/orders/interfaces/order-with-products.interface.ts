import { OrderItem, OrderStatus } from '@prisma/client';

export interface OrderWithProducts {
  id: string;
  totalAmount: number;
  totalItems: number;
  paid: boolean;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date;
  status: OrderStatus;
  OrderItems: OrderItem[];
}

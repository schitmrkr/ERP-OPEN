import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Order, OrderItem, Sale } from '@prisma/client';
import { CreateOrderDto } from './dto';

@Injectable()
export class OrdersService {
  private prisma = new PrismaClient();

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const userExists = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!userExists) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    const totalAmount = dto.orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        orderNumber: dto.orderNumber,
        userId: dto.userId,
        totalAmount,
        orderItems: {
          create: dto.orderItems.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    await this.prisma.sale.create({
      data: {
        orderId: order.id,
        totalAmount,
      },
    });

    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return this.prisma.order.findMany({
      include: { orderItems: true, sale: true, user: true },
    });
  }

  async getOrderById(id: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: true, sale: true, user: true },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async deleteOrder(id: number): Promise<Order> {
    await this.prisma.sale.deleteMany({ where: { orderId: id } });

    return this.prisma.order.delete({
      where: { id },
    });
  }
}

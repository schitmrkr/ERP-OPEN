import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Order, OrderItem, OrderStatus } from '@prisma/client';
import { CreateOrderDto, UpdateOrderDto } from './dto';

@Injectable()
export class OrdersService {
  private prisma = new PrismaClient();

  async createOrder(dto: CreateOrderDto, organizationId: number): Promise<Order> {
    // Validate user belongs to organization
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user || user.organizationId !== organizationId) {
      throw new NotFoundException('User not found or access denied');
    }

    // Validate all items belong to same organization
    const itemIds = dto.orderItems.map(oi => oi.itemId);
    const items = await this.prisma.item.findMany({
      where: { id: { in: itemIds } },
    });

    if (items.length !== itemIds.length) {
      throw new NotFoundException('One or more items not found');
    }

    const invalidItems = items.filter(item => item.organizationId !== organizationId);
    if (invalidItems.length > 0) {
      throw new BadRequestException('All items must belong to the same organization');
    }

    // Calculate total amount
    const totalAmount = dto.orderItems.reduce((sum, oi) => sum + (oi.quantity * oi.price), 0);

    // Check if orderNumber already exists
    const existingOrder = await this.prisma.order.findUnique({
      where: { orderNumber: dto.orderNumber },
    });
    if (existingOrder) {
      throw new BadRequestException('Order number already exists');
    }

    // Create order with orderItems in transaction
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: dto.orderNumber,
          userId: dto.userId,
          organizationId: organizationId,
          totalAmount: totalAmount,
          status: OrderStatus.PENDING,
        },
      });

      await tx.orderItem.createMany({
        data: dto.orderItems.map(oi => ({
          orderId: order.id,
          itemId: oi.itemId,
          quantity: oi.quantity,
          price: oi.price,
        })),
      });

      return this.getOrderById(order.id);
    });
  }

  async getOrdersByOrganization(organizationId: number): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        orderItems: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sellingPrice: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrderById(id: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        orderItems: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sellingPrice: true,
              },
            },
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrder(id: number, dto: UpdateOrderDto): Promise<Order> {
    await this.getOrderById(id); // ensure exists

    const data: any = {};
    if (dto.status !== undefined) data.status = dto.status;

    await this.prisma.order.update({
      where: { id },
      data,
    });

    return this.getOrderById(id);
  }

  async deleteOrder(id: number): Promise<Order> {
    const order = await this.getOrderById(id);
    
    // Delete orderItems first (cascade should handle this, but being explicit)
    await this.prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    await this.prisma.order.delete({
      where: { id },
    });

    return order;
  }
}

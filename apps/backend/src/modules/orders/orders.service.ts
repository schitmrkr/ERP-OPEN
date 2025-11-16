import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaClient, Order, OrderItem, OrderStatus } from '@prisma/client';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto, organizationId: number): Promise<Order> {
    // Validate user belongs to organization
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user || user.organizationId !== organizationId) {
      throw new NotFoundException('User not found or access denied');
    }
    this.logger.log(`User: ${JSON.stringify(user)}`);

    // Validate all items belong to same organization
    const itemIds = dto.orderItems.map(oi => oi.itemId);
    const items = await this.prisma.item.findMany({
      where: { id: { in: itemIds } },
    });

    this.logger.log(`Items: ${JSON.stringify(items)}`);

    if (items.length !== itemIds.length) {
      throw new NotFoundException('One or more items not found');
    }

    const invalidItems = items.filter(item => item.organizationId !== organizationId);
    if (invalidItems.length > 0) {
      throw new BadRequestException('All items must belong to the same organization');
    }

    // Calculate total amount
    const totalAmount = dto.orderItems.reduce((sum, oi) => sum + (oi.quantity * oi.price), 0);

    this.logger.log(`Total amount: ${totalAmount}`);

    // Check if orderNumber already exists
    const existingOrder = await this.prisma.order.findUnique({
      where: { orderNumber: dto.orderNumber },
    });
    if (existingOrder) {
      throw new BadRequestException('Order number already exists');
    }

    this.logger.log(`Existing order: ${JSON.stringify(existingOrder)}`);

    const orderId = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: dto.orderNumber,
          userId: dto.userId,
          organizationId,
          totalAmount,
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

      return order.id;
    });

      return this.getOrderById(orderId);
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
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }

    // Only allow editing items while order is PENDING. Status can be changed separately.
    if (dto.orderItems && dto.orderItems.length > 0 && existingOrder.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be edited');
    }

    await this.prisma.$transaction(async (tx) => {
      const data: any = {};

      if (dto.status !== undefined) {
        data.status = dto.status;
      }

      if (dto.orderItems && dto.orderItems.length > 0) {
        // Validate all items belong to the same organization
        const itemIds = dto.orderItems.map((oi) => oi.itemId);
        const items = await tx.item.findMany({
          where: { id: { in: itemIds } },
        });

        if (items.length !== itemIds.length) {
          throw new NotFoundException('One or more items not found');
        }

        const invalidItems = items.filter((item) => item.organizationId !== existingOrder.organizationId);
        if (invalidItems.length > 0) {
          throw new BadRequestException('All items must belong to the same organization');
        }

        const totalAmount = dto.orderItems.reduce((sum, oi) => sum + oi.quantity * oi.price, 0);
        data.totalAmount = totalAmount;

        // Replace existing order items with the new set
        await tx.orderItem.deleteMany({ where: { orderId: id } });
        await tx.orderItem.createMany({
          data: dto.orderItems.map((oi) => ({
            orderId: id,
            itemId: oi.itemId,
            quantity: oi.quantity,
            price: oi.price,
          })),
        });
      }

      await tx.order.update({
        where: { id },
        data,
      });
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

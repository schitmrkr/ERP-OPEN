import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Order, OrderStatus, OrderItem } from '@prisma/client';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { PrismaService } from '../../shared/prisma/prisma.service';

type OrderWithItems = Order & { orderItems: OrderItem[] };

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

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

  async createOrder(dto: CreateOrderDto, organizationId: number): Promise<Order> {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user || user.organizationId !== organizationId) {
      throw new NotFoundException('User not found or access denied');
    }

    const itemIds = dto.orderItems.map(oi => oi.itemId);
    const items = await this.prisma.item.findMany({
      where: { id: { in: itemIds } },
    });

    if (items.length !== itemIds.length) {
      throw new NotFoundException('One or more items not found');
    }

    const invalidItems = items.filter(i => i.organizationId !== organizationId);
    if (invalidItems.length > 0) {
      throw new BadRequestException('All items must belong to the same organization');
    }

    for (const oi of dto.orderItems) {
      const item = items.find(i => i.id === oi.itemId)!;
      if (item.inventoryQty < oi.quantity) {
        throw new BadRequestException(
          `Insufficient inventory for item '${item.name}'. Available: ${item.inventoryQty}`
        );
      }
    }

    const totalAmount = dto.orderItems.reduce((sum, oi) => sum + oi.quantity * oi.price, 0);

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

      for (const oi of dto.orderItems) {
        await tx.item.update({
          where: { id: oi.itemId },
          data: {
            inventoryQty: { decrement: oi.quantity },
          },
        });
      }

      return order.id;
    });

    return this.getOrderById(orderId);
  }

  async updateOrder(id: number, dto: UpdateOrderDto): Promise<Order> {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!existingOrder) throw new NotFoundException('Order not found');

    return this.prisma.$transaction(async (tx) => {
      if (dto.status === OrderStatus.CANCELLED && existingOrder.status !== OrderStatus.CANCELLED) {
        for (const oi of existingOrder.orderItems) {
          await tx.item.update({
            where: { id: oi.itemId },
            data: { inventoryQty: { increment: oi.quantity } },
          });
        }
      }

      if (dto.orderItems && dto.orderItems.length > 0) {
        if (existingOrder.status !== OrderStatus.PENDING) {
          throw new BadRequestException('Only pending orders can be edited');
        }

        for (const old of existingOrder.orderItems) {
          await tx.item.update({
            where: { id: old.itemId },
            data: { inventoryQty: { increment: old.quantity } },
          });
        }

        const itemIds = dto.orderItems.map((oi) => oi.itemId);
        const items = await tx.item.findMany({ where: { id: { in: itemIds } } });

        if (items.length !== itemIds.length) {
          throw new NotFoundException('One or more items not found');
        }

        const invalidItems = items.filter(i => i.organizationId !== existingOrder.organizationId);
        if (invalidItems.length > 0) {
          throw new BadRequestException('All items must belong to the same organization');
        }

        for (const oi of dto.orderItems) {
          const item = items.find(i => i.id === oi.itemId)!;
          if (item.inventoryQty < oi.quantity) {
            throw new BadRequestException(
              `Insufficient inventory for item '${item.name}'. Available: ${item.inventoryQty}`
            );
          }
        }

        await tx.orderItem.deleteMany({ where: { orderId: id } });
        await tx.orderItem.createMany({
          data: dto.orderItems.map(oi => ({
            orderId: id,
            itemId: oi.itemId,
            quantity: oi.quantity,
            price: oi.price,
          })),
        });

        for (const oi of dto.orderItems) {
          await tx.item.update({
            where: { id: oi.itemId },
            data: { inventoryQty: { decrement: oi.quantity } },
          });
        }

        const totalAmount = dto.orderItems.reduce((sum, oi) => sum + oi.quantity * oi.price, 0);
        await tx.order.update({ where: { id }, data: { totalAmount } });
      }

      if (dto.status !== undefined) {
        await tx.order.update({ where: { id }, data: { status: dto.status } });
      }

      return this.getOrderById(id);
    });
  }

  async deleteOrder(id: number): Promise<OrderWithItems> {
    // Fetch the order along with its order items
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });
  
    if (!order) throw new NotFoundException('Order not found');
  
    await this.prisma.$transaction(async (tx) => {
      // Return inventory for each order item
      for (const oi of order.orderItems) {
        await tx.item.update({
          where: { id: oi.itemId },
          data: { inventoryQty: { increment: oi.quantity } },
        });
      }
  
      // Delete order items and the order itself
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });
  
    return order;
  }

  async getOrdersByOrganization(organizationId: number): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        orderItems: { include: { item: { select: { id: true, name: true, sellingPrice: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

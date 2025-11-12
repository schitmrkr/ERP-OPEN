import { Controller, Get, Post, Param, Delete, Body, Patch, ParseIntPipe, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { Order } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../shared/prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto, @Request() req: any): Promise<Order> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    // Override userId in DTO with authenticated user's ID for security
    dto.userId = user.id;
    
    return this.ordersService.createOrder(dto, user.organizationId);
  }

  @Get()
  async getAllOrders(@Request() req: any): Promise<Order[]> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    return this.ordersService.getOrdersByOrganization(user.organizationId);
  }

  @Get(':id')
  async getOrderById(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<Order> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    const order = await this.ordersService.getOrderById(id);
    
    // Users can only see orders from their organization
    if (order.organizationId !== user.organizationId) {
      throw new NotFoundException('Order not found');
    }
    
    return order;
  }

  @Patch(':id')
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
    @Request() req: any,
  ): Promise<Order> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    const order = await this.ordersService.getOrderById(id);
    
    // Users can only update orders from their organization
    if (order.organizationId !== user.organizationId) {
      throw new NotFoundException('Order not found');
    }
    
    return this.ordersService.updateOrder(id, dto);
  }

  @Delete(':id')
  async deleteOrder(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<Order> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    const order = await this.ordersService.getOrderById(id);
    
    // Users can only delete orders from their organization
    if (order.organizationId !== user.organizationId) {
      throw new NotFoundException('Order not found');
    }
    
    return this.ordersService.deleteOrder(id);
  }
}

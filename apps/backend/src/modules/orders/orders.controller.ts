import { Controller, Get, Post, Param, Delete, Body, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto';
import { Order } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.ordersService.createOrder(dto);
  }

  @Get()
  async getAllOrders(): Promise<Order[]> {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  async getOrder(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.getOrderById(id);
  }

  @Delete(':id')
  async deleteOrder(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.deleteOrder(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Order, OrderItem } from '@prisma/client';
import { CreateOrderDto } from './dto';

@Injectable()
export class OrdersService {

  async createOrder(dto: CreateOrderDto): Promise<Order | null> {

    return null;
  }

  
}

import { Controller, 
  Get, 
  Post, 
  Param, 
  Delete, 
  Body, 
  Patch, 
  ParseIntPipe, 
  UseGuards, 
  Request, 
  NotFoundException, 
  Logger 
 } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { Order } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../shared/prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
private readonly logger = new Logger(OrdersController.name);

constructor(
private readonly ordersService: OrdersService,
private readonly prisma: PrismaService
) {}

/** Helper to fetch user and verify org-level access */
private async getUserAndVerifyOrg(req: any): Promise<{ id: number; organizationId: number }> {
const userId = req.user?.userId;
if (!userId) throw new NotFoundException('User not found in token');

const user = await this.prisma.user.findUnique({ where: { id: userId } });
if (!user) throw new NotFoundException('User not found');

return { id: user.id, organizationId: user.organizationId };
}

@Post()
async createOrder(@Body() dto: CreateOrderDto, @Request() req: any): Promise<Order> {
const { id: userId, organizationId } = await this.getUserAndVerifyOrg(req);

// Force the order userId to authenticated user
dto.userId = userId;

return this.ordersService.createOrder(dto, organizationId);
}

@Get()
async getAllOrders(@Request() req: any): Promise<Order[]> {
const { organizationId } = await this.getUserAndVerifyOrg(req);
return this.ordersService.getOrdersByOrganization(organizationId);
}

@Get(':id')
async getOrderById(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<Order> {
const { organizationId } = await this.getUserAndVerifyOrg(req);
const order = await this.ordersService.getOrderById(id);

if (order.organizationId !== organizationId) {
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
const { organizationId } = await this.getUserAndVerifyOrg(req);
const order = await this.ordersService.getOrderById(id);

if (order.organizationId !== organizationId) {
throw new NotFoundException('Order not found');
}

return this.ordersService.updateOrder(id, dto);
}

@Patch(':id/status')
async updateOrderStatus(
@Param('id', ParseIntPipe) id: number,
@Body() dto: UpdateOrderDto,
@Request() req: any,
): Promise<Order> {
const { organizationId } = await this.getUserAndVerifyOrg(req);
const order = await this.ordersService.getOrderById(id);

if (order.organizationId !== organizationId) {
throw new NotFoundException('Order not found');
}

return this.ordersService.updateOrder(id, dto);
}

@Delete(':id')
async deleteOrder(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<Order> {
const { organizationId } = await this.getUserAndVerifyOrg(req);
const order = await this.ordersService.getOrderById(id);

if (order.organizationId !== organizationId) {
throw new NotFoundException('Order not found');
}

return this.ordersService.deleteOrder(id);
}
}

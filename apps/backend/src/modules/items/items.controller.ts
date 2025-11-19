import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  UseGuards,
  Request,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemsDto, UpdateItemsDto } from './dto';
import { Item } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { PrismaService } from '../../shared/prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('items')
export class ItemsController {
  constructor(
    private readonly itemService: ItemsService,
    private readonly prisma: PrismaService
  ) {}

  private async getUserOrgId(req: ExpressRequest): Promise<number> {
    const userId = (req.user as any)?.userId;

    if (!userId) throw new NotFoundException('User not found in token');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    return user.organizationId;
  }

  private async verifyItemOrg(itemId: number, orgId: number) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      select: { organizationId: true },
    });

    if (!item) throw new NotFoundException('Item not found');

    if (item.organizationId !== orgId)
      throw new ForbiddenException('You are not allowed to access this item');

    return true;
  }

  @Post()
  async createItem(
    @Body() dto: CreateItemsDto,
    @Request() req: ExpressRequest
  ): Promise<Item> {
    const orgId = await this.getUserOrgId(req);
    return this.itemService.createItem(dto, orgId);
  }

  @Get()
  async getAllItems(@Request() req: ExpressRequest): Promise<Item[]> {
    const orgId = await this.getUserOrgId(req);

    return this.prisma.item.findMany({
      where: { organizationId: orgId },
      include: { expenses: true, orderItems: true },
    });
  }

  @Get('average-cost-price')
  async getAverageCostPrice(@Request() req: ExpressRequest) {
    const orgId = await this.getUserOrgId(req);
    return this.itemService.getAverageCostPriceIncludingIndirect(orgId);
  }

  @Get(':id')
  async getItemById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest
  ): Promise<Item> {
    const orgId = await this.getUserOrgId(req);
    await this.verifyItemOrg(id, orgId);

    return this.itemService.getItemById(id);
  }

  @Patch(':id')
  async updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemsDto,
    @Request() req: ExpressRequest
  ): Promise<Item> {
    const orgId = await this.getUserOrgId(req);
    await this.verifyItemOrg(id, orgId);

    return this.itemService.updateItem(id, dto);
  }

  @Delete(':id')
  async deleteItem(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest
  ): Promise<Item> {
    const orgId = await this.getUserOrgId(req);
    await this.verifyItemOrg(id, orgId);

    return this.itemService.deleteItem(id);
  }

  @Post(':id/add-stock')
  async addStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('qty', ParseIntPipe) qty: number,
    @Request() req: ExpressRequest
  ) {
    const orgId = await this.getUserOrgId(req);
    await this.verifyItemOrg(id, orgId);

    if (qty <= 0) throw new BadRequestException('qty must be positive');

    return this.itemService.addStock(id, qty);
  }

  @Post(':id/reduce-stock')
  async reduceStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('qty', ParseIntPipe) qty: number,
    @Request() req: ExpressRequest
  ) {
    const orgId = await this.getUserOrgId(req);
    await this.verifyItemOrg(id, orgId);

    if (qty <= 0) throw new BadRequestException('qty must be positive');

    return this.itemService.reduceStock(id, qty);
  }
}

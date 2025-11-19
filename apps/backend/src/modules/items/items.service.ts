import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Item, Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateItemsDto, UpdateItemsDto } from './dto';

@Injectable()
export class ItemsService {

  constructor(private readonly prisma: PrismaService) {}

  async createItem(dto: CreateItemsDto, userOrgId: number): Promise<Item> {
    return this.prisma.item.create({
      data: {
        name: dto.name,
        sellingPrice: dto.sellingPrice,
        inventoryQty: dto.inventoryQty ?? 0,
        organization: {
          connect: { id: userOrgId },
        },
      },
    });
  }

  async getAllItems(): Promise<Item[]> {
    return this.prisma.item.findMany({
      include: {
        expenses: true,
        orderItems: true,
      },
    });
  }

  async getItemById(id: number): Promise<Item> {
    const item = await this.prisma.item.findUnique({
      where: { id },
      include: {
        expenses: true,
      },
    });

    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async updateItem(id: number, dto: UpdateItemsDto): Promise<Item> {
    const existing = await this.getItemById(id);

    if (dto.inventoryQty !== undefined && dto.inventoryQty < 0) {
      throw new BadRequestException('Inventory cannot be negative');
    }

    return this.prisma.item.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        sellingPrice: dto.sellingPrice ?? existing.sellingPrice,
        inventoryQty: dto.inventoryQty ?? existing.inventoryQty,
      },
      include: { expenses: true, orderItems: true },
    });
  }

  async addStock(itemId: number, qty: number) {
    if (qty <= 0) throw new BadRequestException('Quantity must be positive');

    const item = await this.getItemById(itemId);

    return this.prisma.item.update({
      where: { id: itemId },
      data: {
        inventoryQty: { increment: qty },
      },
      include: { expenses: true, orderItems: true },
    });
  }

  async reduceStock(itemId: number, qty: number) {
    if (qty <= 0) throw new BadRequestException('Quantity must be positive');

    const item = await this.getItemById(itemId);

    if (item.inventoryQty < qty) {
      throw new BadRequestException(
        `Not enough inventory. Available: ${item.inventoryQty}, requested: ${qty}`
      );
    }

    return this.prisma.item.update({
      where: { id: itemId },
      data: {
        inventoryQty: { decrement: qty },
      },
      include: { expenses: true, orderItems: true },
    });
  }

  async getAverageCostPriceIncludingIndirect(organizationId: number) {
    // Fetch items with their direct expenses
    const items = await this.prisma.item.findMany({
      where: { organizationId },
      include: {
        expenses: {
          select: { amount: true, expenseNature: true },
        },
      },
    });
  
    if (items.length === 0) {
      return { items: [], organizationAvgCostPrice: 0 };
    }
  
    // Sum of indirect expenses for the organization (not attached to items)
    const indirectExpenses = await this.prisma.expense.findMany({
      where: {
        organizationId,
        expenseNature: 'INDIRECT',
      },
      select: { amount: true },
    });
  
    const totalIndirectExpenses = indirectExpenses.reduce((sum, e) => sum + e.amount, 0);
  
    // Calculate base cost per item (direct expense)
    const itemBaseCosts = items.map(item => {
      const directExpense = item.expenses
        .filter(e => e.expenseNature === 'DIRECT')
        .reduce((sum, e) => sum + e.amount, 0);
  
      return {
        itemId: item.id,
        name: item.name,
        sellingPrice: item.sellingPrice,
        inventoryQty: item.inventoryQty,
        directExpense,
      };
    });
  
    // Total inventory value for proportional distribution
    const totalInventoryValue = itemBaseCosts.reduce(
      (sum, item) => sum + item.sellingPrice * item.inventoryQty,
      0
    ) || 1; // prevent division by 0
  
    // Calculate average cost per item including proportional indirect expense
    const itemCosts = itemBaseCosts.map(item => {
      const proportionalIndirect =
        totalIndirectExpenses * ((item.sellingPrice * item.inventoryQty) / totalInventoryValue);
  
      const avgCostPrice = (item.directExpense + proportionalIndirect) / (item.inventoryQty || 1);
      return { itemId: item.itemId, name: item.name, avgCostPrice };
    });
  
    const organizationAvgCostPrice =
      itemCosts.reduce((sum, i) => sum + i.avgCostPrice, 0) / itemCosts.length;
  
    return {
      items: itemCosts,
      organizationAvgCostPrice,
    };
  }
  
  
  
  async deleteItem(id: number): Promise<Item> {
    await this.getItemById(id);

    try {
      return await this.prisma.item.delete({
        where: { id },
      });
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new BadRequestException('Cannot delete this item because it is used in existing orders or expenses.');
      }
      throw err;
    }
  }
}

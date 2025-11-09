import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Item } from '@prisma/client';
import { CreateItemsDto, UpdateItemsDto } from './dto';

@Injectable()
export class ItemsService {
  private prisma = new PrismaClient();

  async createItem(dto: CreateItemsDto, userOrgId: number): Promise<Item> {
    return this.prisma.item.create({
      data: {
        name: dto.name,
        sellingPrice: dto.sellingPrice,
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
    await this.getItemById(id); // ensure exists

    return this.prisma.item.update({
      where: { id },
      data: {
        name: dto.name,
        sellingPrice: dto.sellingPrice,
      },
    });
  }

  async deleteItem(id: number): Promise<Item> {
    await this.getItemById(id);

    return this.prisma.item.delete({
      where: { id },
    });
  }
}

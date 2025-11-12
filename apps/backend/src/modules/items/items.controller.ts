import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemsDto, UpdateItemsDto } from './dto';
import { Item } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { PrismaService } from '../../shared/prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('items')
export class ItemsController {
  constructor(
    private readonly itemService: ItemsService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  async createItem(
    @Body() dto: CreateItemsDto,
    @Request() req: ExpressRequest
  ): Promise<Item> {
    const userId = (req.user as any)?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.itemService.createItem(dto, user.organizationId);
  }

  @Get()
  async getAllItems(): Promise<Item[]> {
    return this.itemService.getAllItems();
  }

  @Get(':id')
  async getItemById(@Param('id', ParseIntPipe) id: number): Promise<Item> {
    return this.itemService.getItemById(id);
  }

  @Patch(':id')
  async updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemsDto,
    @Request() req: ExpressRequest
  ): Promise<Item> {
    const userId = (req.user as any)?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    // Optionally, only allow update if item belongs to user's org
    return this.itemService.updateItem(id, dto);
  }

  @Delete(':id')
  async deleteItem(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest
  ): Promise<Item> {
    const userId = (req.user as any)?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    // Optionally, only allow delete if item belongs to user's org
    return this.itemService.deleteItem(id);
  }
}
import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemsDto } from './dto';
import { Item } from '@prisma/client';


@Controller('items')
export class ItemsController {
  constructor(private readonly itemService: ItemsService) {}

  @Post()
  async createItem(@Body() dto: CreateItemsDto): Promise<Item | null> {
    return null;
  }
}
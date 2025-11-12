import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, UseGuards, Request, NotFoundException, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto';
import { Expense, ExpenseType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../shared/prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly expenseService: ExpensesService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  async createExpense(@Body() dto: CreateExpenseDto, @Request() req: any): Promise<Expense> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    // Validate itemId belongs to same organization if provided
    if (dto.itemId) {
      const item = await this.prisma.item.findUnique({ where: { id: dto.itemId } });
      if (!item || item.organizationId !== user.organizationId) {
        throw new NotFoundException('Item not found or access denied');
      }
    }
    
    // Validate userId belongs to same organization if provided
    if (dto.userId) {
      const targetUser = await this.prisma.user.findUnique({ where: { id: dto.userId } });
      if (!targetUser || targetUser.organizationId !== user.organizationId) {
        throw new NotFoundException('User not found or access denied');
      }
    }
    
    return this.expenseService.createExpense(dto, user.organizationId);
  }

  @Get()
  async getAllExpenses(
    @Request() req: any,
    @Query('itemId') itemId?: string,
    @Query('userId') filterUserId?: string,
    @Query('type') type?: ExpenseType,
  ): Promise<Expense[]> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    return this.expenseService.getExpensesByOrganization(
      user.organizationId,
      itemId ? parseInt(itemId) : undefined,
      filterUserId ? parseInt(filterUserId) : undefined,
      type,
    );
  }

  @Get(':id')
  async getExpenseById(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<Expense> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    const expense = await this.expenseService.getExpenseById(id);
    
    // Users can only see expenses from their organization
    if (expense.organizationId !== user.organizationId) {
      throw new NotFoundException('Expense not found');
    }
    
    return expense;
  }

  @Patch(':id')
  async updateExpense(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseDto,
    @Request() req: any,
  ): Promise<Expense> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    const expense = await this.expenseService.getExpenseById(id);
    
    // Users can only update expenses from their organization
    if (expense.organizationId !== user.organizationId) {
      throw new NotFoundException('Expense not found');
    }
    
    // Validate itemId belongs to same organization if provided
    if (dto.itemId !== undefined && dto.itemId !== null) {
      const item = await this.prisma.item.findUnique({ where: { id: dto.itemId } });
      if (!item || item.organizationId !== user.organizationId) {
        throw new NotFoundException('Item not found or access denied');
      }
    }
    
    // Validate userId belongs to same organization if provided
    if (dto.userId !== undefined && dto.userId !== null) {
      const targetUser = await this.prisma.user.findUnique({ where: { id: dto.userId } });
      if (!targetUser || targetUser.organizationId !== user.organizationId) {
        throw new NotFoundException('User not found or access denied');
      }
    }
    
    return this.expenseService.updateExpense(id, dto);
  }

  @Delete(':id')
  async deleteExpense(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<Expense> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    const expense = await this.expenseService.getExpenseById(id);
    
    // Users can only delete expenses from their organization
    if (expense.organizationId !== user.organizationId) {
      throw new NotFoundException('Expense not found');
    }
    
    return this.expenseService.deleteExpense(id);
  }
}
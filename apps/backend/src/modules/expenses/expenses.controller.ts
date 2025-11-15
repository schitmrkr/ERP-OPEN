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
  Query,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto';
import { Expense, ExpenseType, ExpenseNature } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../shared/prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly expenseService: ExpensesService,
    private readonly prisma: PrismaService,
  ) {}

  private async getCurrentUser(req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async validateOrganizationAccess(organizationId: number, itemId?: number, targetUserId?: number) {
    if (itemId) {
      const item = await this.prisma.item.findUnique({ where: { id: itemId } });
      if (!item || item.organizationId !== organizationId) {
        throw new NotFoundException('Item not found or access denied');
      }
    }

    if (targetUserId) {
      const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
      if (!targetUser || targetUser.organizationId !== organizationId) {
        throw new NotFoundException('User not found or access denied');
      }
    }
  }

  @Post()
  async createExpense(@Body() dto: CreateExpenseDto, @Request() req: any): Promise<Expense> {
    const user = await this.getCurrentUser(req);
    await this.validateOrganizationAccess(user.organizationId, dto.itemId, user.id);
    return this.expenseService.createExpense(dto, user.organizationId, user.id);
  }

  @Get()
  async getAllExpenses(
    @Request() req: any,
    @Query('itemId') itemId?: string,
    @Query('userId') filterUserId?: string,
    @Query('type') type?: ExpenseType,
    @Query('expenseNature') expenseNature?: ExpenseNature,
  ): Promise<Expense[]> {
    const user = await this.getCurrentUser(req);

    return this.expenseService.getExpensesByOrganization({
      organizationId: user.organizationId,
      itemId: itemId ? parseInt(itemId) : undefined,
      userId: filterUserId ? parseInt(filterUserId) : undefined,
      type,
      expenseNature,
    });
  }

  @Get(':id')
  async getExpenseById(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<Expense> {
    const user = await this.getCurrentUser(req);
    const expense = await this.expenseService.getExpenseById(id);

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
    const user = await this.getCurrentUser(req);
    const expense = await this.expenseService.getExpenseById(id);

    if (expense.organizationId !== user.organizationId) {
      throw new NotFoundException('Expense not found');
    }

    await this.validateOrganizationAccess(user.organizationId, dto.itemId, user.id);

    return this.expenseService.updateExpense(id, dto, user.id);
  }

  @Delete(':id')
  async deleteExpense(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<Expense> {
    const user = await this.getCurrentUser(req);
    const expense = await this.expenseService.getExpenseById(id);

    if (expense.organizationId !== user.organizationId) {
      throw new NotFoundException('Expense not found');
    }

    return this.expenseService.deleteExpense(id);
  }
}

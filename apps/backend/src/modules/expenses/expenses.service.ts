import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Expense, ExpenseType } from '@prisma/client';
import { CreateExpenseDto, UpdateExpenseDto } from './dto';

@Injectable()
export class ExpensesService {
  private prisma = new PrismaClient();

  async createExpense(dto: CreateExpenseDto, organizationId: number): Promise<Expense> {
    return this.prisma.expense.create({
      data: {
        description: dto.description,
        amount: dto.amount,
        type: dto.type,       // defaults to INGREDIENT if not provided
        itemId: dto.itemId ?? null,
        userId: dto.userId ?? null,
        organizationId: organizationId,
      },
    });
  }

  async getAllExpenses(): Promise<Expense[]> {
    return this.prisma.expense.findMany({
      include: {
        item: true,
        user: true,
      },
    });
  }

  async getExpensesByOrganization(
    organizationId: number,
    itemId?: number,
    userId?: number,
    type?: ExpenseType,
  ): Promise<Expense[]> {
    const where: any = { organizationId };
    if (itemId) where.itemId = itemId;
    if (userId) where.userId = userId;
    if (type) where.type = type;
    
    return this.prisma.expense.findMany({
      where,
      include: {
        item: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getExpenseById(id: number): Promise<Expense> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        item: true,
        user: true,
      },
    });

    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async updateExpense(id: number, dto: UpdateExpenseDto): Promise<Expense> {
    await this.getExpenseById(id); // ensure exists
    
    const data: any = {};
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.itemId !== undefined) data.itemId = dto.itemId;
    if (dto.userId !== undefined) data.userId = dto.userId;
    
    return this.prisma.expense.update({
      where: { id },
      data,
      include: {
        item: true,
        user: true,
      },
    });
  }

  async deleteExpense(id: number): Promise<Expense> {
    await this.getExpenseById(id); // ensure exists
    return this.prisma.expense.delete({
      where: { id },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Expense } from '@prisma/client';
import { CreateExpenseDto } from './dto';

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

  async deleteExpense(id: number): Promise<Expense> {
    await this.getExpenseById(id); // ensure exists
    return this.prisma.expense.delete({
      where: { id },
    });
  }
}

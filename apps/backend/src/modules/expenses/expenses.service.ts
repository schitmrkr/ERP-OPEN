import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Expense, ExpenseType, ExpenseNature } from '@prisma/client';
import { CreateExpenseDto, UpdateExpenseDto } from './dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly DIRECT_TYPES: ExpenseType[] = [
    ExpenseType.INGREDIENT,
    ExpenseType.PACKAGING,
    ExpenseType.UTILITY,
    ExpenseType.TRANSPORT,
  ];

  private readonly INDIRECT_TYPES: ExpenseType[] = [
    ExpenseType.MAINTENANCE,
    ExpenseType.RENT,
    ExpenseType.SALARY,
    ExpenseType.OTHER,
  ];

  private validateTypeForNature(nature: ExpenseNature, type: ExpenseType | null | undefined) {
    if (!type) {
      throw new BadRequestException(
        nature === ExpenseNature.DIRECT
          ? 'Type is required for DIRECT expenses'
          : 'Type is required for INDIRECT expenses',
      );
    }

    if (nature === ExpenseNature.DIRECT && !this.DIRECT_TYPES.includes(type)) {
      throw new BadRequestException('Selected type is not allowed for DIRECT expenses');
    }

    if (nature === ExpenseNature.INDIRECT && !this.INDIRECT_TYPES.includes(type)) {
      throw new BadRequestException('Selected type is not allowed for INDIRECT expenses');
    }
  }

  async createExpense(dto: CreateExpenseDto, organizationId: number, userId: number): Promise<Expense> {
    const nature = dto.expenseNature ?? ExpenseNature.DIRECT;
    const type = dto.type ?? null;

    this.validateTypeForNature(nature, type);

    return this.prisma.expense.create({
      data: {
        description: dto.description,
        amount: dto.amount,
        type,
        expenseNature: nature,
        itemId: dto.itemId ?? null,
        userId,
        organizationId,
      },
      include: {
        item: true,
        user: true,
      },
    });
  }

  async getAllExpenses(): Promise<Expense[]> {
    return this.prisma.expense.findMany({
      include: {
        item: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getExpensesByOrganization(params: {
    organizationId: number;
    itemId?: number;
    userId?: number;
    type?: ExpenseType;
    expenseNature?: ExpenseNature;
  }): Promise<Expense[]> {
    const { organizationId, itemId, userId, type, expenseNature } = params;

    const where: any = { organizationId };
    if (itemId !== undefined) where.itemId = itemId;
    if (userId !== undefined) where.userId = userId;
    if (type !== undefined) where.type = type;
    if (expenseNature !== undefined) where.expenseNature = expenseNature;

    return this.prisma.expense.findMany({
      where,
      include: { item: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getExpenseById(id: number): Promise<Expense> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { item: true, user: true },
    });

    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }


  async updateExpense(id: number, dto: UpdateExpenseDto, userId: number): Promise<Expense> {
    const existing = await this.getExpenseById(id);

    const newNature = dto.expenseNature ?? existing.expenseNature;
    const newType = dto.type ?? existing.type;

    this.validateTypeForNature(newNature, newType as ExpenseType | null | undefined);

    const data: any = {
      description: dto.description ?? existing.description,
      amount: dto.amount ?? existing.amount,
      expenseNature: newNature,
      type: newType,
      itemId: dto.itemId !== undefined ? dto.itemId : existing.itemId,
      userId: userId !== undefined ? userId : existing.userId,
    };

    return this.prisma.expense.update({
      where: { id },
      data,
      include: { item: true, user: true },
    });
  }

  async deleteExpense(id: number): Promise<Expense> {
    await this.getExpenseById(id);
    return this.prisma.expense.delete({ where: { id } });
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto';
import { Expense, ExpenseType } from '@prisma/client';


@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expenseService: ExpensesService) {}

  @Post()
  async createItem(@Body() dto: CreateExpenseDto): Promise<Expense> {
    let organizationId = 1;
    return this.expenseService.createExpense(dto, organizationId);
  }
}
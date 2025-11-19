import { IsNotEmpty, IsOptional, IsNumber, IsEnum, IsInt, Min, ValidateIf } from 'class-validator';
import { ExpenseType, ExpenseNature } from '@prisma/client';

export class CreateExpenseDto {
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsNotEmpty()
  @IsEnum(ExpenseNature)
  expenseNature!: ExpenseNature;

  @IsNotEmpty()
  @IsEnum(ExpenseType)
  type!: ExpenseType; 

  @IsOptional()
  @IsInt()
  itemId?: number;
}

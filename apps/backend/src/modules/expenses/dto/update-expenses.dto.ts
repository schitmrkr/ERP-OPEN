import { IsOptional, IsNumber, IsEnum, IsInt, Min, IsNotEmpty, ValidateIf } from 'class-validator';
import { ExpenseType, ExpenseNature } from '@prisma/client';

export class UpdateExpenseDto {
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsEnum(ExpenseNature)
  expenseNature?: ExpenseNature;

  @ValidateIf(o => o.expenseNature === ExpenseNature.DIRECT)
  @IsEnum(ExpenseType)
  type?: ExpenseType; // required only if DIRECT

  @IsInt()
  @IsOptional()
  itemId?: number;
}

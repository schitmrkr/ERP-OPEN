import { IsNotEmpty, IsOptional, IsNumber, IsEnum, IsInt, Min, ValidateIf } from 'class-validator';
import { ExpenseType, ExpenseNature } from '@prisma/client';

export class CreateExpenseDto {
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsEnum(ExpenseNature)
  expenseNature?: ExpenseNature; // default to DIRECT

  @ValidateIf(o => o.expenseNature === ExpenseNature.DIRECT)
  @IsEnum(ExpenseType)
  type?: ExpenseType; // required only if DIRECT

  @IsOptional()
  @IsInt()
  itemId?: number;
}

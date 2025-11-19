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

  @IsOptional()
  @IsEnum(ExpenseType)
  type?: ExpenseType; 

  @IsInt()
  @IsOptional()
  itemId?: number;
}

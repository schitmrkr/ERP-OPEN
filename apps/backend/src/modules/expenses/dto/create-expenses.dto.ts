import { IsNotEmpty, IsOptional, IsNumber, IsEnum, IsInt, Min } from 'class-validator';
import { ExpenseType } from '@prisma/client';

export class CreateExpenseDto {
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsEnum(ExpenseType)
  type?: ExpenseType; 

  @IsOptional()
  @IsInt()
  itemId?: number;

  @IsOptional()
  @IsInt()
  userId?: number;
}

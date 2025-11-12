import { IsOptional, IsNumber, IsEnum, IsInt, Min, IsNotEmpty } from 'class-validator';
import { ExpenseType } from '@prisma/client';

export class UpdateExpenseDto {
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsEnum(ExpenseType)
  type?: ExpenseType;

  @IsOptional()
  @IsInt()
  itemId?: number | null;

  @IsOptional()
  @IsInt()
  userId?: number | null;
}


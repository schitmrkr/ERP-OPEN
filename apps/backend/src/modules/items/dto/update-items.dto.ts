import { IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateItemsDto {
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNumber()
  sellingPrice?: number;

  @IsOptional()
  @IsNumber()
  inventoryQty!: number;
}

import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateItemsDto {
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  sellingPrice!: number;

  @IsNotEmpty()
  inventoryQty!: number;
}



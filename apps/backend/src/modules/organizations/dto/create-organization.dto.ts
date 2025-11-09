import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateOrganizationWithOwnerDto {
  @IsNotEmpty()
  organizationName!: string;

  @IsNotEmpty()
  ownerName!: string;

  @IsEmail()
  ownerEmail!: string;

  @MinLength(6)
  ownerPassword!: string;
}

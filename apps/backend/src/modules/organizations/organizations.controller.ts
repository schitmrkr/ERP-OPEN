import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BootstrapGuard } from '../auth/guards/bootstrap.guard';
import { CreateOrganizationWithOwnerDto } from './dto/create-organization.dto';

@Controller('organizations')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @UseGuards(BootstrapGuard)
  @Post('create-with-owner')
  async createWithOwner(@Body() dto: CreateOrganizationWithOwnerDto) {
    return this.organizationService.createOrganizationWithOwner(dto);
  }
}

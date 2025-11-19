import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { OrganizationService } from './organizations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BootstrapGuard } from '../../common/guards/bootstrap.guard';
import { CreateOrganizationWithOwnerDto } from './dto/create-organization.dto';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private organizationService: OrganizationService,
    private readonly prisma: PrismaService
  ) {}

  // Create-with-owner only for bootstrap use
  @UseGuards(BootstrapGuard)
  @Post('create-with-owner')
  async createWithOwner(@Body() dto: CreateOrganizationWithOwnerDto) {
    return this.organizationService.createOrganizationWithOwner(dto);
  }

  // Create new org (admin/owner only, or disable for SaaS pattern)
  @UseGuards(JwtAuthGuard, BootstrapGuard)
  @Post()
  async create(@Body() body: { name: string }, @Request() req: any) {
    // Optionally add role check
    // Only OWNER/ADMIN allowed?
    return this.organizationService.createOrganization(body.name);
  }

  @UseGuards(JwtAuthGuard, BootstrapGuard)
  @Get()
  async findAll(@Request() req: any) {
    const userRole = req.user?.role;
    if (userRole === 'OWNER' || userRole === 'ADMIN') {
      return this.organizationService.listAll();
    } else {
      const orgId = await this._getUserOrgId(req);
      return this.organizationService.getOrganization(orgId);
    }
  }

  @UseGuards(JwtAuthGuard, BootstrapGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userRole = req.user?.role;
    if (userRole === 'OWNER' || userRole === 'ADMIN') {
      return this.organizationService.getOrganization(id);
    } else {
      const orgId = await this._getUserOrgId(req);
      if (orgId !== id) throw new NotFoundException('Access denied');
      return this.organizationService.getOrganization(id);
    }
  }

  @UseGuards(JwtAuthGuard, BootstrapGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string },
    @Request() req: any
  ) {
    const userRole = req.user?.role;
    let proceed = false;
    if (userRole === 'OWNER' || userRole === 'ADMIN') proceed = true;
    else {
      const orgId = await this._getUserOrgId(req);
      if (orgId === id) proceed = true;
    }
    if (!proceed) throw new NotFoundException('Access denied');
    return this.prisma.organization.update({ where: { id }, data: { ...body } });
  }

  @UseGuards(JwtAuthGuard, BootstrapGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userRole = req.user?.role;
    let proceed = false;
    if (userRole === 'OWNER' || userRole === 'ADMIN') proceed = true;
    else {
      const orgId = await this._getUserOrgId(req);
      if (orgId === id) proceed = true;
    }
    if (!proceed) throw new NotFoundException('Access denied');
    return this.prisma.organization.delete({ where: { id } });
  }

  private async _getUserOrgId(req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user.organizationId;
  }
}

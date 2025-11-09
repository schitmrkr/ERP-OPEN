import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateOrganizationWithOwnerDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async createOrganization(name: string) {
    return this.prisma.organization.create({
      data: { name },
    });
  }

  async getOrganization(id: number) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return this.prisma.organization.findUnique({ where: { name } });
  }

  async listAll() {
    return this.prisma.organization.findMany();
  }

  async createOrganizationWithOwner(dto: CreateOrganizationWithOwnerDto) {
    const existingOrg = await this.prisma.organization.findUnique({
      where: { name: dto.organizationName }
    });

    if (existingOrg) {
      throw new BadRequestException('Organization name already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: dto.organizationName }
      });

      const existingOwner = await tx.user.findFirst({
        where: { organizationId: organization.id, role: 'OWNER' }
      });

      if (existingOwner) {
        throw new BadRequestException('Organization already has an owner');
      }

      const hashed = await bcrypt.hash(dto.ownerPassword, 10);

      const owner = await tx.user.create({
        data: {
          name: dto.ownerName,
          email: dto.ownerEmail,
          password: hashed,
          role: 'OWNER',
          organizationId: organization.id,
        },
      });

      return { organization, owner };
    });
  }

  /**
   * Ensure a default org exists, returns it.
   * Call this on app bootstrap.
   */
  async ensureDefaultOrganization() {
    const DEFAULT_NAME = 'Default Organization';
    let org = await this.findByName(DEFAULT_NAME);
    if (!org) {
      org = await this.createOrganization(DEFAULT_NAME);
    }
    return org;
  }
}

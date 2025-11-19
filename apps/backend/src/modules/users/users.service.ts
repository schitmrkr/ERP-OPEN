import { Injectable } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { mapPrismaError } from '../../common/exceptions/primsa-error.mapper';
import { NotFoundException } from '../../common/exceptions/common.exceptions';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto, organizationId: number): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      return await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: dto.role || UserRole.CASHIER,
          organization: { connect: { id: organizationId } },
        },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async getUsersByOrganization(
    organizationId: number,
  ): Promise<Omit<User, 'password'>[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: { organizationId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return users as Omit<User, 'password'>[];
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User');
      return user;
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    try {
      const data: any = { ...dto };
      if (dto.password) {
        data.password = await bcrypt.hash(dto.password, 10);
      }

      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async deleteUser(id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  private prisma = new PrismaClient();

  async createUser(dto: CreateUserDto, organizationId: number): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role || UserRole.CASHIER,
        organization: {
          connect: { id: organizationId }
        }
      },
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUsersByOrganization(organizationId: number): Promise<Omit<User, 'password'>[]> {
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
        // Exclude password
      },
    });
    return users as Omit<User, 'password'>[];
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    const data: any = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe, UseGuards, Request, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../../shared/prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService
  ) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Post()
  async createUser(@Body() dto: CreateUserDto, @Request() req: any): Promise<User> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    return this.userService.createUser(dto, user.organizationId);
  }

  @Get()
  async getAllUsers(@Request() req: any): Promise<Omit<User, 'password'>[]> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    // Return users from same organization
    return this.userService.getUsersByOrganization(user.organizationId);
  }

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<Omit<User, 'password'>> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const currentUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) throw new NotFoundException('User not found');
    
    const targetUser = await this.userService.getUserById(id);
    
    // Users can only see users from their organization
    if (targetUser.organizationId !== currentUser.organizationId) {
      throw new NotFoundException('User not found');
    }
    
    return targetUser;
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Request() req: any
  ): Promise<Omit<User, 'password'>> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const currentUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) throw new NotFoundException('User not found');
    
    const targetUser = await this.userService.getUserById(id);
    
    // Users can only update users from their organization
    if (targetUser.organizationId !== currentUser.organizationId) {
      throw new NotFoundException('User not found');
    }
    
    // Only OWNER/ADMIN can update users (except users can update themselves for non-role fields)
    if (targetUser.id !== currentUser.id) {
      if (currentUser.role !== 'OWNER' && currentUser.role !== 'ADMIN') {
        throw new ForbiddenException('Only owners and admins can update other users');
      }
    }
    
    // Only OWNER/ADMIN can update roles
    if (dto.role && dto.role !== targetUser.role) {
      if (currentUser.role !== 'OWNER' && currentUser.role !== 'ADMIN') {
        throw new ForbiddenException('Only owners and admins can change user roles');
      }
    }
    
    return this.userService.updateUser(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<Omit<User, 'password'>> {
    const userId = req.user?.userId;
    if (!userId) throw new NotFoundException('User not found in token');
    const currentUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) throw new NotFoundException('User not found');
    
    const targetUser = await this.userService.getUserById(id);
    
    // Users can only delete users from their organization
    if (targetUser.organizationId !== currentUser.organizationId) {
      throw new NotFoundException('User not found');
    }
    
    // Cannot delete yourself
    if (targetUser.id === currentUser.id) {
      throw new ForbiddenException('Cannot delete yourself');
    }
    
    return this.userService.deleteUser(id);
  }
}

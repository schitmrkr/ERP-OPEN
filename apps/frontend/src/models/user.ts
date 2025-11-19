export type UserRole = 'OWNER' | 
                       'ADMIN' | 
                       'MANAGER' | 
                       'CASHIER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}


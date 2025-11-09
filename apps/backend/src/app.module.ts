import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/users.module';
import { ItemModule } from './modules/items/items.module';
import { ExpenseModule } from './modules/expenses/expenses.module';
import { OrderModule } from './modules/orders/orders.module';
import { OrganizationModule } from './modules/organizations/organizations.module';
import { AuthModule } from './modules/auth/auth.module';

import { PrismaModule } from './shared/prisma/prisma.module'

@Module({
  imports: [
    UserModule, 
    ItemModule, 
    ExpenseModule, 
    OrderModule, 
    OrganizationModule,
    AuthModule,
    PrismaModule
  ],  
  controllers: [],
  providers: [],
})
export class AppModule {}

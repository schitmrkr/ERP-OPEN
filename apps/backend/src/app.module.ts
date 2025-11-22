import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/users.module';
import { ItemModule } from './modules/items/items.module';
import { ExpenseModule } from './modules/expenses/expenses.module';
import { OrderModule } from './modules/orders/orders.module';
import { OrganizationModule } from './modules/organizations/organizations.module';
import { AuthModule } from './modules/auth/auth.module';
import { StatModule } from './modules/stats/stats.module';
import { AnalyticModule } from './modules/analytics/analytics.module';

import { HealthModule } from './modules/health/health.module';

import { PrismaModule } from './shared/prisma/prisma.module';

@Module({
  imports: [
    HealthModule,
    UserModule, 
    ItemModule, 
    ExpenseModule, 
    OrderModule, 
    OrganizationModule,
    AuthModule,
    StatModule,
    PrismaModule,
    AnalyticModule
  ],  
  controllers: [],
  providers: [],
})
export class AppModule {}

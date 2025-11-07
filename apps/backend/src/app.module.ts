import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/users.module';
import { ItemModule } from './modules/items/items.module';
import { ExpenseModule } from './modules/expenses/expenses.module';
import { OrderModule } from 'modules/orders/orders.module';

@Module({
  imports: [UserModule, ItemModule, ExpenseModule, OrderModule],  
  controllers: [],
  providers: [],
})
export class AppModule {}

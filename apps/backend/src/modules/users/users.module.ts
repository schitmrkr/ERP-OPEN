import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // export if other modules need userService
})
export class UserModule {}

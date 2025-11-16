import { Module } from '@nestjs/common';
import { StatService } from './stats.service';
import { StatController } from './stats.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [StatController],
  providers: [StatService, PrismaService],
  exports: [StatService],
})
export class StatModule {}
import { Module } from '@nestjs/common';
import { AnalyticService } from './analytics.service';
import { AnalyticController } from './analytics.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticController],
  providers: [AnalyticService, PrismaService],
  exports: [AnalyticService],
})
export class AnalyticModule {}
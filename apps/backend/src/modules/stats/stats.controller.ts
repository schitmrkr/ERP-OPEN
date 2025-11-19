import {
    Controller,
    Get,
    Query,
    UseGuards,
    Request,
    BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StatService } from './stats.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatController {
constructor(private statService: StatService) {}

@Get('dashboard')
async getDashboardStats(@Request() req: any):  Promise<DashboardStatsDto> {
    const organizationId = req.user.organizationId;
    if (!organizationId) {
    throw new BadRequestException('Organization not found in user context');
    }
    return this.statService.getDashboardStats(organizationId);
}

@Get('chart')
async getChartStats(
    @Request() req: any,
    @Query('range') range: 'daily' | 'weekly' | 'monthly' | 'yearly',
) {
    const organizationId = req.user.organizationId;

    if (!range) {
    throw new BadRequestException('range must be daily, monthly or yearly');
    }

    return this.statService.getSalesExpensesChart(organizationId, range);
}
}
  
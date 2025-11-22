import {
    Controller,
    Get,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticService } from './analytics.service';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticController {
constructor(private analyticService: AnalyticService) {}
    @Get('item-cost-analytics')
    async getItemCostAnalytics(
        @Request() req: any
    ) {
        const organizationId: number = req.user.organizationId;
        return this.analyticService.getOrganizationItemCostAnalytics(organizationId);
    }
}
  
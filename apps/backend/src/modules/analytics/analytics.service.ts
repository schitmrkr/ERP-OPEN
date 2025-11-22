import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { GET_ITEM_COST_ANALYTICS_QUERY } from './queries';

@Injectable()
export class AnalyticService {
  constructor(private prisma: PrismaService) {}

  async getOrganizationItemCostAnalytics(organizationId: number) {
    const result = await this.prisma.$queryRawUnsafe(GET_ITEM_COST_ANALYTICS_QUERY, organizationId);
    return result;
  }

}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';

@Injectable()
export class ItemCostService {
    constructor(private readonly prisma: PrismaService) {}

    async getItemCostAnalytics(orgId: number) {
        return this.prisma.$queryRaw`
            SELECT * FROM "Item" WHERE organizationId = ${orgId}
        `;
    }
}


import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class StatService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(organizationId: number) {
    const [orders, expenses, items] = await Promise.all([
      this.prisma.order.findMany({ where: { organizationId } }),
      this.prisma.expense.findMany({ where: { organizationId } }),
      this.prisma.item.findMany({ where: { organizationId } }),
    ]);

    const totalOrders = orders.length;
    const totalSales = orders
      .filter((o) => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const totalItems = items.length;
    const avgItemPrice =
      totalItems > 0
        ? items.reduce((s, i) => s + i.sellingPrice, 0) / totalItems
        : 0;

    const recentOrders = orders
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    const topItems = [...items]
      .sort((a, b) => b.sellingPrice - a.sellingPrice)
      .slice(0, 5);

    // ========= TIME WINDOWS =========
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const toDate = (d: any) => new Date(d);

    // Weekly
    const weeklyOrdersList = orders.filter(o => toDate(o.createdAt) >= startOfWeek);
    const weeklySales = weeklyOrdersList
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const weeklyExpenses = expenses
      .filter(e => toDate(e.createdAt) >= startOfWeek)
      .reduce((sum, e) => sum + e.amount, 0);

    // Monthly
    const monthlyOrdersList = orders.filter(o => toDate(o.createdAt) >= startOfMonth);
    const monthlySales = monthlyOrdersList
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const monthlyExpenses = expenses
      .filter(e => toDate(e.createdAt) >= startOfMonth)
      .reduce((sum, e) => sum + e.amount, 0);

    // Yearly
    const yearlyOrdersList = orders.filter(o => toDate(o.createdAt) >= startOfYear);
    const yearlySales = yearlyOrdersList
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const yearlyExpenses = expenses
      .filter(e => toDate(e.createdAt) >= startOfYear)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalOrders,
      totalSales,
      pendingOrders,
      totalExpenses,
      totalItems,
      avgItemPrice,
      recentOrders,
      topItems,

      weekly: {
        orders: weeklyOrdersList.length,
        sales: weeklySales,
        expenses: weeklyExpenses,
      },
      monthly: {
        orders: monthlyOrdersList.length,
        sales: monthlySales,
        expenses: monthlyExpenses,
      },
      yearly: {
        orders: yearlyOrdersList.length,
        sales: yearlySales,
        expenses: yearlyExpenses,
      },
    };
  }


  async getSalesExpensesChart(
    organizationId: number,
    range: 'daily' | 'weekly' | 'monthly' | 'yearly',
  ) {
    const orders = await this.prisma.order.findMany({
      where: {
        organizationId,
        status: 'COMPLETED',
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });
  
    const expenses = await this.prisma.expense.findMany({
      where: { organizationId },
      select: {
        amount: true,
        createdAt: true,
      },
    });
  
    const groupByTime = (items: { createdAt: Date; totalAmount?: number; amount?: number }[]) => {
      const grouped: Record<string, number> = {};
      items.forEach((item) => {
        const date = new Date(item.createdAt);
        let key = '';
        if (range === 'daily') {
          key = date.toISOString().slice(0, 10); // YYYY-MM-DD
        } else if (range === 'weekly') {
            // Get ISO week number
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
            const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            key = `${date.getFullYear()}-W${weekNumber}`;
        } else if (range === 'monthly') {
          key = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
        } else if (range === 'yearly') {
          key = `${date.getFullYear()}`; // YYYY
        }
        const value = item.totalAmount ?? item.amount ?? 0;
        grouped[key] = (grouped[key] || 0) + value;
      });
      return Object.entries(grouped)
        .map(([key, total]) => ({ key, total }))
        .sort((a, b) => (a.key > b.key ? 1 : -1));
    };
  
    return {
        data: {
            range,
            sales: groupByTime(orders),
            expenses: groupByTime(expenses),
        }
    };
  }
  
}

import { Order, Item } from '@prisma/client';

export class TimeStatsDto {
  orders: number;
  sales: number;
  expenses: number;

  constructor(orders: number, sales: number, expenses: number) {
    this.orders = orders;
    this.sales = sales;
    this.expenses = expenses;
  }
}
 
export class DashboardStatsDto {
  totalOrders: number;
  totalSales: number;
  pendingOrders: number;
  totalExpenses: number;
  totalItems: number;
  avgItemPrice: number;

  recentOrders: Order[];
  topItems: Item[];

  weekly: TimeStatsDto;
  monthly: TimeStatsDto;
  yearly: TimeStatsDto;

  constructor(
    totalOrders: number,
    totalSales: number,
    pendingOrders: number,
    totalExpenses: number,
    totalItems: number,
    avgItemPrice: number,
    recentOrders: Order[],
    topItems: Item[],
    weekly: TimeStatsDto,
    monthly: TimeStatsDto,
    yearly: TimeStatsDto,
  ) {
    this.totalOrders = totalOrders;
    this.totalSales = totalSales;
    this.pendingOrders = pendingOrders;
    this.totalExpenses = totalExpenses;
    this.totalItems = totalItems;
    this.avgItemPrice = avgItemPrice;
    this.recentOrders = recentOrders;
    this.topItems = topItems;
    this.weekly = weekly;
    this.monthly = monthly;
    this.yearly = yearly;
  }
}

  
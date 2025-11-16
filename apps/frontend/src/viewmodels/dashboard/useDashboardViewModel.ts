import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { type Order } from "../../models/order";
import { type Item } from "../../models/items";

import { type ChartData, type ChartDataPoint } from "../../models/dashboard";

export const useDashboardViewModel = () => {
  const [loading, setLoading] = useState(false);

  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [averageItemPrice, setAverageItemPrice] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topItems, setTopItems] = useState<Item[]>([]);

  const [weeklyOrders, setWeeklyOrders] = useState(0);
  const [weeklySales, setWeeklySales] = useState(0);
  const [weeklyExpenses, setWeeklyExpenses] = useState(0);

  const [monthlyOrders, setMonthlyOrders] = useState(0);
  const [monthlySales, setMonthlySales] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);

  const [yearlyOrders, setYearlyOrders] = useState(0);
  const [yearlySales, setYearlySales] = useState(0);
  const [yearlyExpenses, setYearlyExpenses] = useState(0);

  const [chartData, setChartData] = useState<ChartData | null>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/stats/dashboard`, {
        headers: getAuthHeaders(),
      });
      const data = res.data;

      setTotalOrders(data.totalOrders);
      setTotalSales(data.totalSales);
      setPendingOrders(data.pendingOrders);
      setTotalExpenses(data.totalExpenses);
      setTotalItems(data.totalItems);
      setAverageItemPrice(data.avgItemPrice);
      setRecentOrders(data.recentOrders);
      setTopItems(data.topItems);

      setWeeklyOrders(data.weekly.orders);
      setWeeklySales(data.weekly.sales);
      setWeeklyExpenses(data.weekly.expenses);

      setMonthlyOrders(data.monthly.orders);
      setMonthlySales(data.monthly.sales);
      setMonthlyExpenses(data.monthly.expenses);

      setYearlyOrders(data.yearly.orders);
      setYearlySales(data.yearly.sales);
      setYearlyExpenses(data.yearly.expenses);
    } catch (err: any) {
      console.error(err instanceof AxiosError ? err.response?.data?.message : err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async (range: "daily" | "weekly" | "monthly" | "yearly") => {
    try {
      const res = await axios.get<{ data: ChartData }>(`${BACKEND_URL}/api/stats/chart`, {
        headers: getAuthHeaders(),
        params: { range },
      });
  
      const { sales = [], expenses = [] } = res.data?.data || {};
  
      const allDates = Array.from(
        new Set([...sales.map(s => s.key), ...expenses.map(e => e.key)])
      ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      const normalize = (data: ChartDataPoint[]) => {
        const map = Object.fromEntries(data.map(d => [d.key, d.total]));
        return allDates.map(date => ({
          key: date,
          total: map[date] ?? 0, 
        }));
      };
  
      setChartData({
        range: res.data.data.range,
        sales: normalize(sales),
        expenses: normalize(expenses),
      });
    } catch (err: any) {
      console.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message
          : err.message || err
      );
    }
  };
  

  useEffect(() => {
    fetchDashboardData();
    fetchChartData("daily");
  }, []);

  return {
    loading,
    totalOrders,
    totalSales,
    pendingOrders,
    totalExpenses,
    totalItems,
    averageItemPrice,
    recentOrders,
    topItems,
    weeklyOrders,
    weeklySales,
    weeklyExpenses,
    monthlyOrders,
    monthlySales,
    monthlyExpenses,
    yearlyOrders,
    yearlySales,
    yearlyExpenses,
    chartData,
    fetchChartData,
    refresh: fetchDashboardData,
  };
};

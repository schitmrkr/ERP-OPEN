import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { type Order, OrderStatus } from "../../models/order";
import { type Expense } from "../../models/expense";
import { type Item } from "../../models/items";

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

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch orders, expenses, and items in parallel
      const [ordersRes, expensesRes, itemsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/orders`, {
          headers: getAuthHeaders(),
        }),
        axios.get(`${BACKEND_URL}/api/expenses`, {
          headers: getAuthHeaders(),
        }),
        axios.get(`${BACKEND_URL}/api/items`, {
          headers: getAuthHeaders(),
        }),
      ]);

      const orders: Order[] = ordersRes.data;
      const expenses: Expense[] = expensesRes.data;
      const items: Item[] = itemsRes.data;

      // Calculate metrics
      const total = orders.length;
      const sales = orders
        .filter((o) => o.status === OrderStatus.COMPLETED)
        .reduce((sum, o) => sum + o.totalAmount, 0);
      const pending = orders.filter((o) => o.status === OrderStatus.PENDING).length;
      const expensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

      // Calculate items stats
      const itemsTotal = items.length;
      const avgPrice =
        itemsTotal > 0
          ? items.reduce((sum, item) => sum + item.sellingPrice, 0) / itemsTotal
          : 0;

      // Get top items by price (top 5)
      const top = [...items]
        .sort((a, b) => b.sellingPrice - a.sellingPrice)
        .slice(0, 5);

      // Get recent orders (last 5, sorted by date)
      const recent = [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setTotalOrders(total);
      setTotalSales(sales);
      setPendingOrders(pending);
      setTotalExpenses(expensesTotal);
      setTotalItems(itemsTotal);
      setAverageItemPrice(avgPrice);
      setRecentOrders(recent);
      setTopItems(top);
    } catch (err: any) {
      console.error(
        err instanceof AxiosError ? err.response?.data?.message : err.message || err
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
    refresh: fetchDashboardData,
  };
};


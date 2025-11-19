import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import ERPSidebar, { collapsedWidth, drawerWidth } from "../../components/sidebar/ERPSidebar";
import { useDashboardViewModel } from "../../../viewmodels/dashboard/useDashboardViewModel";
import { OrderStatus } from "../../../models/order";
import { useUIStore } from "../../../stores/uiStore";

const DashboardView: React.FC = () => {
  const {
    loading,
    totalOrders,
    totalSales,
    pendingOrders,
    totalExpenses,
    totalItems,
    averageItemPrice,
    recentOrders,
    topItems,
    weeklySales,
    weeklyExpenses,
    monthlySales,
    monthlyExpenses,
    yearlySales,
    yearlyExpenses,
    chartData,
    fetchChartData,
  } = useDashboardViewModel();

  const [chartRange, setChartRange] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const tabLabels: ("daily" | "weekly" | "monthly" | "yearly")[] = ["daily", "weekly", "monthly", "yearly"];

  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const isCollapsed = isSidebarCollapsed;

  const formatCurrency = (amount: number) => !Number.isFinite(amount) ? "Rs. 0.00" : `Rs. ${amount.toFixed(2)}`;

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return "success";
      case OrderStatus.CANCELLED:
        return "error";
      default:
        return "warning";
    }
  };

  const metrics = [
    { title: "Total Orders", value: totalOrders.toString() },
    { title: "Total Sales", value: formatCurrency(totalSales) },
    { title: "Pending Orders", value: pendingOrders.toString() },
    { title: "Total Expenses", value: formatCurrency(totalExpenses) },
    { title: "Total Items", value: totalItems.toString() },
    { title: "Avg Item Price", value: formatCurrency(averageItemPrice) },
  ];

  useEffect(() => {
    fetchChartData(chartRange);
  }, [chartRange]);

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    const ranges: ("daily" | "weekly" | "monthly" | "yearly")[] = ["daily", "weekly", "monthly", "yearly"];
    setChartRange(ranges[value]);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <ERPSidebar isCollapsed={isCollapsed} toggleCollapse={toggleSidebar} />

      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 4 },
          overflowY: "auto",
          transition: "margin 300ms ease",
          marginLeft: isCollapsed ? `${collapsedWidth}px` : `${drawerWidth}px`,
          bgcolor: "background.default",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Metrics */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {metrics.map((metric) => (
                <Paper
                  key={metric.title}
                  elevation={3}
                  sx={{
                    p: 2,
                    flex: { xs: "1 1 100%", sm: "1 1 200px" },
                    minWidth: 200,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary">
                    {metric.title}
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>
                    {metric.value}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* Chart with Tabs */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Sales vs Expenses
              </Typography>
              <Tabs
                value={["daily", "weekly", "monthly", "yearly"].indexOf(chartRange)}
                onChange={handleTabChange}
                sx={{ mb: 2 }}
                variant="scrollable"
                scrollButtons="auto"
              >
                {tabLabels.map((label) => (
                  <Tab key={label} label={label.charAt(0).toUpperCase() + label.slice(1)} />
                ))}
              </Tabs>

              {chartData && chartData.sales.length > 0 && chartData.expenses.length > 0 ? (
                <>
                  <LineChart
                    height={250}
                    series={[
                      { data: chartData.expenses.map((p) => p.total), label: "Expenses", shape: "cross", color: "#F44336" },
                      { data: chartData.sales.map((p) => p.total), label: "Sales", shape: "diamond", color: "#2196F3" },
                    ]}
                    xAxis={[{ data: chartData.sales.map((p) => p.key), scaleType: "point" }]}
                    yAxis={[{ label: "Amount (Rs.)" }]}
                    margin={{ right: 24 }}
                  />
                  <LineChart
                    height={250}
                    series={[
                      {
                        data: chartData.sales.map((p, i) => {
                          const sale = Number(p.total) || 0;
                          const expense = Number(chartData.expenses[i]?.total) || 0;
                          return sale - expense;
                        }),
                        label: "Profit",
                        shape: "star",
                        color: "#9C27B0",
                      },
                    ]}
                    xAxis={[{ data: chartData.sales.map((p) => p.key), scaleType: "point" }]}
                    yAxis={[{ label: "Profit (Rs.)" }]}
                    margin={{ right: 24 }}
                  />
                </>
              ) : (
                <Typography color="text.secondary">No chart data available</Typography>
              )}
            </Box>

            {/* Profit Metrics */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 4 }}>
              {[
                {
                  title: "Today's Profit",
                  value:
                    chartData && chartData.sales.length > 0 && chartData.expenses.length > 0
                      ? `Rs. ${(Number(chartData.sales.at(-1)?.total) - Number(chartData.expenses.at(-1)?.total || 0)).toFixed(2)}`
                      : "Rs. 0.00",
                },
                { title: "Weekly Profit", value: `Rs. ${(weeklySales - weeklyExpenses).toFixed(2)}` },
                { title: "Monthly Profit", value: `Rs. ${(monthlySales - monthlyExpenses).toFixed(2)}` },
                { title: "Yearly Profit", value: `Rs. ${(yearlySales - yearlyExpenses).toFixed(2)}` },
              ].map((metric) => (
                <Paper
                  key={metric.title}
                  elevation={3}
                  sx={{
                    p: 2,
                    flex: { xs: "1 1 100%", sm: "1 1 200px" },
                    minWidth: 200,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary">
                    {metric.title}
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>
                    {metric.value}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* Recent Orders & Top Items */}
            <Box sx={{ mt: 4, display: "flex", flexWrap: "wrap", gap: 2 }}>
              {/* Recent Orders */}
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 400px" }, minWidth: 300 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Orders
                </Typography>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                  {recentOrders.length === 0 ? (
                    <Typography color="text.secondary">No recent orders to display.</Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {recentOrders.map((order) => (
                        <Box
                          key={order.id}
                          sx={{
                            p: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between",
                            alignItems: { xs: "flex-start", sm: "center" },
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1">{order.orderNumber}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {order.user?.name} • {new Date(order.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: { xs: 1, sm: 0 } }}>
                            <Typography variant="h6" color="primary">
                              {formatCurrency(order.totalAmount)}
                            </Typography>
                            <Chip label={order.status} color={getStatusColor(order.status) as any} size="small" />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Box>

              {/* Top Items */}
              <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 400px" }, minWidth: 300 }}>
                <Typography variant="h6" gutterBottom>
                  Top Items by Price
                </Typography>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                  {topItems.length === 0 ? (
                    <Typography color="text.secondary">No items to display.</Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {topItems.map((item, index) => (
                        <Box
                          key={item.id}
                          sx={{
                            p: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between",
                            alignItems: { xs: "flex-start", sm: "center" },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="h6" color="primary" sx={{ minWidth: 30 }}>
                              #{index + 1}
                            </Typography>
                            <Box>
                              <Typography variant="subtitle1">{item.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Item ID: {item.id}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="h6" color="primary" sx={{ mt: { xs: 1, sm: 0 } }}>
                            {formatCurrency(item.sellingPrice)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default DashboardView;

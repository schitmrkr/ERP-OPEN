import React, { useState } from "react";
import { Box, Paper, Typography, CircularProgress, Chip } from "@mui/material";
import ERPSidebar from "../../components/sidebar/ERPSidebar";
import { useDashboardViewModel } from "../../../viewmodels/dashboard/useDashboardViewModel";
import { OrderStatus } from "../../../models/order";

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
  } = useDashboardViewModel();

  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

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

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <ERPSidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />

      <Box sx={{ flex: 1, p: 4, bgcolor: "background.default" }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {metrics.map((metric) => (
                <Paper
                  key={metric.title}
                  elevation={3}
                  sx={{
                    p: 3,
                    flex: "1 1 200px",
                    minWidth: 200,
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
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

            {/* Two Column Layout for Recent Orders and Top Items */}
            <Box sx={{ mt: 4, display: "flex", gap: 3, flexWrap: "wrap" }}>
              {/* Recent Orders */}
              <Box sx={{ flex: "1 1 400px", minWidth: 300 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Orders
                </Typography>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                  {recentOrders.length === 0 ? (
                    <Typography color="text.secondary">
                      No recent orders to display.
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {recentOrders.map((order) => (
                        <Box
                          key={order.id}
                          sx={{
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1">
                              {order.orderNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {order.user?.name} • {new Date(order.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                            <Typography variant="h6" color="primary">
                              {formatCurrency(order.totalAmount)}
                            </Typography>
                            <Chip
                              label={order.status}
                              color={getStatusColor(order.status) as any}
                              size="small"
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Box>

              {/* Top Items */}
              <Box sx={{ flex: "1 1 400px", minWidth: 300 }}>
                <Typography variant="h6" gutterBottom>
                  Top Items by Price
                </Typography>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                  {topItems.length === 0 ? (
                    <Typography color="text.secondary">
                      No items to display.
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {topItems.map((item, index) => (
                        <Box
                          key={item.id}
                          sx={{
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Typography
                              variant="h6"
                              color="primary"
                              sx={{ minWidth: 30 }}
                            >
                              #{index + 1}
                            </Typography>
                            <Box>
                              <Typography variant="subtitle1">
                                {item.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Item ID: {item.id}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="h6" color="primary">
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

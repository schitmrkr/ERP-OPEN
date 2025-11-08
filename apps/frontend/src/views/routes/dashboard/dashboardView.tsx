import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";

const DashboardView: React.FC = () => {
  const metrics = [
    { title: "Total Orders", value: 120 },
    { title: "Total Sales", value: "$15,200" },
    { title: "Pending Orders", value: 8 },
    { title: "Expenses", value: "$3,400" },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          bgcolor: "primary.main",
          color: "white",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6">ERP Menu</Typography>
        <Button color="inherit">Dashboard</Button>
        <Button color="inherit">Orders</Button>
        <Button color="inherit">Items</Button>
        <Button color="inherit">Expenses</Button>
        <Button color="inherit">Users</Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4, bgcolor: "background.default" }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {/* Metrics */}
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

        {/* Optional Recent Orders */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recent Orders
          </Typography>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography color="text.secondary">No recent orders to display.</Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardView;

import React, { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import ERPSidebar from "../../components/sidebar/ERPSidebar"

const DashboardView: React.FC = () => {
  const metrics = [
    { title: "Total Orders", value: 120 },
    { title: "Total Sales", value: "$15,200" },
    { title: "Pending Orders", value: 8 },
    { title: "Expenses", value: "$3,400" },
  ];

  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = async () => {
    setIsCollapsed(!isCollapsed);
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <ERPSidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse}/>

      <Box sx={{ flex: 1, p: 4, bgcolor: "background.default" }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

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

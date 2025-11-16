import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  IconButton
} from "@mui/material";
import NotificationBox from "../../components/NotificationBox";
import { Edit2, Trash2 } from "lucide-react";
import ERPSidebar from "../../components/sidebar/ERPSidebar";
import { useItemsViewModel } from "../../../viewmodels/items/useItemsViewModel";
import { collapsedWidth, drawerWidth } from "../../components/sidebar/ERPSidebar";

import { useUIStore } from "../../../stores/uiStore";

const ItemsView: React.FC = () => {
  const { 
    items,
    loading,
    name,
    setName,
    sellingPrice,
    setSellingPrice,
    save,
    remove,
    editItem,
    notification,
    setNotification,
  } = useItemsViewModel();

  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const isCollapsed = isSidebarCollapsed;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <ERPSidebar isCollapsed={isCollapsed} toggleCollapse={toggleSidebar} />

      <Box sx={{  flex: 1,
                  p: 4, 
                  overflowY: 'auto',
                  transition: 'margin 300ms ease',
                  marginLeft: isCollapsed ? `${collapsedWidth}px` : `${drawerWidth}px`,
                  bgcolor: "background.default" }}>
        <Typography variant="h4" gutterBottom>
          Items
        </Typography>

        {notification && (
          <NotificationBox
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Create/Edit Form */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 1, display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Selling Price"
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(parseFloat(e.target.value))}
            sx={{ width: 150 }}
          />
          <Button
            variant="contained"
            onClick={save}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </Paper>

        {/* Items List */}
        {items.map((item) => (
          <Paper
            key={item.id}
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: 1,
            }}
          >
            <Box>
              <Typography variant="subtitle1">{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Rs. {item.sellingPrice.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={() => editItem(item)}>
                <Edit2 size={20} />
              </IconButton>
              <IconButton onClick={() => remove(item.id)}>
                <Trash2 size={20} />
              </IconButton>
            </Box>
          </Paper>
        ))}

        {items.length === 0 && !loading && (
          <Typography color="text.secondary">No items found.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ItemsView;

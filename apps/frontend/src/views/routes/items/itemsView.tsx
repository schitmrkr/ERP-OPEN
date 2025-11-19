import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import NotificationBox from "../../components/NotificationBox";
import { Edit2, Trash2 } from "lucide-react";
import ERPSidebar, { collapsedWidth, drawerWidth } from "../../components/sidebar/ERPSidebar";
import { useItemsViewModel } from "../../../viewmodels/items/useItemsViewModel";
import { useUIStore } from "../../../stores/uiStore";

const ItemsView: React.FC = () => {
  const {
    items,
    loading,
    name,
    setName,
    sellingPrice,
    setSellingPrice,
    inventoryQty,
    setInventoryQty,
    save,
    remove,
    editItem,
    notification,
    setNotification,
    avgCostPrices,
    loadingAvgCost,
  } = useItemsViewModel();

  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const isCollapsed = isSidebarCollapsed;

  const isMobile = useMediaQuery("(max-width: 768px)");

  const getItemAvgCost = (itemId: number) => {
    return avgCostPrices?.items.find((i) => i.itemId === itemId)?.avgCostPrice ?? 0;
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <ERPSidebar isCollapsed={isCollapsed} toggleCollapse={toggleSidebar} />

      <Box
        sx={{
          flex: 1,
          p: isMobile ? 2 : 4,
          overflowY: "auto",
          transition: "margin 300ms ease",
          marginLeft: isMobile
            ? `${collapsedWidth}px`
            : isCollapsed
            ? `${collapsedWidth}px`
            : `${drawerWidth}px`,
          bgcolor: "background.default",
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
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
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 1,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            label="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            fullWidth={isMobile}
            label="Selling Price"
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(parseFloat(e.target.value))}
            sx={{ width: isMobile ? "100%" : 150 }}
          />

          <TextField
            fullWidth={isMobile}
            label="Inventory Qty"
            type="number"
            value={inventoryQty}
            onChange={(e) => setInventoryQty(parseInt(e.target.value) || 0)}
            sx={{ width: isMobile ? "100%" : 150 }}
          />

          <Button
            variant="contained"
            onClick={save}
            disabled={loading}
            fullWidth={isMobile}
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
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 2 : 0,
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              borderRadius: 1,
            }}
          >
            <Box>
              <Typography variant="subtitle1">{item.name}</Typography>

              <Typography variant="body2" color="text.secondary">
                Selling Price: Rs. {item.sellingPrice.toFixed(2)}
              </Typography>

              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Inventory: <strong>{item.inventoryQty}</strong>
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Avg Cost Price: Rs. {loadingAvgCost ? "..." : getItemAvgCost(item.id).toFixed(2)}
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

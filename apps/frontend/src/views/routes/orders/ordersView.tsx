import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from "@mui/material";
import { Edit2, Trash2, Plus, X } from "lucide-react";
import ERPSidebar from "../../components/sidebar/ERPSidebar";
import { useOrdersViewModel } from "../../../viewmodels/orders/useOrdersViewModel";
import { OrderStatus } from "../../../models/order";

const OrdersView: React.FC = () => {
  const { 
    orders,
    items,
    loading,
    orderNumber,
    setOrderNumber,
    orderItems,
    addOrderItem,
    removeOrderItem,
    updateOrderItem,
    editingId,
    status,
    setStatus,
    save,
    remove,
    editOrder
  } = useOrdersViewModel();

  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
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

  const calculateTotal = () => {
    return orderItems.reduce((sum, oi) => sum + (oi.quantity * oi.price), 0);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <ERPSidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />

      <Box sx={{ flex: 1, p: 4, bgcolor: "background.default" }}>
        <Typography variant="h4" gutterBottom>
          Orders
        </Typography>

        {/* Create/Edit Form */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          {editingId ? (
            <>
              <TextField
                label="Order Number"
                value={orderNumber}
                disabled
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  label="Status"
                >
                  <MenuItem value={OrderStatus.PENDING}>Pending</MenuItem>
                  <MenuItem value={OrderStatus.COMPLETED}>Completed</MenuItem>
                  <MenuItem value={OrderStatus.CANCELLED}>Cancelled</MenuItem>
                </Select>
              </FormControl>
            </>
          ) : (
            <>
              <TextField
                label="Order Number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                fullWidth
              />
              <Typography variant="subtitle2" gutterBottom>
                Order Items
              </Typography>
              {orderItems.map((oi, index) => (
                <Box key={index} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Item</InputLabel>
                    <Select
                      value={oi.itemId}
                      onChange={(e) => updateOrderItem(index, 'itemId', Number(e.target.value))}
                      label="Item"
                    >
                      {items.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name} (${item.sellingPrice.toFixed(2)})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Quantity"
                    type="number"
                    value={oi.quantity}
                    onChange={(e) => updateOrderItem(index, 'quantity', Number(e.target.value))}
                    sx={{ width: 120 }}
                  />
                  <TextField
                    label="Price"
                    type="number"
                    value={oi.price}
                    onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
                    sx={{ width: 120 }}
                  />
                  <IconButton onClick={() => removeOrderItem(index)}>
                    <X size={20} />
                  </IconButton>
                </Box>
              ))}
              <Button
                variant="outlined"
                startIcon={<Plus size={20} />}
                onClick={addOrderItem}
              >
                Add Item
              </Button>
              {orderItems.length > 0 && (
                <Typography variant="h6" color="primary">
                  Total: ${calculateTotal().toFixed(2)}
                </Typography>
              )}
            </>
          )}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={save}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : editingId ? "Update Status" : "Create Order"}
            </Button>
            {editingId && (
              <Button
                variant="outlined"
                onClick={() => {
                  setOrderNumber("");
                  setOrderItems([]);
                  setStatus(OrderStatus.PENDING);
                  editOrder({ id: 0, orderNumber: "", userId: 0, organizationId: 0, createdAt: "", totalAmount: 0, status: OrderStatus.PENDING, orderItems: [] });
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Paper>

        {/* Orders List */}
        {orders.map((order) => (
          <Paper
            key={order.id}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 3,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Box>
                <Typography variant="subtitle1">{order.orderNumber}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.user?.name} • {new Date(order.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip label={order.status} color={getStatusColor(order.status) as any} size="small" />
                <IconButton onClick={() => editOrder(order)}>
                  <Edit2 size={20} />
                </IconButton>
                <IconButton onClick={() => remove(order.id)}>
                  <Trash2 size={20} />
                </IconButton>
              </Box>
            </Box>
            <Typography variant="h6" color="primary">
              Total: ${order.totalAmount.toFixed(2)}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Items:
              </Typography>
              {order.orderItems.map((oi) => (
                <Typography key={oi.id} variant="body2">
                  {oi.item?.name} x {oi.quantity} @ ${oi.price.toFixed(2)} = ${(oi.quantity * oi.price).toFixed(2)}
                </Typography>
              ))}
            </Box>
          </Paper>
        ))}

        {orders.length === 0 && !loading && (
          <Typography color="text.secondary">No orders found.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default OrdersView;


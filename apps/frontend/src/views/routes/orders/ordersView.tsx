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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Pagination,
} from "@mui/material";
import NotificationBox from "../../components/NotificationBox";
import { Edit2, Trash2, Plus, X } from "lucide-react";
import ERPSidebar from "../../components/sidebar/ERPSidebar";
import { useOrdersViewModel } from "../../../viewmodels/orders/useOrdersViewModel";
import { OrderStatus } from "../../../models/order";
import { collapsedWidth, drawerWidth } from "../../components/sidebar/ERPSidebar";

import { useUIStore } from "../../../stores/uiStore";

const OrdersView: React.FC = () => {
  const { 
    orders,
    items,
    loading,

    // Create form
    orderNumber,
    setOrderNumber,
    orderItems,
    addOrderItem,
    removeOrderItem,
    updateOrderItem,

    // Edit modal
    editModalOpen,
    editOrderNumber,
    editStatus,
    setEditStatus,
    editOrderItems,
    addEditOrderItem,
    removeEditOrderItem,
    updateEditOrderItem,
    saveEdit,
    closeEditModal,

    save,
    remove,
    editOrder,
    notification,
    setNotification,
    updateOrderStatusInline,
  } = useOrdersViewModel();

  const [activeStatusTab, setActiveStatusTab] = useState<OrderStatus>(OrderStatus.PENDING);

  // Pagination & date filtering
  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPerPage = 10;
  const [orderDateFilterMode, setOrderDateFilterMode] = useState<'ALL' | 'DAILY' | 'MONTHLY'>('ALL');
  const [orderSelectedDate, setOrderSelectedDate] = useState<string>("");

  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const isCollapsed = isSidebarCollapsed;

  const calculateTotal = () => {
    return orderItems.reduce((sum, oi) => sum + (oi.quantity * oi.price), 0);
  };

  const calculateEditTotal = () => {
    return editOrderItems.reduce((sum, oi) => sum + (oi.quantity * oi.price), 0);
  };

  const filterOrdersByDate = (ordersToFilter: typeof orders) => {
    if (orderDateFilterMode === 'ALL' || !orderSelectedDate) return ordersToFilter;
    const selected = new Date(orderSelectedDate);

    if (orderDateFilterMode === 'DAILY') {
      return ordersToFilter.filter((order) => {
        const d = new Date(order.createdAt);
        return (
          d.getFullYear() === selected.getFullYear() &&
          d.getMonth() === selected.getMonth() &&
          d.getDate() === selected.getDate()
        );
      });
    }

    // MONTHLY
    return ordersToFilter.filter((order) => {
      const d = new Date(order.createdAt);
      return (
        d.getFullYear() === selected.getFullYear() &&
        d.getMonth() === selected.getMonth()
      );
    });
  };

  const filteredOrdersByStatus = orders.filter((order) => order.status === activeStatusTab);
  const filteredOrders = filterOrdersByDate(filteredOrdersByStatus);
  const ordersPageCount = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
  const paginatedOrders = filteredOrders.slice(
    (ordersPage - 1) * ordersPerPage,
    ordersPage * ordersPerPage,
  );

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
          Orders
        </Typography>

        {notification && (
          <NotificationBox
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Create Form */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 1, display: "flex", flexDirection: "column", gap: 2 }}>
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
                      {item.name} (Rs. {item.sellingPrice.toFixed(2)})
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
              Total: Rs. {calculateTotal().toFixed(2)}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={save}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Create Order"}
            </Button>
          </Box>
        </Paper>

        {/* Edit Order Modal */}
        <Dialog open={editModalOpen} onClose={closeEditModal} fullWidth maxWidth="md">
          <DialogTitle>Edit Order</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Order Number"
              value={editOrderNumber}
              disabled
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                label="Status"
              >
                <MenuItem value={OrderStatus.PENDING}>Pending</MenuItem>
                <MenuItem value={OrderStatus.COMPLETED}>Completed</MenuItem>
                <MenuItem value={OrderStatus.CANCELLED}>Cancelled</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="subtitle2" gutterBottom>
              Order Items
            </Typography>
            {editOrderItems.map((oi, index) => (
              <Box key={index} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Item</InputLabel>
                  <Select
                    value={oi.itemId}
                    onChange={(e) => updateEditOrderItem(index, 'itemId', Number(e.target.value))}
                    label="Item"
                  >
                    {items.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name} (Rs. {item.sellingPrice.toFixed(2)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Quantity"
                  type="number"
                  value={oi.quantity}
                  onChange={(e) => updateEditOrderItem(index, 'quantity', Number(e.target.value))}
                  sx={{ width: 120 }}
                />
                <TextField
                  label="Price"
                  type="number"
                  value={oi.price}
                  onChange={(e) => updateEditOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
                  sx={{ width: 120 }}
                />
                <IconButton onClick={() => removeEditOrderItem(index)}>
                  <X size={20} />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<Plus size={20} />}
              onClick={addEditOrderItem}
            >
              Add Item
            </Button>
            {editOrderItems.length > 0 && (
              <Typography variant="h6" color="primary">
                Total: Rs. {calculateEditTotal().toFixed(2)}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditModal}>Cancel</Button>
            <Button
              variant="contained"
              onClick={saveEdit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Save Changes"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Date Filter & Status Tabs */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel>View</InputLabel>
              <Select
                value={orderDateFilterMode}
                label="View"
                onChange={(e) => {
                  const mode = e.target.value as 'ALL' | 'DAILY' | 'MONTHLY';
                  setOrderDateFilterMode(mode);
                  setOrdersPage(1);
                  if (mode === 'ALL') {
                    setOrderSelectedDate("");
                  }
                }}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="DAILY">Daily</MenuItem>
                <MenuItem value="MONTHLY">Monthly</MenuItem>
              </Select>
            </FormControl>
            {orderDateFilterMode === 'DAILY' && (
              <TextField
                label="Date"
                type="date"
                size="small"
                value={orderSelectedDate}
                onChange={(e) => {
                  setOrderSelectedDate(e.target.value);
                  setOrdersPage(1);
                }}
                InputLabelProps={{ shrink: true }}
              />
            )}
            {orderDateFilterMode === 'MONTHLY' && (
              <TextField
                label="Month"
                type="month"
                size="small"
                value={orderSelectedDate}
                onChange={(e) => {
                  setOrderSelectedDate(e.target.value);
                  setOrdersPage(1);
                }}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Box>

          <Tabs
            value={activeStatusTab}
            onChange={(_, value) => {
              setActiveStatusTab(value);
              setOrdersPage(1);
            }}
          >
            <Tab label="Pending" value={OrderStatus.PENDING} />
            <Tab label="Completed" value={OrderStatus.COMPLETED} />
            <Tab label="Cancelled" value={OrderStatus.CANCELLED} />
          </Tabs>
        </Box>

        {/* Orders List */}
        {paginatedOrders
          .map((order) => (
          <Paper
            key={order.id}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 1,
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
                <Select
                  size="small"
                  value={order.status}
                  onChange={(e) => updateOrderStatusInline(order.id, e.target.value as OrderStatus)}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value={OrderStatus.PENDING}>Pending</MenuItem>
                  <MenuItem value={OrderStatus.COMPLETED}>Completed</MenuItem>
                  <MenuItem value={OrderStatus.CANCELLED}>Cancelled</MenuItem>
                </Select>
                {order.status === OrderStatus.PENDING && (
                  <IconButton onClick={() => editOrder(order)}>
                    <Edit2 size={20} />
                  </IconButton>
                )}
                <IconButton onClick={() => remove(order.id)}>
                  <Trash2 size={20} />
                </IconButton>
              </Box>
            </Box>
            <Typography variant="h6" color="primary">
              Total: Rs. {order.totalAmount.toFixed(2)}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Items:
              </Typography>
              {order.orderItems.map((oi) => (
                <Typography key={oi.id} variant="body2">
                  {oi.item?.name} x {oi.quantity} @ Rs. {oi.price.toFixed(2)} = Rs. {(oi.quantity * oi.price).toFixed(2)}
                </Typography>
              ))}
            </Box>
          </Paper>
        ))}

        {filteredOrders.length === 0 && !loading && (
          <Typography color="text.secondary">No orders found for the selected filters.</Typography>
        )}

        {filteredOrders.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={ordersPageCount}
              page={ordersPage}
              onChange={(_, value) => setOrdersPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default OrdersView;


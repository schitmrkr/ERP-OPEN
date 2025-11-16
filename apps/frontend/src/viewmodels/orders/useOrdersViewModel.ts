import { useState, useEffect } from "react";
import { type Order, type CreateOrderDto, type UpdateOrderDto, type CreateOrderItemDto, OrderStatus } from "../../models/order";
import { type Item } from "../../models/items";
import axios, { AxiosError } from "axios";

export const useOrdersViewModel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  // Create form state
  const [orderNumber, setOrderNumber] = useState("");
  const [orderItems, setOrderItems] = useState<CreateOrderItemDto[]>([]);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editOrderId, setEditOrderId] = useState<number | null>(null);
  const [editOrderNumber, setEditOrderNumber] = useState("");
  const [editStatus, setEditStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [editOrderItems, setEditOrderItems] = useState<CreateOrderItemDto[]>([]);

  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const generateOrderNumberFromList = (existingOrders: Order[]): string => {
    const now = new Date();
    const datePart = now.toISOString().split("T")[0].replace(/-/g, "");
    const prefix = `ORD-${datePart}-`;

    const existingNumbers = new Set(existingOrders.map((o) => o.orderNumber));
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    const generateRandomSuffix = () =>
      Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)])
        .join("");

    // Try multiple times to avoid collisions with existing orders for today
    for (let i = 0; i < 50; i++) {
      const suffix = generateRandomSuffix();
      const candidate = `${prefix}${suffix}`;
      if (!existingNumbers.has(candidate)) {
        return candidate;
      }
    }

    // Fallback (extremely unlikely to be needed)
    return `${prefix}${Date.now().toString(36).toUpperCase().slice(-7)}`;
  };

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/orders`, {
        headers: getAuthHeaders(),
      });
      setOrders(res.data);
      // Auto-generate the next order number when there is none in the create form
      setOrderNumber((prev) =>
        prev && prev.trim().length > 0 ? prev : generateOrderNumberFromList(res.data),
      );
    } catch (err: any) {
      console.error(
        err instanceof AxiosError ? err.response?.data?.message : err.message || err
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/items`, {
        headers: getAuthHeaders(),
      });
      setItems(res.data);
    } catch (err: any) {
      console.error("Failed to fetch items");
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { itemId: 0, quantity: 1, price: 0 }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: keyof CreateOrderItemDto, value: number) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    // Auto-calculate price from item's sellingPrice if itemId changes
    if (field === 'itemId') {
      const item = items.find(i => i.id === value);
      if (item) {
        updated[index].price = item.sellingPrice;
      }
    }
    setOrderItems(updated);
  };

  const save = async () => {
    if (!orderNumber) {
      setNotification({ type: "error", message: "Please provide an order number" });
      return;
    }

    // Creating a new order requires at least one valid item
    if (orderItems.length === 0) {
      setNotification({ type: "error", message: "Please add at least one item" });
      return;
    }
    if (orderItems.some(oi => oi.itemId === 0 || oi.quantity <= 0 || oi.price <= 0)) {
      setNotification({ type: "error", message: "Please fill all order item fields correctly" });
      return;
    }

    setLoading(true);
    try {
      const payload: CreateOrderDto = {
        orderNumber,
        orderItems,
        userId: 0,
      };
      await axios.post(
        `${BACKEND_URL}/api/orders`,
        payload,
        { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
      );

      setOrderNumber("");
      setOrderItems([]);
      setNotification({ type: "success", message: "Order created successfully" });
      fetchOrders();
    } catch (err: any) {
      let msg = "Error saving order";
      if (err instanceof AxiosError) {
        msg = err.response?.data?.message || msg;
      } else {
        msg = err.message || msg;
      }
      setNotification({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatusInline = async (id: number, newStatus: OrderStatus) => {
    setLoading(true);
    try {
      await axios.patch(
        `${BACKEND_URL}/api/orders/${id}/status`,
        { status: newStatus },
        { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
      );
      setNotification({ type: "success", message: "Order status updated" });
      fetchOrders();
    } catch (err: any) {
      let msg = "Error updating order status";
      if (err instanceof AxiosError) {
        msg = err.response?.data?.message || msg;
      } else {
        msg = err.message || msg;
      }
      setNotification({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  // Editing via modal (only for PENDING orders)
  const editOrder = (order: Order) => {
    if (order.status !== OrderStatus.PENDING) {
      setNotification({ type: "error", message: "Only pending orders can be edited" });
      return;
    }
    setEditOrderId(order.id);
    setEditOrderNumber(order.orderNumber);
    setEditStatus(order.status);
    setEditOrderItems(
      order.orderItems.map((oi) => ({
        itemId: oi.itemId,
        quantity: oi.quantity,
        price: oi.price,
      })),
    );
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditOrderId(null);
    setEditOrderNumber("");
    setEditStatus(OrderStatus.PENDING);
    setEditOrderItems([]);
  };

  const addEditOrderItem = () => {
    setEditOrderItems([...editOrderItems, { itemId: 0, quantity: 1, price: 0 }]);
  };

  const removeEditOrderItem = (index: number) => {
    setEditOrderItems(editOrderItems.filter((_, i) => i !== index));
  };

  const updateEditOrderItem = (index: number, field: keyof CreateOrderItemDto, value: number) => {
    const updated = [...editOrderItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'itemId') {
      const item = items.find((i) => i.id === value);
      if (item) {
        updated[index].price = item.sellingPrice;
      }
    }
    setEditOrderItems(updated);
  };

  const saveEdit = async () => {
    if (!editOrderId) return;
    if (editOrderItems.length === 0) {
      setNotification({ type: "error", message: "Please add at least one item" });
      return;
    }
    if (editOrderItems.some((oi) => oi.itemId === 0 || oi.quantity <= 0 || oi.price <= 0)) {
      setNotification({ type: "error", message: "Please fill all order item fields correctly" });
      return;
    }

    setLoading(true);
    try {
      const payload: UpdateOrderDto = {
        status: editStatus,
        orderItems: editOrderItems,
      };
      await axios.patch(
        `${BACKEND_URL}/api/orders/${editOrderId}`,
        payload,
        { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
      );

      setNotification({ type: "success", message: "Order updated successfully" });
      closeEditModal();
      fetchOrders();
    } catch (err: any) {
      let msg = "Error updating order";
      if (err instanceof AxiosError) {
        msg = err.response?.data?.message || msg;
      } else {
        msg = err.message || msg;
      }
      setNotification({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/orders/${id}`, {
        headers: getAuthHeaders(),
      });
      setNotification({ type: "success", message: "Order deleted successfully" });
      fetchOrders();
    } catch (err: any) {
      let msg = "Error deleting order";
      if (err instanceof AxiosError) {
        msg = err.response?.data?.message || msg;
      } else {
        msg = err.message || msg;
      }
      setNotification({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchItems();
  }, []);

  return {
    orders,
    items,
    loading,

    // Create form
    orderNumber,
    setOrderNumber,
    orderItems,
    setOrderItems,
    addOrderItem,
    removeOrderItem,
    updateOrderItem,

    // Edit modal
    editModalOpen,
    editOrderId,
    editOrderNumber,
    editStatus,
    setEditStatus,
    editOrderItems,
    addEditOrderItem,
    removeEditOrderItem,
    updateEditOrderItem,
    saveEdit,
    closeEditModal,

    save, // create
    editOrder,
    remove,
    notification,
    setNotification,
    updateOrderStatusInline,
  };
};


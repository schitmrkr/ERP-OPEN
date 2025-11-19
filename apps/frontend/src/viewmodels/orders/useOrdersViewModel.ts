import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import {
  type Order,
  OrderStatus,
  type CreateOrderDto,
  type UpdateOrderDto,
  type CreateOrderItemDto,
} from "../../models/order";
import { type Item } from "../../models/items";

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

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  /** Returns headers object for Axios */
  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  /** Generate unique order number */
  const generateOrderNumberFromList = (existingOrders: Order[]): string => {
    const now = new Date();
    const datePart = now.toISOString().split("T")[0].replace(/-/g, "");
    const prefix = `ORD-${datePart}-`;

    const existingNumbers = new Set(existingOrders.map((o) => o.orderNumber));
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    const generateRandomSuffix = () =>
      Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

    for (let i = 0; i < 50; i++) {
      const suffix = generateRandomSuffix();
      const candidate = `${prefix}${suffix}`;
      if (!existingNumbers.has(candidate)) return candidate;
    }

    return `${prefix}${Date.now().toString(36).toUpperCase().slice(-7)}`;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Order[]>(`${BACKEND_URL}/api/orders`, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      setOrders(res.data);

      setOrderNumber((prev) =>
        prev && prev.trim().length > 0 ? prev : generateOrderNumberFromList(res.data)
      );
    } catch (err: any) {
      console.error(err instanceof AxiosError ? err.response?.data?.message : err.message || err);
      setNotification({ type: "error", message: "Failed to fetch orders" });
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get<Item[]>(`${BACKEND_URL}/api/items`, {
        headers: getAuthHeaders(),
      });
      setItems(res.data);
    } catch (err) {
      console.error("Failed to fetch items");
    }
  };

  const addOrderItem = () => setOrderItems([...orderItems, { itemId: 0, quantity: 1, price: 0 }]);
  const removeOrderItem = (index: number) =>
    setOrderItems(orderItems.filter((_, i) => i !== index));
  const updateOrderItem = (index: number, field: keyof CreateOrderItemDto, value: number) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "itemId") {
      const item = items.find((i) => i.id === value);
      if (item) updated[index].price = item.sellingPrice;
    }
    setOrderItems(updated);
  };

  const saveOrder = async () => {
    if (!orderNumber || orderItems.length === 0) {
      setNotification({ type: "error", message: "Order number and items are required" });
      return;
    }
    if (orderItems.some((oi) => oi.itemId === 0 || oi.quantity <= 0 || oi.price <= 0)) {
      setNotification({ type: "error", message: "Fill all order item fields correctly" });
      return;
    }

    setLoading(true);
    try {
      const payload: CreateOrderDto = { orderNumber, orderItems, userId: 0 };
      await axios.post(`${BACKEND_URL}/api/orders`, payload, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      setNotification({ type: "success", message: "Order created successfully" });
      setOrderNumber("");
      setOrderItems([]);
      fetchOrders();
    } catch (err: any) {
      const msg = err instanceof AxiosError ? err.response?.data?.message || "Error saving order" : err.message;
      setNotification({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };


  const updateOrderStatusInline = async (id: number, status: OrderStatus) => {
    setLoading(true);
    try {
      await axios.patch(`${BACKEND_URL}/api/orders/${id}/status`, { status }, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      setNotification({ type: "success", message: "Order status updated" });
      fetchOrders();
    } catch (err: any) {
      const msg = err instanceof AxiosError ? err.response?.data?.message || "Error updating status" : err.message;
      setNotification({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const editOrder = (order: Order) => {
    if (order.status !== OrderStatus.PENDING) {
      setNotification({ type: "error", message: "Only pending orders can be edited" });
      return;
    }
    setEditOrderId(order.id);
    setEditOrderNumber(order.orderNumber);
    setEditStatus(order.status);
    setEditOrderItems(order.orderItems.map((oi) => ({ itemId: oi.itemId, quantity: oi.quantity, price: oi.price })));
    setEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditOrderId(null);
    setEditOrderNumber("");
    setEditStatus(OrderStatus.PENDING);
    setEditOrderItems([]);
  };

  const addEditOrderItem = () =>
    setEditOrderItems([...editOrderItems, { itemId: 0, quantity: 1, price: 0 }]);
  const removeEditOrderItem = (index: number) =>
    setEditOrderItems(editOrderItems.filter((_, i) => i !== index));
  const updateEditOrderItem = (index: number, field: keyof CreateOrderItemDto, value: number) => {
    const updated = [...editOrderItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "itemId") {
      const item = items.find((i) => i.id === value);
      if (item) updated[index].price = item.sellingPrice;
    }
    setEditOrderItems(updated);
  };

  const saveEdit = async () => {
    if (!editOrderId || editOrderItems.length === 0) return;
    if (editOrderItems.some((oi) => oi.itemId === 0 || oi.quantity <= 0 || oi.price <= 0)) {
      setNotification({ type: "error", message: "Fill all order item fields correctly" });
      return;
    }

    setLoading(true);
    try {
      const payload: UpdateOrderDto = { status: editStatus, orderItems: editOrderItems };
      await axios.patch(`${BACKEND_URL}/api/orders/${editOrderId}`, payload, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      setNotification({ type: "success", message: "Order updated successfully" });
      closeEditModal();
      fetchOrders();
    } catch (err: any) {
      const msg = err instanceof AxiosError ? err.response?.data?.message || "Error updating order" : err.message;
      setNotification({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const removeOrder = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/orders/${id}`, {
        headers: getAuthHeaders(),
      });
      setNotification({ type: "success", message: "Order deleted successfully" });
      fetchOrders();
    } catch (err: any) {
      const msg = err instanceof AxiosError ? err.response?.data?.message || "Error deleting order" : err.message;
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
    orderNumber,
    setOrderNumber,
    orderItems,
    setOrderItems,
    addOrderItem,
    removeOrderItem,
    updateOrderItem,
    save: saveOrder,
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
    editOrder,
    remove: removeOrder,
    notification,
    setNotification,
    updateOrderStatusInline,
  };
};

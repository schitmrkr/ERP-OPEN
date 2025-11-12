import { useState, useEffect } from "react";
import { type Order, type CreateOrderDto, type UpdateOrderDto, type CreateOrderItemDto, OrderStatus } from "../../models/order";
import { type Item } from "../../models/items";
import axios, { AxiosError } from "axios";

export const useOrdersViewModel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderItems, setOrderItems] = useState<CreateOrderItemDto[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.PENDING);

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
    if (!orderNumber) return alert("Please provide an order number");
    if (orderItems.length === 0) return alert("Please add at least one item");
    if (orderItems.some(oi => oi.itemId === 0 || oi.quantity <= 0 || oi.price <= 0)) {
      return alert("Please fill all order item fields correctly");
    }

    setLoading(true);
    try {
      if (editingId) {
        // Update order status only
        await axios.patch(
          `${BACKEND_URL}/api/orders/${editingId}`,
          { status },
          { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
        );
      } else {
        // Create new order
        const payload: CreateOrderDto = {
          orderNumber,
          orderItems,
        };
        await axios.post(
          `${BACKEND_URL}/api/orders`,
          payload,
          { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
        );
      }

      setOrderNumber("");
      setOrderItems([]);
      setEditingId(null);
      setStatus(OrderStatus.PENDING);
      fetchOrders();
    } catch (err: any) {
      let msg = "Error saving order";
      if (err instanceof AxiosError) {
        msg = err.response?.data?.message || msg;
      } else {
        msg = err.message || msg;
      }
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const editOrder = (order: Order) => {
    setEditingId(order.id);
    setOrderNumber(order.orderNumber);
    setStatus(order.status);
    // Note: Order items cannot be edited after creation in this implementation
  };

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/orders/${id}`, {
        headers: getAuthHeaders(),
      });
      fetchOrders();
    } catch (err: any) {
      let msg = "Error deleting order";
      if (err instanceof AxiosError) {
        msg = err.response?.data?.message || msg;
      } else {
        msg = err.message || msg;
      }
      alert(msg);
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
    editingId,
    status,
    setStatus,
    save,
    editOrder,
    remove,
  };
};


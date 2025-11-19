import { useState, useEffect } from "react";
import { type Item } from "../../models/items";
import axios, { AxiosError } from "axios";

// Add interface for average cost price
export interface ItemCostPrice {
  itemId: number;
  name: string;
  avgCostPrice: number;
}

export interface AverageCostPriceResponse {
  items: ItemCostPrice[];
  organizationAvgCostPrice: number;
}

export const useItemsViewModel = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [sellingPrice, setSellingPrice] = useState(0);
  const [inventoryQty, setInventoryQty] = useState(0);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // New state for average cost price
  const [avgCostPrices, setAvgCostPrices] = useState<AverageCostPriceResponse | null>(null);
  const [loadingAvgCost, setLoadingAvgCost] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/items`, {
        headers: getAuthHeaders(),
      });
      setItems(res.data);
    } catch (err: any) {
      console.error(
        err instanceof AxiosError ? err.response?.data?.message : err.message || err
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageCostPrices = async () => {
    setLoadingAvgCost(true);
    try {
      const res = await axios.get<AverageCostPriceResponse>(
        `${BACKEND_URL}/api/items/average-cost-price`,
        { headers: getAuthHeaders() }
      );
      setAvgCostPrices(res.data);
    } catch (err: any) {
      console.error(
        err instanceof AxiosError ? err.response?.data?.message : err.message || err
      );
      setNotification({ type: "error", message: "Failed to fetch average cost prices" });
    } finally {
      setLoadingAvgCost(false);
    }
  };

  const save = async () => {
    if (!name || sellingPrice <= 0) {
      setNotification({
        type: "error",
        message: "Please provide valid name and price",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { name, sellingPrice, inventoryQty };

      if (editingId) {
        await axios.patch(`${BACKEND_URL}/api/items/${editingId}`, payload, {
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        });
      } else {
        await axios.post(`${BACKEND_URL}/api/items`, payload, {
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        });
      }

      setName("");
      setSellingPrice(0);
      setInventoryQty(0);
      setEditingId(null);

      setNotification({
        type: "success",
        message: editingId ? "Item updated successfully" : "Item created successfully",
      });

      fetchItems();
      fetchAverageCostPrices(); // Refresh average cost prices after save
    } catch (err: any) {
      let msg = "Error saving item";
      if (err instanceof AxiosError) msg = err.response?.data?.message || msg;
      else msg = err.message || msg;

      setNotification({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const editItem = (item: Item) => {
    setEditingId(item.id);
    setName(item.name);
    setSellingPrice(item.sellingPrice);
    setInventoryQty(item.inventoryQty);
  };

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setLoading(true);

    try {
      await axios.delete(`${BACKEND_URL}/api/items/${id}`, {
        headers: getAuthHeaders(),
      });

      setNotification({
        type: "success",
        message: "Item deleted successfully",
      });

      fetchItems();
      fetchAverageCostPrices(); // Refresh average cost prices after delete
    } catch (err: any) {
      let msg = "Error deleting item";
      if (err instanceof AxiosError) msg = err.response?.data?.message || msg;
      else msg = err.message || msg;

      setNotification({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchAverageCostPrices(); // Fetch average cost prices on mount
  }, []);

  return {
    items,
    loading,
    name,
    setName,
    sellingPrice,
    setSellingPrice,
    inventoryQty,
    setInventoryQty,
    editingId,
    save,
    editItem,
    remove,
    notification,
    setNotification,
    avgCostPrices,
    loadingAvgCost,
    fetchAverageCostPrices, // optional manual refresh
  };
};

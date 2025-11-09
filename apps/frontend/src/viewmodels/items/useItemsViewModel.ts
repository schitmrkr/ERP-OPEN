import { useState, useEffect } from "react";
import { type Item } from "../../models/items";


export const useItemsViewModel = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [sellingPrice, setSellingPrice] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/items`);
      if (!res.ok) throw new Error("Failed to fetch items");
      const data = await res.json();
      setItems(data);
    } catch (err: any) {
      console.error(err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!name || sellingPrice <= 0) return alert("Please provide valid name and price");

    setLoading(true);
    try {
      const payload = { name, sellingPrice };
      let res: Response;

      if (editingId) {
        res = await fetch(`${BACKEND_URL}/api/items/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${BACKEND_URL}/api/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save item");
      }

      setName("");
      setSellingPrice(0);
      setEditingId(null);
      fetchItems();
    } catch (err: any) {
      alert(err.message || "Error saving item");
    } finally {
      setLoading(false);
    }
  };

  const editItem = (item: Item) => {
    setEditingId(item.id);
    setName(item.name);
    setSellingPrice(item.sellingPrice);
  };


  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/items/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete item");
      }

      fetchItems();
    } catch (err: any) {
      alert(err.message || "Error deleting item");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    name,
    setName,
    sellingPrice,
    setSellingPrice,
    editingId,
    save,
    editItem,
    remove,
  };
};

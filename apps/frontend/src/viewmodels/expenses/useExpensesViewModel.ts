import { useState, useEffect } from "react";
import { type Expense, type CreateExpenseDto, type UpdateExpenseDto, ExpenseType, ExpenseNature } from "../../models/expense";
import { type Item } from "../../models/items";
import axios, { AxiosError } from "axios";

export const useExpensesViewModel = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [expenseNature, setExpenseNature] = useState<ExpenseNature>(ExpenseNature.DIRECT);
  const [type, setType] = useState<ExpenseType>(ExpenseType.INGREDIENT);
  const [itemId, setItemId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/expenses`, {
        headers: getAuthHeaders(),
      });
      setExpenses(res.data);
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
      if (res.data.length > 0 && !editingId) {
        setItemId(res.data[0].id);
      }
    } catch (err: any) {
      console.error("Failed to fetch items");
    }
  };

  const save = async () => {
    if (!description || amount <= 0) {
      setNotification({ type: "error", message: "Please provide valid description and amount" });
      return;
    }

    // When expense is DIRECT, enforce type and item selection on the frontend
    if (expenseNature === ExpenseNature.DIRECT) {
      if (!type) {
        setNotification({ type: "error", message: "Please select an expense type for direct expenses" });
        return;
      }
      if (!itemId) {
        setNotification({ type: "error", message: "Please select an item for direct expenses" });
        return;
      }
    }

    // When expense is INDIRECT, enforce type selection (different allowed set)
    if (expenseNature === ExpenseNature.INDIRECT && !type) {
      setNotification({ type: "error", message: "Please select an expense type for indirect expenses" });
      return;
    }

    setLoading(true);
    try {
      const payload: CreateExpenseDto | UpdateExpenseDto = {
        description,
        amount,
        expenseNature,
        // type is required for both natures (allowed set differs per nature)
        type,
        // item is only relevant for DIRECT expenses; backend accepts optional itemId
        itemId: expenseNature === ExpenseNature.DIRECT ? itemId || null : undefined,
      };

      if (editingId) {
        await axios.patch(
          `${BACKEND_URL}/api/expenses/${editingId}`,
          payload,
          { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
        );
      } else {
        await axios.post(
          `${BACKEND_URL}/api/expenses`,
          payload,
          { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
        );
      }

      setDescription("");
      setAmount(0);
      setExpenseNature(ExpenseNature.DIRECT);
      setType(ExpenseType.INGREDIENT);
      setItemId(null);
      setEditingId(null);
      setNotification({ type: "success", message: editingId ? "Expense updated successfully" : "Expense created successfully" });
      fetchExpenses();
    } catch (err: any) {
      let msg = "Error saving expense";
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

  const editExpense = (expense: Expense) => {
    setEditingId(expense.id);
    setDescription(expense.description);
    setAmount(expense.amount);
    setExpenseNature(expense.expenseNature || ExpenseNature.DIRECT);
    setType(expense.type || ExpenseType.INGREDIENT);
    setItemId(expense.itemId);
  };

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/expenses/${id}`, {
        headers: getAuthHeaders(),
      });
      setNotification({ type: "success", message: "Expense deleted successfully" });
      fetchExpenses();
    } catch (err: any) {
      let msg = "Error deleting expense";
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
    fetchExpenses();
    fetchItems();
  }, []);

  return {
    expenses,
    items,
    loading,
    description,
    setDescription,
    amount,
    setAmount,
    expenseNature,
    setExpenseNature,
    type,
    setType,
    itemId,
    setItemId,
    editingId,
    save,
    editExpense,
    remove,
    notification,
    setNotification,
  };
};



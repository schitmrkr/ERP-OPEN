import { useState, useEffect } from "react";
import { type Expense, type CreateExpenseDto, type UpdateExpenseDto, ExpenseType } from "../../models/expense";
import { type Item } from "../../models/items";
import { type User } from "../../models/user";
import axios, { AxiosError } from "axios";

export const useExpensesViewModel = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<ExpenseType>(ExpenseType.INGREDIENT);
  const [itemId, setItemId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const getAuthHeaders = (): HeadersInit => {
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
    } catch (err: any) {
      console.error("Failed to fetch items");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/users`, {
        headers: getAuthHeaders(),
      });
      setUsers(res.data);
    } catch (err: any) {
      console.error("Failed to fetch users");
    }
  };

  const save = async () => {
    if (!description || amount <= 0) return alert("Please provide valid description and amount");

    setLoading(true);
    try {
      const payload: CreateExpenseDto | UpdateExpenseDto = {
        description,
        amount,
        type,
        itemId: itemId || null,
        userId: userId || null,
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
      setType(ExpenseType.INGREDIENT);
      setItemId(null);
      setUserId(null);
      setEditingId(null);
      fetchExpenses();
    } catch (err: any) {
      let msg = "Error saving expense";
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

  const editExpense = (expense: Expense) => {
    setEditingId(expense.id);
    setDescription(expense.description);
    setAmount(expense.amount);
    setType(expense.type);
    setItemId(expense.itemId);
    setUserId(expense.userId);
  };

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/expenses/${id}`, {
        headers: getAuthHeaders(),
      });
      fetchExpenses();
    } catch (err: any) {
      let msg = "Error deleting expense";
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
    fetchExpenses();
    fetchItems();
    fetchUsers();
  }, []);

  return {
    expenses,
    items,
    users,
    loading,
    description,
    setDescription,
    amount,
    setAmount,
    type,
    setType,
    itemId,
    setItemId,
    userId,
    setUserId,
    editingId,
    save,
    editExpense,
    remove,
  };
};


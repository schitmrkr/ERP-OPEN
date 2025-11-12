import { useState, useEffect } from "react";
import { type User, type CreateUserDto, type UpdateUserDto, UserRole } from "../../models/user";
import axios, { AxiosError } from "axios";

export const useUsersViewModel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.CASHIER);
  const [editingId, setEditingId] = useState<number | null>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/users`, {
        headers: getAuthHeaders(),
      });
      setUsers(res.data);
    } catch (err: any) {
      console.error(
        err instanceof AxiosError ? err.response?.data?.message : err.message || err
      );
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!name || !email) return alert("Please provide valid name and email");
    if (!editingId && !password) return alert("Please provide a password");

    setLoading(true);
    try {
      const payload: CreateUserDto | UpdateUserDto = editingId
        ? { name, email, ...(password && { password }), role }
        : { name, email, password, role };

      if (editingId) {
        await axios.patch(
          `${BACKEND_URL}/api/users/${editingId}`,
          payload,
          { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
        );
      } else {
        await axios.post(
          `${BACKEND_URL}/api/users`,
          payload,
          { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
        );
      }

      setName("");
      setEmail("");
      setPassword("");
      setRole(UserRole.CASHIER);
      setEditingId(null);
      fetchUsers();
    } catch (err: any) {
      let msg = "Error saving user";
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

  const editUser = (user: User) => {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword(""); // Don't pre-fill password
  };

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/users/${id}`, {
        headers: getAuthHeaders(),
      });
      fetchUsers();
    } catch (err: any) {
      let msg = "Error deleting user";
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
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    role,
    setRole,
    editingId,
    save,
    editUser,
    remove,
  };
};


import { useState, useEffect } from "react";
import { type Organization, type CreateOrganizationDto, type UpdateOrganizationDto } from "../../models/organization";
import axios, { AxiosError } from "axios";

export const useOrganizationsViewModel = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/organizations`, {
        headers: getAuthHeaders(),
      });
      // Backend returns single org for non-admin users, or array for admin
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setOrganizations(data);
    } catch (err: any) {
      console.error(
        err instanceof AxiosError ? err.response?.data?.message : err.message || err
      );
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!name) return alert("Please provide a valid name");

    setLoading(true);
    try {
      if (editingId) {
        await axios.patch(
          `${BACKEND_URL}/api/organizations/${editingId}`,
          { name },
          { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
        );
      } else {
        await axios.post(
          `${BACKEND_URL}/api/organizations`,
          { name },
          { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
        );
      }

      setName("");
      setEditingId(null);
      fetchOrganizations();
    } catch (err: any) {
      let msg = "Error saving organization";
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

  const editOrganization = (org: Organization) => {
    setEditingId(org.id);
    setName(org.name);
  };

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this organization?")) return;

    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/organizations/${id}`, {
        headers: getAuthHeaders(),
      });
      fetchOrganizations();
    } catch (err: any) {
      let msg = "Error deleting organization";
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
    fetchOrganizations();
  }, []);

  return {
    organizations,
    loading,
    name,
    setName,
    editingId,
    save,
    editOrganization,
    remove,
  };
};


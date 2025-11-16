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
  Alert
} from "@mui/material";
import { Edit2, Trash2 } from "lucide-react";
import ERPSidebar from "../../components/sidebar/ERPSidebar";
import { useUsersViewModel } from "../../../viewmodels/users/useUsersViewModel";
import { UserRole } from "../../../models/user";
import { useAuth } from "../../../hooks/useAuth";
import { canModifyUsers } from "../../../utils/roleUtils";
import { collapsedWidth, drawerWidth } from "../../components/sidebar/ERPSidebar";

import { useUIStore } from "../../../stores/uiStore";

const UsersView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { 
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
    remove,
    editUser
  } = useUsersViewModel();

  const canModify = canModifyUsers(currentUser?.role);

  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const isCollapsed = isSidebarCollapsed;

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
          Users
        </Typography>

        {!canModify && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Only owners and admins can create, edit, or delete users.
          </Alert>
        )}

        {/* Create/Edit Form - Only visible to OWNER/ADMIN */}
        {canModify && (
          <Paper sx={{ p: 3, mb: 4, borderRadius: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ flex: 1 }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label={editingId ? "New Password (optional)" : "Password"}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                label="Role"
              >
                <MenuItem value={UserRole.OWNER}>Owner</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                <MenuItem value={UserRole.MANAGER}>Manager</MenuItem>
                <MenuItem value={UserRole.CASHIER}>Cashier</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={save}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : editingId ? "Update" : "Create"}
            </Button>
            {editingId && (
              <Button
                variant="outlined"
                onClick={() => {
                  setName("");
                  setEmail("");
                  setPassword("");
                  setRole(UserRole.CASHIER);
                  editUser({ id: 0, name: "", email: "", role: UserRole.CASHIER, organizationId: 0, createdAt: "", updatedAt: "" });
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Paper>
        )}

        {/* Users List */}
        {users.map((user) => (
          <Paper
            key={user.id}
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: 1,
            }}
          >
            <Box>
              <Typography variant="subtitle1">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email} • {user.role}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              {canModify && (
                <>
                  <IconButton onClick={() => editUser(user)}>
                    <Edit2 size={20} />
                  </IconButton>
                  <IconButton onClick={() => remove(user.id)}>
                    <Trash2 size={20} />
                  </IconButton>
                </>
              )}
            </Box>
          </Paper>
        ))}

        {users.length === 0 && !loading && (
          <Typography color="text.secondary">No users found.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default UsersView;


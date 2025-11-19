import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  IconButton
} from "@mui/material";
import { Edit2, Trash2 } from "lucide-react";
import ERPSidebar from "../../components/sidebar/ERPSidebar";
import { useOrganizationsViewModel } from "../../../viewmodels/organizations/useOrganizationsViewModel";
import { collapsedWidth, drawerWidth } from "../../components/sidebar/ERPSidebar";

import { useUIStore } from "../../../stores/uiStore";

const OrganizationsView: React.FC = () => {
  const { 
    organizations,
    loading,
    name,
    setName,
    editingId,
    save,
    remove,
    editOrganization
  } = useOrganizationsViewModel();

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
          Organizations
        </Typography>

        {/* Create/Edit Form */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="Organization Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ flex: 1 }}
          />
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
                editOrganization({ id: 0, name: "", createdAt: "", updatedAt: "" });
              }}
            >
              Cancel
            </Button>
          )}
        </Paper>

        {/* Organizations List */}
        {organizations.map((org) => (
          <Paper
            key={org.id}
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: 3,
            }}
          >
            <Box>
              <Typography variant="subtitle1">{org.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(org.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={() => editOrganization(org)}>
                <Edit2 size={20} />
              </IconButton>
              <IconButton onClick={() => remove(org.id)}>
                <Trash2 size={20} />
              </IconButton>
            </Box>
          </Paper>
        ))}

        {organizations.length === 0 && !loading && (
          <Typography color="text.secondary">No organizations found.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default OrganizationsView;


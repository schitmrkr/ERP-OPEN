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
  InputLabel
} from "@mui/material";
import { Edit2, Trash2 } from "lucide-react";
import ERPSidebar from "../../components/sidebar/ERPSidebar";
import { useExpensesViewModel } from "../../../viewmodels/expenses/useExpensesViewModel";
import { ExpenseType } from "../../../models/expense";

const ExpensesView: React.FC = () => {
  const { 
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
    remove,
    editExpense
  } = useExpensesViewModel();

  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <ERPSidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />

      <Box sx={{ flex: 1, p: 4, bgcolor: "background.default" }}>
        <Typography variant="h4" gutterBottom>
          Expenses
        </Typography>

        {/* Create/Edit Form */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as ExpenseType)}
                label="Type"
              >
                <MenuItem value={ExpenseType.INGREDIENT}>Ingredient</MenuItem>
                <MenuItem value={ExpenseType.PACKAGING}>Packaging</MenuItem>
                <MenuItem value={ExpenseType.UTILITY}>Utility</MenuItem>
                <MenuItem value={ExpenseType.OTHER}>Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Item (Optional)</InputLabel>
              <Select
                value={itemId || ""}
                onChange={(e) => setItemId(e.target.value ? Number(e.target.value) : null)}
                label="Item (Optional)"
              >
                <MenuItem value="">None</MenuItem>
                {items.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>User (Optional)</InputLabel>
              <Select
                value={userId || ""}
                onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : null)}
                label="User (Optional)"
              >
                <MenuItem value="">None</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
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
                  setDescription("");
                  setAmount(0);
                  setType(ExpenseType.INGREDIENT);
                  setItemId(null);
                  setUserId(null);
                  editExpense({ id: 0, description: "", amount: 0, type: ExpenseType.INGREDIENT, itemId: null, userId: null, organizationId: 0, createdAt: "" });
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Paper>

        {/* Expenses List */}
        {expenses.map((expense) => (
          <Paper
            key={expense.id}
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
              <Typography variant="subtitle1">{expense.description}</Typography>
              <Typography variant="body2" color="text.secondary">
                ${expense.amount.toFixed(2)} • {expense.type}
                {expense.item && ` • Item: ${expense.item.name}`}
                {expense.user && ` • User: ${expense.user.name}`}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={() => editExpense(expense)}>
                <Edit2 size={20} />
              </IconButton>
              <IconButton onClick={() => remove(expense.id)}>
                <Trash2 size={20} />
              </IconButton>
            </Box>
          </Paper>
        ))}

        {expenses.length === 0 && !loading && (
          <Typography color="text.secondary">No expenses found.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ExpensesView;


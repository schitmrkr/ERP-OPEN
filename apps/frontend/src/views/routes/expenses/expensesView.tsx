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
  Tabs,
  Tab,
  Pagination,
} from "@mui/material";
import NotificationBox from "../../components/NotificationBox";
import { Edit2, Trash2 } from "lucide-react";
import ERPSidebar from "../../components/sidebar/ERPSidebar";
import { useExpensesViewModel } from "../../../viewmodels/expenses/useExpensesViewModel";
import { ExpenseType, ExpenseNature } from "../../../models/expense";
import { collapsedWidth, drawerWidth } from "../../components/sidebar/ERPSidebar";
import { useUIStore } from "../../../stores/uiStore";

const ExpensesView: React.FC = () => {
  const { 
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
    remove,
    editExpense,
    notification,
    setNotification,
  } = useExpensesViewModel();

  const [activeNatureTab, setActiveNatureTab] = useState<ExpenseNature | 'ALL'>('ALL');

  // Pagination & date filtering
  const [expensesPage, setExpensesPage] = useState(1);
  const expensesPerPage = 10;
  const [expenseDateFilterMode, setExpenseDateFilterMode] = useState<'ALL' | 'DAILY' | 'MONTHLY'>('ALL');
  const [expenseSelectedDate, setExpenseSelectedDate] = useState<string>("");

  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const isCollapsed = isSidebarCollapsed;

  const filterExpensesByDate = (expensesToFilter: typeof expenses) => {
    if (expenseDateFilterMode === 'ALL' || !expenseSelectedDate) return expensesToFilter;
    const selected = new Date(expenseSelectedDate);

    if (expenseDateFilterMode === 'DAILY') {
      return expensesToFilter.filter((expense) => {
        const d = new Date(expense.createdAt);
        return (
          d.getFullYear() === selected.getFullYear() &&
          d.getMonth() === selected.getMonth() &&
          d.getDate() === selected.getDate()
        );
      });
    }

    // MONTHLY
    return expensesToFilter.filter((expense) => {
      const d = new Date(expense.createdAt);
      return (
        d.getFullYear() === selected.getFullYear() &&
        d.getMonth() === selected.getMonth()
      );
    });
  };

  const filteredExpensesByNature = expenses.filter((expense) =>
    activeNatureTab === 'ALL' ? true : expense.expenseNature === activeNatureTab,
  );
  const filteredExpenses = filterExpensesByDate(filteredExpensesByNature);
  const expensesPageCount = Math.max(1, Math.ceil(filteredExpenses.length / expensesPerPage));
  const paginatedExpenses = filteredExpenses.slice(
    (expensesPage - 1) * expensesPerPage,
    expensesPage * expensesPerPage,
  );

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
          Expenses
        </Typography>

        {notification && (
          <NotificationBox
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Create/Edit Form */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 1, display: "flex", flexDirection: "column", gap: 2 }}>
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
              <InputLabel>Nature</InputLabel>
              <Select
                value={expenseNature}
                onChange={(e) => {
                  const newNature = e.target.value as ExpenseNature;
                  setExpenseNature(newNature);

                  // When switching to INDIRECT, clear item because it is not relevant
                  if (newNature === ExpenseNature.INDIRECT) {
                    setItemId(null);
                  }
                }}
                label="Nature"
              >
                <MenuItem value={ExpenseNature.DIRECT}>Direct</MenuItem>
                <MenuItem value={ExpenseNature.INDIRECT}>Indirect</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl
              sx={{ flex: 1 }}
              required
            >
              <InputLabel>Type</InputLabel>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as ExpenseType)}
                label="Type"
              >
                {/* DIRECT-allowed types */}
                <MenuItem
                  value={ExpenseType.INGREDIENT}
                  disabled={expenseNature === ExpenseNature.INDIRECT}
                >
                  Ingredient
                </MenuItem>
                <MenuItem
                  value={ExpenseType.PACKAGING}
                  disabled={expenseNature === ExpenseNature.INDIRECT}
                >
                  Packaging
                </MenuItem>
                <MenuItem
                  value={ExpenseType.UTILITY}
                  disabled={expenseNature === ExpenseNature.INDIRECT}
                >
                  Utility
                </MenuItem>
                <MenuItem
                  value={ExpenseType.TRANSPORT}
                  disabled={expenseNature === ExpenseNature.INDIRECT}
                >
                  Transport
                </MenuItem>

                {/* INDIRECT-allowed types */}
                <MenuItem
                  value={ExpenseType.MAINTENANCE}
                  disabled={expenseNature === ExpenseNature.DIRECT}
                >
                  Maintenance
                </MenuItem>
                <MenuItem
                  value={ExpenseType.RENT}
                  disabled={expenseNature === ExpenseNature.DIRECT}
                >
                  Rent
                </MenuItem>
                <MenuItem
                  value={ExpenseType.SALARY}
                  disabled={expenseNature === ExpenseNature.DIRECT}
                >
                  Salary
                </MenuItem>
                <MenuItem
                  value={ExpenseType.OTHER}
                  disabled={expenseNature === ExpenseNature.DIRECT}
                >
                  Other
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl
              sx={{ flex: 1 }}
              disabled={expenseNature === ExpenseNature.INDIRECT}
              required={expenseNature === ExpenseNature.DIRECT}
              error={expenseNature === ExpenseNature.DIRECT && !itemId}
            >
              <InputLabel>Item</InputLabel>
              <Select
                value={itemId || ""}
                onChange={(e) => setItemId(e.target.value ? Number(e.target.value) : null)}
                label="Item"
              >
                {expenseNature === ExpenseNature.INDIRECT && (
                  <MenuItem value="">None</MenuItem>
                )}
                {items.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
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
                    setExpenseNature(ExpenseNature.DIRECT);
                    setType(ExpenseType.INGREDIENT);
                    setItemId(null);
                    editExpense({
                      id: 0,
                      description: "",
                      amount: 0,
                      type: ExpenseType.INGREDIENT,
                      expenseNature: ExpenseNature.DIRECT,
                      itemId: null,
                      userId: null,
                      organizationId: 0,
                      createdAt: "",
                    } as any);
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
        </Paper>

        {/* Date Filter & Nature Tabs */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel>View</InputLabel>
              <Select
                value={expenseDateFilterMode}
                label="View"
                onChange={(e) => {
                  const mode = e.target.value as 'ALL' | 'DAILY' | 'MONTHLY';
                  setExpenseDateFilterMode(mode);
                  setExpensesPage(1);
                  if (mode === 'ALL') {
                    setExpenseSelectedDate("");
                  }
                }}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="DAILY">Daily</MenuItem>
                <MenuItem value="MONTHLY">Monthly</MenuItem>
              </Select>
            </FormControl>
            {expenseDateFilterMode === 'DAILY' && (
              <TextField
                label="Date"
                type="date"
                size="small"
                value={expenseSelectedDate}
                onChange={(e) => {
                  setExpenseSelectedDate(e.target.value);
                  setExpensesPage(1);
                }}
                InputLabelProps={{ shrink: true }}
              />
            )}
            {expenseDateFilterMode === 'MONTHLY' && (
              <TextField
                label="Month"
                type="month"
                size="small"
                value={expenseSelectedDate}
                onChange={(e) => {
                  setExpenseSelectedDate(e.target.value);
                  setExpensesPage(1);
                }}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Box>

          <Tabs
            value={activeNatureTab}
            onChange={(_, value) => {
              setActiveNatureTab(value);
              setExpensesPage(1);
            }}
          >
            <Tab label="All" value="ALL" />
            <Tab label="Direct" value={ExpenseNature.DIRECT} />
            <Tab label="Indirect" value={ExpenseNature.INDIRECT} />
          </Tabs>
        </Box>

        {/* Expenses List */}
        {paginatedExpenses
          .map((expense) => (
          <Paper
            key={expense.id}
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
              <Typography variant="subtitle1">{expense.description}</Typography>
              <Typography variant="body2" color="text.secondary">
                Rs. {expense.amount.toFixed(2)} • {expense.expenseNature}
                {expense.type && ` • Type: ${expense.type}`}
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

        {filteredExpenses.length === 0 && !loading && (
          <Typography color="text.secondary">No expenses found for the selected filters.</Typography>
        )}

        {filteredExpenses.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={expensesPageCount}
              page={expensesPage}
              onChange={(_, value) => setExpensesPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ExpensesView;


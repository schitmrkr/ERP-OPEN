import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/protectedRoutes";
import LoginView from "./routes/auth/loginView";

import DashboardView from "./routes/dashboard/dashboardView";
import ItemsView from "./routes/items/itemsView";
import UsersView from "./routes/users/usersView";
import ExpensesView from "./routes/expenses/expensesView";
import OrdersView from "./routes/orders/ordersView";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginView />} />

        <Route path="/" element={
            <ProtectedRoute>
              <DashboardView />
            </ProtectedRoute>
          } />
        <Route path="/items" element={
            <ProtectedRoute>
              <ItemsView />
            </ProtectedRoute>
        } />
        <Route path="/users" element={
            <ProtectedRoute>
              <UsersView />
            </ProtectedRoute>
        } />
        <Route path="/expenses" element={
            <ProtectedRoute>
              <ExpensesView />
            </ProtectedRoute>
        } />
        <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersView />
            </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default AppRouter;
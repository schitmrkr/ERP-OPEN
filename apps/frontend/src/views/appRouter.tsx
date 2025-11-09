import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/protectedRoutes";
import LoginView from "./routes/auth/loginView";

import DashboardView from "./routes/dashboard/dashboardView";
import ItemsView from "./routes/items/itemsView";

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
      </Routes>
    </Router>
  );
}

export default AppRouter;
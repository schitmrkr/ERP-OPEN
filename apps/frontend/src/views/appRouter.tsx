import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/protectedRoutes";
import LoginView from "./routes/auth/loginView";

import DashboardView from "./routes/dashboard/dashboardView";

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
      </Routes>
    </Router>
  );
}

export default AppRouter;
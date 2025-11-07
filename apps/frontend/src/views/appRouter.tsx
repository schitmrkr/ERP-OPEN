import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginView from "./routes/auth/loginView";
import RegisterView from "./routes/auth/registerView";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
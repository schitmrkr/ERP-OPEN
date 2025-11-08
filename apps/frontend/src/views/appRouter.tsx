import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginView from "./routes/auth/loginView";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginView />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Expenses from "./components/Expenses";
import Income from "./components/Income";
import BudgetGoalsTracker from "./components/Budget";
import { GoogleOAuthProvider } from "@react-oauth/google";
import SplitExpenseManager from "./components/Split";

const GOOGLE_CLIENT_ID = "140143509369-kae63f2pnndpdtl22diob5gm6dnnn4r8.apps.googleusercontent.com";

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = !!localStorage.getItem("token"); // Check if user is logged in

  return isAuthenticated ? element : <Navigate to="/" replace />;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/income" element={<ProtectedRoute element={<Income />} />} />
        <Route path="/expenses" element={<ProtectedRoute element={<Expenses />} />} />
        <Route path="/budget" element={<ProtectedRoute element={<BudgetGoalsTracker />} />} />
        <Route path="/split" element={<ProtectedRoute element={<SplitExpenseManager />} />} />
      </Routes>
    </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

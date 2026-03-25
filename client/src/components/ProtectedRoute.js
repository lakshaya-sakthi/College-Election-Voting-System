import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin trying admin page
  if (adminOnly && role !== "admin") {
    return <Navigate to="/vote" replace />;
  }

  return children;
}
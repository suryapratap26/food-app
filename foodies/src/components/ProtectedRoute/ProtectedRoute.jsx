import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element: Component, requiredRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 1. ✅ Not logged in → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. ✅ Route requires specific role (e.g., ADMIN) but user doesn't have it → redirect to home
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  if (!requiredRole && role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <Component />;
};

export default ProtectedRoute;
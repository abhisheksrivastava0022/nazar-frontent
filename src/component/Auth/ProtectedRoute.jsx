import { Navigate } from "react-router-dom";

/**
 * 🛡️ ProtectedRoute Component
 * ----------------------------
 * Blocks access to private routes if the user is not authenticated.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");

  if (!token) {
    console.warn("🚫 No token found → redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    console.warn("⚠️ Unauthorized role → redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

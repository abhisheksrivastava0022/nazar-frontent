import { Navigate } from "react-router-dom";

const CheckNotLogin = ({ children }) => {
  const token = localStorage.getItem("token");
  // If no token → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists → allow access
  return children;
};

export default CheckNotLogin;

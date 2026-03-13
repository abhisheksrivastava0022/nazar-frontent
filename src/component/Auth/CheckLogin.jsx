import { Navigate } from "react-router-dom";

const CheckLogin = ({ children }) => {
  const token = localStorage.getItem("token");
  // If no token → redirect to login
  if (token) {
    return <Navigate to="/home" replace />;
  }

  // If token exists → allow access
  return children;
};

export default CheckLogin;

import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  // Render public pages immediately without blocking on /api/getme;
  // redirect only once an authenticated session is confirmed.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

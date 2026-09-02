import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "";

const fetchUser = async () => {
  const res = await axios.get(`${API_BASE}/api/getme`, { withCredentials: true });
  return res.data;
};

const ProtectedRoute = ({ children }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: fetchUser,
    retry: false,
  });

  if (isLoading) return <div>Loading...</div>;

  if (error || !data?.success || !data?.user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

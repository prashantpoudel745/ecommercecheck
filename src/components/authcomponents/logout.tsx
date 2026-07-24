import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { clearAuthToken } from "@/utils/authToken";
const API_URL = import.meta.env.VITE_API_URL||"";

const LogoutButton = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return;
      }

      await response.json();
      clearAuthToken();

      navigate("/home");
    } catch (error) {
      toast.error("Network error during logout:", error);
    }
  };

  return <button onClick={logout}>Logout</button>;
};
export default LogoutButton;


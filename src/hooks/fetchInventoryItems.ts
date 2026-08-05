const API_URL = import.meta.env.VITE_API_URL|| "";

export const fetchInventoryItem = async () => {
    try {
      const response = await fetch(`${API_URL}/api/inventory`, {
        method: "GET",
        credentials: "include",
      });
      return response;
    } catch (err){
        //
    }
  };
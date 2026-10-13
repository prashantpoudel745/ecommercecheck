const API_URL = import.meta.env.VITE_API_URL || "";

export const fetchInventoryItem = async () => {
  try {
    const response = await fetch(`${API_URL}/api/inventory`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch inventory");
    }
    const data = await response.json();
    let result: any[] = [];
    if (Array.isArray(data)) {
      result = data;
    } else if (data && Array.isArray(data.inventory)) {
      result = data.inventory;
    }

    // Attach backward-compatible response properties in case callers check response.ok or response.json()
    (result as any).ok = true;
    (result as any).status = 200;
    (result as any).json = async () => ({ success: true, inventory: result });

    return result;
  } catch (err) {
    console.error("fetchInventoryItem error:", err);
    const empty: any[] = [];
    (empty as any).ok = false;
    (empty as any).status = 500;
    (empty as any).json = async () => ({ success: false, inventory: [] });
    return empty;
  }
};
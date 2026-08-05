import api from "@/utils/api";

// Get backup status summary
export const fetchBackupStatus = async () => {
  const response = await api.get("/backup/status");
  return response.data;
};

// Export full backup — returns a download URL
export const exportBackup = async (): Promise<void> => {
  const response = await api.get("/backup/export", { responseType: "blob" });
  const url  = window.URL.createObjectURL(new Blob([response.data], { type: "application/json" }));
  const link = document.createElement("a");
  const cd   = response.headers["content-disposition"] || "";
  const match = cd.match(/filename="?([^"]+)"?/);
  link.href = url;
  link.setAttribute("download", match?.[1] || "backup.json");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

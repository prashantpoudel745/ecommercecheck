import { Button } from "@/components/ui/button"; // Adjust path based on your project structure
import { Download } from "lucide-react";

const DownloadCSVButton = ({ clients }) => {
  const convertToCSV = (data) => {
    const headers = [
      "Name",
      "Company",
      "VAT No",
      "Status",
      "Email",
      "Phone",
      "Items",
      "Value",
    ];
    const rows = data.map((client) => [
      client.name || "",
      client.companyName || "",
      client.vatNo || "",
      client.status || "",
      client.email || "",
      client.phone || "",
      client.items && client.items.length > 0
        ? client.items
            .map(
              (item) =>
                `${item.itemName} (Qty: ${item.quantity}, Price: ${item.price})`
            )
            .join("; ")
        : "No items",
      client.value || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return csvContent;
  };

  const handleDownload = () => {
    const csv = convertToCSV(clients);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "clients_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Download
    </Button>
  );
};

export default DownloadCSVButton;

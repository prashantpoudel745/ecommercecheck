import { Button } from "@/components/ui/button"; // Adjust path based on your project structure
import { Download } from "lucide-react";
import { CURRENCY_SYMBOL } from "@/utils/formatCurrency";

const DownloadInventoryCSVButton = ({ products }) => {
  const convertToCSV = (data) => {
    const headers = [
      "Product Name",
      "ID",
      "Category",
      "Price",
      "Quantity",
      "Max Stock",
      "Stock Percentage",
      "Status",
    ];
    const rows = data.map((product) => {
      const stockPercentage = (
        (product.quantity / product.maxStock) *
        100
      ).toFixed(2);
      const status =
        product.quantity === 0
          ? "Out of Stock"
          : product.quantity <= product.maxStock * 0.2
          ? "Low Stock"
          : "In Stock";

      return [
        product.name || "",
        product._id || "",
        product.category || "",
        product.price ? `${CURRENCY_SYMBOL}${product.price.toFixed(2)}` : "",
        product.quantity || 0,
        product.maxStock || 0,
        stockPercentage,
        status,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return csvContent;
  };

  const handleDownload = () => {
    const csv = convertToCSV(products);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "inventory_export.csv");
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
      Download CSV
    </Button>
  );
};

export default DownloadInventoryCSVButton;

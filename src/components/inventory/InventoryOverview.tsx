import { useEffect, useState } from "react";
import { Database, Upload, BarChart3, Mail, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import SearchComponent from "../Search";
import { UpdateInventory } from "./UpdateInventory";
import { DeleteInventory } from "./DeleteInventory";
import DownloadInventoryCSVButton from "./DownloadInventorycsv";
import { Product, InventoryStats } from "../../../types/inventory.types";
import { CURRENCY_SYMBOL } from "@/utils/formatCurrency";
import { useAuth } from "@/context/AuthContext";
import { formatCurrencyValue } from "@/functions/formatcurrencyvalue";
import { CurrencyUtil } from "@/utils/currency.util";
import { InventorySkeleton } from "@/skeleton/inventorySkeleton/inventorySkeleton";

const Api = import.meta.env.VITE_API_URL||"";

export function InventoryOverview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    lowStockItems: 0,
    lowStockChange: 0,
    inventoryValue: 0,
    inventoryValueChange: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [lastEmailCheck, setLastEmailCheck] = useState<Date | null>(null);
  const {user}= useAuth();
  const [emailNotificationEnabled, setEmailNotificationEnabled] =
    useState(true);

  const calculateProductStatus = (
    quantity: number
  ): "in-stock" | "low-stock" | "out-of-stock" => {
    return quantity === 0
      ? "out-of-stock"
      : quantity < 30
      ? "low-stock"
      : "in-stock";
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${Api}/api/inventory`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error fetching inventory: ${response.statusText}`);
      }

      const data = await response.json();
      const inventoryData = (data.inventory || []).map((product: Product) => ({
        ...product,
        status: calculateProductStatus(product.quantity),
        maxStock: product.maxStock || 1000,
      }));
      setProducts(inventoryData);
      setStats(calculateInventoryStats(inventoryData));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch inventory data"
      );
      // console.error("Failed to fetch inventory data:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const checkAndSendStockNotifications = async (inventoryData: Product[]) => {
    try {
      // Check if we have low stock or out of stock items
      const lowStockItems = inventoryData.filter(
        (product) => product.quantity <= 20 // Critical low stock threshold
      );

      const mediumStockItems = inventoryData.filter(
        (product) => product.quantity > 20 && product.quantity <= 50
      );

      // Only send email if there are items that need attention
      const needsNotification =
        lowStockItems.length > 0 || mediumStockItems.length > 0;

      if (needsNotification) {
        // Check if we've sent an email recently
        const now = new Date();
        const hoursSinceLastEmail = lastEmailCheck
          ? (now.getTime() - lastEmailCheck.getTime()) / (1000 * 60 * 60)
          : 24; // If no previous check, assume it's been 24 hours

        // Send email every 24 hours if there are items that need attention
        if (hoursSinceLastEmail >= 24) {
          await sendStockNotificationEmail();
          setLastEmailCheck(now);
        }
      }
    } catch (error) {
      // console.error("Error checking stock notifications:", error);
    }
  };

  const sendStockNotificationEmail = async () => {
    setEmailSending(true);
    try {
      const response = await fetch(`${Api}/api/inventory/sendstockmail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to send email: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error("Error sending stock notification email:", error);
      throw error;
    } finally {
      setEmailSending(false);
    }
  };

  const handleManualEmailSend = async () => {
    try {
      await sendStockNotificationEmail();

      setLastEmailCheck(new Date());
      toast.success("Stock notification email sent successfully!");
    } catch (error) {
      toast.error("Failed to send email notification");
    }
  };

  const calculateInventoryStats = (products: Product[]): InventoryStats => {
    const totalProducts = products.length;
    const lowStockItems = products.filter(
      (p) => p.status === "low-stock" || p.status === "out-of-stock"
    ).length;
    const inventoryValue = products
      .reduce(
        (sum, product) => sum.plus(CurrencyUtil.mul(product.price || 0, product.quantity || 0)),
        CurrencyUtil.parse(0)
      )
      .toFixed(2);

    return {
      totalProducts,
      lowStockItems,
      lowStockChange: 0,
      inventoryValue,
      inventoryValueChange: 0,
    };
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { color: "bg-red-100 text-red-700", text: "No Stock" };
    } else if (quantity < 30) {
      return { color: "bg-amber-100 text-amber-700", text: "Low Stock" };
    } else {
      return { color: "bg-green-100 text-green-700", text: "In Stock" };
    }
  };

  const getStockPercentage = (quantity: number, maxStock: number = 1000) => {
    return Math.round((quantity / maxStock) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 0) return "bg-red-500";
    if (percentage < 25) return "bg-amber-500";
    return "bg-emerald-500";
  };

  // Auto-refresh inventory data every 5 minutes
  useEffect(() => {
    fetchInventory();

    const interval = setInterval(() => {
      fetchInventory();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Separate effect for automatic email notifications every 24 hours
  useEffect(() => {
    if (!emailNotificationEnabled) return;

    // Initial check after component mounts and products are loaded

    // Set up interval for every 24 hours
    const interval = setInterval(async () => {
      if (products.length > 0) {
        await checkAndSendStockNotifications(products);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => {
      clearInterval(interval);
    };
  }, [emailNotificationEnabled, products, checkAndSendStockNotifications]); // Added missing dependencies

  if (loading) {
    return <InventorySkeleton />;
  }

  if (error) {
    return (
      <Card className="bg-red-50">
        <CardContent className="py-4">
          <p className="text-red-700">Error: {error}</p>
          <p className="text-sm text-red-600 mt-2">
            Please ensure the API server is running
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Email Notification Controls */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Mail size={20} />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotificationEnabled}
                  onChange={(e) =>
                    setEmailNotificationEnabled(e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-blue-700">
                  Auto-send email notifications every 24 hours for low stock
                  items
                </span>
              </label>
            </div>
            <div className="flex items-center gap-3">
              {lastEmailCheck && (
                <span className="text-xs text-blue-600">
                  Last sent: {lastEmailCheck.toLocaleString()}
                </span>
              )}
              <Button
                onClick={handleManualEmailSend}
                disabled={emailSending}
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-900 hover:bg-slate-100"
              >
                {emailSending ? (
                  "Sending..."
                ) : (
                  <>
                    <Mail size={16} className="mr-2" />
                    Send Now
                  </>
                )}
              </Button>
            </div>
          </div>
          {stats.lowStockItems > 0 && (
            <div className="mt-3 p-3 bg-amber-100 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle size={16} />
                <span className="text-sm font-medium">
                  {stats.lowStockItems} items need attention and will trigger
                  email notifications every 24 hours
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toString()}
          icon={<Database size={18} />}
          details={
            <div className="mt-2 text-xs space-y-1 max-h-40 overflow-y-auto">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product._id}
                  className="flex justify-between items-center"
                >
                  <span className="truncate">{product.name}</span>
                  <span className="text-muted-foreground">
                    {product.category}
                  </span>
                </div>
              ))}
              {products.length > 5 && (
                <div className="text-muted-foreground text-xs">
                  +{products.length - 5} more items
                </div>
              )}
            </div>
          }
        />

        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems.toString()}
          change={{
            value: stats.lowStockChange,
            type: stats.lowStockChange >= 0 ? "increase" : "decrease",
          }}
          icon={<Upload size={18} />}
          details={
            <div className="mt-2 text-xs space-y-1 max-h-40 overflow-y-auto">
              {products
                .filter((product) => product.status !== "in-stock")
                .slice(0, 5)
                .map((product) => (
                  <div
                    key={product._id}
                    className="flex justify-between items-center"
                  >
                    <span className="truncate">{product.name}</span>
                    <span
                      className={
                        product.quantity === 0
                          ? "text-red-500"
                          : "text-amber-500"
                      }
                    >
                      {product.quantity} left
                    </span>
                  </div>
                ))}
              {stats.lowStockItems === 0 && (
                <div className="text-gray-500">All items well stocked</div>
              )}
            </div>
          }
        />
        <StatCard
          title="Inventory Value"
          value={`${CURRENCY_SYMBOL} ${formatCurrencyValue(stats.inventoryValue)}`}
          change={{
            value:Number(stats.inventoryValueChange),
            type: Number(stats.inventoryValueChange) >= 0 ? "increase" : "decrease",
          }}
          icon={<BarChart3 size={18} />}
          details={
            <div className="mt-2 text-xs space-y-2">
              <div className="font-medium">Top Valued Products:</div>
              {[...products]
                .sort(
                  (a, b) =>
                    CurrencyUtil.mul(b.price || 0, b.quantity || 0)
                      .minus(CurrencyUtil.mul(a.price || 0, a.quantity || 0))
                      .toNumber()
                )
                .slice(0, 3)
                .map((product) => (
                  <div key={product._id} className="flex justify-between">
                    <span className="truncate">{product.name}</span>
                    <span className="text-emerald-500">
                      {CURRENCY_SYMBOL}{formatCurrencyValue(CurrencyUtil.mul(product.price || 0, product.quantity || 0))}
                    </span>
                  </div>
                ))}
            </div>
          }
        />
      </div>

      <Card>

      <CardHeader className="sticky flex flex-wrap items-center justify-between -top-7 z-30 bg-gray-50/95 backdrop-blur-md pt-1 pb-4 gap-3">
          <CardTitle className="font-bold text-xl sm:text-2xl lg:text-3xl">Inventory Status</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* <div className="bg-gray-50 p-2 rounded-md">
              <BulkUpload />
            </div> */}
            {/* <AddInventoryButton /> */}
            <DownloadInventoryCSVButton products={products} />
          </div>
        </CardHeader>

        <CardContent>
          <SearchComponent
            data={products}
            searchFields={["name", "category", "_id"]}
            placeholder="Search products by name, category, or ID..."
            renderResults={(filteredProducts) => (
              <>
                {filteredProducts.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">
                    No matching inventory items found.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        {user.role === "admin" && (
                          <TableHead>Actions</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => {
                        const stockPercentage = getStockPercentage(
                          product.quantity,
                          product.maxStock
                        );
                        const status = getStockStatus(product.quantity);

                        return (
                          <TableRow key={product._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  ID: {product._id.slice(-4)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell>{CURRENCY_SYMBOL}{formatCurrencyValue(product.price)}</TableCell>
                            <TableCell>
                              <div className="w-full space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span>
                                    {product.quantity} / {product.maxStock}
                                  </span>
                                  <span>{stockPercentage}%</span>
                                </div>
                                <Progress
                                  value={stockPercentage}
                                  className="h-2"
                                  indicatorClassName={getProgressColor(
                                    stockPercentage
                                  )}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                              >
                                {status.text}
                              </span>
                            </TableCell>
                            {user.role === "admin" && (
                              <TableCell>
                                <div className="flex gap-2">
                                  <UpdateInventory
                                    productId={product._id}
                                    productName={product.name}
                                    productCategory={product.category}
                                    productPrice={product.price}
                                    productQuantity={product.quantity}
                                    onUpdate={(updatedProduct) => {
                                      // Handle update logic - update the product in your products array
                                      setProducts(
                                        products.map((p) =>
                                          p._id === updatedProduct._id
                                            ? { ...p, ...updatedProduct }
                                            : p
                                        )
                                      );
                                    }}
                                  />
                                  <DeleteInventory
                                    productId={product._id}
                                    productName={product.name}
                                    onDelete={(productId) => {
                                      // Handle delete logic
                                      setProducts(
                                        products.filter(
                                          (p) => p._id !== productId
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}


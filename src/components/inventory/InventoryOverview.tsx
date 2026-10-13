import { useEffect, useState, useCallback } from "react";
import {
  Database,
  Upload,
  BarChart3,
  Mail,
  AlertTriangle,
  Search,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { UpdateInventory } from "./UpdateInventory";
import { DeleteInventory } from "./DeleteInventory";
import DownloadInventoryCSVButton from "./DownloadInventorycsv";
import AddInventoryButton from "./AddInventory";
import { Product, InventoryStats } from "../../../types/inventory.types";
import { CURRENCY_SYMBOL } from "@/utils/formatCurrency";
import { useAuth } from "@/context/AuthContext";
import { formatCurrencyValue } from "@/functions/formatcurrencyvalue";
import { CurrencyUtil } from "@/utils/currency.util";
import { InventorySkeleton } from "@/skeleton/inventorySkeleton/inventorySkeleton";

const Api = import.meta.env.VITE_API_URL || "";

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
  const { user } = useAuth();
  const [emailNotificationEnabled, setEmailNotificationEnabled] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const calculateProductStatus = (
    quantity: number
  ): "in-stock" | "low-stock" | "out-of-stock" => {
    return quantity === 0
      ? "out-of-stock"
      : quantity < 30
      ? "low-stock"
      : "in-stock";
  };

  const calculateInventoryStats = (productList: Product[]): InventoryStats => {
    const totalProducts = productList.length;
    const lowStockItems = productList.filter(
      (p) => p.status === "low-stock" || p.status === "out-of-stock"
    ).length;
    const inventoryValue = productList
      .reduce(
        (sum, product) =>
          sum.plus(CurrencyUtil.mul(product.price || 0, product.quantity || 0)),
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

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
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
    } finally {
      setLoading(false);
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
    } catch (err) {
      console.error("Error sending stock notification email:", err);
      throw err;
    } finally {
      setEmailSending(false);
    }
  };

  const checkAndSendStockNotifications = useCallback(
    async (inventoryData: Product[]) => {
      try {
        const lowStockItems = inventoryData.filter(
          (product) => product.quantity <= 20
        );
        const mediumStockItems = inventoryData.filter(
          (product) => product.quantity > 20 && product.quantity <= 50
        );

        const needsNotification =
          lowStockItems.length > 0 || mediumStockItems.length > 0;

        if (needsNotification) {
          const now = new Date();
          const hoursSinceLastEmail = lastEmailCheck
            ? (now.getTime() - lastEmailCheck.getTime()) / (1000 * 60 * 60)
            : 24;

          if (hoursSinceLastEmail >= 24) {
            await sendStockNotificationEmail();
            setLastEmailCheck(now);
          }
        }
      } catch (err) {
        console.error("Error checking stock notifications:", err);
      }
    },
    [lastEmailCheck]
  );

  const handleManualEmailSend = async () => {
    try {
      await sendStockNotificationEmail();
      setLastEmailCheck(new Date());
      toast.success("Stock notification email sent successfully!");
    } catch (err) {
      toast.error("Failed to send email notification");
    }
  };

  // Auto-refresh inventory data every 5 minutes
  useEffect(() => {
    fetchInventory();
    const interval = setInterval(() => {
      fetchInventory();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Separate effect for automatic email notifications every 24 hours
  useEffect(() => {
    if (!emailNotificationEnabled) return;

    const interval = setInterval(async () => {
      if (products.length > 0) {
        await checkAndSendStockNotifications(products);
      }
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [emailNotificationEnabled, products, checkAndSendStockNotifications]);

  const getStockStatusPill = (quantity: number) => {
    if (quantity === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          No Stock
        </span>
      );
    } else if (quantity < 30) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          In Stock
        </span>
      );
    }
  };

  const getStockPercentage = (quantity: number, maxStock: number = 1000) => {
    return Math.min(100, Math.round((quantity / maxStock) * 100));
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 0) return "bg-rose-500";
    if (percentage < 25) return "bg-amber-500";
    return "bg-emerald-600";
  };

  // Derive filter categories
  const categoriesList = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchTerm ||
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product._id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    const matchesStatus =
      !selectedStatus ||
      (selectedStatus === "out-of-stock" && product.quantity === 0) ||
      (selectedStatus === "low-stock" && product.quantity > 0 && product.quantity < 30) ||
      (selectedStatus === "in-stock" && product.quantity >= 30);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return <InventorySkeleton />;
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <XCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-rose-900">Failed to Load Inventory</h3>
        <p className="text-xs text-rose-700">{error}</p>
        <button
          onClick={fetchInventory}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          <RotateCcw size={14} />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Classical Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat 1: Total Products */}
        <div className="bg-white px-5 py-1 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Products
              </span>
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Database size={18} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-2">
              {stats.totalProducts}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Active stock catalog items
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Categories</span>
            <span className="font-bold text-slate-900">{categoriesList.length} Types</span>
          </div>
        </div>

        {/* Stat 2: Low Stock Alerts */}
        <div className="bg-white px-5 py-1 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Low / Out of Stock
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Upload size={18} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">
              {stats.lowStockItems}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
              {stats.lowStockItems > 0 ? (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <AlertTriangle size={12} /> Needs restock attention
                </span>
              ) : (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> All items well stocked
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Critical threshold</span>
            <span className="font-bold text-slate-900">&lt; 30 units</span>
          </div>
        </div>

        {/* Stat 3: Total Inventory Value */}
        <div className="bg-white px-5 py-1 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Inventory Valuation
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <BarChart3 size={18} />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 font-mono">
              {CURRENCY_SYMBOL} {formatCurrencyValue(stats.inventoryValue)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Combined stock value at unit price
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Top product value</span>
            <span className="font-bold text-emerald-700">
              {products.length > 0
                ? `${CURRENCY_SYMBOL} ${formatCurrencyValue(
                    Math.max(
                      ...products.map((p) =>
                        CurrencyUtil.mul(p.price || 0, p.quantity || 0).toNumber()
                      )
                    )
                  )}`
                : "NPR 0"}
            </span>
          </div>
        </div>
      </div>

      {/* Classical Email Notification Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Low Stock Email Alerts & Dispatch
              </h4>
              <p className="text-xs text-slate-500">
                Automated daily email reports to store managers for critical low stock items
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={emailNotificationEnabled}
                onChange={(e) => setEmailNotificationEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
              />
              <span>Daily Auto Alert</span>
            </label>

            {lastEmailCheck && (
              <span className="text-[11px] text-slate-400 font-medium hidden lg:inline">
                Last dispatched: {lastEmailCheck.toLocaleTimeString()}
              </span>
            )}

            <Button
              onClick={handleManualEmailSend}
              disabled={emailSending}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-xs"
            >
              {emailSending ? (
                "Sending Alert..."
              ) : (
                <>
                  <Mail size={14} className="mr-1.5" />
                  Send Alert Now
                </>
              )}
            </Button>
          </div>
        </div>

        {stats.lowStockItems > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center gap-2 text-amber-800 text-xs font-medium">
            <AlertTriangle size={15} className="shrink-0 text-amber-600" />
            <span>
              {stats.lowStockItems} stock item{stats.lowStockItems > 1 ? "s" : ""} require restock attention and are included in the automated stock digest.
            </span>
          </div>
        )}
      </div>

      {/* Main Inventory Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Card Header & Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Inventory Items & Stock Status
              </h3>
              <p className="text-xs text-slate-500">
                Showing {filteredProducts.length} of {products.length} registered products
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {user?.role === "admin" && (
                <AddInventoryButton onInventoryAdded={fetchInventory} />
              )}
              <DownloadInventoryCSVButton products={products} />
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by product name, category, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter */}
            {categoriesList.length > 0 && (
              <div className="w-full sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50/50 font-medium text-slate-700"
                >
                  <option value="">All Categories</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="w-full sm:w-44">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50/50 font-medium text-slate-700"
              >
                <option value="">All Stock Statuses</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock (&lt; 30)</option>
                <option value="out-of-stock">Out of Stock (0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Package size={28} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No matching products found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchTerm || selectedCategory || selectedStatus
                ? "No inventory items match your current search and filter selections."
                : "No products in stock catalog. Click 'Add Inventory' to create your first item!"}
            </p>
            {(searchTerm || selectedCategory || selectedStatus) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedStatus("");
                }}
                className="text-xs font-semibold text-slate-900 hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4 min-w-[180px]">Stock Level & Capacity</th>
                  <th className="py-3 px-4">Status</th>
                  {user?.role === "admin" && (
                    <th className="py-3 px-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProducts.map((product) => {
                  const maxCap = product.maxStock || 1000;
                  const stockPct = getStockPercentage(product.quantity, maxCap);
                  const progressColor = getProgressColor(stockPct);

                  return (
                    <tr key={product._id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Product details */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            <Package size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-slate-950">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              ID: #{product._id.slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {product.category || "General"}
                        </span>
                      </td>

                      {/* Unit price */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-900">
                        {CURRENCY_SYMBOL} {formatCurrencyValue(product.price)}
                      </td>

                      {/* Stock Level & Progress */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1.5 max-w-[200px]">
                          <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                            <span>
                              <strong className="text-slate-900">{product.quantity}</strong> / {maxCap} units
                            </span>
                            <span className="text-slate-500 font-semibold">{stockPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                              style={{ width: `${stockPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStockStatusPill(product.quantity)}
                      </td>

                      {/* Admin Actions */}
                      {user?.role === "admin" && (
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <UpdateInventory
                              productId={product._id}
                              productName={product.name}
                              productCategory={product.category}
                              productPrice={product.price}
                              productQuantity={product.quantity}
                              onUpdate={(updatedProduct) => {
                                setProducts((prev) =>
                                  prev.map((p) =>
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
                                setProducts((prev) =>
                                  prev.filter((p) => p._id !== productId)
                                );
                              }}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

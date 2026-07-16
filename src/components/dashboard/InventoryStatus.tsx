import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type { TooltipProps } from "recharts";
import { SkeletonLoader } from "@/skeleton/costumerSkeleton/skeletonLoader";
import { InventoryStatusData } from "../../../types";

const API_BASE = import.meta.env.VITE_API_URL;

interface InventoryStatusChartProps {
  userId: string;
  financialViewMode?: "year" | "month" | "day";
  financialSelectedYear?: string | null;
  financialSelectedMonth?: string | null;
}

type ChartPayload = TooltipProps<ValueType, NameType>;

interface BarClickState {
  activePayload?: Array<{
    payload?: InventoryStatusData;
  }>;
}

// ---------------------------------------------------------------------------
// Design tokens — shared semantics with the financial overview: a calm,
// muted status system rather than saturated stock-light red/amber/green.
// ---------------------------------------------------------------------------

const COLOR = {
  high: "#0F766E", // teal-700
  medium: "#B45309", // amber-700
  low: "#9F1239", // rose-800
  grid: "#E2E8F0",
  axis: "#94A3B8",
};

const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const formatCount = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

const escapeCsvValue = (value: string | number) => {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const buildInventoryCsv = (rows: InventoryStatusData[]) => {
  const header = [
    "category",
    "totalItems",
    "inStock",
    "mediumStock",
    "lowStock",
    "itemName",
    "itemQuantity",
    "itemStatus",
  ];

  const lines: string[] = [header.join(",")];

  rows.forEach((row) => {
    if (row.items && row.items.length > 0) {
      row.items.forEach((item) => {
        lines.push(
          [
            row.category,
            row.totalItems,
            row.inStock,
            row.mediumStock,
            row.lowStock,
            item.name,
            item.quantity,
            item.status,
          ]
            .map(escapeCsvValue)
            .join(",")
        );
      });
    } else {
      lines.push(
        [row.category, row.totalItems, row.inStock, row.mediumStock, row.lowStock, "", "", ""]
          .map(escapeCsvValue)
          .join(",")
      );
    }
  });

  return lines.join("\n");
};

const downloadCsv = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

const TooltipRow = ({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) => (
  <div className="flex items-center justify-between gap-6 py-0.5">
    <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
      <span className="h-1.5 w-1.5 rounded-[2px]" style={{ backgroundColor: color }} />
      {label}
    </span>
    <span className="text-[12px] font-medium tabular-nums text-slate-800">
      {formatCount(value)}
    </span>
  </div>
);

const CustomTooltip = React.memo(
  ({ active, label, data }: ChartPayload & { data: InventoryStatusData[] }) => {
    if (!active || typeof label !== "string") return null;

    const currentData = data.find((item) => item.category === label);
    if (!currentData) return null;

    return (
      <div className="min-w-[190px] rounded-md border border-slate-200 bg-white px-3 py-2.5 shadow-md dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <div className="flex items-center justify-between gap-6 py-0.5">
          <span className="text-[11px] font-semibold text-slate-500">Total items</span>
          <span className="text-[12px] font-bold tabular-nums text-slate-900">
            {formatCount(currentData.totalItems)}
          </span>
        </div>
        <div className="my-1.5 h-px bg-slate-100 dark:bg-slate-800" />
        <TooltipRow color={COLOR.high} label="High stock" value={currentData.inStock} />
        <TooltipRow color={COLOR.medium} label="Medium stock" value={currentData.mediumStock} />
        <TooltipRow color={COLOR.low} label="Low stock" value={currentData.lowStock} />
      </div>
    );
  }
);

// ---------------------------------------------------------------------------
// Legend — rendered outside the chart's fixed-height container so it never
// competes with axis labels for space (the cause of the overlap).
// ---------------------------------------------------------------------------

const LegendRow = ({
  items,
}: {
  items: { label: string; color: string }[];
}) => (
  <div className="flex flex-wrap items-center gap-4">
    {items.map((item) => (
      <span
        key={item.label}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300"
      >
        <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: item.color }} />
        {item.label}
      </span>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// KPI summary card
// ---------------------------------------------------------------------------

const KpiCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) => (
  <div className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-[2px]" style={{ backgroundColor: accent }} />
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
    </div>
    <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-50">
      {formatCount(value)}
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// Status detail list (replaces the pastel-block layout)
// ---------------------------------------------------------------------------

const StatusList = ({
  label,
  color,
  count,
  items,
  emptyLabel,
}: {
  label: string;
  color: string;
  count: number;
  items: { name: string; quantity: number }[];
  emptyLabel: string;
}) => (
  <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        <span className="h-1.5 w-1.5 rounded-[2px]" style={{ backgroundColor: color }} />
        {label}
      </span>
      <span className="text-[11px] font-semibold tabular-nums text-slate-400">
        {formatCount(count)}
      </span>
    </div>
    {items.length > 0 ? (
      <div className="custom-scrollbar max-h-44 overflow-y-auto px-4 py-1">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border-b border-slate-50 py-2 last:border-0 dark:border-slate-800/60"
          >
            <span className="truncate pr-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              {item.name}
            </span>
            <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {formatCount(item.quantity)}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <p className="px-4 py-4 text-sm text-slate-400">{emptyLabel}</p>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Header action buttons (Bulk Upload / Download CSV)
// ---------------------------------------------------------------------------

const HeaderActions = ({
  onDownloadCsv,
  onBulkUploadClick,
  uploading,
  disabled,
}: {
  onDownloadCsv: () => void;
  onBulkUploadClick: () => void;
  uploading: boolean;
  disabled: boolean;
}) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={onBulkUploadClick}
      disabled={uploading}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14" />
      </svg>
      {uploading ? "Uploading..." : "Bulk Upload"}
    </button>
    <button
      type="button"
      onClick={onDownloadCsv}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14" />
      </svg>
      Download CSV
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function InventoryStatusChart({
  userId,
  financialViewMode = "year",
  financialSelectedYear = null,
  financialSelectedMonth = null,
}: InventoryStatusChartProps) {
  const [data, setData] = useState<InventoryStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchInventoryStatus = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/inventory/statuschart/${id}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 404) {
        setData([]);
        return;
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch inventory status: ${response.status}`);
      }

      const responseData = await response.json();
      setData(Array.isArray(responseData) ? responseData : []);
    } catch (err) {
      setError("Failed to load inventory status data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const handler = setTimeout(() => fetchInventoryStatus(userId), 300);
    return () => clearTimeout(handler);
  }, [userId, fetchInventoryStatus]);

  useEffect(() => {
    if (!data.length) return;
    setSelectedCategory((current) => {
      if (current && data.some((item) => item.category === current)) return current;
      return data[0].category;
    });
  }, [data]);

  const handleBarClick = useCallback((chartData: InventoryStatusData | undefined) => {
    if (!chartData?.category) return;
    setSelectedCategory(chartData.category);
  }, []);

  const selectedData = useMemo(
    () => (selectedCategory ? data.find((item) => item.category === selectedCategory) : null),
    [selectedCategory, data]
  );

  const inStockItems = useMemo(
    () => selectedData?.items?.filter((item) => item.status === "inStock") || [],
    [selectedData]
  );
  const mediumStockItems = useMemo(
    () => selectedData?.items?.filter((item) => item.status === "mediumStock") || [],
    [selectedData]
  );
  const lowStockItems = useMemo(
    () => selectedData?.items?.filter((item) => item.status === "lowStock") || [],
    [selectedData]
  );

  const financialContextLabel = useMemo(() => {
    if (financialViewMode === "month" && financialSelectedYear) {
      return `Synced to ${financialSelectedYear}`;
    }
    if (financialViewMode === "day" && financialSelectedYear && financialSelectedMonth) {
      return `Synced to ${MONTH_NAMES_FULL[parseInt(financialSelectedMonth)]} ${financialSelectedYear}`;
    }
    return null;
  }, [financialViewMode, financialSelectedYear, financialSelectedMonth]);

  const totals = useMemo(() => {
    return data.reduce(
      (acc, item) => ({
        total: acc.total + item.totalItems,
        high: acc.high + item.inStock,
        medium: acc.medium + item.mediumStock,
        low: acc.low + item.lowStock,
      }),
      { total: 0, high: 0, medium: 0, low: 0 }
    );
  }, [data]);

  // -- CSV download ---------------------------------------------------------
  const handleDownloadCsv = useCallback(() => {
    if (!data.length) return;
    const csv = buildInventoryCsv(data);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(csv, `inventory-status-${stamp}.csv`);
  }, [data]);

  // -- Bulk upload ------------------------------------------------------------
  const handleBulkUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleBulkUploadChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // allow re-selecting the same file later
      if (!file || !userId) return;

      try {
        setUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE}/api/inventory/bulk-upload/${userId}`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Bulk upload failed: ${response.status}`);
        }

        // Refresh the chart with newly uploaded data
        await fetchInventoryStatus(userId);
      } catch (err) {
        setUploadError("Failed to upload CSV. Please check the file and try again.");
      } finally {
        setUploading(false);
      }
    },
    [userId, fetchInventoryStatus]
  );

  const SyncBadge = () =>
    financialContextLabel ? (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        {financialContextLabel}
      </span>
    ) : null;

  // Shared sticky header, used in every render branch ----------------------
  const StickyHeader = ({ showHint = false }: { showHint?: boolean }) => (
    <div className="sticky top-0 z-20 -mx-1 mb-5 flex flex-col gap-3 bg-white/95 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-slate-950/95 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Inventory status
        </h3>
        <SyncBadge />
      </div>
      <div className="flex flex-col items-start gap-1.5 sm:items-end">
        <div className="flex items-center gap-3">
          {showHint && (
            <span className="text-[11px] text-slate-400">Click a bar to view details</span>
          )}
          <HeaderActions
            onDownloadCsv={handleDownloadCsv}
            onBulkUploadClick={handleBulkUploadClick}
            uploading={uploading}
            disabled={data.length === 0}
          />
        </div>
        {uploadError && <p className="text-[11px] text-rose-600 dark:text-rose-400">{uploadError}</p>}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleBulkUploadChange}
      />
    </div>
  );

  // Loading / error / empty ---------------------------------------------

  if (loading || error || data.length === 0) {
    return (
      <div className="flex h-full w-full flex-col">
        <StickyHeader />
        <div className="flex h-[280px] items-center justify-center sm:h-[320px]">
          {loading ? (
            <SkeletonLoader />
          ) : error ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-200 px-8 py-10 dark:border-slate-800">
              <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{error}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-200 px-8 py-10 dark:border-slate-800">
              <svg className="h-8 w-8 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                No inventory status data available
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render ------------------------------------------------------------------

  return (
    <div className="flex h-full w-full flex-col">
      <StickyHeader showHint />

      {/* KPI summary strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Total items" value={totals.total} accent="#334155" />
        <KpiCard label="High stock" value={totals.high} accent={COLOR.high} />
        <KpiCard label="Medium stock" value={totals.medium} accent={COLOR.medium} />
        <KpiCard label="Low stock" value={totals.low} accent={COLOR.low} />
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            By category
          </p>
          <LegendRow
            items={[
              { label: "High stock", color: COLOR.high },
              { label: "Medium stock", color: COLOR.medium },
              { label: "Low stock", color: COLOR.low },
            ]}
          />
        </div>
        <div className="custom-scrollbar overflow-x-auto">
          <div
            className="h-[280px] sm:h-[320px]"
            style={{ minWidth: Math.max(720, data.length * 110) }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 4, left: 0, bottom: 0 }}
                barGap={isMobile ? 3 : 6}
                barCategoryGap={isMobile ? "22%" : "28%"}
                onClick={(state: BarClickState) => {
                  if (state?.activePayload?.[0]?.payload) {
                    handleBarClick(state.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="0" vertical={false} stroke={COLOR.grid} className="dark:opacity-20" />
                <XAxis
                  dataKey="category"
                  axisLine={{ stroke: COLOR.grid }}
                  tickLine={false}
                  interval={0}
                  height={40}
                  tick={{ fill: COLOR.axis, fontSize: isMobile ? 10 : 11 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCount}
                  tick={{ fill: COLOR.axis, fontSize: isMobile ? 10 : 11 }}
                  domain={[0, "dataMax"]}
                  allowDecimals={false}
                  width={44}
                />
                <Tooltip content={<CustomTooltip data={data} />} cursor={{ fill: "rgba(100, 116, 139, 0.06)" }} />
                <Bar
                  dataKey="inStock"
                  name="High stock"
                  fill={COLOR.high}
                  barSize={isMobile ? 12 : 18}
                  radius={[2, 2, 0, 0]}
                  cursor="pointer"
                  animationDuration={400}
                />
                <Bar
                  dataKey="mediumStock"
                  name="Medium stock"
                  fill={COLOR.medium}
                  barSize={isMobile ? 12 : 18}
                  radius={[2, 2, 0, 0]}
                  cursor="pointer"
                  animationDuration={400}
                />
                <Bar
                  dataKey="lowStock"
                  name="Low stock"
                  fill={COLOR.low}
                  barSize={isMobile ? 12 : 18}
                  radius={[2, 2, 0, 0]}
                  cursor="pointer"
                  animationDuration={400}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category selector — explicit, accessible alternative to clicking bars */}
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          {data.map((item) => (
            <button
              key={item.category}
              onClick={() => setSelectedCategory(item.category)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedCategory === item.category
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {item.category}
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selectedData && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {selectedData.category} — item detail
          </p>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <StatusList
              label="High stock"
              color={COLOR.high}
              count={selectedData.inStock}
              items={inStockItems}
              emptyLabel="No items in stock"
            />
            <StatusList
              label="Medium stock"
              color={COLOR.medium}
              count={selectedData.mediumStock}
              items={mediumStockItems}
              emptyLabel="No items in medium stock"
            />
            <StatusList
              label="Low stock"
              color={COLOR.low}
              count={selectedData.lowStock}
              items={lowStockItems}
              emptyLabel="No items in low stock"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryStatusChart;
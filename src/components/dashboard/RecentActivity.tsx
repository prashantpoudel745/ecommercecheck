import { useEffect, useState } from "react";
import { Activity } from "../../../types";
import { formatCurrency } from "@/utils/formatCurrency";

const API_BASE = import.meta.env.VITE_API_URL||"";

const COLOR = {
  accounting: "#0F766E", // teal-700
  accountingBg: "#F0FDFA",
  inventory: "#B45309", // amber-700
  inventoryBg: "#FFFBEB",
  default: "#475569", // slate-600
  defaultBg: "#F1F5F9",
};

type ActivityKind = "accounting" | "inventory" | "expense" | "default";

const getActivityStyle = (collection: string, category?: string): { color: string; bg: string; kind: ActivityKind } => {
  const normalizedCategory = String(category || "").trim().toLowerCase();
  if (collection === "inventory") {
    return { color: COLOR.inventory, bg: COLOR.inventoryBg, kind: "inventory" };
  }

  if (collection === "accounting") {
    if (normalizedCategory === "sales") {
      return { color: COLOR.accounting, bg: COLOR.accountingBg, kind: "accounting" };
    }
    if (["expense", "expenses", "purchase", "purchases"].includes(normalizedCategory)) {
      return { color: "#dc2626", bg: "#fee2e2", kind: "expense" };
    }
    return { color: COLOR.accounting, bg: COLOR.accountingBg, kind: "accounting" };
  }

  return { color: COLOR.default, bg: COLOR.defaultBg, kind: "default" };
};

const ActivityIcon = ({ kind, color }: { kind: ActivityKind; color: string }) => {
  if (kind === "accounting") {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={color}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }
  if (kind === "expense") {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={color}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }
  if (kind === "inventory") {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={color}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={color}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

const formatQuantity = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

const ActivityRow = ({ activity }: { activity: Activity }) => {
  const { color, bg, kind } = getActivityStyle(activity.collection, activity.category);

  // Handles both Number and String values coming from the backend.
  const amount =
    activity.amount !== undefined &&
    activity.amount !== null &&
    activity.amount !== ""
      ? Number(activity.amount)
      : null;

  const quantity =
    activity.quantity !== undefined &&
    activity.quantity !== null
      ? Number(activity.quantity)
      : null;

  const hasAmount = amount !== null && !Number.isNaN(amount);
  const hasQuantity = quantity !== null && !Number.isNaN(quantity);

  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: bg }}
      >
        <ActivityIcon kind={kind} color={color} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {activity.name || activity.category}
          </p>

          <span className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-700">
            {activity.collection}
          </span>
        </div>

        <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
          {activity.action}

          {hasAmount && (
            <span
              className="ml-1.5 font-semibold tabular-nums"
              style={{ color }}
            >
              {formatCurrency(amount)}
            </span>
          )}

          {hasQuantity && (
            <span
              className="ml-1.5 font-semibold tabular-nums"
              style={{ color: COLOR.inventory }}
            >
              {formatQuantity(quantity)} units
            </span>
          )}
        </p>

        <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {formatDate(activity.createdAt)}
        </p>
      </div>
    </div>
  );
};

type FilterKind = "all" | "accounting" | "inventory";

const FILTERS: { key: FilterKind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "accounting", label: "Accounting" },
  { key: "inventory", label: "Inventory" },
];

const FilterTabs = ({
  active,
  onChange,
}: {
  active: FilterKind;
  onChange: (kind: FilterKind) => void;
}) => {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
      {FILTERS.map(({ key, label }) => {
        const isActive = active === key;
        const accentColor =
          key === "accounting" ? COLOR.accounting : key === "inventory" ? COLOR.inventory : COLOR.default;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className="rounded-md px-2.5 py-1 text-xs font-semibold transition-colors"
            style={
              isActive
                ? { backgroundColor: "white", color: accentColor, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }
                : { color: "#94A3B8" }
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

const RecentActivity = ({ userId }: { userId: string }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKind>("all");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/api/activity/recentactivities/${userId}`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        setActivities(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load recent activity.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchActivities();
  }, [userId]);

  const filteredActivities =
    filter === "all" ? activities : activities.filter((a) => a.collection === filter);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Recent activity
        </h3>
        <div className="flex items-center gap-2">
          <FilterTabs active={filter} onChange={setFilter} />
          <span className="hidden items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-3">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-3/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : error || activities.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-12 dark:border-slate-800">
          <svg className="h-7 w-7 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {error || "No recent activity"}
          </p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-12 dark:border-slate-800">
          <svg className="h-7 w-7 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            No {filter} activity
          </p>
        </div>
      ) : (
        <div className="custom-scrollbar flex-1 overflow-y-auto pr-1">
          {filteredActivities.map((activity) => (
            <ActivityRow key={activity._id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
import { cn } from "@/lib/utils";
import { StatCardProps } from "../../../types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function StatCard({ title, value, change, icon, details, className }: StatCardProps) {
  // Helper to parse change string or object
  const renderChangePill = () => {
    if (!change) return null;

    let changeText = "";
    let isPositive = false;
    let isNegative = false;

    if (typeof change === "object" && change !== null) {
      isPositive = change.type === "increase" || change.value > 0;
      isNegative = change.type === "decrease" || change.value < 0;
      changeText = `${isPositive ? "+" : ""}${change.value}%`;
    } else {
      const str = String(change).trim();
      changeText = str;
      if (str.startsWith("+")) {
        isPositive = true;
      } else if (str.startsWith("-")) {
        isNegative = true;
      } else {
        const parsed = parseFloat(str);
        if (!isNaN(parsed)) {
          if (parsed > 0) isPositive = true;
          else if (parsed < 0) isNegative = true;
        }
      }
    }

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums border transition-colors",
          isPositive
            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
            : isNegative
            ? "bg-rose-50 text-rose-700 border-rose-200/80"
            : "bg-slate-100 text-slate-600 border-slate-200"
        )}
      >
        {isPositive && <TrendingUp size={12} className="shrink-0 text-emerald-600" />}
        {isNegative && <TrendingDown size={12} className="shrink-0 text-rose-600" />}
        {!isPositive && !isNegative && <Minus size={12} className="shrink-0 text-slate-400" />}
        <span>{changeText}</span>
      </span>
    );
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300/90 transition-all duration-200",
        className
      )}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans">
          {title}
        </span>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-slate-100/80 text-slate-700 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 group-hover:bg-slate-900 group-hover:text-white transition-all duration-200">
            {icon}
          </div>
        )}
      </div>

      {/* Main Value & Trend Row */}
      <div className="mt-3 space-y-1.5">
        <div className="text-xl sm:text-xl font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </div>

        {(change || details) && (
          <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
            {renderChangePill()}
            {details && (
              <span className="text-xs text-slate-500 font-medium">
                {details}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StatCardProps } from "../../../types";

export function StatCard({ title, value, change, icon, details, className }: StatCardProps) {
  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <CardContent className="flex flex-1 items-center justify-between p-4 sm:p-5 lg:p-6">
        <div className="space-y-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">
            {title}
          </p>
          <h3 className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg lg:text-xl truncate">
            {value}
          </h3>
        </div>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition-transform hover:scale-105 sm:h-12 sm:w-12">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

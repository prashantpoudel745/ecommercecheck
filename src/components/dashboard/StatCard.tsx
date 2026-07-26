import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StatCardProps } from "../../../types";

export function StatCard({ title, value, change, icon, details, className }: StatCardProps) {
  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <CardContent className="flex flex-1 items-center justify-between p-5 sm:p-6">
        <div className="space-y-1 sm:space-y-1">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>
          <h3 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
            {value}
          </h3>
        </div>
        {icon && (
          <div className="flex h-6 w-6 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition-transform hover:scale-105 sm:h-14 sm:w-14">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export function ShellCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ShellPanel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.9))] p-6 shadow-[0_12px_36px_rgba(15,23,42,0.04)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

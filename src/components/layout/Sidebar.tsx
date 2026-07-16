import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChartBar,
  BrainCircuit,
  Database,
  LayoutDashboard,
  Globe,
  Upload,
  ChartSpline,
  UserPlus,
  CheckCheck,
  Goal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { label: t("navigation.dashboard", "Dashboard"), icon: <LayoutDashboard size={20} />, path: "/" },
    { label: t("navigation.insights", "Insights"), icon: <BrainCircuit size={20} />, path: "/insights" },
    { label: t("navigation.accounting", "Accounting"), icon: <ChartBar size={20} />, path: "/accounting" },
    { label: t("navigation.goals", "Goals"), icon: <Goal size={20} />, path: "/prediction" },
    {
      label: t("navigation.investments", "Investments"),
      icon: <ChartSpline size={20} />,
      path: "/investments",
    },
    {
      label: t("navigation.attendance", "Attendance"),
      icon: <CheckCheck size={20} />,
      path: "/attendance",
    },
    { label: t("navigation.crm", "CRM"), icon: <Database size={20} />, path: "/crm" },
    {
      label: t("navigation.employees", "Employees"),
      icon: <UserPlus size={20} />,
      path: "/employees",
    },
    { label: t("navigation.inventory", "Inventory"), icon: <Upload size={20} />, path: "/inventory" },
  ];

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r border-slate-800/80 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.35)] transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="border-b border-slate-800/80 px-4 py-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center") }>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500 to-blue-700 text-sm font-semibold text-white shadow-lg shadow-sky-950/30">
            B
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-[15px] font-semibold tracking-wide text-white">Bebasthapan</h2>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Operations console</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-3 top-3 text-slate-300 hover:bg-slate-800 hover:text-white",
            collapsed && "right-1/2 translate-x-1/2"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {collapsed ? (
              <path d="m9 18 6-6-6-6" />
            ) : (
              <path d="m15 18-6-6 6-6" />
            )}
          </svg>
        </Button>
      </div>

      <nav className="flex-1 py-4">
        <div className="px-4 pb-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
          {!collapsed ? "Workspace" : ""}
        </div>
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <TooltipProvider
                delayDuration={0}
                disableHoverableContent={!collapsed}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200",
                        location.pathname === item.path
                          ? "bg-white/10 text-white ring-1 ring-white/10"
                          : "text-slate-300 hover:bg-white/5 hover:text-white",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <span className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition-colors group-hover:bg-white/10 group-hover:text-white",
                        location.pathname === item.path && "bg-sky-500/15 text-sky-300"
                      )}>
                        {item.icon}
                      </span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import {
  ChartBar,
  BrainCircuit,
  Database,
  LayoutDashboard,
  Upload,
  ChartSpline,
  UserPlus,
  CheckCheck,
  Goal,
  Plus,
  CirclePlus,
  ShoppingCart,
  Banknote,
  FileText,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Auto-close mobile sidebar on navigation
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

  const handleQuickCreate = (itemPath: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate(`${itemPath}/new`);
  };

  const menuItems = [
    { label: t("navigation.dashboard", "Dashboard"), icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { label: t("navigation.insights", "Insights"), icon: <BrainCircuit size={20} />, path: "/insights" },
    { label: t("navigation.crm", "CRM"), icon: <Database size={20} />, path: "/crm" },
    {
      label: "Sales",
      icon: <ShoppingCart size={20} />,
      id: "sales",
      subItems: [
        { label: "Quotations", path: "/sales/quotations", canCreate: true },
        { label: "Sales Orders", path: "/sales/orders", canCreate: true },
        { label: "Invoice", path: "/sales/invoice", canCreate: true },
        // { label: "Credit Notes", path: "/sales/credit-notes", canCreate: true },
        { label: "Customers", path: "/sales/customers", canCreate: true },
      ]
    },
    {
      label: "Purchase",
      icon: <Banknote size={20} />,
      id: "purchase",
      subItems: [
        { label: "Purchase Order",   path: "/purchase/orders",          canCreate: true },
        { label: "Purchase Bills",   path: "/purchase/bills",           canCreate: true },
        { label: "Supplier Payment", path: "/purchase/supplier-payment",canCreate: true },
        { label: "Expenses",         path: "/purchase/expenses",        canCreate: true },
        { label: "Suppliers",        path: "/purchase/suppliers",       canCreate: true },
        // { label: "Debit Notes",   path: "/purchase/debit-notes",    canCreate: true }, // IRD
      ]
    },
    { 
      label: t("navigation.accounting", "Accounting"), 
      icon: <ChartBar size={20} />, 
      path: "/accounting",
      id: "accounting",
      subItems: [
        { label: "Overview", path: "/accounting/dashboard" },
        { label: "Journal Voucher", path: "/accounting/journal-vouchers" },
        // { label: "Cash Transfers", path: "/accounting/cash-transfers", canCreate: true },
        { label: "Charts Of Account", path: "/accounting/chart-of-accounts" },
        { label: "Financial Reports", path: "/accounting/financial-reports" },
      ]
    },
    { 
      label: t("navigation.inventory", "Inventory"), 
      icon: <Upload size={20} />, 
      path: "/inventory",
      id: "inventory",
      subItems: [
        { label: "Products", path: "/inventory/products", canCreate: true },
        // { label: "Categories", path: "/inventory/categories", canCreate: true },
      ]
    },
    { label: t("navigation.goals", "Goals"), icon: <Goal size={20} />, path: "/prediction" },
    // {
    //   label: t("navigation.investments", "Investments"),
    //   icon: <ChartSpline size={20} />,
    //   path: "/investments",
    //   roles: ["admin", "superadmin"],
    // },
    {
      label: t("navigation.attendance", "Attendance"),
      icon: <CheckCheck size={20} />,
      path: "/attendance",
      roles: ["admin", "hr", "employee", "superadmin"],
    },
    {
      label: t("navigation.employees", "Employees"),
      icon: <UserPlus size={20} />,
      path: "/employees",
    },
    {
      label: "Company Settings",
      icon: <Settings size={20} />,
      id: "settings",
      subItems: [
        { label: "Company Profile (IRD)", path: "/settings/company" },
        // { label: "Backup & Restore ",   path: "/settings/backup"  },
      ],
    },
  ];

  const allowedMenuItems = menuItems.filter((item) => 
    !item.roles || item.roles.includes(user?.role || "")
  );

  // Shared nav content — rendered in both desktop and mobile containers
  const navContent = (
    <>
      <div className="relative flex items-center justify-between border-b border-slate-800/80 px-3 py-4">
        <div className={cn("flex min-w-0 items-center gap-3", collapsed && "hidden")}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
            <img src="/images/logo.png" alt="Logo" className="h-9 w-9 object-contain" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold tracking-wide text-white">
              Bebasthapan
            </h2>
          </div>
        </div>

        {/* Desktop collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex shrink-0 text-slate-300 hover:bg-slate-800 hover:text-white mx-auto"
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
            {collapsed ? <path d="m9 18 6-6-6-6" /> : <path d="m15 18-6-6 6-6" />}
          </svg>
        </Button>

        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0 text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={onMobileClose}
        >
          <X size={20} />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <ul className="space-y-1 px-2">
          {allowedMenuItems.map((item, index) => (
            <li key={item.id || item.path || index}>
              {item.subItems ? (
                !collapsed ? (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={item.id || ""} className="border-none">
                      <AccordionTrigger className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200 text-slate-300 hover:bg-white/5 hover:text-white hover:no-underline [&[data-state=open]]:bg-white/5 [&[data-state=open]]:text-white">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition-colors group-hover:bg-white/10 group-hover:text-white">
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-2">
                        <ul className="space-y-1 pl-11 pr-2">
                          {item.subItems.map((subItem, subIndex) => (
                            <li key={subIndex} className="flex items-center justify-between group/sub">
                              <Link
                                to={subItem.path || "#"}
                                className="block flex-1 rounded-md px-3 py-2 text-sm text-slate-400 transition-colors hover:text-white hover:bg-white/5"
                              >
                                {subItem.label}
                              </Link>
                              {subItem.canCreate && (
                                <button 
                                  onClick={(e) => handleQuickCreate(subItem.path || "", e)}
                                  className="opacity-0 group-hover/sub:opacity-100 p-1 text-emerald-500 hover:text-emerald-400 transition-opacity"
                                  title={`Create ${subItem.label}`}
                                >
                                  <Plus size={16} />
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <TooltipProvider delayDuration={0} disableHoverableContent={false}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200",
                            location.pathname === item.path
                              ? "bg-white/10 text-white ring-1 ring-white/10"
                              : "text-slate-300 hover:bg-white/5 hover:text-white",
                            "justify-center px-2"
                          )}
                        >
                          <span className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition-colors group-hover:bg-white/10 group-hover:text-white",
                            location.pathname === item.path && "bg-sky-500/15 text-sky-300"
                          )}>
                            {item.icon}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="!p-0">
                        <ul className="space-y-1 bg-slate-900 rounded-md p-2 shadow-lg">
                          {item.subItems.map((subItem, subIndex) => (
                            <li key={subIndex}>
                              <Link
                                to={subItem.path || "#"}
                                className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5"
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              ) : (
                <TooltipProvider delayDuration={0} disableHoverableContent={!collapsed}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path || "#"}
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
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer Profile Area Optional */}
      {/* {!collapsed && (
        <div className="p-4 border-t border-slate-800/80">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-medium">
               {user?.name?.charAt(0) || "U"}
             </div>
             <div className="min-w-0 flex-1">
               <p className="text-sm font-medium text-white truncate">{user.fullName || "guest user"}</p>
               <p className="text-sm font-medium text-white truncate">{user.email || "guestuser123@gmail.com"}</p>
             </div>
           </div>
        </div>
      )} */}
    </>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <div
        className={cn(
          "relative hidden lg:flex h-screen flex-col border-r border-slate-800/80 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.35)] transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {navContent}
      </div>

      {/* ── Mobile Backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* ── Mobile Sidebar Drawer ── */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.35)] transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </div>
    </>
  );
}


import { useState } from "react";
import ChartOfAccounts from "./ChartOfAccounts";
import VoucherBook from "./VoucherBook";
import FinancialReports from "./FinancialReports";
import ClientSection from "./ClientSection";
import FiscalPeriodManager from "./FiscalPeriodManager";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  PieChart,
  Users,
  CalendarRange,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import AccountingDashboard from "./AccountingDashboard";
import ErrorBoundary from "./ErrorBoundary";

export default function AccountingOverview() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "coa" | "vouchers" | "reports" | "clients" | "fiscal"
  >("dashboard");

  const navTabs = [
    { id: "dashboard", label: "Financial Overview", icon: LayoutDashboard, badge: null },
    { id: "coa", label: "Chart of Accounts", icon: FileText, badge: null },
    { id: "vouchers", label: "Voucher Book", icon: BookOpen, badge: "GL" },
    { id: "clients", label: "Client & Vendor Ledgers", icon: Users, badge: null },
    { id: "reports", label: "Financial Statements & VAT", icon: PieChart, badge: "P&L / BS" },
    { id: "fiscal", label: "Fiscal Period Manager", icon: CalendarRange, badge: null },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Enterprise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Enterprise Accounting & General Ledger
            </h1>
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              <ShieldCheck size={13} className="text-indigo-600" />
              IRD Nepal Compliant
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Double-entry ledger, voucher journal entries, chart of accounts, party ledgers, P&L, balance sheets, and fiscal year period control.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <Landmark size={14} className="text-slate-600" />
            <span>Double Entry Standard</span>
          </div>
        </div>
      </div>

      {/* Enterprise Tab Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Icon size={16} className={isActive ? "text-white" : "text-slate-500"} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-md font-extrabold uppercase ${
                      isActive
                        ? "bg-slate-800 text-slate-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Panel with ErrorBoundary */}
      <ErrorBoundary key={activeTab}>
        {activeTab === "dashboard" && <AccountingDashboard />}
        {activeTab === "coa" && <ChartOfAccounts />}
        {activeTab === "vouchers" && <VoucherBook />}
        {activeTab === "clients" && <ClientSection />}
        {activeTab === "reports" && <FinancialReports />}
        {activeTab === "fiscal" && <FiscalPeriodManager />}
      </ErrorBoundary>
    </div>
  );
}

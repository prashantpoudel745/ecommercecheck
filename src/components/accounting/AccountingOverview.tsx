import { useState } from "react";
import ChartOfAccounts from "./ChartOfAccounts";
import VoucherBook from "./VoucherBook";
import FinancialReports from "./FinancialReports";
import ClientSection from "./ClientSection";
import FiscalPeriodManager from "./FiscalPeriodManager";
import { LayoutDashboard, FileText, BookOpen, PieChart, Users, CalendarRange } from "lucide-react";
import AccountingDashboard from "./AccountingDashboard";
import ErrorBoundary from "./ErrorBoundary";

export default function AccountingOverview() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "coa" | "vouchers" | "reports" | "clients" | "fiscal">("dashboard");

  const TabButton = ({ id, label, icon: Icon }: { id: "dashboard" | "coa" | "vouchers" | "reports" | "clients" | "fiscal", label: string, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
        activeTab === id 
        ? "bg-slate-900 text-white font-medium shadow-sm" 
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
        {/* Sticky Navigation Tabs */}
        <div className="sticky top-0 z-10 flex space-x-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
            <TabButton id="dashboard" label="Overview" icon={LayoutDashboard} />
            <TabButton id="coa" label="Chart of Accounts" icon={FileText} />
            <TabButton id="vouchers" label="Voucher Book" icon={BookOpen} />
            <TabButton id="clients" label="Clients" icon={Users} />
            <TabButton id="reports" label="Financial Reports" icon={PieChart} />
            <TabButton id="fiscal" label="Fiscal Periods" icon={CalendarRange} />
        </div>

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

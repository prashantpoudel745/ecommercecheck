import { useState, useEffect } from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import { 
  getAccountingHealth, 
  getTrialBalance, 
  getPandL, 
  getBalanceSheet, 
  getVatReport,
  seedDefaults 
} from "../../services/accounting.service";
import { 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TBAccount {
  name: string;
  group?: string;
  debit: number;
  credit: number;
}

export default function FinancialReports() {
  const [activeTab, setActiveTab] = useState<"tb" | "pl" | "bs" | "vat" | "health">("tb");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  const fetchReport = async (tab: string) => {
    setLoading(true);
    try {
      let res;
      if (tab === "tb") res = await getTrialBalance();
      if (tab === "pl") res = await getPandL();
      if (tab === "bs") res = await getBalanceSheet();
      if (tab === "vat") res = await getVatReport();
      // if (tab === "health") res = await getAccountingHealth();
      setData(res);
    } catch (error) {
      // console.error("Error fetching report:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm("Seed default groups and recommended ledger accounts? This is optional and will create standard Tally/Nepal default structures if you don't want to create them manually.")) return;
    setLoading(true);
    try {
      await seedDefaults();
      await fetchReport(activeTab);
    } catch (e: any) {
      console.error("Failed to seed defaults", e);
    } finally {
      setLoading(false);
    }
  };

  const Currency = ({ value, className = "" }: { value: number, className?: string }) => (
    <span className={`${value < 0 ? "text-rose-500" : ""} font-mono font-bold ${className}`}>
      {formatCurrency(Math.abs(value || 0))}
    </span>
  );

  const renderTB = () => {
    if (!data) return <div className="text-center py-12 text-slate-400 italic">No trial balance data found.</div>;
    const accountGroupKeys = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"];
    
    return (
  <div className="space-y-4 animate-in fade-in duration-500">
    <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm bg-white relative isolate">
      <div className="max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="sticky top-5 z-10 bg-slate-50 border-b px-6 py-4 text-left font-bold text-slate-500 uppercase text-[10px]">Account Ledger</th>
              <th className="sticky top-5 z-10 bg-slate-50 border-b px-6 py-4 text-left font-bold text-slate-500 uppercase text-[10px]">Group</th>
              <th className="sticky top-5 z-10 bg-slate-50 border-b px-6 py-4 text-right font-bold text-slate-500 uppercase text-[10px]">Debit</th>
              <th className="sticky top-5 z-10 bg-slate-50 border-b px-6 py-4 text-right font-bold text-slate-500 uppercase text-[10px]">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accountGroupKeys.map((key) => {
              const accounts = data?.[key];
              if (!Array.isArray(accounts) || accounts.length === 0) return null;
              return accounts.map((acc: TBAccount, i: number) => (
                <tr key={`${key}-${i}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{acc.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium lowercase">{key}</td>
                  <td className="px-6 py-4 text-right">
                    {acc.debit > 0 ? <Currency value={acc.debit} /> : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {acc.credit > 0 ? <Currency value={acc.credit} /> : "-"}
                  </td>
                </tr>
              ));
            })}
            <tr className="sticky bottom-0 z-10 bg-slate-900 text-white font-bold">
              <td colSpan={2} className="px-6 py-4 text-right uppercase tracking-widest text-xs">Total Trial Balance</td>
              <td className="px-6 py-4 text-right"><Currency value={data?.totalDebit || 0} className="text-white" /></td>
              <td className="px-6 py-4 text-right"><Currency value={data?.totalCredit || 0} className="text-white" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
  };
  const renderPL = () => {
    if (!data) return <div className="text-center py-12 text-slate-400 italic">No P&L data found.</div>;
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-lg bg-emerald-50/30">
            <CardHeader className="pb-2 border-b border-emerald-100/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-emerald-700 font-bold flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5" /> Trading Revenue
                </CardTitle>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Total: {formatCurrency(data?.totalRevenue || 0)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {Array.isArray(data?.revenue) && data.revenue.length > 0 ? data.revenue.map((acc: any, i: number) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-white/40 last:border-0">
                  <span className="text-slate-600">{acc.name}</span>
                  <Currency value={(acc.credit || 0) - (acc.debit || 0)} />
                </div>
              )) : <p className="text-xs text-slate-400 italic">No revenue recorded.</p>}
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-rose-50/30">
            <CardHeader className="pb-2 border-b border-rose-100/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-rose-700 font-bold flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5" /> Operating Expenses
                </CardTitle>
                <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-none">Total: {formatCurrency(data?.totalExpenses || data?.totalExpense || 0)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {Array.isArray(data?.expenses) && data.expenses.length > 0 ? data.expenses.map((acc: any, i: number) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-white/40 last:border-0">
                  <span className="text-slate-600">{acc.name}</span>
                  <Currency value={(acc.debit || 0) - (acc.credit || 0)} />
                </div>
              )) : <p className="text-xs text-slate-400 italic">No expenses recorded.</p>}
            </CardContent>
          </Card>
        </div>

        <div className={`p-8 rounded-3xl text-center shadow-xl border-4 ${
          (data?.netProfit || 0) >= 0 ? "bg-emerald-600 border-emerald-500 text-white" : "bg-rose-600 border-rose-500 text-white"
        }`}>
          <p className="text-xs uppercase font-black tracking-[0.2em] mb-2 opacity-80">Final Performance Result</p>
          <h2 className="text-5xl font-black">
            {(data?.netProfit || 0) >= 0 ? "PROFIT: " : "LOSS: "}
            {formatCurrency(Math.abs(data?.netProfit || 0))}
          </h2>
        </div>
      </div>
    );
  };

  const renderBS = () => {
    if (!data) return <div className="text-center py-12 text-slate-400 italic">No balance sheet data found.</div>;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
        <div className="space-y-6">
          <Section label="Assets" items={data.assets} total={data.totalAssets} color="emerald" icon={TrendingUp} />
        </div>
        <div className="space-y-6">
          <Section label="Equity" items={data.equity} color="indigo" extra={{ label: "Net Profit", val: data.netProfit }} />
          <Section label="Liabilities" items={data.liabilities} total={data.totalLiabilitiesAndEquity} color="rose" icon={TrendingDown} isTotalJoint={true} />
        </div>
        {data.isBalanced === false && (
          <div className="col-span-full p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-center font-bold">
            ⚠️ Attention: Balance Sheet is currently out of sync by {formatCurrency(Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity))}
          </div>
        )}
      </div>
    );
  };

  const renderVAT = () => {
    if (!data) return <div className="text-center py-12 text-slate-400 italic">No VAT data found.</div>;

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            ["Taxable Sales", data.taxableSales],
            ["Taxable Purchases", data.taxablePurchases],
            ["Output VAT", data.outputVat],
            ["Input VAT", data.inputVat],
          ].map(([label, value]) => (
            <Card key={String(label)} className="border-none shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-xl"><Currency value={Number(value || 0)} /></CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="border-none shadow-lg bg-slate-950 text-white">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Nepal VAT Position</p>
              <h3 className="text-2xl font-black">
                {data.netVatPayable > 0 ? "VAT Payable" : data.netVatRefundable > 0 ? "VAT Refundable/Credit" : "No Net VAT"}
              </h3>
            </div>
            <div className="text-3xl font-black">
              {formatCurrency(data.netVatPayable || data.netVatRefundable || 0)}
            </div>
          </CardContent>
        </Card>

        <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm bg-white">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="sticky top-0 z-10 bg-slate-50 border-b px-5 py-3 text-left text-[10px] uppercase text-slate-500">Voucher</th>
                  <th className="sticky top-0 z-10 bg-slate-50 border-b px-5 py-3 text-left text-[10px] uppercase text-slate-500">Party</th>
                  <th className="sticky top-0 z-10 bg-slate-50 border-b px-5 py-3 text-right text-[10px] uppercase text-slate-500">Taxable</th>
                  <th className="sticky top-0 z-10 bg-slate-50 border-b px-5 py-3 text-right text-[10px] uppercase text-slate-500">Output VAT</th>
                  <th className="sticky top-0 z-10 bg-slate-50 border-b px-5 py-3 text-right text-[10px] uppercase text-slate-500">Input VAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.vouchers || []).slice(0, 30).map((voucher: any) => (
                  <tr key={`${voucher.voucherNumber}-${voucher.date}`} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold">{voucher.voucherNumber}</td>
                    <td className="px-5 py-3 text-slate-500">{voucher.partyName || "-"}</td>
                    <td className="px-5 py-3 text-right"><Currency value={voucher.taxableAmount || 0} /></td>
                    <td className="px-5 py-3 text-right"><Currency value={voucher.outputVat || 0} /></td>
                    <td className="px-5 py-3 text-right"><Currency value={voucher.inputVat || 0} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderHealth = () => {
    if (!data) return <div className="text-center py-12 text-slate-400 italic">No accounting health data found.</div>;
    const ready = Boolean(data.marketLaunchReady);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Card className={`border-none shadow-lg ${ready ? "bg-emerald-600" : "bg-amber-600"} text-white`}>
          <CardContent className="p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-start gap-4">
              {ready ? <ShieldCheck className="w-9 h-9" /> : <AlertTriangle className="w-9 h-9" />}
              <div>
                <p className="text-xs uppercase tracking-[0.18em] opacity-80">Market Launch Readiness</p>
                <h3 className="text-2xl font-black">{data.verdict}</h3>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-5xl font-black">{data.readinessScore}/100</div>
              {!ready && (
                <Button 
                  onClick={handleSeedDefaults} 
                  className="bg-white text-amber-700 hover:bg-slate-100 font-bold px-4 py-1 h-auto text-xs"
                >
                  Run Default Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-rose-700">Critical Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.issues?.length ? data.issues.map((issue: any) => (
                <div key={issue.code + issue.message} className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm text-rose-800">
                  {issue.message}
                </div>
              )) : <p className="text-sm text-slate-500">No critical accounting issue detected.</p>}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-amber-700">Warnings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.warnings?.length ? data.warnings.map((warning: any) => (
                <div key={warning.code + warning.message} className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
                  {warning.message}
                </div>
              )) : <p className="text-sm text-slate-500">No launch warning detected.</p>}
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Nepal Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            {(data.nepalContext || []).map((line: string) => <p key={line}>{line}</p>)}
          </CardContent>
        </Card>
      </div>
    );
  };

  const Section = ({ label, items, total, color, icon: Icon, extra, isTotalJoint }: any) => (
    <Card className="border-none shadow-md bg-white">
      <CardHeader className="pb-3 px-6 border-b border-slate-50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">{label}</CardTitle>
        {Icon && <Icon className={`w-4 h-4 text-${color}-500 opacity-50`} />}
      </CardHeader>
      <CardContent className="px-6 py-4 space-y-2">
        {Array.isArray(items) && items.map((item: any, i: number) => (
          <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b last:border-0 border-slate-50">
            <span className="text-slate-700 font-medium">{item.name}</span>
            <Currency value={Math.abs((item.debit || 0) - (item.credit || 0))} />
          </div>
        ))}
        {extra && (
          <div className="flex justify-between items-center text-sm py-2 px-3 bg-indigo-50 rounded-lg text-indigo-700 font-bold border border-indigo-100">
            <span>{extra.label}</span>
            <Currency value={extra.val} />
          </div>
        )}
        {(total !== undefined || isTotalJoint) && (
          <div className={`mt-4 pt-4 border-t-2 border-slate-900 flex justify-between items-center font-black text-${color}-700`}>
            <span className="uppercase text-[10px] tracking-tighter">Total {label}</span>
            <span className="text-lg font-black"><Currency value={total || 0} /></span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="sticky top-5 z-30 bg-gray-50/95 backdrop-blur-md pt-1 pb-4 space-y-4 border-b border-gray-100">
        <div className="ml-3">
          <h2 className="text-4xl font-semibold tracking-tighter bg-clip-text text-black">
            Financial Reporting
          </h2>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4" /> Real-time double-entry compliance monitoring.
          </p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
          <Button variant={activeTab === "tb" ? "default" : "ghost"} onClick={() => setActiveTab("tb")} className="rounded-xl h-10 px-6 font-bold">Trial Balance</Button>
          <Button variant={activeTab === "pl" ? "default" : "ghost"} onClick={() => setActiveTab("pl")} className="rounded-xl h-10 px-6 font-bold">P & L</Button>
          <Button variant={activeTab === "bs" ? "default" : "ghost"} onClick={() => setActiveTab("bs")} className="rounded-xl h-10 px-6 font-bold">Balance Sheet</Button>
          <Button variant={activeTab === "vat" ? "default" : "ghost"} onClick={() => setActiveTab("vat")} className="rounded-xl h-10 px-6 font-bold">VAT</Button>
          {/* <Button variant={activeTab === "health" ? "default" : "ghost"} onClick={() => setActiveTab("health")} className="rounded-xl h-10 px-6 font-bold">Health</Button> */}
        </div>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin opacity-20" />
            <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Compiling Ledger Data...</p>
          </div>
        ) : data ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            {activeTab === "tb" && renderTB()}
            {activeTab === "pl" && renderPL()}
            {activeTab === "bs" && renderBS()}
            {activeTab === "vat" && renderVAT()}
            {activeTab === "health" && renderHealth()}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <p className="text-slate-400 italic">Financial data pulse lost.</p>
            <Button onClick={() => fetchReport(activeTab)} className="bg-indigo-600 rounded-xl">Reconnect Core</Button>
          </div>
        )}
      </div>
    </div>
  );
}
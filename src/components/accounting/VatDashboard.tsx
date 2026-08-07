import { useMemo } from "react";
import { Landmark, ReceiptText, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import { CurrencyUtil } from "@/utils/currency.util";
import type { VatReport } from "../../../types/accounting.types";

const Currency = ({ value }: { value: number | string }) => (
  <span className="font-mono font-bold">{formatCurrency(CurrencyUtil.parse(value).abs())}</span>
);

export default function VatDashboard({ data }: { data: VatReport | null }) {
  const summaryCards = useMemo(() => {
    if (!data) return [];
    return [
      { label: "Output VAT", value: data.outputVat, tone: "emerald", icon: TrendingUp },
      { label: "Input VAT", value: data.inputVat, tone: "amber", icon: TrendingDown },
      { label: "Taxable Sales", value: data.taxableSales, tone: "blue", icon: Landmark },
      { label: "Taxable Purchases", value: data.taxablePurchases, tone: "rose", icon: ReceiptText },
    ];
  }, [data]);

  if (!data) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">No VAT data found for this period.</div>;
  }

  const inputVoucherRows = data.inputVatVouchers || [];
  const outputVoucherRows = data.outputVatVouchers || [];
  const netLabel = CurrencyUtil.parse(data.netVatPayable || 0).greaterThan(0)
    ? "VAT Payable"
    : CurrencyUtil.parse(data.netVatRefundable || 0).greaterThan(0)
      ? "VAT Refundable/Credit"
      : "No Net VAT";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">VAT Control Dashboard</p>
            <h2 className="text-2xl font-black text-slate-900">Input VAT vs Output VAT</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-slate-100 text-slate-700 border-none">Period: {data.period.startDate || "—"} → {data.period.endDate || "—"}</Badge>
            <Badge className="bg-slate-100 text-slate-700 border-none">Sales Source Count: {data.summary?.salesCount || 0}</Badge>
            <Badge className="bg-slate-100 text-slate-700 border-none">Purchase Source Count: {data.summary?.purchaseCount || 0}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const toneMap = {
            emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
            amber: "bg-amber-50 text-amber-700 border-amber-100",
            blue: "bg-blue-50 text-blue-700 border-blue-100",
            rose: "bg-rose-50 text-rose-700 border-rose-100",
          };
          const Icon = card.icon;
          return (
            <Card key={card.label} className={`border ${toneMap[card.tone as keyof typeof toneMap]}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>{card.label}</CardDescription>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl"><Currency value={card.value} /></CardTitle>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-none shadow-lg bg-slate-950 text-white">
        <CardContent className="p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">VAT Position</p>
            <h3 className="text-2xl font-black">{netLabel}</h3>
          </div>
          <div className="text-3xl font-black">
            {formatCurrency(CurrencyUtil.parse(data.netVatPayable || data.netVatRefundable || 0).abs())}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-emerald-700">Output VAT Sources</CardTitle>
            <CardDescription>Sales and credit-note VAT due to collect</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outputVoucherRows.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No output VAT voucher entries in this period.</p>
            ) : outputVoucherRows.map((voucher) => (
              <div key={`${voucher.voucherNumber}-${voucher.date}`} className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{voucher.voucherNumber}</p>
                    <p className="text-xs text-slate-500">{voucher.partyName || "—"}</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-none">Output: <Currency value={voucher.outputVat} /></Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-amber-700">Input VAT Sources</CardTitle>
            <CardDescription>Purchase and expense VAT available as credit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inputVoucherRows.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No input VAT voucher entries in this period.</p>
            ) : inputVoucherRows.map((voucher) => (
              <div key={`${voucher.voucherNumber}-${voucher.date}`} className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{voucher.voucherNumber}</p>
                    <p className="text-xs text-slate-500">{voucher.partyName || "—"}</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-none">Input: <Currency value={voucher.inputVat} /></Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchPurchaseProformas } from "@/services/purchase.service";
import { formatCurrency } from "@/utils/formatCurrency";

const asNumber = (value: any) => Number(value?.$numberDecimal ?? value ?? 0);

export default function PurchaseProformasPage() {
  const { data: response, isLoading } = useQuery({ queryKey: ["purchase", "proformas"], queryFn: fetchPurchaseProformas });
  const proformas = response?.data || [];

  return <div className="p-3 sm:p-4 lg:p-4">
    <div className="mb-4">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Purchase Proforma Invoices</h1>
      <p className="text-xs sm:text-sm text-slate-500">Review order estimates, then edit and issue a Purchase Invoice.</p>
    </div>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto"><table className="w-full text-left text-xs sm:text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600"><tr>
          <th className="px-4 py-3">Proforma Number</th><th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">Action</th>
        </tr></thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? <tr><td colSpan={6} className="px-4 py-5 text-center text-slate-400">Loading…</td></tr> : proformas.length === 0 ? <tr><td colSpan={6} className="px-4 py-5 text-center text-slate-400">No purchase proforma invoices found.</td></tr> : proformas.map((proforma: any) => <tr key={proforma._id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-medium text-slate-900">{proforma.proformaNumber}</td><td className="px-4 py-3">{proforma.supplierName}</td><td className="px-4 py-3">{new Date(proforma.proformaDate || proforma.createdAt).toLocaleDateString()}</td><td className="px-4 py-3">{formatCurrency(asNumber(proforma.totalAmount))}</td><td className="px-4 py-3">{proforma.status}</td>
            <td className="px-4 py-3 text-center">{proforma.status === "OPEN" && <Link to={`/purchase/bills/new?proforma=${proforma._id}`}><Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700"><ArrowRight className="mr-1 h-3 w-3" /> Edit & invoice</Button></Link>}</td>
          </tr>)}
        </tbody>
      </table></div>
    </div>
  </div>;
}

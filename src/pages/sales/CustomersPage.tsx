import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "@/services/sales.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CustomersPage() {
  const { data: response, isLoading: loading } = useQuery({
    queryKey: ["sales", "customers"],
    queryFn: fetchCustomers,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const data = (response?.data || []) as any[];

  return (
    <div className="p-3 sm:p-4 lg:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-xs sm:text-sm text-slate-500">Manage your customer database</p>
        </div>
        <Link to="/sales/customers/new">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2">
            <Plus size={16} />
            Add Customer
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Name</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Email</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Phone</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Added On</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-4 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-4 text-center text-slate-400">No customers found.</td></tr>
              ) : (
                data.map((item: any) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-900">{item.name}</td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4">{item.email}</td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4">{item.phone || "-"}</td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        {item.status || "ACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

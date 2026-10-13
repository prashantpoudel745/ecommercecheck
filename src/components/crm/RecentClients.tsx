import { Users, Building2 } from "lucide-react";

interface Client {
  _id: string;
  name: string;
  email?: string;
  companyName?: string;
  status: "due" | "paid";
  value?: number;
}

interface RecentClientsProps {
  clients: Client[];
  getInitials: (name: string) => string;
  getStatusBadge: (status: Client["status"]) => string;
  formatCurrency: (amount: number) => string;
}

export default function RecentClients({
  clients,
  getInitials,
  getStatusBadge,
  formatCurrency,
}: RecentClientsProps) {
  const recentList = clients.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden h-full flex flex-col justify-between">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recent Active Accounts</h3>
          <p className="text-xs text-slate-500">Newly registered client accounts</p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
          Top 5
        </span>
      </div>

      {recentList.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 font-medium italic">
          No recent clients registered
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Client</th>
                <th className="py-2.5 px-4">Company</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Account Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentList.map((client) => (
                <tr key={client._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {getInitials(client.name)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          {client.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {client.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                    {client.companyName || "-"}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                        client.status
                      )}`}
                    >
                      {client.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                    {formatCurrency(client.value || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

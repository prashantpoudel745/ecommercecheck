// src/components/Dashboard/InvestmentsTable.jsx
import { useEffect, useState } from "react";
import { toast } from "@/utils/notify";
import AddInvestmentForm from "./AddnewInvestment";
import { formatCurrency } from "@/utils/formatCurrency";
import { useAuth } from "@/context/AuthContext";

const InvestmentsTable = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const API = import.meta.env.VITE_API_URL||"";
  // Function to fetch investments
  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/investment`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch investments");
      }

      const data = await response.json();

      if (data.success && data.investments) {
        // Transform the data to match our table structure
        const formattedInvestments = data.investments.map((inv) => ({
          id: inv._id,
          client: inv.clientname,
          description: inv.description,
          amount: formatCurrency(inv.amount),
          rawAmount: inv.amount, // Keep raw amount for sorting
          returns: inv.returns,
          category: inv.category,
          date: new Date(inv.date || Date.now()).toLocaleDateString(),
          status: "Active", // Default status, can be modified if you add status field to your model
        }));

        setInvestments(formattedInvestments);
      } else {
        setInvestments([]);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchInvestments();
  }, []);

  // Handle investment deletion
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this investment?")) {
      try {
        const response = await fetch(`${API}/api/investment/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete investment");
        }

        toast.success("Investment deleted successfully");
        // Refresh the investments list
        fetchInvestments();
      } catch (error) {
        toast.error(error.message || "Failed to delete investment");
      }
    }
  };

  const filteredInvestments = investments.filter(
    (investment) =>
      investment.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      investment.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20 dark:ring-emerald-500/20";
      case "Lead":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-500/20";
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 ring-1 ring-inset ring-zinc-500/20";
    }
  };

  // Handler for adding a new investment
  const handleAddInvestment = (investment) => {
    // Optionally, you can optimistically update the UI or just refetch
    fetchInvestments();
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-3 gap-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 drop-shadow-sm">Investments Directory</h3>
        <div className="flex space-x-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search investors..."
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:text-zinc-100 transition-all shadow-sm w-full sm:w-64 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddInvestmentForm
            onAddInvestment={handleAddInvestment}
            userId={userId}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-center text-zinc-500 dark:text-zinc-400">Loading directory...</div>
      ) : error ? (
        <div className="p-4 text-center text-rose-500 dark:text-rose-400">{error}</div>
      ) : investments.length === 0 ? (
        <div className="p-4 text-center text-zinc-500 dark:text-zinc-400 font-medium italic">
          No investments found. Add your first investment!
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50/80 dark:bg-zinc-800/50 backdrop-blur-md">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Returns
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-transparent">
              {filteredInvestments.map((investment) => (
                <tr key={investment.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {investment.client}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300">
                    {investment.description}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {investment.amount}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 ring-1 ring-inset ring-zinc-500/10 dark:ring-zinc-400/20">
                      {investment.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {investment.returns}%
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    {investment.date}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 inline-flex text-[11px] leading-5 font-bold uppercase tracking-wider rounded-full ${getStatusClass(
                        investment.status
                      )}`}
                    >
                      {investment.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <button
                      className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium transition-colors"
                      onClick={() => handleDelete(investment.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && investments.length > 0 && (
        <div className="pt-4 flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-sm">
          <div>
            Showing <span className="font-semibold text-zinc-700 dark:text-zinc-300">1</span> to{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{filteredInvestments.length}</span> of{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{investments.length}</span> results
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentsTable;

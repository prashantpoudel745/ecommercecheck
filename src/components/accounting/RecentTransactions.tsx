import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import TransactionTable from "./TransactionTable";
import AddTransactionButton from "./AddTransaction";
import SearchComponent from "../Search";
import { Transaction } from "../../../types";

export default function RecentTransactions({
  transactions,
  loading,
  onTransactionAdded,
}: {
  transactions: Transaction[];
  loading: boolean;
  onTransactionAdded: (t: Transaction) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "PAYMENT" | "EXPENSE" | "SALES" | "RECEIPT" | "OTHER">("ALL");

  const filteredTransactions = (transactions || []).filter((t) => {
    if (filter === "ALL") return true;
    if (filter === "SALES") return t.type === "SALES" || t.category?.toLowerCase() === "sales";
    if (filter === "EXPENSE") return ["EXPENSE", "PURCHASE"].includes(t.type || "") || ["expense", "expenses", "purchase", "purchases"].includes(t.category?.toLowerCase() || "");
    if (filter === "PAYMENT") return t.type === "PAYMENT";
    if (filter === "RECEIPT") return t.type === "RECEIPT";
    if (filter === "OTHER") {
      return !["SALES", "PURCHASE", "EXPENSE", "PAYMENT", "RECEIPT"].includes(t.type || "") && 
             t.category?.toLowerCase() !== "sales" && 
             !["expense", "expenses", "purchase", "purchases"].includes(t.category?.toLowerCase() || "");
    }
    return true;
  });

  const displayedTransactions = showAll
    ? filteredTransactions
    : [...filteredTransactions]
        .sort((a, b) => {
          const dateB = new Date(b?.date || b?.updatedAt || 0).getTime();
          const dateA = new Date(a?.date || a?.updatedAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 10);

  return (
    <Card>
      {/* Sticky header: title, filters, and action buttons stay pinned while the table scrolls */}
      <CardHeader className="sticky -top-6 z-10 bg-white border-b border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <AddTransactionButton onTransactionAdded={onTransactionAdded} />
              {filteredTransactions.length > 10 && (
                <button
                  onClick={() => setShowAll(!showAll)}
  className="text-sm font-bold text-blue-600 hover:underline whitespace-nowrap"
                >
                  {showAll ? "View Less" : "View All"}
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5 bg-slate-100/80 p-1 rounded-xl w-fit border border-slate-200/50">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "ALL"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("SALES")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "SALES"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setFilter("EXPENSE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "EXPENSE"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setFilter("PAYMENT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "PAYMENT"
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setFilter("RECEIPT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "RECEIPT"
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Receipts
            </button>
            <button
              onClick={() => setFilter("OTHER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "OTHER"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Others
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            Loading transactions...
          </div>
        ) : (
          <SearchComponent
            data={displayedTransactions}
            searchFields={["description", "clientname", "category", "type", "voucherNumber", "referenceNumber"]}
            placeholder="Search transactions..."
            renderResults={(filteredTransactions) => (
              <TransactionTable 
                transactions={filteredTransactions} 
                onTransactionDeleted={() => onTransactionAdded({} as any)} // Trigger refresh
              />
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}

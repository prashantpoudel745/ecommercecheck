import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Plus, RefreshCw, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import api from "@/utils/api";
const API_URL =  import.meta.env.VITE_API_URL|| "";

interface FiscalPeriod {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
}

export default function FiscalPeriodManager() {
  const [periods, setPeriods] = useState<FiscalPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "" });

  const fetchPeriods = async () => {
    setLoading(true);
    try {
       const res= await api.get(`/erp/fiscal-periods`);
      setPeriods(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load fiscal periods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.startDate || !form.endDate) {
      toast.error("All fields are required.");
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error("End date must be after start date.");
      return;
    }
    setCreating(true);
    try {
      await api.post(`${API_URL}/api/erp/fiscal-periods`, form);
      toast.success(`Fiscal period "${form.name}" created.`);
      setForm({ name: "", startDate: "", endDate: "" });
      setShowCreate(false);
      fetchPeriods();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create fiscal period");
    } finally {
      setCreating(false);
    }
  };

  const handleLock = async (id: string, name: string) => {
    if (!confirm(`Lock fiscal period "${name}"? This will prevent any new vouchers from being posted to this period. This action is IRREVERSIBLE.`)) return;
    try {
      await api.post(`/erp/fiscal-periods/${id}/lock`);
      toast.success(`Period "${name}" locked successfully.`);
      fetchPeriods();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to lock period");
    }
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky lg:top-5 md:top-10 sm:top-10 z-30 bg-gray-50/95 backdrop-blur-md pt-1 pb-4 space-y-4 border-b border-gray-100">
        <div className="mx-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="mx-4">
            <h2 className="text-3xl font-bold tracking-tight bg-black bg-clip-text text-transparent flex items-center gap-2">
              <Calendar className="w-7 h-7 text-indigo-600" />
              Fiscal Period Manager
            </h2>
            <p className="text-muted-foreground mt-1">Define accounting years and lock closed periods to protect historical data.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchPeriods} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowCreate(true)} className="shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> New Period
            </Button>
          </div>
        </div>
      </div>

      {/* Warning banner */}
      <div className="mx-1 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-amber-600" />
        <div>
          <span className="font-black">Locking is permanent.</span> Once a fiscal period is locked, no new vouchers can be posted to dates within that period. This is an auditor-required control. Ensure you have run and saved all financial reports for the period before locking.
        </div>
      </div>

      {/* Periods table */}
      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Period Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Start Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">End Date</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Locked On</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-gray-400 italic">
                      <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin opacity-30" />
                      Loading fiscal periods...
                    </td>
                  </tr>
                ) : periods.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                      <p className="text-gray-400 italic">No fiscal periods defined yet.</p>
                      <p className="text-gray-400 text-xs mt-1">Create your first fiscal year to get started.</p>
                    </td>
                  </tr>
                ) : (
                  periods.map((period) => (
                    <tr key={period._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">{period.name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(period.startDate)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(period.endDate)}</td>
                      <td className="px-6 py-4 text-center">
                        {period.isLocked ? (
                          <Badge className="bg-red-500 hover:bg-red-600 border-none gap-1">
                            <Lock className="w-3 h-3" /> Locked
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none">Open</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {period.isLocked && period.lockedAt ? (
                          <div>
                            <div>{formatDate(period.lockedAt)}</div>
                            {period.lockedBy && <div className="text-gray-400">by {period.lockedBy}</div>}
                          </div>
                        ) : "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {!period.isLocked && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleLock(period._id, period.name)}
                          >
                            <Lock className="w-3 h-3 mr-1" /> Lock Period
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create New Period Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl border-none">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                New Fiscal Period
              </CardTitle>
              <CardDescription>Define the date range for an accounting period (e.g., Fiscal Year 2081/82).</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fp-name">Period Name <span className="text-rose-500">*</span></Label>
                <Input
                  id="fp-name"
                  placeholder="e.g., FY 2081/82 or Q1 2081"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fp-start">Start Date <span className="text-rose-500">*</span></Label>
                  <Input
                    id="fp-start"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fp-end">End Date <span className="text-rose-500">*</span></Label>
                  <Input
                    id="fp-end"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 italic">
                Once created, vouchers will be validated against open fiscal periods. Posting to a locked or undefined period will be rejected.
              </p>
            </CardContent>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <Button variant="ghost" onClick={() => { setShowCreate(false); setForm({ name: "", startDate: "", endDate: "" }); }}>Cancel</Button>
              <Button onClick={handleCreate} disabled={creating} className="px-6">
                {creating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                {creating ? "Creating..." : "Create Period"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

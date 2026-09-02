import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { 
  createQuotation, 
  createSalesOrder, 
  createInvoice, 
  createCreditNote, 
  createCustomerPayment,
  createCustomer 
} from "@/services/sales.service";

export default function QuickCreatePage() {
  const { module, entityType } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [panError, setPanError] = useState("");

  // Map URL parameters to display titles and API functions
  const getEntityConfig = () => {
    switch (entityType) {
      case "quotations":
        return { title: "Quotation", submit: createQuotation, type: "sales" };
      case "orders":
        return { title: module === "sales" ? "Sales Order" : "Purchase Order", submit: module === "sales" ? createSalesOrder : async () => {}, type: module };
      case "invoice":
        return { title: "Invoice", submit: createInvoice, type: "sales" };
      case "credit-notes":
        return { title: "Credit Note", submit: createCreditNote, type: "sales" };
      case "customer-payment":
        return { title: "Customer Payment", submit: createCustomerPayment, type: "sales" };
      case "customers":
        return { title: "Customer", submit: createCustomer, type: "sales" };
      default:
        return { title: "Item", submit: async () => {}, type: "unknown" };
    }
  };

  const config = getEntityConfig();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // IRD Compliance: validate PAN/VAT before submission
    const panVal = formData.vatNo || formData.taxNumber || "";
    if (panVal && !/^\d{9}$/.test(panVal)) {
      setPanError("PAN/VAT must be exactly 9 numeric digits (IRD Nepal requirement).");
      return;
    }
    setPanError("");

    setLoading(true);
    
    try {
      await config.submit(formData);
      toast.success(`${config.title} created successfully!`);
      navigate(`/${module}/${entityType}`); // Navigate back to list view
    } catch (error: any) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (entityType) {
      case "quotations":
      case "orders":
      case "invoice":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Customer Name</label>
                <input name="customerName" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="Enter customer name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Customer Email</label>
                <input name="customerEmail" type="email" onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="customer@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Total Amount</label>
                <input name="totalAmount" type="number" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="0.00" />
              </div>
            </div>
          </>
        );
      case "credit-notes":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Customer Name</label>
                <input name="customerName" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Credit Amount</label>
                <input name="amount" type="number" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-700">Reason</label>
                <input name="reason" onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
              </div>
            </div>
          </>
        );
      case "customer-payment":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Customer Name</label>
                <input name="customerName" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Amount</label>
                <input name="amount" type="number" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
              </div>
            </div>
          </>
        );
      case "customers":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input name="name" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input name="email" type="email" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <input name="phone" type="tel" onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  PAN / VAT Number
                  <span className="ml-1 text-xs text-amber-600 font-normal">(9 digits — IRD Required)</span>
                </label>
                <input
                  name="vatNo"
                  maxLength={9}
                  pattern="\d{9}"
                  onChange={(e) => {
                    handleInputChange(e);
                    if (e.target.value && !/^\d{9}$/.test(e.target.value)) {
                      setPanError("PAN/VAT must be exactly 9 numeric digits.");
                    } else {
                      setPanError("");
                    }
                  }}
                  className={`w-full rounded-md border p-2 focus:ring-2 outline-none ${
                    panError ? "border-red-400 focus:ring-red-400" : "focus:ring-emerald-500"
                  }`}
                  placeholder="e.g. 123456789"
                />
                {panError && <p className="text-xs text-red-500 mt-1">{panError}</p>}
              </div>
            </div>
          </>
        );
      default:
        return <div className="p-4 bg-slate-50 rounded-lg text-slate-500">Creation form for {config.title} is coming soon.</div>;
    }
  };

  return (
    <div className="p-4 sm:p-4 max-w-5xl mx-auto w-full">
      <div className="mb-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-5 shadow-sm">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Create New {config.title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Fill out the details below to create a new record.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFormFields()}
          
          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[120px]"
            >
              {loading ? "Saving..." : "Save Record"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

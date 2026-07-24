import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
    setLoading(true);
    
    try {
      await config.submit(formData);
      toast.success(`${config.title} created successfully!`);
      navigate(`/${module}/${entityType}`); // Navigate back to list view
    } catch (error: any) {
      toast.error(`Failed to create ${config.title}: ${error.message}`);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Customer Name</label>
                <input name="customerName" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Enter customer name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Customer Email</label>
                <input name="customerEmail" type="email" onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="customer@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Total Amount</label>
                <input name="totalAmount" type="number" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" />
              </div>
            </div>
          </>
        );
      case "credit-notes":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Customer Name</label>
                <input name="customerName" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Credit Amount</label>
                <input name="amount" type="number" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-700">Reason</label>
                <input name="reason" onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
          </>
        );
      case "customer-payment":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Customer Name</label>
                <input name="customerName" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Amount</label>
                <input name="amount" type="number" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
          </>
        );
      case "customers":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input name="name" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input name="email" type="email" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <input name="phone" type="tel" onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
          </>
        );
      default:
        return <div className="p-4 bg-slate-50 rounded-lg text-slate-500">Creation form for {config.title} is coming soon.</div>;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create New {config.title}</h1>
        <p className="text-slate-500 mt-1">Fill out the details below to create a new record.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
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

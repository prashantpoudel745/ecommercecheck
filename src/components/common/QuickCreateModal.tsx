import { useState } from "react";
import { X } from "lucide-react";
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

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string; // e.g., "Quotations", "Sales Orders", etc.
}

export function QuickCreateModal({ isOpen, onClose, entityType }: QuickCreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (entityType === "Quotations") await createQuotation(formData);
      else if (entityType === "Sales Orders") await createSalesOrder(formData);
      else if (entityType === "Invoice") await createInvoice(formData);
      else if (entityType === "Credit Notes") await createCreditNote(formData);
      else if (entityType === "Customer Payment") await createCustomerPayment(formData);
      else if (entityType === "Customers") await createCustomer(formData);

      toast.success(`${entityType} created successfully!`);
      onClose();
    } catch (error: any) {
      toast.error(`Failed to create ${entityType}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (entityType) {
      case "Quotations":
      case "Sales Orders":
      case "Invoice":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name</label>
              <input name="customerName" required onChange={handleInputChange} className="w-full rounded-md border p-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Amount</label>
              <input name="totalAmount" type="number" required onChange={handleInputChange} className="w-full rounded-md border p-2" />
            </div>
          </>
        );
      case "Credit Notes":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name</label>
              <input name="customerName" required onChange={handleInputChange} className="w-full rounded-md border p-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Credit Amount</label>
              <input name="amount" type="number" required onChange={handleInputChange} className="w-full rounded-md border p-2" />
            </div>
          </>
        );
      case "Customer Payment":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name</label>
              <input name="customerName" required onChange={handleInputChange} className="w-full rounded-md border p-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Amount</label>
              <input name="amount" type="number" required onChange={handleInputChange} className="w-full rounded-md border p-2" />
            </div>
          </>
        );
      case "Customers":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input name="name" required onChange={handleInputChange} className="w-full rounded-md border p-2" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input name="email" type="email" required onChange={handleInputChange} className="w-full rounded-md border p-2" />
            </div>
          </>
        );
      default:
        return <p>Form coming soon.</p>;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Create {entityType}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFormFields()}
          
          <div className="mt-8 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
              {loading ? "Saving..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

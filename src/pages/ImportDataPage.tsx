import React, { useRef, useState } from "react";
import { Upload, Download, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import api from "@/utils/api";

const MODULES = [
  {
    id: "inventory",
    title: "Import Inventory",
    description: "Upload your product catalog, quantities, and prices.",
    uploadUrl: "/inventory/bulk-upload",
    templateHeaders: "name,category,quantity,price",
    templateFileName: "inventory_template.csv",
  },
  {
    id: "sales",
    title: "Import Sales (Invoices)",
    description: "Upload sales invoices. Rows with the same invoiceNumber are grouped.",
    uploadUrl: "/sales/invoices/bulk-upload",
    templateHeaders: "invoiceNumber,customerName,customerEmail,itemName,quantity,price,taxRate,paymentStatus",
    templateFileName: "sales_template.csv",
  },
  {
    id: "purchase",
    title: "Import Expenses (Purchase Bills)",
    description: "Upload purchase bills. Rows with the same billNumber are grouped.",
    uploadUrl: "/purchase/bills/bulk-upload",
    templateHeaders: "billNumber,supplierName,category,itemName,quantity,price,paymentStatus",
    templateFileName: "purchase_template.csv",
  },
  {
    id: "accounting",
    title: "Import Accounting Vouchers",
    description: "Upload manual journal entries, receipts, or payments.",
    uploadUrl: "/erp/vouchers/bulk-upload",
    templateHeaders: "date,voucherType,narration,debitAccountCode,creditAccountCode,amount,referenceNumber",
    templateFileName: "accounting_template.csv",
  },
];

export default function ImportDataPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedModule, setSelectedModule] = useState<typeof MODULES[0] | null>(null);

  const downloadTemplate = (headers: string, filename: string) => {
    const blob = new Blob([headers], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadClick = (module: typeof MODULES[0]) => {
    setSelectedModule(module);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedModule) return;

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
      toast.error("Please upload a valid CSV or Excel file.");
      return;
    }

    setLoadingId(selectedModule.id);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(selectedModule.uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const { results } = res.data;
      if (results?.failed?.length > 0) {
        toast.warning(`Upload completed with some errors. Succeeded: ${results.success.length}, Failed: ${results.failed.length}`);
        console.warn("Failed rows:", results.failed);
      } else {
        toast.success(res.data.message || "Data imported successfully!");
      }
    } catch (error: any) {
      toast.error(`Upload failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoadingId(null);
      setSelectedModule(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Upload className="text-emerald-500" />
          Bulk Data Import
        </h1>
        <p className="text-slate-500 mt-2">
          Download the provided templates, fill them out with your data, and upload them to populate the system.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv, .xlsx, .xls"
        className="hidden"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MODULES.map((mod) => (
          <div key={mod.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{mod.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{mod.description}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded p-3 mt-4 mb-6 border border-slate-100">
                <p className="text-xs font-mono text-slate-600 break-all">
                  <span className="font-semibold text-slate-700">Headers:</span> {mod.templateHeaders}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700"
                onClick={() => downloadTemplate(mod.templateHeaders, mod.templateFileName)}
                disabled={loadingId !== null}
              >
                <Download size={16} className="mr-2" />
                Template
              </Button>
              <Button
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={() => handleUploadClick(mod)}
                disabled={loadingId !== null}
              >
                {loadingId === mod.id ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Uploading...
                  </span>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Upload Data
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

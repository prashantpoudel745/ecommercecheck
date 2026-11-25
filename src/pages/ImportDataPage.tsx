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
    templateSample: "Sample Product,General,10,500",
    templateFileName: "inventory_template.csv",
  },
  {
    id: "sales",
    title: "Import Sales (Invoices)",
    description: "Upload sales invoices. Rows with the same invoiceNumber are grouped.",
    uploadUrl: "/sales/invoices/bulk-upload",
    templateHeaders: "invoiceNumber,customerName,customerEmail,itemName,quantity,price,taxRate,taxIncluded,paymentStatus,amountPaid,vatExempt",
    templateSample: "INV-001,Acme Corp,billing@acme.com,Consulting Service,1,1000,13,false,due,0,false",
    templateFileName: "sales_template.csv",
  },
  {
    id: "purchase",
    title: "Import Expenses (Purchase Bills)",
    description: "Upload purchase bills. Rows with the same billNumber are grouped.",
    uploadUrl: "/purchase/bills/bulk-upload",
    templateHeaders: "billNumber,supplierName,supplierBillNumber,category,itemName,quantity,price,taxRate,paymentStatus,amountPaid,vatExempt",
    templateSample: "BILL-001,Global Suppliers,SUP-901,purchase,Office Supplies,5,200,13,due,0,false",
    templateFileName: "purchase_template.csv",
  },
  {
    id: "accounting",
    title: "Import Accounting Vouchers",
    description: "Upload manual journal entries, receipts, or payments.",
    uploadUrl: "/erp/vouchers/bulk-upload",
    templateHeaders: "date,voucherType,narration,debitAccountCode,creditAccountCode,amount,referenceNumber",
    templateSample: "2026-01-15,JOURNAL,Office rent payment,Rent Expense,Cash Account,5000,REF-001",
    templateFileName: "accounting_template.csv",
  },
];

interface ImportReport {
  moduleTitle: string;
  successCount: number;
  failed: Array<{ row?: number; importReference?: string; error: string }>;
}

export default function ImportDataPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedModule, setSelectedModule] = useState<typeof MODULES[0] | null>(null);
  const [lastReport, setLastReport] = useState<ImportReport | null>(null);

  const downloadTemplate = (headers: string, sample: string, filename: string) => {
    const csvContent = `${headers}\n${sample}\n`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".csv") && !lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xls")) {
      toast.error("Please upload a valid CSV or Excel file.");
      return;
    }

    setLoadingId(selectedModule.id);
    setLastReport(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(selectedModule.uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const results = res.data?.results;
      const successCount = results?.success?.length ?? 0;
      const failed = results?.failed ?? [];

      setLastReport({
        moduleTitle: selectedModule.title,
        successCount,
        failed,
      });

      if (failed.length > 0) {
        toast.warn(`Upload completed with some errors. Succeeded: ${successCount}, Failed: ${failed.length}`);
      } else {
        toast.success(res.data.message || `Imported ${successCount} record(s) successfully!`);
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
    <div className="p-4 max-w-6xl mx-auto w-full animate-fade-in">
      <div className="mb-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {MODULES.map((mod) => (
          <div key={mod.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between transition-all hover:shadow-md">
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
              
              <div className="bg-slate-50 rounded p-3 mt-4 mb-3 border border-slate-100">
                <p className="text-xs font-mono text-slate-600 break-all">
                  <span className="font-semibold text-slate-700">Headers:</span> {mod.templateHeaders}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700"
                onClick={() => downloadTemplate(mod.templateHeaders, mod.templateSample, mod.templateFileName)}
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

      {lastReport && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              {lastReport.failed.length > 0 ? (
                <AlertCircle className="text-amber-500" size={18} />
              ) : (
                <CheckCircle2 className="text-emerald-500" size={18} />
              )}
              {lastReport.moduleTitle} — Import Summary
            </h3>
            <span className="text-sm text-slate-600">
              Succeeded: <strong className="text-emerald-600">{lastReport.successCount}</strong>{" "}
              | Failed: <strong className={lastReport.failed.length > 0 ? "text-rose-600" : "text-slate-600"}>{lastReport.failed.length}</strong>
            </span>
          </div>

          {lastReport.failed.length > 0 && (
            <div className="max-h-56 overflow-y-auto rounded-lg border border-rose-100 bg-rose-50/50 p-3 space-y-1.5 text-xs text-rose-800">
              {lastReport.failed.map((item, idx) => (
                <div key={idx} className="font-mono">
                  {item.row ? `Row ${item.row}` : item.importReference || `Item ${idx + 1}`}: {item.error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

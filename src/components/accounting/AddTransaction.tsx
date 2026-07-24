"use client";
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { Plus, Trash2, ScanLine } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardTitle } from "@/components/ui/card";
import {
  InventoryItem,
  CombinedDialogProps,
} from "../../../types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTransactionForm } from "@/hooks/useTransactionForm";
import { getUserFriendlyErrorMessage } from "@/utils/errorHandler";
import * as accountingService from "@/services/accounting.service";
import BillScanner from "./BillScanner";
import type { BillData } from "@/services/ocr.service";
import { formatCurrency } from "@/utils/formatCurrency";
import { CurrencyUtil } from "@/utils/currency.util";

const API_URL = import.meta.env.VITE_API_URL|| "";

export default function CombinedAddDialog({
  onTransactionAdded,
  buttonLabel = "Add New",
  variant = "outline",
}: CombinedDialogProps) {
  const [open, setOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [itemSearchTerms, setItemSearchTerms] = useState<string[]>([""]);
  const [showDropdowns, setShowDropdowns] = useState<boolean[]>([false]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountGroups, setAccountGroups] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const { 
    formData, 
    setFormData, 
    loading: isSubmitting, 
    error: submitError, 
    submitTransaction,
    resetForm
  } = useTransactionForm(() => {
    if (onTransactionAdded) onTransactionAdded({} as any); 
    setOpen(false);
  });

  // Fetch inventory and accounts
  useEffect(() => {
    if (open) {
      const normalizedCategory = formData.category?.toLowerCase();
      if (["sales", "purchase"].includes(normalizedCategory || "")) {
        fetchInventoryItems();
      }
      fetchAccounts();
      fetchAccountGroups();
      fetchCustomers();
    }
  }, [open, formData.category]);

  const fetchInventoryItems = async () => {
    setIsLoadingInventory(true);
    try {
      const response = await fetch(`${API_URL}/api/inventory`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data.inventory || []);
      }
    } catch (err) {
  // Intentionally ignore errors.
    } finally {
      setIsLoadingInventory(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await accountingService.getAccounts();
      setAccounts(data || []);
    } catch (err) {
        // Intentionally ignore errors.
    }
  };

  const fetchAccountGroups = async () => {
    try {
      const data = await accountingService.getAccountGroups();
      setAccountGroups(data || []);
    } catch (err) {
  // Intentionally ignore errors.
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await accountingService.getCustomers();
      setCustomers(data || []);
    } catch (err) {
  // Intentionally ignore errors.
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", { 
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, clientName: value }));
    setShowClientDropdown(value.trim().length > 0);
  };

  const handleSelectClient = (party: any) => {
    setFormData((prev) => ({
      ...prev,
      clientName: party.name || prev.clientName,
      companyName: party.companyName || party.name || prev.companyName,
      vatNo: party.vatNo || "",
      email: party.email || "",
      phone: party.phone || prev.phone,
    }));
    setShowClientDropdown(false);
  };

  const handleItemFieldChange = (e, index: number) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    const updatedItem = { ...newItems[index], [name]: value };

    if (name === "quantity" || name === "price") {
      const quantity = CurrencyUtil.parse(updatedItem.quantity);
      const price = CurrencyUtil.parse(updatedItem.price);
      updatedItem.amount = CurrencyUtil.mul(quantity, price).toNumber(); // or keep as string if formData types updated
    }

    newItems[index] = updatedItem;
    setFormData({...formData, items: newItems});
  };

  const handleItemSearchChange = (e, index: number) => {
    const value = e.target.value;
    const newSearchTerms = [...itemSearchTerms];
    newSearchTerms[index] = value;
    setItemSearchTerms(newSearchTerms);

    const newShowDropdowns = [...showDropdowns];
    newShowDropdowns[index] = value.trim().length > 0 && ["sales", "purchase"].includes(formData.category?.toLowerCase() || "");
    setShowDropdowns(newShowDropdowns);

    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], itemName: value };
    setFormData({...formData, items: newItems});
  };

  const handleSelectItem = (inventoryItem: any, index: number) => {
    const newItems = [...formData.items];
    const price = CurrencyUtil.format(inventoryItem.price);
    newItems[index] = {
      ...newItems[index],
      itemName: inventoryItem.name,
      productCategory: inventoryItem.category || "",
      price,
      amount: CurrencyUtil.mul(price, (newItems[index].quantity || 1)).toNumber()
    };
    setFormData({...formData, items: newItems});

    const newSearchTerms = [...itemSearchTerms];
    newSearchTerms[index] = inventoryItem.name;
    setItemSearchTerms(newSearchTerms);

    const newShowDropdowns = [...showDropdowns];
    newShowDropdowns[index] = false;
    setShowDropdowns(newShowDropdowns);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [{ itemName: "", quantity: 1, price: 0, amount: 0, productCategory: "" }, ...formData.items]
    });
    setItemSearchTerms((prev) => ["", ...prev]);
    setShowDropdowns((prev) => [false, ...prev]);
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({...formData, items: newItems});
    setItemSearchTerms((prev) => prev.filter((_, i) => i !== index));
    setShowDropdowns((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (post: boolean, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!showConfirmation) {
      setIsPosting(post);
      setShowConfirmation(true);
      return;
    }
    try {
      await submitTransaction(isPosting);
      toast.success(isPosting ? "Transaction posted to ledger" : "Draft saved successfully");
      setShowConfirmation(false);
    } catch (err) { 
      const friendlyMessage = getUserFriendlyErrorMessage(err);
      toast.error(friendlyMessage);
    }
    // setOpen(false);
  };

  const handleSubmitConfirmation = async () => {
    await handleSubmit(isPosting);
  };

  const handleReset = () => {
    resetForm();
    setItemSearchTerms([""]);
    setShowDropdowns([false]);
    setShowConfirmation(false);
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const totalAmount = formData.items
    .reduce((total, item) => total.plus(CurrencyUtil.parse(item.amount || 0)), CurrencyUtil.parse(0))
    .toNumber();

  const getFilteredItems = (searchTerm: string) => {
    if (!searchTerm.trim() || !inventoryItems.length) return [];
    return inventoryItems.filter((invItem) => invItem.name.toLowerCase().includes(searchTerm.toLowerCase().trim())).slice(0, 10);
  };

  const handleInputBlur = (index: number) => {
    setTimeout(() => {
      const newShowDropdowns = [...showDropdowns];
      newShowDropdowns[index] = false;
      setShowDropdowns(newShowDropdowns);
    }, 200);
  };

  // â”€â”€â”€ Handle OCR Bill Data â”€â”€â”€
  const handleBillDataExtracted = (data: BillData) => {
    // Auto-fill form fields from extracted bill data
    const extractedItems = data.items.length > 0
      ? data.items.map(item => ({
          itemName: item.itemName || "",
          quantity: item.quantity || 1,
          price: item.price || 0,
          amount: item.amount || (item.quantity * item.price) || 0,
          productCategory: item.productCategory || "",
        }))
      : [];

    setFormData(prev => {
      // Filter out any completely empty default items so we don't leave blanks
      const existingItems = prev.items.filter(item => 
        item.itemName.trim() !== "" || item.price > 0 || item.quantity > 1
      );
      
      const newItems = [...existingItems, ...extractedItems];
      
      // If we still have no items, ensure at least one blank row exists
      if (newItems.length === 0) {
        newItems.push({ itemName: "", quantity: 1, price: 0, amount: 0, productCategory: "" });
      }

      // Sync the search dropdown states to match the new items array length
      setItemSearchTerms(newItems.map(item => item.itemName));
      setShowDropdowns(newItems.map(() => false));

      return {
        ...prev,
        clientName: data.clientName || prev.clientName,
        vatNo: data.vatNo || prev.vatNo,
        vatBillNo: data.vatBillNo || prev.vatBillNo,
        category: data.category || prev.category,
        items: newItems,
      };
    });
  };

  const cashBankAccounts = accounts.filter(
    (a: any) => a.accountGroup?.name?.toLowerCase().includes("cash") || 
                a.accountGroup?.name?.toLowerCase().includes("bank") ||
                a.name?.toLowerCase().includes("cash") ||
                a.name?.toLowerCase().includes("bank")
  );

  const clientSearchTerm = (formData.clientName || "").toLowerCase().trim();

  const filteredParties = accounts.filter(acc => {
    if (!clientSearchTerm) return false;
    const isSales = formData.category?.toLowerCase() === "sales";
    const groupName = (typeof acc.accountGroup === "object" ? acc.accountGroup?.name : "")?.toLowerCase() || "";
    const accName = (acc.name || "").toLowerCase();
    
    const nameMatch = accName.includes(clientSearchTerm);
    
    const isMatchingGroup = isSales 
      ? (groupName.includes("debtor") || groupName.includes("receivable"))
      : (groupName.includes("creditor") || groupName.includes("payable"));
      
    return isMatchingGroup && nameMatch;
  }).slice(0, 5);

  const filteredCustomers = customers.filter(c => {
    if (!clientSearchTerm) return false;
    const searchable = [
      c.name,
      c.companyName,
      c.vatNo,
      c.email,
      c.phone,
    ].filter(Boolean).join(" ").toLowerCase();

    return searchable.includes(clientSearchTerm);
  }).slice(0, 8);

  // Combine unique parties from both sources
  const allParties = [
    ...filteredCustomers.map(c => ({
      name: c.name,
      companyName: c.companyName,
      vatNo: c.vatNo,
      email: c.email || "",
      phone: c.phone || "",
      type: "Customer",
    })),
    ...filteredParties.filter(p => !filteredCustomers.some(c => c.name === p.name))
                      .map(p => ({
                        name: p.name,
                        companyName: p.name,
                        vatNo: p.vatNo || "",
                        email: "",
                        phone: "",
                        type: "Account",
                      }))
  ].slice(0, 8);

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {variant === "outline" ? (
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 py-6">
              <Plus size={20} />
              <CardTitle className="text-lg font-semibold">{buttonLabel}</CardTitle>
            </Button>
          ) : (
            <Button variant="default">{buttonLabel}</Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-semibold">Add New Transaction</DialogTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setScannerOpen(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-violet-50 to-purple-50 border-purple-200 text-purple-700 hover:from-violet-100 hover:to-purple-100 hover:text-purple-800 hover:border-purple-300 transition-all shadow-sm"
              >
                <ScanLine className="w-4 h-4" />
                Scan Bill
              </Button>
            </div>
          </DialogHeader>

          {submitError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
              {submitError}
            </div>
          )}

          {/* Bill Scanner Dialog */}
          <BillScanner
            open={scannerOpen}
            onOpenChange={setScannerOpen}
            onDataExtracted={handleBillDataExtracted}
          />

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Client & Payment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="clientName">Client Name*</Label>
                  <Input 
                    id="clientName" 
                    name="clientName" 
                    value={formData.clientName} 
                    onChange={handleClientSearchChange}
                    onFocus={() => setShowClientDropdown(formData.clientName.trim().length > 0)}
                    onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                    placeholder="Search or enter new party" 
                    disabled={isSubmitting} 
                    autoComplete="off"
                  />
                  {showClientDropdown && allParties.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-56 overflow-auto">
                      {allParties.map((party, idx) => (
                        <div 
                          key={`${party.type}-${party.name}-${idx}`} 
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex flex-col border-b last:border-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectClient(party);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800">{party.name}</span>
                            <Badge variant="outline" className="text-[8px] h-4 uppercase">
                              {party.type}
                            </Badge>
                          </div>
                          {party.companyName && party.companyName !== party.name && (
                            <span className="text-[11px] text-slate-500 mt-1">{party.companyName}</span>
                          )}
                          {party.vatNo && (
                            <span className="text-[10px] text-slate-400 mt-1">VAT: {party.vatNo}</span>
                          )}
                          {party.email && (
                            <span className="text-[10px] text-slate-400 mt-0.5">{party.email}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNo">VAT No (Party)*</Label>
                  <Input id="vatNo" name="vatNo" value={formData.vatNo} onChange={handleChange} placeholder="Party VAT Registration" disabled={isSubmitting} />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="email">Email Address (For Invoice)</Label>
                  <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="client@example.com" disabled={isSubmitting} />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="vatBillNo">VAT Bill #*</Label>
                  <Input id="vatBillNo" name="vatBillNo" value={formData.vatBillNo} onChange={handleChange} placeholder="Invoice/Bill Number" disabled={isSubmitting} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Type</Label>
                  <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full border rounded-md p-2 h-10" disabled={isSubmitting} >
                    <option value="">Select Category</option>
                    <option value="Sales">Sales</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Expenses">Expenses</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">Payment</Label>
                  <select id="paymentStatus" name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="w-full border rounded-md p-2 h-10" disabled={isSubmitting} >
                    <option value="paid">Full Payment</option>
                    <option value="partial">Partial Payment</option>
                    <option value="due">Due / Unpaid</option>
                  </select>
                </div>
              </div>

              {formData.paymentStatus !== "paid" && (
                <div className="space-y-2">
                  <Label htmlFor="partyAccountGroupId">Ledger Group for Party / Client</Label>
                  <select 
                    id="partyAccountGroupId" 
                    value={formData.partyAccountGroupId || ""} 
                    onChange={(e) => setFormData({...formData, partyAccountGroupId: e.target.value})} 
                    className="w-full border rounded-md p-2 h-10" 
                    disabled={isSubmitting}
                  >
                    <option value="">Select Group (Defaults to {formData.category === 'Sales' ? 'Sundry Debtors' : 'Sundry Creditors'})</option>
                    {accountGroups
                      .filter(g => formData.category === 'Sales' ? g.nature === 'ASSET' : g.nature === 'LIABILITY')
                      .map(g => (
                        <option key={g._id} value={g._id}>{g.name}</option>
                      ))}
                  </select>
                </div>
              )}

              {formData.paymentStatus === "partial" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amountPaid">Amount Paid</Label>
                    <Input id="amountPaid" type="number" value={formData.amountPaid} onChange={(e) => setFormData({...formData, amountPaid: Number(e.target.value)})} placeholder="0.00" disabled={isSubmitting} />
                  </div>
                </div>
              )}

              {formData.paymentStatus !== "due" && (
                <div className="space-y-2">
                  <Label htmlFor="paymentAccount">Payment Account (Cash/Bank)</Label>
                  <select id="paymentAccount" value={formData.paymentAccountId} onChange={(e) => setFormData({...formData, paymentAccountId: e.target.value})} className="w-full border rounded-md p-2 h-10" disabled={isSubmitting} >
                    <option value="">Select Account</option>
                    {cashBankAccounts.map(acc => (
                      <option key={acc._id} value={acc._id}>{acc.name} ({acc.code})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-medium">Items</h3>
                <Button type="button" variant="ghost" size="sm" onClick={addItem} disabled={isSubmitting} className="text-slate-600 hover:text-slate-900">
                  <Plus size={16} className="mr-1" /> Add Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50 relative space-y-3">
                    {formData.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500" disabled={isSubmitting}>
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 relative">
                        <Label className="text-xs mb-1 block">Item Name</Label>
                        <Input 
                          value={itemSearchTerms[index] || ""} 
                          onChange={(e) => handleItemSearchChange(e, index)}
                          onBlur={() => handleInputBlur(index)}
                          placeholder="Search or enter item name"
                          disabled={isSubmitting}
                        />
                        {showDropdowns[index] && (
                          <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-40 overflow-auto">
                            {getFilteredItems(itemSearchTerms[index]).map(invItem => (
                              <div key={invItem._id} className="p-2 hover:bg-gray-100 cursor-pointer text-sm" onMouseDown={(e) => e.preventDefault()} onClick={() => handleSelectItem(invItem, index)}>
                                {invItem.name} ({formatCurrency(invItem.price || 0)})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Quantity</Label>
                        <Input name="quantity" type="number" value={item.quantity} onChange={(e) => handleItemFieldChange(e, index)} disabled={isSubmitting} />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Rate</Label>
                        <Input name="price" type="number" value={item.price} onChange={(e) => handleItemFieldChange(e, index)} disabled={isSubmitting} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <div className="flex justify-between w-full items-center">
                <div className="text-lg font-bold">Total: {formatCurrency(totalAmount)}</div>
                <div className="space-x-2">
                  <Button type="button" variant="outline" onClick={() => { setOpen(false); handleReset(); }} disabled={isSubmitting}>Cancel</Button>
                  <Button type="button" variant="secondary" onClick={(e) => handleSubmit(false, e)} disabled={isSubmitting}>Save as Draft</Button>
                  <Button type="button" onClick={(e) => handleSubmit(true, e)} disabled={isSubmitting}>Post to Ledger</Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
         
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
          
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-3 rounded-md space-y-1">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Client:</span> <span className="font-semibold">{formData.clientName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Type:</span> <span className="font-semibold">{formData.category}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Status:</span> <span className="font-semibold capitalize">{formData.paymentStatus}</span></div>
              <div className="flex justify-between text-sm border-t pt-2 mt-2"><span className="font-bold">Total Amount:</span> <span className="font-bold">{formatCurrency(totalAmount)}</span></div>
              {formData.paymentStatus === "partial" && (
                <div className="flex justify-between text-sm text-green-600"><span className="font-medium">Amount Paying Now:</span> <span className="font-bold">{formatCurrency(formData.amountPaid)}</span></div>
              )}
            </div>
            <p className="text-xs text-gray-500 italic text-center">
              {isPosting ? "This will post a voucher directly to the general ledger." : "This will save a draft voucher that must be approved later."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={isSubmitting}>Back</Button>
            <Button onClick={handleSubmitConfirmation} disabled={isSubmitting}>{isSubmitting ? "Processing..." : isPosting ? "Confirm Post" : "Confirm Draft"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


import { useState } from "react";
import * as accountingService from "../services/accounting.service";
import { TransactionFormData } from "../../types/accounting.types";

export function useTransactionForm(onSuccess?: () => void) {
  const [formData, setFormData] = useState<TransactionFormData>({
    clientName: "",
    companyName: "",
    vatNo: "",
    email: "",
    phone: "",
    notes: "",
    description: "",
    category: "",
    paymentStatus: "paid",
    amountPaid: 0,
    paymentAccountId: "",
    vatBillNo: "",
    items: [{ itemName: "", quantity: 1, price: 0, amount: 0, productCategory: "Raw Materials" }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      clientName: "",
      companyName: "",
      vatNo: "",
      email: "",
      phone: "",
      notes: "",
      description: "",
      category: "",
      paymentStatus: "paid",
      amountPaid: 0,
      paymentAccountId: "",
      vatBillNo: "",
      items: [{ itemName: "", quantity: 1, price: 0, amount: 0, productCategory: "Raw Materials" }],
    });
    setError(null);
  };

  const submitTransaction = async (post: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountingService.createTransactionWithVoucher(formData, post);
      if (onSuccess) onSuccess();
      resetForm();
      return response;
    } catch (err) {
      // console.error("Transaction submission error:", err);
      setError(err.response?.data?.message || err.message || "Submission failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    error,
    submitTransaction,
    resetForm
  };
}

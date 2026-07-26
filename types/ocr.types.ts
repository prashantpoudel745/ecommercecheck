export interface BillItem {
  itemName: string;
  quantity: number;
  price: number;
  amount: number;
  productCategory: string;
}

export interface BillData {
  success: boolean;
  clientName: string;
  vatNo: string;
  vatBillNo: string;
  category: string;
  items: BillItem[];
  totalAmount: number;
  rawText: string;
  source: "llm" | "regex";
  imageUrl?: string;
  error?: string;
}
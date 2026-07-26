export type Customer = {
  name: string;
  companyName?: string;
  dueamount?: number;
  value?: number;
};

export interface Client {
  _id: string;
  name: string;
  email?: string;
  companyName?: string;
  vatNo?: string;
  status: "paid" | "due";
  phone?: string;
  value?: number;
  dueamount?: number;
  updatedBy?: string;
  items?: Array<{
    _id: string;
    itemName: string;
    quantity: number;
    price: number;
  }>;
}
export interface Stats {
  totalClients: number;
  activeClients: number;
  totalValue: number;
}
export interface CustomerInteractionsProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}
export type Decimal128Json = { $numberDecimal: string };
export type DecimalValue = number | string | Decimal128Json;
import {Client,Transaction} from "./index"
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type { TooltipProps } from "recharts";

export interface InventoryItem {
  _id: string;
  id: string;
  name: string;
  quantity: number;
  price: DecimalValue;
  clientname: string;
  status: "inStock" | "mediumStock" | "lowStock";
  category: string;
  updatedAt: string;
value?: number;
}
export interface InventoryStatusChartProps {
  userId: string;
  financialViewMode?: "year" | "month" | "day";
  financialSelectedYear?: string | null;
  financialSelectedMonth?: string | null;
}

export interface AddInventoryButtonProps {
  onInventoryAdded?: (inventory: InventoryItem) => void;
}

export interface BarClickState {
  activePayload?: Array<{
    payload?: InventoryStatusData;
  }>;
}

export type ChartPayload = TooltipProps<ValueType, NameType>;

export interface CombinedDialogProps {
  onClientAdded?: (client: Client) => void;
  onTransactionAdded?: (transaction: Transaction) => void;
  onInventoryAdded?: (inventory: InventoryItem) => void;
  buttonLabel?: string;
  variant?: "default" | "outline";
}

export interface ItemFormData {
  itemName: string;
  quantity: string;
  price: string;
  amount: string;
  productCategory: string;
}

export interface InventoryStatusData {
  category: string;
  totalItems: number;
  inStock: number;
  mediumStock: number;
  lowStock: number;
  items: InventoryItem[];
  names: string[];
}

export interface DeleteInventoryProps {
  productId: string;
  productName: string;
  onDelete: (productId: string) => void;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  price: DecimalValue;
  status: "in-stock" | "low-stock" | "out-of-stock";
  maxStock: number;
}

export interface InventoryStats {
  totalProducts: number;
  lowStockItems: number;
  lowStockChange: number;
  inventoryValue: DecimalValue;
  inventoryValueChange: DecimalValue;
}

export interface UpdateInventoryProps {
  productId: string;
  productName: string;
  productCategory: string;
  productPrice: DecimalValue;
  productQuantity: number;
  onUpdate: (updatedProduct: {
    _id: string;
    name: string;
    category: string;
    price: DecimalValue;
    quantity: number;
    status: "in-stock" | "low-stock" | "out-of-stock";
  }) => void;
}
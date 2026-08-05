import { useState } from "react";
import { PlusCircle, ScanLine } from "lucide-react";
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
import { toast } from "@/utils/notify";
import BillScanner from "../accounting/BillScanner";
import { BillData } from "../../../types/ocr.types";
import { AddInventoryButtonProps } from "../../../types/inventory.types";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL||"";




const AddInventoryButton = ({ onInventoryAdded }: AddInventoryButtonProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    price: "",
    category: "",
    clientname: "",
  });

  const handleBillDataExtracted = (data: BillData) => {
    const firstItem = data.items && data.items.length > 0 ? data.items[0] : null;
    
    setFormData((prevData) => ({
      ...prevData,
      name: firstItem?.itemName || prevData.name,
      quantity: firstItem?.quantity?.toString() || prevData.quantity,
      price: firstItem?.price?.toString() || prevData.price,
      category: data.category || firstItem?.productCategory || prevData.category,
      clientname: data.clientName || prevData.clientname,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const inventoryData = {
        name: formData.name,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        category: formData.category,
        clientname: formData.clientname,
      };

      const response = await fetch(`${API_BASE_URL}/api/inventory/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(inventoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add inventory item");
      }

      const result = await response.json();
      const newInventoryItem = result.inventory || result;

      if (onInventoryAdded) {
        try {
          onInventoryAdded(newInventoryItem);
        } catch (callbackError) {
          console.error("Callback error:", callbackError);
        }
      }

      toast.success("Inventory item added successfully!");
      setFormData({
        name: "",
        quantity: "",
        price: "",
        category: "",
        clientname: "",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to add inventory item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className=" flex items-center justify-center gap-2 py-6"
        >
          <PlusCircle size={20} />
          <CardTitle className="text-lg font-semibold">Add Inventory</CardTitle>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-violet-50 to-purple-50 border-purple-200 text-purple-700 hover:from-violet-100 hover:to-purple-100 hover:text-purple-800 hover:border-purple-300 transition-all shadow-sm"
            >
              <ScanLine className="w-4 h-4" />
              Scan Item
            </Button>
          </div>
        </DialogHeader>

        <BillScanner
          open={scannerOpen}
          onOpenChange={setScannerOpen}
          onDataExtracted={handleBillDataExtracted}
        />

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Product Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Enter item name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientname" className="text-right">
                Client Name
              </Label>
              <Input
                id="clientname"
                name="clientname"
                value={formData.clientname}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Enter client name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                className="col-span-3"
                placeholder="0"
                min="0"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price/Item
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className="col-span-3"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Enter product category"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Inventory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInventoryButton;


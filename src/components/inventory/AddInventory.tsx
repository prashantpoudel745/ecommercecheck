import { useMemo, useRef, useState } from "react";
import { PlusCircle, ScanLine, Loader2, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/utils/notify";
import BillScanner from "../accounting/BillScanner";
import { BillData } from "../../../types/ocr.types";
import { AddInventoryButtonProps } from "../../../types/inventory.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const BASE_UNITS = [
  { value: "PCS", label: "Pieces (PCS)" },
  { value: "KG", label: "Kilogram (KG)" },
  { value: "GM", label: "Gram (GM)" },
  { value: "LTR", label: "Litre (LTR)" },
  { value: "ML", label: "Millilitre (ML)" },
  { value: "MTR", label: "Metre (MTR)" },
];

const ALTERNATE_UNITS = [
  { value: "BOX", label: "Box" },
  { value: "CARTON", label: "Carton" },
  { value: "DOZEN", label: "Dozen" },
  { value: "PACK", label: "Pack" },
  { value: "BAG", label: "Bag" },
  { value: "BUNDLE", label: "Bundle" },
];

const INITIAL_FORM = {
  name: "",
  clientname: "",
  baseUnit: "PCS",
  quantity: "",
  price: "",
  tags: "",
};

type FormState = typeof INITIAL_FORM;

interface AlternateRow {
  id: number;
  unit: string;
  factor: string;
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}

const Field = ({ id, label, hint, children }: FieldProps) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-sm font-medium text-slate-700">
      {label}
    </Label>
    {children}
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
);

const AddInventoryButton = ({ onInventoryAdded }: AddInventoryButtonProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [alternateRows, setAlternateRows] = useState<AlternateRow[]>([]);
  const nextRowId = useRef(1);

  const baseUnitLabel = formData.baseUnit || "base unit";

  // Alternate units not yet used by another row (and not the base unit)
  const usedUnits = alternateRows.map((r) => r.unit).filter(Boolean);
  const availableFor = (current: string) =>
    ALTERNATE_UNITS.filter(
      (u) =>
        u.value !== formData.baseUnit &&
        (u.value === current || !usedUnits.includes(u.value))
    );
  const canAddRow =
    ALTERNATE_UNITS.filter(
      (u) => u.value !== formData.baseUnit && !usedUnits.includes(u.value)
    ).length > alternateRows.filter((r) => !r.unit).length;

  const { valid: alternateUnits, hasIncomplete } = useMemo(() => {
    const valid: { unit: string; conversionFactor: number }[] = [];
    let hasIncomplete = false;
    alternateRows.forEach((row) => {
      const factor = Number(row.factor);
      if (row.unit && factor > 0) {
        valid.push({ unit: row.unit, conversionFactor: factor });
      } else {
        hasIncomplete = true;
      }
    });
    return { valid, hasIncomplete };
  }, [alternateRows]);

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setAlternateRows([]);
  };

  const handleOpenChange = (next: boolean) => {
    if (isSubmitting) return;
    setOpen(next);
    if (!next) resetForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBaseUnitChange = (value: string) => {
    setFormData((prev) => ({ ...prev, baseUnit: value }));
    // An alternate unit can't be the same as the base unit
    setAlternateRows((rows) =>
      rows.map((r) => (r.unit === value ? { ...r, unit: "" } : r))
    );
  };

  const addRow = () =>
    setAlternateRows((rows) => [
      ...rows,
      { id: nextRowId.current++, unit: "", factor: "" },
    ]);

  const updateRow = (id: number, patch: Partial<AlternateRow>) =>
    setAlternateRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );

  const removeRow = (id: number) =>
    setAlternateRows((rows) => rows.filter((r) => r.id !== id));

  const handleBillDataExtracted = (data: BillData) => {
    const items = data.items ?? [];
    const firstItem = items[0] ?? null;

    setFormData((prev) => ({
      ...prev,
      name: firstItem?.itemName || prev.name,
      quantity: firstItem?.quantity?.toString() || prev.quantity,
      price: firstItem?.price?.toString() || prev.price,
      tags: data.category || firstItem?.productCategory || prev.tags,
      clientname: data.clientName || prev.clientname,
    }));

    toast.success(
      items.length > 1
        ? `Filled from the first of ${items.length} items on the bill. Check the details before saving.`
        : "Filled from the bill. Check the details before saving."
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasIncomplete) return;

    setIsSubmitting(true);

    try {
      const inventoryData = {
        name: formData.name.trim(),
        clientname: formData.clientname.trim(),
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        baseUnit: formData.baseUnit,
        alternateUnits,
      };

      const response = await fetch(`${API_BASE_URL}/api/inventory/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(inventoryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Couldn't add the item. Try again.");
      }

      const result = await response.json();
      const newInventoryItem = result.inventory || result;

      try {
        onInventoryAdded?.(newInventoryItem);
      } catch (callbackError) {
        console.error("onInventoryAdded failed:", callbackError);
      }

      toast.success("Inventory item added");
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Add inventory failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Couldn't add the item. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add inventory
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add inventory item</DialogTitle>
            <DialogDescription>
              Enter the item by hand, or scan a bill to fill the form for you.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800">Have a bill?</p>
              <p className="text-xs text-slate-500">
                We'll read the item, quantity and price from it.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setScannerOpen(true)}
              disabled={isSubmitting}
              className="shrink-0 gap-1.5 bg-white"
            >
              <ScanLine className="h-4 w-4" />
              Scan bill
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item */}
            <fieldset className="space-y-4" disabled={isSubmitting}>
              <legend className="mb-1 text-sm font-semibold text-slate-900">
                Item
              </legend>

              <Field id="name" label="Product name">
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Full cream milk 1L"
                  autoComplete="off"
                  required
                />
              </Field>

              <Field id="clientname" label="Client name">
                <Input
                  id="clientname"
                  name="clientname"
                  value={formData.clientname}
                  onChange={handleChange}
                  placeholder="Who this stock belongs to"
                  autoComplete="off"
                  required
                />
              </Field>

              <Field id="tags" label="Tags" hint="Separate with commas. Optional.">
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="dairy, cold, supplier-a"
                  autoComplete="off"
                />
              </Field>
            </fieldset>

            {/* Units */}
            <fieldset className="space-y-4" disabled={isSubmitting}>
              <legend className="mb-1 text-sm font-semibold text-slate-900">
                Units
              </legend>

              <Field
                id="baseUnit"
                label="Base unit"
                hint="The smallest unit you count and price this item in."
              >
                <Select value={formData.baseUnit} onValueChange={handleBaseUnitChange}>
                  <SelectTrigger id="baseUnit">
                    <SelectValue placeholder="Select base unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {BASE_UNITS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700">
                    Alternate units
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addRow}
                    disabled={!canAddRow}
                    className="h-8 gap-1 px-2 text-slate-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add unit
                  </Button>
                </div>

                {alternateRows.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Optional. Add a larger unit you buy or sell in, like a carton.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {alternateRows.map((row) => {
                      const factor = Number(row.factor);
                      return (
                        <li key={row.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Select
                              value={row.unit || undefined}
                              onValueChange={(v) => updateRow(row.id, { unit: v })}
                            >
                              <SelectTrigger
                                className="w-[130px] shrink-0"
                                aria-label="Alternate unit"
                              >
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableFor(row.unit).map((u) => (
                                  <SelectItem key={u.value} value={u.value}>
                                    {u.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <span className="shrink-0 text-sm text-slate-500">=</span>

                            <Input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step="any"
                              value={row.factor}
                              onChange={(e) =>
                                updateRow(row.id, { factor: e.target.value })
                              }
                              placeholder="24"
                              aria-label={`${row.unit || "Alternate unit"} size in ${baseUnitLabel}`}
                              className="min-w-0"
                            />

                            <span className="shrink-0 text-sm text-slate-500">
                              {baseUnitLabel}
                            </span>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRow(row.id)}
                              aria-label="Remove alternate unit"
                              className="h-8 w-8 shrink-0 text-slate-500 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {row.unit && factor > 0 && (
                            <p className="pl-1 text-xs text-slate-500">
                              1 {row.unit} = {factor} {baseUnitLabel}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {hasIncomplete && (
                  <p className="text-xs text-red-600" role="alert">
                    Choose a unit and enter a number above 0 for each alternate
                    unit, or remove the row.
                  </p>
                )}
              </div>
            </fieldset>

            {/* Stock & price */}
            <fieldset className="space-y-4" disabled={isSubmitting}>
              <legend className="mb-1 text-sm font-semibold text-slate-900">
                Stock and price
              </legend>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="quantity" label="Quantity" hint={`In ${baseUnitLabel}`}>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    inputMode="decimal"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </Field>

                <Field id="price" label="Price per item" hint={`Per ${baseUnitLabel}`}>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    inputMode="decimal"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </Field>
              </div>
            </fieldset>

            <DialogFooter className="gap-2 border-t border-slate-200 pt-4 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || hasIncomplete}
                className="min-w-[130px] gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Adding…" : "Add item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BillScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onDataExtracted={handleBillDataExtracted}
      />
    </>
  );
};

export default AddInventoryButton;
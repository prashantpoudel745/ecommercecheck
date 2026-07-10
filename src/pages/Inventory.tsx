
import { InventoryOverview } from "@/components/inventory/InventoryOverview";
import { ModulePageFrame } from "@/components/layout/ModulePageFrame";

export default function Inventory() {
  return (
    <ModulePageFrame
      kicker="Stock operations"
      title="Inventory Management"
      subtitle="Keep stock movement, restock signals, and item visibility organized in a cleaner command-center layout."
      chips={[
        "Stock health",
        "Low inventory alerts",
        "Category oversight",
      ]}
    >
      <InventoryOverview />
    </ModulePageFrame>
  );
}

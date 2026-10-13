
import { InventoryOverview } from "@/components/inventory/InventoryOverview";
import { ModulePageFrame } from "@/components/layout/ModulePageFrame";

export default function Inventory() {
  return (
    <ModulePageFrame
      kicker="Stock operations"
      title="Inventory Management"
      subtitle=""
    >
      <InventoryOverview />
    </ModulePageFrame>
  );
}

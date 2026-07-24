import { ModulePageFrame } from "@/components/layout/ModulePageFrame";

export default function CashTransfers() {
  return (
    <ModulePageFrame
      kicker="Accounting"
      title="Cash Transfers"
      subtitle="Manage your cash transfers."
      chips={["Internal Transfers", "Bank to Cash"]}
    >
      <div className="flex justify-center items-center h-64 text-slate-500">
        Cash Transfers module coming soon.
      </div>
    </ModulePageFrame>
  );
}

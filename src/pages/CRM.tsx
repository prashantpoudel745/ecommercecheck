import CustomerOverview from "@/components/crm/CustomerOverview";
import { ModulePageFrame } from "@/components/layout/ModulePageFrame";

export default function CRM() {
  return (
    <ModulePageFrame
      kicker="Customer operations"
      title="Customer Relationship Management"
      subtitle="Track client relationships, follow-ups, and account activity inside a more disciplined business interface."
      chips={[
        "Client visibility",
        "Relationship tracking",
        "Sales follow-up",
      ]}
    >
      <CustomerOverview />
    </ModulePageFrame>
  );
}

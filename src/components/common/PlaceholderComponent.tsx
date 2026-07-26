import { ModulePageFrame } from "@/components/layout/ModulePageFrame";
import {PlaceholderProps} from "../../../types/placeholder.types"


export default function PlaceholderComponent({ moduleName, title }: PlaceholderProps) {
  return (
    <ModulePageFrame
      kicker={moduleName}
      title={title}
      subtitle={`Manage your ${title.toLowerCase()}.`}
    >
      <div className="flex justify-center items-center h-64 text-slate-500">
        {title} module coming soon.
      </div>
    </ModulePageFrame>
  );
}

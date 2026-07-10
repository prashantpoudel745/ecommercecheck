import { useState } from "react";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Region = {
  id: string;
  name: string;
  currency: string;
  locale: string;
};

const regions: Region[] = [
  { id: "us", name: "United States", currency: "USD", locale: "en-US" },
  { id: "eu", name: "European Union", currency: "EUR", locale: "en-EU" },
  { id: "uk", name: "United Kingdom", currency: "GBP", locale: "en-GB" },
  { id: "ca", name: "Canada", currency: "CAD", locale: "en-CA" },
  { id: "au", name: "Australia", currency: "AUD", locale: "en-AU" },
];

export function RegionSelector() {
  const [region, setRegion] = useState<string>("us");

  const handleRegionChange = (value: string) => {
    setRegion(value);
    // Here you would typically update the application's locale settings
  };

  return (
    <div className="flex items-center gap-2">
      <Globe size={16} className="text-slate-500" />
      <Select value={region} onValueChange={handleRegionChange}>
        <SelectTrigger className="w-[180px] h-9 bg-transparent">
          <SelectValue placeholder="Select region" />
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectItem key={region.id} value={region.id}>
              {region.name} ({region.currency})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

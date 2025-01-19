import { MapPin } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";

interface AddressFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function AddressFields({ lead, onUpdate }: AddressFieldsProps) {
  const { settings } = useSettings();

  return (
    <div>
      <h3 className="text-xs font-medium text-gray-500 mb-3 px-3">
        {settings?.language === "en" ? "Address" : "Adresse"}
      </h3>
      <div className="divide-y divide-gray-50">
        <InfoRow
          icon={MapPin}
          label={settings?.language === "en" ? "Street" : "Straße"}
          value={lead.street}
          field="street"
          onUpdate={onUpdate}
        />
        <InfoRow
          icon={MapPin}
          label={settings?.language === "en" ? "City" : "Stadt"}
          value={lead.city}
          field="city"
          onUpdate={onUpdate}
        />
        <InfoRow
          icon={MapPin}
          label={settings?.language === "en" ? "State" : "Bundesland"}
          value={lead.region}
          field="region"
          onUpdate={onUpdate}
        />
        <InfoRow
          icon={MapPin}
          label={settings?.language === "en" ? "Postal Code" : "Postleitzahl"}
          value={lead.postal_code}
          field="postal_code"
          onUpdate={onUpdate}
        />
        <InfoRow
          icon={MapPin}
          label={settings?.language === "en" ? "Country" : "Land"}
          value={lead.country}
          field="country"
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
}
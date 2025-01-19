import { MapPin } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";
import { ContactInfoGroup } from "./ContactInfoGroup";

interface AddressFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function AddressFields({ lead, onUpdate }: AddressFieldsProps) {
  const { settings } = useSettings();

  const fields = [
    { icon: MapPin, label: settings?.language === "en" ? "Street" : "Straße", field: "street", value: lead.street },
    { icon: MapPin, label: settings?.language === "en" ? "City" : "Stadt", field: "city", value: lead.city },
    { icon: MapPin, label: settings?.language === "en" ? "State" : "Bundesland", field: "region", value: lead.region },
    { icon: MapPin, label: settings?.language === "en" ? "Postal Code" : "Postleitzahl", field: "postal_code", value: lead.postal_code },
    { icon: MapPin, label: settings?.language === "en" ? "Country" : "Land", field: "country", value: lead.country },
  ];

  return (
    <ContactInfoGroup
      title={settings?.language === "en" ? "Address" : "Adresse"}
      leadId={lead.id}
    >
      {fields.map((field) => (
        <InfoRow
          key={field.field}
          icon={field.icon}
          label={field.label}
          value={field.value}
          field={field.field}
          onUpdate={onUpdate}
        />
      ))}
    </ContactInfoGroup>
  );
}
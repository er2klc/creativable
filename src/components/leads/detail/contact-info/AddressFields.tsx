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
    { icon: MapPin, label: settings?.language === "en" ? "City" : "Stadt", field: "city", value: lead.city },
    { icon: MapPin, label: settings?.language === "en" ? "State" : "Bundesland", field: "region", value: lead.region },
  ];

  return (
    <ContactInfoGroup
      title={settings?.language === "en" ? "Address" : "Adresse"}
      leadId={lead.id}
      groupName="address"
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
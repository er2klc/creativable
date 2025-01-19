import { Calendar, MessageSquare, Clock, Languages } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";
import { ContactInfoGroup } from "./ContactInfoGroup";

interface AdditionalInfoFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function AdditionalInfoFields({ lead, onUpdate }: AdditionalInfoFieldsProps) {
  const { settings } = useSettings();

  const fields = [
    { icon: Calendar, label: settings?.language === "en" ? "Birth Date" : "Geburtsdatum", field: "birth_date", value: lead.birth_date ? new Date(lead.birth_date).toLocaleDateString() : null },
    { icon: MessageSquare, label: settings?.language === "en" ? "Preferred Contact Channel" : "Bevorzugter Kontaktkanal", field: "preferred_communication_channel", value: lead.preferred_communication_channel },
    { icon: Clock, label: settings?.language === "en" ? "Best Contact Times" : "Beste Erreichbarkeitszeit", field: "best_contact_times", value: lead.best_contact_times },
    { icon: Languages, label: settings?.language === "en" ? "Languages" : "Sprachen", field: "languages", value: lead.languages },
  ];

  return (
    <ContactInfoGroup
      title={settings?.language === "en" ? "Additional Information" : "Zusätzliche Informationen"}
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
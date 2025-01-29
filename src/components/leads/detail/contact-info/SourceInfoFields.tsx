import { Share2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";
import { ContactInfoGroup } from "./ContactInfoGroup";

interface SourceInfoFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>, showToast?: boolean) => void;
  showToast?: boolean;
}

export function SourceInfoFields({ lead, onUpdate, showToast = false }: SourceInfoFieldsProps) {
  const { settings } = useSettings();

  const fields = [
    { icon: Share2, label: settings?.language === "en" ? "Contact Source" : "Kontakt-Quelle", field: "platform", value: lead.platform, isSourceField: true },
  ];

  return (
    <ContactInfoGroup
      title={settings?.language === "en" ? "Source Information" : "Herkunftsinformationen"}
      leadId={lead.id}
      groupName="source_info"
    >
      {fields.map((field) => (
        <InfoRow
          key={field.field}
          icon={field.icon}
          label={field.label}
          value={field.value}
          field={field.field}
          onUpdate={onUpdate}
          isSourceField={field.isSourceField}
          showToast={showToast}
        />
      ))}
    </ContactInfoGroup>
  );
}
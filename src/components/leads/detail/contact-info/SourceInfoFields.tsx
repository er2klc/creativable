import { Share2, UserPlus } from "lucide-react";
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
    { icon: UserPlus, label: settings?.language === "en" ? "Referred By" : "Empfohlen durch", field: "referred_by", value: lead.referred_by },
  ];

  return (
    <ContactInfoGroup
      title={settings?.language === "en" ? "Source Information" : "Herkunftsinformationen"}
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
          isSourceField={field.isSourceField}
          showToast={showToast}
        />
      ))}
    </ContactInfoGroup>
  );
}
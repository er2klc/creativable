import { Phone, Mail, Globe } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";
import { ContactInfoGroup } from "./ContactInfoGroup";

interface ContactDetailsFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function ContactDetailsFields({ lead, onUpdate }: ContactDetailsFieldsProps) {
  const { settings } = useSettings();

  const fields = [
    { icon: Phone, label: settings?.language === "en" ? "Phone" : "Telefon", field: "phone_number", value: lead.phone_number },
    { icon: Mail, label: settings?.language === "en" ? "Email" : "E-Mail", field: "email", value: lead.email },
    { icon: Globe, label: settings?.language === "en" ? "Website" : "Webseite", field: "website", value: lead.website },
  ];

  return (
    <ContactInfoGroup
      title={settings?.language === "en" ? "Contact Details" : "Kontaktdetails"}
      leadId={lead.id}
      groupName="contact_details"
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
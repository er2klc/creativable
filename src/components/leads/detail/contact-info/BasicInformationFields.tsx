import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";
import { ContactInfoGroup } from "./ContactInfoGroup";
import { User, Building2, AtSign, Phone, Globe } from "lucide-react";

interface BasicInformationFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function BasicInformationFields({ lead, onUpdate }: BasicInformationFieldsProps) {
  const { settings } = useSettings();
  const [showEmptyFields, setShowEmptyFields] = useState(true);

  const fields = [
    { icon: User, label: settings?.language === "en" ? "Name" : "Name", field: "name", value: lead.name },
    { icon: Building2, label: settings?.language === "en" ? "Company" : "Firma", field: "company_name", value: lead.company_name },
    { icon: AtSign, label: "E-Mail", field: "email", value: lead.email },
    { icon: Phone, label: settings?.language === "en" ? "Phone" : "Telefon", field: "phone_number", value: lead.phone_number },
    { icon: Globe, label: settings?.language === "en" ? "Website" : "Webseite", field: "website", value: lead.website },
  ];

  const visibleFields = showEmptyFields 
    ? fields 
    : fields.filter(field => field.value);

  return (
    <ContactInfoGroup
      title={settings?.language === "en" ? "Basic Information" : "Basis Informationen"}
      leadId={lead.id}
      showEmptyFields={showEmptyFields}
      onToggleEmptyFields={() => setShowEmptyFields(!showEmptyFields)}
      groupName="basic_info"
    >
      {visibleFields.map((field) => (
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
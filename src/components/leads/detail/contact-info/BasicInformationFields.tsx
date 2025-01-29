import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";
import { ContactInfoGroup } from "./ContactInfoGroup";
import { User, AtSign, Phone, Globe, Calendar, Building2, MapPin, Hash } from "lucide-react";

interface BasicInformationFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function BasicInformationFields({ lead, onUpdate }: BasicInformationFieldsProps) {
  const { settings } = useSettings();
  const [showEmptyFields, setShowEmptyFields] = useState(true);

  const fields = [
    { icon: User, label: settings?.language === "en" ? "Name" : "Name", field: "name", value: lead.name },
    { icon: AtSign, label: "Email", field: "email", value: lead.email },
    { icon: Phone, label: settings?.language === "en" ? "Phone" : "Telefon", field: "phone_number", value: lead.phone_number },
    { icon: Globe, label: settings?.language === "en" ? "Website" : "Webseite", field: "website", value: lead.website },
    { icon: Calendar, label: settings?.language === "en" ? "Birth Date" : "Geburtsdatum", field: "birth_date", value: lead.birth_date },
    { icon: Building2, label: settings?.language === "en" ? "Company" : "Firma", field: "company_name", value: lead.company_name },
    { icon: MapPin, label: settings?.language === "en" ? "City" : "Stadt", field: "city", value: lead.city }
  ];

  const visibleFields = showEmptyFields 
    ? fields 
    : fields.filter(field => field.value);

  return (
    <div className="mt-8 space-y-6">
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
    </div>
  );
}
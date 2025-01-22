import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";
import { ContactInfoGroup } from "./ContactInfoGroup";
import { User, AtSign, Phone, Globe, Calendar, Building2, MapPin, Heart, Target, AlertCircle } from "lucide-react";

interface BasicInformationFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function BasicInformationFields({ lead, onUpdate }: BasicInformationFieldsProps) {
  const { settings } = useSettings();
  const [showEmptyFields, setShowEmptyFields] = useState(true);

  const fields = [
    { icon: User, label: settings?.language === "en" ? "Name" : "Name", field: "name", value: lead.name },
    { icon: AtSign, label: "E-Mail", field: "email", value: lead.email },
    { icon: Phone, label: settings?.language === "en" ? "Phone" : "Telefon", field: "phone_number", value: lead.phone_number },
    { icon: Globe, label: settings?.language === "en" ? "Website" : "Webseite", field: "website", value: lead.website },
    { icon: Calendar, label: settings?.language === "en" ? "Birth Date" : "Geburtsdatum", field: "birth_date", value: lead.birth_date },
    { icon: Building2, label: settings?.language === "en" ? "Company" : "Firma", field: "company_name", value: lead.company_name },
    { icon: MapPin, label: settings?.language === "en" ? "City" : "Stadt", field: "city", value: lead.city },
  ];

  const interestsFields = [
    { icon: Heart, label: settings?.language === "en" ? "Interests" : "Interessen", field: "interests", value: lead.interests },
    { icon: Target, label: settings?.language === "en" ? "Goals" : "Ziele", field: "goals", value: lead.goals },
    { icon: AlertCircle, label: settings?.language === "en" ? "Challenges" : "Herausforderungen", field: "challenges", value: lead.challenges },
  ];

  const visibleFields = showEmptyFields 
    ? fields 
    : fields.filter(field => field.value);

  const visibleInterestsFields = showEmptyFields
    ? interestsFields
    : interestsFields.filter(field => field.value && field.value.length > 0);

  return (
    <>
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

      <ContactInfoGroup
        title={settings?.language === "en" ? "Interests & Goals" : "Interessen & Ziele"}
        leadId={lead.id}
        showEmptyFields={showEmptyFields}
        onToggleEmptyFields={() => setShowEmptyFields(!showEmptyFields)}
        groupName="interests_goals"
      >
        {visibleInterestsFields.map((field) => (
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
    </>
  );
}
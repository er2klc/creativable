import { Contact2, Building2, Briefcase } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";

interface BasicInformationFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function BasicInformationFields({ lead, onUpdate }: BasicInformationFieldsProps) {
  const { settings } = useSettings();

  return (
    <div>
      <h3 className="text-xs font-medium text-gray-500 mb-3 px-3">
        {settings?.language === "en" ? "Basic Information" : "Grundinformationen"}
      </h3>
      <div className="divide-y divide-gray-50">
        <InfoRow
          icon={Contact2}
          label={settings?.language === "en" ? "Name" : "Name"}
          value={lead.name}
          field="name"
          onUpdate={onUpdate}
        />
        <InfoRow
          icon={Building2}
          label={settings?.language === "en" ? "Company" : "Firma"}
          value={lead.company_name}
          field="company_name"
          onUpdate={onUpdate}
        />
        <InfoRow
          icon={Briefcase}
          label={settings?.language === "en" ? "Position" : "Position"}
          value={lead.position}
          field="position"
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
}
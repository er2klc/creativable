import { Heart, Target, AlertCircle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";
import { ContactInfoGroup } from "./ContactInfoGroup";

interface InterestsGoalsFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function InterestsGoalsFields({ lead, onUpdate }: InterestsGoalsFieldsProps) {
  const { settings } = useSettings();

  const fields = [
    { icon: Heart, label: settings?.language === "en" ? "Interests" : "Interessen", field: "interests", value: lead.interests },
    { icon: Target, label: settings?.language === "en" ? "Goals" : "Ziele", field: "goals", value: lead.goals },
    { icon: AlertCircle, label: settings?.language === "en" ? "Challenges" : "Herausforderungen", field: "challenges", value: lead.challenges },
  ];

  return (
    <ContactInfoGroup
      title={settings?.language === "en" ? "Interests & Goals" : "Interessen & Ziele"}
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
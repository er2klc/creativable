import { Heart, Target, AlertCircle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";

interface InterestsGoalsFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function InterestsGoalsFields({ lead, onUpdate }: InterestsGoalsFieldsProps) {
  const { settings } = useSettings();

  return (
    <div>
      <h3 className="text-xs font-medium text-gray-500 mb-3 px-3">
        {settings?.language === "en" ? "Interests & Goals" : "Interessen & Ziele"}
      </h3>
      <div className="divide-y divide-gray-50">
        <InfoRow
          icon={Heart}
          label={settings?.language === "en" ? "Interests" : "Interessen"}
          value={lead.interests}
          field="interests"
          onUpdate={onUpdate}
        />
        <InfoRow
          icon={Target}
          label={settings?.language === "en" ? "Goals" : "Ziele"}
          value={lead.goals}
          field="goals"
          onUpdate={onUpdate}
        />
        <InfoRow
          icon={AlertCircle}
          label={settings?.language === "en" ? "Challenges" : "Herausforderungen"}
          value={lead.challenges}
          field="challenges"
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
}
import { Calendar, MessageSquare, Clock, Languages } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";

interface AdditionalInfoFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function AdditionalInfoFields({ lead, onUpdate }: AdditionalInfoFieldsProps) {
  const { settings } = useSettings();

  return (
    <div>
      <h3 className="text-xs font-medium text-gray-500 mb-3 px-3">
        {settings?.language === "en" ? "Additional Information" : "Zusätzliche Informationen"}
      </h3>
      <div className="divide-y divide-gray-50">
        <InfoRow
          icon={Calendar}
          label={settings?.language === "en" ? "Birth Date" : "Geburtsdatum"}
          value={lead.birth_date ? new Date(lead.birth_date).toLocaleDateString() : null}
          field="birth_date"
          onUpdate={onUpdate}
        />
        <InfoRow
          icon={MessageSquare}
          label={settings?.language === "en" ? "Preferred Contact Channel" : "Bevorzugter Kontaktkanal"}
          value={lead.preferred_communication_channel}
          field="preferred_communication_channel"
          onUpdate={onUpdate}
        />
        <InfoRow
          icon={Clock}
          label={settings?.language === "en" ? "Best Contact Times" : "Beste Erreichbarkeitszeit"}
          value={lead.best_contact_times}
          field="best_contact_times"
          onUpdate={onUpdate}
        />
        <InfoRow
          icon={Languages}
          label={settings?.language === "en" ? "Languages" : "Sprachen"}
          value={lead.languages}
          field="languages"
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
}
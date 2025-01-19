import { Share2, UserPlus } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";

interface SourceInfoFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function SourceInfoFields({ lead, onUpdate }: SourceInfoFieldsProps) {
  const { settings } = useSettings();

  return (
    <div>
      <h3 className="text-xs font-medium text-gray-500 mb-3 px-3">
        {settings?.language === "en" ? "Source Information" : "Herkunftsinformationen"}
      </h3>
      <div className="divide-y divide-gray-50">
        <InfoRow
          icon={Share2}
          label={settings?.language === "en" ? "Contact Source" : "Kontakt-Quelle"}
          value={lead.platform}
          field="platform"
          onUpdate={onUpdate}
          isSourceField
        />
        <InfoRow
          icon={UserPlus}
          label={settings?.language === "en" ? "Referred By" : "Empfohlen durch"}
          value={lead.referred_by}
          field="referred_by"
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
}
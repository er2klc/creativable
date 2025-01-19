import { Phone, Mail, Globe } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { InfoRow } from "./InfoRow";

interface ContactDetailsFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function ContactDetailsFields({ lead, onUpdate }: ContactDetailsFieldsProps) {
  const { settings } = useSettings();

  return (
    <div>
      <h3 className="text-xs font-medium text-gray-500 mb-3 px-3">
        {settings?.language === "en" ? "Contact Details" : "Kontaktdetails"}
      </h3>
      <div className="divide-y divide-gray-50">
        <InfoRow
          icon={Phone}
          label={settings?.language === "en" ? "Phone" : "Telefon"}
          value={lead.phone_number}
          field="phone_number"
          onUpdate={onUpdate}
        />
        <InfoRow
          icon={Mail}
          label={settings?.language === "en" ? "Email" : "E-Mail"}
          value={lead.email}
          field="email"
          onUpdate={onUpdate}
        />
        <InfoRow
          icon={Globe}
          label={settings?.language === "en" ? "Website" : "Webseite"}
          value={lead.website}
          field="website"
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
}
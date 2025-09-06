import { Input } from "@/components/ui/input";
import { Phone, Mail } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";

interface ContactInfoFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function ContactInfoFields({ lead, onUpdate }: ContactInfoFieldsProps) {
  const { settings } = useSettings();

  return (
    <>
      <div>
        <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Phone className="h-4 w-4 text-gray-900" />
          {settings?.language === "en" ? "Phone Number" : "Telefonnummer"}
        </dt>
        <dd>
          <Input
            value={lead.phone_number || ""}
            onChange={(e) => onUpdate({ phone_number: e.target.value })}
            placeholder={settings?.language === "en" ? "Enter phone number" : "Telefonnummer eingeben"}
            type="tel"
          />
        </dd>
      </div>
      <div>
        <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Mail className="h-4 w-4 text-gray-900" />
          {settings?.language === "en" ? "Email" : "E-Mail"}
        </dt>
        <dd>
          <Input
            value={lead.email || ""}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder={settings?.language === "en" ? "Enter email" : "E-Mail eingeben"}
            type="email"
          />
        </dd>
      </div>
    </>
  );
}
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";

interface LeadDetailHeaderProps {
  lead: Tables<"leads">;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function LeadDetailHeader({ lead, onUpdateLead }: LeadDetailHeaderProps) {
  const { settings } = useSettings();
  const contactTypes = (lead?.contact_type?.split(",") || []).filter(Boolean);

  return (
    <div className="relative -mx-6 -mt-6 bg-white border-b pb-4">
      {/* Name Tab */}
      <div className="absolute -top-2 left-4 bg-blue-500 text-white px-6 py-2 rounded-t-lg shadow-lg transform -skew-x-12">
        <input
          value={lead?.name || ""}
          onChange={(e) => onUpdateLead({ name: e.target.value })}
          className="bg-transparent border-none hover:bg-blue-600/50 transition-colors px-2 rounded w-full max-w-md text-lg font-semibold focus:outline-none placeholder:text-white/70"
          placeholder={settings?.language === "en" ? "Contact name" : "Kontaktname"}
        />
      </div>

      {/* Contact Type Tabs */}
      <div className="absolute -top-2 right-4 flex gap-2">
        <div
          className={`px-6 py-2 rounded-t-lg cursor-pointer transition-all transform -skew-x-12 ${
            contactTypes.includes("Partner")
              ? "bg-green-500 text-white shadow-lg"
              : "bg-white/80 text-gray-600 border-t border-x hover:bg-green-100"
          }`}
          onClick={() =>
            onUpdateLead({
              contact_type: contactTypes.includes("Partner")
                ? contactTypes.filter((t) => t !== "Partner").join(",")
                : [...contactTypes, "Partner"].join(","),
            })
          }
        >
          <span className="transform skew-x-12 inline-block">Partner</span>
        </div>
        <div
          className={`px-6 py-2 rounded-t-lg cursor-pointer transition-all transform -skew-x-12 ${
            contactTypes.includes("Kunde")
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-white/80 text-gray-600 border-t border-x hover:bg-blue-100"
          }`}
          onClick={() =>
            onUpdateLead({
              contact_type: contactTypes.includes("Kunde")
                ? contactTypes.filter((t) => t !== "Kunde").join(",")
                : [...contactTypes, "Kunde"].join(","),
            })
          }
        >
          <span className="transform skew-x-12 inline-block">Kunde</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-16 flex items-center gap-4 px-6">
        <SendMessageDialog
          lead={lead}
          trigger={
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              {settings?.language === "en" ? "Send Message" : "Nachricht senden"}
            </Button>
          }
        />
      </div>
    </div>
  );
}
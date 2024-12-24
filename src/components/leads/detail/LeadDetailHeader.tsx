import { Button } from "@/components/ui/button";
import { Send, User, Users, UserCheck } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { cn } from "@/lib/utils";

interface LeadDetailHeaderProps {
  lead: Tables<"leads">;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function LeadDetailHeader({ lead, onUpdateLead }: LeadDetailHeaderProps) {
  const { settings } = useSettings();
  const contactTypes = (lead?.contact_type?.split(",") || []).filter(Boolean);

  return (
    <div className="relative -mx-6 -mt-6 mb-8">
      {/* Name Tab */}
      <div className="absolute left-4 sm:left-8 top-8">
        <div className="relative">
          <div className="px-4 sm:px-6 py-2 sm:py-3 rounded-t-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-600" />
              <input
                value={lead?.name || ""}
                onChange={(e) => onUpdateLead({ name: e.target.value })}
                className="bg-transparent border-none hover:bg-gray-100/50 transition-colors px-2 rounded w-full max-w-[150px] sm:max-w-md text-base sm:text-lg font-semibold focus:outline-none placeholder:text-gray-400 text-gray-800"
                placeholder={settings?.language === "en" ? "Contact name" : "Kontaktname"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Type Tabs */}
      <div className="absolute right-12 sm:right-16 top-8 flex gap-2">
        <div
          className={cn(
            "px-3 sm:px-6 py-2 sm:py-3 rounded-t-lg cursor-pointer transition-colors relative",
            contactTypes.includes("Partner")
              ? "bg-[#E6FFE6]/70 backdrop-blur-sm text-green-800 shadow-sm"
              : "bg-white/80 text-gray-400 hover:bg-green-50"
          )}
          onClick={() =>
            onUpdateLead({
              contact_type: contactTypes.includes("Partner")
                ? contactTypes.filter((t) => t !== "Partner").join(",")
                : [...contactTypes, "Partner"].join(","),
            })
          }
        >
          <span className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap">
            <UserCheck className="h-4 w-4" />
            Partner
          </span>
        </div>
        <div
          className={cn(
            "px-3 sm:px-6 py-2 sm:py-3 rounded-t-lg cursor-pointer transition-colors relative",
            contactTypes.includes("Kunde")
              ? "bg-[#FFF3E6]/70 backdrop-blur-sm text-amber-800 shadow-sm"
              : "bg-white/80 text-gray-400 hover:bg-yellow-50"
          )}
          onClick={() =>
            onUpdateLead({
              contact_type: contactTypes.includes("Kunde")
                ? contactTypes.filter((t) => t !== "Kunde").join(",")
                : [...contactTypes, "Kunde"].join(","),
            })
          }
        >
          <span className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap">
            <Users className="h-4 w-4" />
            Kunde
          </span>
        </div>
      </div>

      {/* Continuous line */}
      <div className="absolute top-[4.5rem] left-0 right-0 h-px bg-gray-200" />

      {/* Action Buttons */}
      <div className="mt-24 flex items-center gap-4 px-6">
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
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
    <div className="relative -mx-6 -mt-12 mb-8">
      {/* Name Tab */}
      <div className="absolute -top-2 left-8">
        <div className="relative">
          <div className="bg-[#F2E6FF]/70 backdrop-blur-sm px-6 py-3 rounded-t-lg shadow-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-800" />
              <input
                value={lead?.name || ""}
                onChange={(e) => onUpdateLead({ name: e.target.value })}
                className="bg-transparent border-none hover:bg-purple-100/50 transition-colors px-2 rounded w-full max-w-md text-lg font-semibold focus:outline-none placeholder:text-purple-400 text-purple-800"
                placeholder={settings?.language === "en" ? "Contact name" : "Kontaktname"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Type Tabs */}
      <div className="absolute -top-2 right-24 flex gap-2">
        <div
          className={cn(
            "px-6 py-3 rounded-t-lg cursor-pointer transition-colors relative",
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
          <span className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Partner
          </span>
        </div>
        <div
          className={cn(
            "px-6 py-3 rounded-t-lg cursor-pointer transition-colors relative",
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
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Kunde
          </span>
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
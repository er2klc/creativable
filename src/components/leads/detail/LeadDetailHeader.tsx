import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, UserCheck, Handshake, User } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSettings } from "@/hooks/use-settings";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { Badge } from "@/components/ui/badge";

interface LeadDetailHeaderProps {
  lead: Tables<"leads">;
  phases: Tables<"lead_phases">[];
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function LeadDetailHeader({ lead, phases, onUpdateLead }: LeadDetailHeaderProps) {
  const { settings } = useSettings();
  const contactTypes = (lead?.contact_type?.split(",") || []).filter(Boolean);

  const handleContactTypeChange = (type: string, checked: boolean) => {
    const currentTypes = new Set(contactTypes);
    if (checked) {
      currentTypes.add(type);
    } else {
      currentTypes.delete(type);
    }
    onUpdateLead({ contact_type: Array.from(currentTypes).join(",") });
  };

  return (
    <div className="space-y-6">
      <div className="relative flex items-start justify-between border-b pb-6">
        {/* Name Tab */}
        <div className="absolute -top-4 left-0 bg-background border rounded-t-lg px-4 py-2 flex items-center gap-2 shadow-sm">
          <User className="h-4 w-4" />
          <Input
            value={lead?.name || ""}
            onChange={(e) => onUpdateLead({ name: e.target.value })}
            className="text-lg font-semibold bg-transparent border-none hover:bg-accent/50 transition-colors px-2 rounded w-full max-w-md"
            placeholder={settings?.language === "en" ? "Contact name" : "Kontaktname"}
          />
        </div>

        {/* Contact Type Tabs */}
        <div className="absolute -top-4 right-0 flex gap-2">
          <div className={`px-4 py-2 rounded-t-lg flex items-center gap-2 cursor-pointer transition-all ${
            contactTypes.includes("Partner") 
              ? "bg-blue-500 text-white shadow-lg" 
              : "bg-gray-100 text-gray-500"
          }`}
          onClick={() => handleContactTypeChange("Partner", !contactTypes.includes("Partner"))}
          >
            <Handshake className="h-4 w-4" />
            Partner
          </div>
          <div className={`px-4 py-2 rounded-t-lg flex items-center gap-2 cursor-pointer transition-all ${
            contactTypes.includes("Kunde") 
              ? "bg-green-500 text-white shadow-lg" 
              : "bg-gray-100 text-gray-500"
          }`}
          onClick={() => handleContactTypeChange("Kunde", !contactTypes.includes("Kunde"))}
          >
            <UserCheck className="h-4 w-4" />
            Kunde
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center gap-4 ml-auto">
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

      {/* Phase Selection */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Select
          value={lead?.phase}
          onValueChange={(value) => onUpdateLead({ phase: value })}
        >
          <SelectTrigger className="w-[200px] bg-white relative group">
            <SelectValue placeholder={settings?.language === "en" ? "Select phase" : "Phase auswählen"} />
          </SelectTrigger>
          <SelectContent>
            <div className="grid gap-2 p-2">
              {phases.map((phase) => (
                <SelectItem 
                  key={phase.id} 
                  value={phase.name} 
                  className="cursor-pointer rounded-md transition-all hover:bg-accent focus:bg-accent"
                >
                  <Badge 
                    variant={lead?.phase === phase.name ? "default" : "outline"}
                    className="w-full justify-between font-normal py-2"
                  >
                    {phase.name}
                  </Badge>
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
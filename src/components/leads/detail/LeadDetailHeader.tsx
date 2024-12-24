import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, UserCheck, Handshake } from "lucide-react";
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
    <div className="space-y-6 border-b pb-6">
      <div className="flex items-center justify-between">
        <Input
          value={lead?.name || ""}
          onChange={(e) => onUpdateLead({ name: e.target.value })}
          className="text-2xl font-semibold bg-transparent border-none hover:bg-accent/50 transition-colors px-2 rounded w-full max-w-md"
          placeholder={settings?.language === "en" ? "Contact name" : "Kontaktname"}
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-accent/50 px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={contactTypes.includes("Partner")}
                  onCheckedChange={(checked) => handleContactTypeChange("Partner", checked as boolean)}
                  id="partner"
                />
                <label htmlFor="partner" className="text-sm font-medium flex items-center gap-1">
                  <Handshake className="h-4 w-4" />
                  Partner
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={contactTypes.includes("Kunde")}
                  onCheckedChange={(checked) => handleContactTypeChange("Kunde", checked as boolean)}
                  id="kunde"
                />
                <label htmlFor="kunde" className="text-sm font-medium flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  Kunde
                </label>
              </div>
            </div>
          </div>
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Select
          value={lead?.phase}
          onValueChange={(value) => onUpdateLead({ phase: value })}
        >
          <SelectTrigger className="w-[200px] bg-white relative group hover:bg-accent/50 transition-colors">
            <SelectValue placeholder={settings?.language === "en" ? "Select phase" : "Phase auswählen"} />
          </SelectTrigger>
          <SelectContent>
            {phases.map((phase) => (
              <SelectItem key={phase.id} value={phase.name} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <Badge variant="outline" className="font-normal">
                  {phase.name}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
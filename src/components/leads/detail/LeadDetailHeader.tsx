import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSettings } from "@/hooks/use-settings";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";

interface LeadDetailHeaderProps {
  lead: Tables<"leads">;
  phases: Tables<"lead_phases">[];
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function LeadDetailHeader({ lead, phases, onUpdateLead }: LeadDetailHeaderProps) {
  const { settings } = useSettings();

  return (
    <div className="space-y-4 border-b pb-4">
      <div className="flex items-center justify-between">
        <Input
          value={lead?.name || ""}
          onChange={(e) => onUpdateLead({ name: e.target.value })}
          className="text-2xl font-semibold bg-transparent border-none hover:bg-accent/50 transition-colors px-2 rounded"
          placeholder={settings?.language === "en" ? "Contact name" : "Kontaktname"}
        />
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
      <div className="flex items-center gap-4">
        <Select
          value={lead?.phase}
          onValueChange={(value) => onUpdateLead({ phase: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={settings?.language === "en" ? "Select phase" : "Phase auswählen"} />
          </SelectTrigger>
          <SelectContent>
            {phases.map((phase) => (
              <SelectItem key={phase.id} value={phase.name}>
                {phase.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-4 bg-accent/50 px-4 py-2 rounded">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={lead?.contact_type?.includes("Partner")}
              onCheckedChange={(checked) => {
                const currentTypes = lead?.contact_type?.split(",").filter(Boolean) || [];
                const newTypes = checked
                  ? [...currentTypes, "Partner"]
                  : currentTypes.filter(t => t !== "Partner");
                onUpdateLead({ contact_type: newTypes.join(",") });
              }}
              id="partner"
            />
            <label htmlFor="partner" className="text-sm">Partner</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={lead?.contact_type?.includes("Kunde")}
              onCheckedChange={(checked) => {
                const currentTypes = lead?.contact_type?.split(",").filter(Boolean) || [];
                const newTypes = checked
                  ? [...currentTypes, "Kunde"]
                  : currentTypes.filter(t => t !== "Kunde");
                onUpdateLead({ contact_type: newTypes.join(",") });
              }}
              id="kunde"
            />
            <label htmlFor="kunde" className="text-sm">Kunde</label>
          </div>
        </div>
      </div>
    </div>
  );
}
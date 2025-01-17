import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LeadTableCell } from "./table/LeadTableCell";
import { LeadTableActions } from "./table/LeadTableActions";

interface LeadTableViewProps {
  leads: Tables<"leads">[];
  onLeadClick: (id: string) => void;
}

export const LeadTableView = ({ leads, onLeadClick }: LeadTableViewProps) => {
  const { settings } = useSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: phases = [] } = useQuery({
    queryKey: ["pipeline-phases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const handlePhaseChange = async (leadId: string, phaseId: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          phase_id: phaseId,
          last_action: settings?.language === "en" ? "Phase changed" : "Phase geändert",
          last_action_date: new Date().toISOString(),
        })
        .eq("id", leadId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["leads"] });

      toast({
        title: settings?.language === "en" ? "Phase updated" : "Phase aktualisiert",
        description: settings?.language === "en"
          ? "The phase has been successfully updated."
          : "Die Phase wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error("Error updating phase:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en"
          ? "Failed to update phase"
          : "Phase konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableCell className="w-[30px] p-2">
                <span className="sr-only">Favorite</span>
              </TableCell>
              <TableCell className="w-[15%] min-w-[120px]">
                {settings?.language === "en" ? "Contact" : "Kontakt"}
              </TableCell>
              <TableCell className="w-[15%] min-w-[120px]">
                {settings?.language === "en" ? "Platform" : "Plattform"}
              </TableCell>
              <TableCell className="w-[15%] min-w-[120px]">
                {settings?.language === "en" ? "Phase" : "Phase"}
              </TableCell>
              <TableCell className="w-[20%] min-w-[120px]">
                {settings?.language === "en" ? "Last Action" : "Letzte Aktion"}
              </TableCell>
              <TableCell className="w-[15%] min-w-[120px]">
                {settings?.language === "en" ? "Industry" : "Branche"}
              </TableCell>
              <TableCell className="w-[50px]">
                <span className="sr-only">Actions</span>
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onLeadClick(lead.id)}
              >
                <LeadTableCell type="favorite" value={null} />
                <LeadTableCell type="name" value={lead.name} />
                <LeadTableCell type="platform" value={lead.platform} />
                <LeadTableCell type="phase" value={lead.phase_id} />
                <LeadTableCell type="lastAction" value={lead.last_action_date} />
                <LeadTableCell type="industry" value={lead.industry} />
                <TableCell className="whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <LeadTableActions
                    lead={lead}
                    onShowDetails={() => onLeadClick(lead.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
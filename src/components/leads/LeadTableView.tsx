
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLeadStore } from "@/store/useLeadStore";
import { LeadRow } from "./LeadRow";
import { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Text } from "@/components/ui/text";
import { useFilter } from "@/hooks/use-filter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const LeadTableView = () => {
  const navigate = useNavigate();
  const filter = useFilter();
  const isMobile = useIsMobile();
  const store = useLeadStore();
  const [loadingLeads, setLoadingLeads] = useState<Record<string, boolean>>({});

  const handleArchive = async (leadId: string) => {
    setLoadingLeads((prev) => ({ ...prev, [leadId]: true }));
    try {
      await supabase
        .from("leads")
        .update({ archived: true })
        .eq("id", leadId);

      store.archiveLead(leadId);
      toast.success("Lead archiviert");
    } catch (error) {
      console.error("Error archiving lead:", error);
      toast.error("Fehler beim Archivieren des Leads");
    } finally {
      setLoadingLeads((prev) => ({ ...prev, [leadId]: false }));
    }
  };

  const handleSelect = (lead: Tables<"leads">) => {
    store.setSelectedLeadId(lead.id);
  };

  // Filtering logic
  let filteredLeads = [...store.leads];

  if (filter.searchTerm) {
    filteredLeads = filteredLeads.filter((lead) =>
      lead.name?.toLowerCase().includes(filter.searchTerm.toLowerCase())
    );
  }

  if (filter.platform && filter.platform !== "all") {
    filteredLeads = filteredLeads.filter(
      (lead) => lead.platform === filter.platform
    );
  }

  if (filter.status && filter.status !== "all") {
    filteredLeads = filteredLeads.filter(
      (lead) => lead.status === filter.status
    );
  }

  if (filter.phase && filter.phase !== "all") {
    filteredLeads = filteredLeads.filter((lead) => {
      // Handle 'no_phase' special case
      if (filter.phase === "no_phase") {
        return !lead.phase_id;
      }
      return lead.phase_id === filter.phase;
    });
  }

  if (!isMobile) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="text-left text-sm font-medium text-gray-500">
            <tr className="border-b">
              <th className="px-4 py-3 w-1/4">Name</th>
              <th className="px-4 py-3 w-1/6">Plattform</th>
              <th className="px-4 py-3 w-1/6">Status</th>
              <th className="px-4 py-3 w-1/6">Phase</th>
              <th className="px-4 py-3 w-1/6">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Keine Leads gefunden
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  isSelected={store.selectedLeadId === lead.id}
                  onSelect={() => handleSelect(lead)}
                  onArchive={() => handleArchive(lead.id)}
                  isLoading={loadingLeads[lead.id] || false}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredLeads.length === 0 ? (
        <Text className="text-center py-4 text-gray-500">
          Keine Leads gefunden
        </Text>
      ) : (
        filteredLeads.map((lead) => (
          <LeadRow
            key={lead.id}
            lead={lead}
            isSelected={store.selectedLeadId === lead.id}
            onSelect={() => handleSelect(lead)}
            onArchive={() => handleArchive(lead.id)}
            isLoading={loadingLeads[lead.id] || false}
            isMobile={true}
          />
        ))
      )}
    </div>
  );
};

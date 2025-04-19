
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { LeadAvatar } from "./LeadAvatar";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface LeadTableViewProps {
  leads: Tables<"leads">[];
  onLeadClick: (id: string) => void;
  selectedPipelineId: string | null;
}

export function LeadTableView({ leads, onLeadClick, selectedPipelineId }: LeadTableViewProps) {
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter leads based on search query
  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(query) ||
      lead.company_name?.toLowerCase().includes(query) ||
      lead.social_media_username?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.phone_number?.toLowerCase().includes(query) ||
      lead.industry?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      <div className="p-4">
        <Input
          placeholder={settings?.language === "en" ? "Search leads..." : "Kontakte suchen..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">{settings?.language === "en" ? "Name" : "Name"}</TableHead>
              <TableHead>{settings?.language === "en" ? "Platform" : "Plattform"}</TableHead>
              <TableHead>{settings?.language === "en" ? "Username" : "Benutzername"}</TableHead>
              <TableHead>{settings?.language === "en" ? "Company" : "Unternehmen"}</TableHead>
              <TableHead>{settings?.language === "en" ? "Industry" : "Branche"}</TableHead>
              <TableHead>{settings?.language === "en" ? "Status" : "Status"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {settings?.language === "en" ? "No leads found." : "Keine Kontakte gefunden."}
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onLeadClick(lead.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <LeadAvatar lead={lead} />
                      <span>{lead.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{lead.platform}</TableCell>
                  <TableCell>{lead.social_media_username || "-"}</TableCell>
                  <TableCell>{lead.company_name || "-"}</TableCell>
                  <TableCell>{lead.industry || "-"}</TableCell>
                  <TableCell>
                    <div className="capitalize">{lead.status || "lead"}</div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


import React from "react";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { LeadTableCell } from "@/components/leads/table/LeadTableCell";
import { TableRow } from "@/components/ui/table";
import { LeadTableActions } from "@/components/leads/table/LeadTableActions";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadRowProps {
  lead: Tables<"leads">;
  isSelected?: boolean;
  onSelect: () => void;
  onArchive: () => void;
  isLoading?: boolean;
  isMobile?: boolean;
}

export const LeadRow = ({
  lead,
  isSelected,
  onSelect,
  onArchive,
  isLoading = false,
  isMobile = false,
}: LeadRowProps) => {
  if (isMobile) {
    return (
      <div
        className={cn(
          "p-4 border rounded-lg shadow-sm cursor-pointer transition-colors",
          isSelected ? "bg-blue-50 border-blue-200" : "bg-white hover:bg-gray-50"
        )}
        onClick={onSelect}
      >
        <div className="flex justify-between items-center gap-2">
          <LeadTableCell 
            type="name" 
            value={lead.name} 
            lead={lead}
          />
          <div className="flex items-center">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <LeadTableActions 
                lead={lead} 
                onShowDetails={onSelect}
              />
            )}
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-sm text-gray-500">
          <LeadTableCell 
            type="platform" 
            value={lead.platform} 
          />
          <LeadTableCell 
            type="status" 
            value={lead.status || 'lead'} 
          />
        </div>
      </div>
    );
  }

  return (
    <TableRow
      className={cn(
        "cursor-pointer hover:bg-gray-50",
        isSelected && "bg-blue-50"
      )}
      onClick={onSelect}
    >
      <LeadTableCell 
        type="name" 
        value={lead.name} 
        lead={lead}
      />
      <LeadTableCell 
        type="platform" 
        value={lead.platform} 
      />
      <LeadTableCell 
        type="status" 
        value={lead.status || 'lead'} 
      />
      <LeadTableCell 
        type="phase" 
        value={lead.phase_id} 
      />
      <td className="whitespace-nowrap py-2 px-4">
        <div className="flex items-center gap-2 justify-end">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                }}
              >
                Archivieren
              </Button>
              <LeadTableActions 
                lead={lead}
                onShowDetails={onSelect}
              />
            </>
          )}
        </div>
      </td>
    </TableRow>
  );
};


import { DialogHeader } from "@/components/ui/dialog";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { LeadWithRelations } from "@/types/leads";
import { DeleteLeadDialog } from "./header/DeleteLeadDialog";
import { LeadName } from "./header/LeadName";
import { Platform } from "@/config/platforms";
import { Tables } from "@/integrations/supabase/types";
import { HeaderActions } from "./header/HeaderActions";
import { useStatusChange } from "./hooks/useStatusChange";
import { HeaderActions as GlobalHeaderActions } from "@/components/layout/HeaderActions";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/dashboard/SearchBar";

export interface LeadDetailHeaderProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  onDeleteLead: () => void;
}

export function LeadDetailHeader({ lead, onUpdateLead, onDeleteLead }: LeadDetailHeaderProps) {
  const { settings } = useSettings();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { handleStatusChange } = useStatusChange(lead, onUpdateLead, settings);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return data;
    }
  });

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    onDeleteLead();
  };

  return (
    <>
      <DialogHeader className="fixed top-0 left-0 right-0 z-[40] bg-white border-b md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
        <div className="flex flex-col space-y-4">
          <header className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-4">
              <LeadName name={lead.name} platform={lead.platform as Platform} />
              <div className="w-[300px]">
                <SearchBar />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <HeaderActions 
                status={lead.status || 'lead'}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
              <GlobalHeaderActions profile={profile} userEmail={undefined} />
            </div>
          </header>
          <div className="px-6 pb-3">
          <CompactPhaseSelector
            lead={lead as any}
            onUpdateLead={onUpdateLead}
          />
          </div>
        </div>
      </DialogHeader>

      <DeleteLeadDialog 
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

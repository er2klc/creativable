
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
import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface LeadDetailHeaderProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  onDeleteLead: () => void;
}

export function LeadDetailHeader({ lead, onUpdateLead, onDeleteLead }: LeadDetailHeaderProps) {
  const { settings } = useSettings();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { handleStatusChange } = useStatusChange(lead, onUpdateLead, settings);
  const [searchQuery, setSearchQuery] = useState("");

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
              <div className="relative w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Suche in Kontaktdetails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <HeaderActions 
                status={lead.status || 'lead'}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
              <div className="flex items-center gap-4">
                <button className="relative">
                  <Bell className="h-5 w-5 text-gray-600 hover:text-purple-500 transition-colors" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    2
                  </span>
                </button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    {profile?.full_name?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          <div className="px-6 pb-3">
            <CompactPhaseSelector
              lead={lead}
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

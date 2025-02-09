import { Button } from "@/components/ui/button";
import { LeadSearch } from "../LeadSearch";
import { LayoutGrid, List, ChevronDown, Instagram, Linkedin, Users, Bell } from "lucide-react";
import { AddLeadDialog } from "../AddLeadDialog";
import { CreateInstagramContactDialog } from "../instagram/CreateInstagramContactDialog";
import { CreateLinkedInContactDialog } from "../linkedin/CreateLinkedInContactDialog";
import { LeadFilters } from "../LeadFilters";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface LeadsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string | null) => void;
  viewMode: "kanban" | "list";
  setViewMode: (mode: "kanban" | "list") => void;
  setIsEditMode: (isEdit: boolean) => void;
}

export const LeadsHeader = ({
  searchQuery,
  setSearchQuery,
  selectedPipelineId,
  setSelectedPipelineId,
  viewMode,
  setViewMode,
  setIsEditMode,
}: LeadsHeaderProps) => {
  const [showAddLead, setShowAddLead] = useState(false);
  const [showInstagramDialog, setShowInstagramDialog] = useState(false);
  const [showLinkedInDialog, setShowLinkedInDialog] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getInitials = (email: string) => {
    return email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="w-full bg-background border-b">
      <div className={`w-full px-4 py-4 ${isMobile ? 'ml-0' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div className="flex items-center justify-between md:justify-start gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h1 className="text-xl font-semibold">Kontakte</h1>
            </div>

            <div className="flex items-center gap-0">
              <Button
                variant="default"
                className="bg-black text-white hover:bg-black/90 rounded-r-none text-sm whitespace-nowrap"
                onClick={() => setShowAddLead(true)}
              >
                ✨ Kontakt hinzufügen
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    className="bg-black text-white hover:bg-black/90 rounded-l-none"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowInstagramDialog(true)}>
                    <Instagram className="h-4 w-4 mr-2" />
                    <span>Instagram</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowLinkedInDialog(true)}>
                    <Linkedin className="h-4 w-4 mr-2" />
                    <span>LinkedIn</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 min-w-0 max-w-xl">
            <LeadSearch value={searchQuery} onChange={setSearchQuery} />
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4">
            <LeadFilters
              selectedPipelineId={selectedPipelineId}
              setSelectedPipelineId={setSelectedPipelineId}
              onEditModeChange={setIsEditMode}
            />

            {!isMobile && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant={viewMode === "kanban" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("kanban")}
                  className="h-9 w-9"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-9 w-9"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}

            {!isMobile && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-px bg-gray-500" /> {/* Längere vertikale Linie */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setShowNotifications(true)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                <div className="h-6 w-px bg-gray-200" /> {/* Vertikale Linie zwischen Bell und Avatar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>{getInitials(user?.email || "")}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      <span>Abmelden</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddLeadDialog
        open={showAddLead}
        onOpenChange={setShowAddLead}
        pipelineId={selectedPipelineId}
      />

      <CreateInstagramContactDialog
        open={showInstagramDialog}
        onOpenChange={setShowInstagramDialog}
        pipelineId={selectedPipelineId}
      />

      <CreateLinkedInContactDialog
        open={showLinkedInDialog}
        onOpenChange={setShowLinkedInDialog}
        pipelineId={selectedPipelineId}
      />
    </div>
  );
};

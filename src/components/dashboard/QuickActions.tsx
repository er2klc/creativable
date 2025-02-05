import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Calendar, 
  CheckSquare,
  Building2,
  User,
  Plus
} from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewAppointmentDialog } from "@/components/calendar/NewAppointmentDialog";
import { AddTaskDialog } from "@/components/todo/AddTaskDialog";
import { CreateInstagramContactDialog } from "@/components/leads/instagram/CreateInstagramContactDialog";
import { CreateLinkedInContactDialog } from "@/components/leads/linkedin/CreateLinkedInContactDialog";

export const QuickActions = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [showMainDialog, setShowMainDialog] = useState(false);
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false);
  const [showInstagramDialog, setShowInstagramDialog] = useState(false);
  const [showLinkedInDialog, setShowLinkedInDialog] = useState(false);
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);

  const { data: teams } = useQuery({
    queryKey: ['user-teams'],
    queryFn: async () => {
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams (
            id,
            name,
            slug
          )
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      return teamMembers?.map(tm => tm.teams) || [];
    }
  });

  const handleTeamClick = () => {
    if (!teams?.length) {
      navigate('/unity');
      return;
    }
    
    if (teams.length === 1) {
      navigate(`/unity/team/${teams[0].slug}`);
      return;
    }

    setShowTeamDialog(true);
  };

  const actions = [
    {
      icon: User,
      label: settings?.language === "en" ? "My Contacts" : "Meine Kontakte",
      onClick: () => navigate("/contacts"),
      className: "bg-gradient-to-br from-[#F2FCE2]/50 to-[#E5DEFF]/50 hover:from-[#F2FCE2]/60 hover:to-[#E5DEFF]/60"
    },
    {
      icon: UserPlus,
      label: settings?.language === "en" ? "New Contact" : "Neuer Kontakt",
      onClick: () => setShowMainDialog(true),
      className: "bg-gradient-to-br from-[#FDE1D3]/50 to-[#D3E4FD]/50 hover:from-[#FDE1D3]/60 hover:to-[#D3E4FD]/60"
    },
    {
      icon: Calendar,
      label: settings?.language === "en" ? "Schedule Meeting" : "Termin planen",
      onClick: () => setShowNewAppointmentDialog(true),
      className: "bg-gradient-to-br from-[#E5DEFF]/50 to-[#FDE1D3]/50 hover:from-[#E5DEFF]/60 hover:to-[#FDE1D3]/60"
    },
    {
      icon: CheckSquare,
      label: settings?.language === "en" ? "Add Task" : "Aufgabe erstellen",
      onClick: () => setShowAddTaskDialog(true),
      className: "bg-gradient-to-br from-[#D3E4FD]/50 to-[#F2FCE2]/50 hover:from-[#D3E4FD]/60 hover:to-[#F2FCE2]/60"
    },
    {
      icon: Building2,
      label: settings?.language === "en" ? "My Team" : "Mein Team",
      onClick: handleTeamClick,
      className: "bg-gradient-to-br from-[#F2FCE2]/50 to-[#E5DEFF]/50 hover:from-[#F2FCE2]/60 hover:to-[#E5DEFF]/60"
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className={`w-full h-24 flex flex-col gap-2 items-center justify-center transition-all duration-200 hover:scale-105 border border-gray-200/50 shadow-sm backdrop-blur-sm ${action.className}`}
            onClick={action.onClick}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-sm text-center">{action.label}</span>
          </Button>
        ))}
      </div>

      <Dialog 
        open={showMainDialog} 
        onOpenChange={setShowMainDialog}
        modal={true}
      >
        <DialogContent 
          className="sm:max-w-[425px]"
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <div className="grid grid-cols-3 gap-4 py-4">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => {
                setShowMainDialog(false);
                setShowAddLeadDialog(true);
              }}
            >
              <div className="relative">
                <UserPlus className="h-6 w-6" />
                <Plus className="h-3 w-3 absolute -right-1 -top-1" />
              </div>
              <span className="text-sm">Manuell</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => {
                setShowMainDialog(false);
                setShowInstagramDialog(true);
              }}
            >
              <div className="relative text-pink-500">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"
                  />
                </svg>
                <Plus className="h-3 w-3 absolute -right-1 -top-1" />
              </div>
              <span className="text-sm">Instagram</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => {
                setShowMainDialog(false);
                setShowLinkedInDialog(true);
              }}
            >
              <div className="relative text-[#0A66C2]">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z"
                  />
                </svg>
                <Plus className="h-3 w-3 absolute -right-1 -top-1" />
              </div>
              <span className="text-sm">LinkedIn</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddLeadDialog
        open={showAddLeadDialog}
        onOpenChange={setShowAddLeadDialog}
      />

      <CreateInstagramContactDialog
        open={showInstagramDialog}
        onOpenChange={setShowInstagramDialog}
      />

      <CreateLinkedInContactDialog
        open={showLinkedInDialog}
        onOpenChange={setShowLinkedInDialog}
      />

      <NewAppointmentDialog 
        open={showNewAppointmentDialog}
        onOpenChange={setShowNewAppointmentDialog}
        initialSelectedDate={new Date()}
      />

      <AddTaskDialog
        open={showAddTaskDialog}
        onOpenChange={setShowAddTaskDialog}
      />

      <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="grid gap-4 py-4">
            <h2 className="text-lg font-semibold">Wähle dein Team</h2>
            <div className="grid gap-2">
              {teams?.map((team) => (
                <Button
                  key={team.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate(`/unity/team/${team.slug}`);
                    setShowTeamDialog(false);
                  }}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  {team.name}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
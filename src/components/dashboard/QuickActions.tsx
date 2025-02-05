import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Calendar, 
  CheckSquare,
  Building2,
  User
} from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewAppointmentDialog } from "@/components/calendar/NewAppointmentDialog";
import { AddTaskDialog } from "@/components/todo/AddTaskDialog";

export const QuickActions = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);

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
      onClick: () => setShowAddLeadDialog(true),
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

      <AddLeadDialog 
        open={showAddLeadDialog} 
        onOpenChange={setShowAddLeadDialog}
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
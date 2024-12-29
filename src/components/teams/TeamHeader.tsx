import { Infinity, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

interface TeamHeaderProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
  };
  teamStats?: {
    totalMembers: number;
    admins: number;
  };
}

export function TeamHeader({ team, teamStats }: TeamHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-background border-b">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Infinity className="h-8 w-8 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold text-primary">
                  {team.name}
                </h1>
                <TeamLogoUpload teamId={team.id} currentLogoUrl={team.logo_url} />
              </div>
              <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{teamStats?.totalMembers || 0} Mitglieder</span>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/unity')}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Zurück zur Übersicht
          </Button>
        </div>
        <Separator className="my-4" />
      </div>
    </div>
  );
}
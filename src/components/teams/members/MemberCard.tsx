
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type Tables } from "@/integrations/supabase/types";
import { useTeamPresence } from "../context/TeamPresenceContext";
import { useNavigate, useParams } from "react-router-dom";

interface MemberCardProps {
  member: Tables<"team_members"> & {
    profile: Tables<"profiles">;
    points?: {
      level: number;
      points: number;
    };
  };
  currentUserLevel: number;
}

export const MemberCard = ({ member, currentUserLevel }: MemberCardProps) => {
  const { isOnline } = useTeamPresence();
  const memberIsOnline = isOnline(member.user_id);
  const canChat = currentUserLevel >= 3 && member.points?.level >= 3;
  const lastSeen = member.profile?.last_seen;
  const navigate = useNavigate();
  const { teamSlug } = useParams();

  const handleCardClick = () => {
    if (member.profile?.slug) {
      navigate(`/unity/team/${teamSlug}/members/${member.profile.slug}`);
    }
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md" 
      onClick={handleCardClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-background">
              <AvatarImage src={member.profile?.avatar_url} />
              <AvatarFallback>
                {member.profile?.display_name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
              memberIsOnline ? "bg-green-500 animate-pulse" : "bg-gray-300"
            )} />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="bg-gradient-to-r from-primary/80 to-primary rounded-full h-8 w-8 flex items-center justify-center text-white font-medium">
                  {member.points?.level || 0}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Level {member.points?.level || 0}</p>
                <p className="text-xs text-muted-foreground">{member.points?.points || 0} Punkte</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base">{member.profile?.display_name}</h3>
            <Badge variant={member.role === 'owner' ? "default" : "secondary"} className="ml-2">
              {member.role}
            </Badge>
          </div>

          {member.profile?.slug && (
            <p className="text-sm text-muted-foreground">
              @{member.profile.slug}
            </p>
          )}

          {member.profile?.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {member.profile.bio}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            {lastSeen && !memberIsOnline && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(lastSeen), { addSuffix: true, locale: de })}
              </span>
            )}
          </div>
        </div>

        {canChat && (
          <Button
            className="w-full mt-3"
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation(); // Verhindert, dass der Card-Click ausgelöst wird
            }}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Nachricht senden
          </Button>
        )}
        {!canChat && currentUserLevel < 3 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  className="w-full mt-3"
                  size="sm"
                  variant="secondary"
                  disabled
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Nachricht senden
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Du brauchst Level 3 um Nachrichten zu senden
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </Card>
  );
};

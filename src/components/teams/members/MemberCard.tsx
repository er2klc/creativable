
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type Tables } from "@/integrations/supabase/types";
import { useTeamPresence } from "../context/TeamPresenceContext";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { AwardPointsDialog } from "./AwardPointsDialog";
import { useTeamChatStore } from "@/store/useTeamChatStore";

interface MemberCardProps {
  member: Tables<"team_members"> & {
    profile: Tables<"profiles">;
    points?: {
      level: number;
      points: number;
    };
  };
  currentUserLevel: number;
  isAdmin: boolean;
}

export const MemberCard = ({ member, currentUserLevel, isAdmin }: MemberCardProps) => {
  const { isOnline } = useTeamPresence();
  const memberIsOnline = isOnline(member.user_id);
  const points = member.points || { level: 0, points: 0 };
  const canChat = currentUserLevel >= 3 && points.level >= 3;
  const lastSeen = member.profile?.last_seen;
  const navigate = useNavigate();
  const { teamSlug } = useParams();
  const setSelectedUserId = useTeamChatStore((state) => state.setSelectedUserId);

  const handleCardClick = () => {
    if (member.profile?.slug) {
      navigate(`/unity/${teamSlug}/members/${member.profile.slug}`);
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserId(member.user_id);
  };

  const [isAwardPointsOpen, setIsAwardPointsOpen] = useState(false);

  return (
    <Card className="relative group cursor-pointer" onClick={handleCardClick}>
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
                  {points.level}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Level {points.level}</p>
                <p className="text-xs text-muted-foreground">{points.points} Punkte</p>
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
            onClick={handleChatClick}
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

        {member.role !== 'owner' && isAdmin && (
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setIsAwardPointsOpen(true);
              }}
            >
              <Award className="h-4 w-4 mr-2" />
              Punkte vergeben
            </Button>
          </div>
        )}

        <AwardPointsDialog
          isOpen={isAwardPointsOpen}
          onClose={() => setIsAwardPointsOpen(false)}
          memberId={member.id}
          memberName={member.profile?.display_name || "Unbekannt"}
          teamId={member.team_id}
        />
      </div>
    </Card>
  );
};

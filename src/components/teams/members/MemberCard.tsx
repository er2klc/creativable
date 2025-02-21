
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
import { useUser } from "@supabase/auth-helpers-react";

interface MemberCardProps {
  member: Tables<"team_members"> & {
    profile: Tables<"profiles">;
    points?: {
      level: number;
      points: number;
    };
  };
  currentUserLevel: number;
  isAdmin?: boolean;
}

export const MemberCard = ({ member, currentUserLevel, isAdmin }: MemberCardProps) => {
  const { isOnline } = useTeamPresence();
  const memberIsOnline = isOnline(member.user_id);
  const points = member.points || { level: 0, points: 0 };
  const user = useUser();
  const isCurrentUser = user?.id === member.user_id;
  const canChat = !isCurrentUser && currentUserLevel >= 3 && points.level >= 3;
  const lastSeen = member.profile?.last_seen;
  const navigate = useNavigate();
  const { teamSlug } = useParams();
  const setSelectedUserId = useTeamChatStore((state) => state.setSelectedUserId);
  const [isAwardPointsOpen, setIsAwardPointsOpen] = useState(false);

  const handleCardClick = () => {
    if (member.profile?.slug) {
      navigate(`/unity/${teamSlug}/members/${member.profile.slug}`);
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserId(member.user_id);
  };

  return (
    <Card 
      className="group overflow-hidden bg-[#222] cursor-pointer relative h-[320px]"
      onClick={handleCardClick}
    >
      <div className="relative h-[200px]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#222]/95 to-transparent" />
        <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center">
          <Avatar className="h-24 w-24 border-2 border-white/10">
            <AvatarImage src={member.profile?.avatar_url} />
            <AvatarFallback className="text-2xl text-white/80">
              {member.profile?.display_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#333] to-[#222]">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base text-white/90 truncate">
              {member.profile?.display_name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant={member.role === 'owner' ? "default" : "secondary"} className="ml-2">
                {member.role}
              </Badge>
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
          </div>

          {member.profile?.slug && (
            <p className="text-sm text-white/60 truncate">
              @{member.profile.slug}
            </p>
          )}

          {member.profile?.bio && (
            <p className="text-sm text-white/60 line-clamp-2">
              {member.profile.bio}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-white/60 mt-2">
            {lastSeen && !memberIsOnline && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(lastSeen), { addSuffix: true, locale: de })}
              </span>
            )}
            <div className={cn(
              "h-2 w-2 rounded-full",
              memberIsOnline ? "bg-green-500 animate-pulse" : "bg-gray-500"
            )} />
          </div>

          <div className="flex gap-2 mt-4">
            {canChat && (
              <Button
                className="w-full"
                size="sm"
                variant="secondary"
                onClick={handleChatClick}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Nachricht senden
              </Button>
            )}
            {!canChat && currentUserLevel < 3 && !isCurrentUser && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      className="w-full"
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
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAwardPointsOpen(true);
                }}
              >
                <Award className="h-4 w-4 mr-2" />
                Punkte vergeben
              </Button>
            )}
          </div>
        </div>

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

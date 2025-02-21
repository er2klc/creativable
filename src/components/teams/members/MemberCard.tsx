
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
  className?: string;
}

export const MemberCard = ({ member, currentUserLevel, className }: MemberCardProps) => {
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

  const handleCardClick = () => {
    if (member.profile?.slug) {
      navigate(`/unity/${teamSlug}/members/${member.profile.slug}`);
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserId(member.user_id);
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-gradient-to-r from-primary/80 to-primary';
      case 'admin':
        return 'bg-gradient-to-r from-violet-600 to-blue-600';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-500';
    }
  };

  return (
    <Card 
      className={cn(
        "group overflow-hidden bg-[#222] cursor-pointer relative h-[320px]",
        className
      )}
      onClick={handleCardClick}
    >
      <div className="relative h-[220px]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#222]/95 to-transparent" />
        <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center pt-8">
          {/* Level Badge - Left Top */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-[#1A1F2C]/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1 text-white/90">
              Level {points.level}
            </div>
          </div>

          {/* Points Badge - Right Top */}
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-[#1A1F2C]/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1 text-white/90">
              {points.points} Punkte
            </div>
          </div>

          {/* Avatar with Online Status */}
          <div className="relative z-20">
            {/* Online Status Ring */}
            {memberIsOnline && (
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-green-500/20 to-green-500/30 animate-pulse" />
            )}
            <div className="relative">
              <Avatar className="h-32 w-32 border-2 border-white/20 shadow-lg relative">
                <AvatarImage src={member.profile?.avatar_url} />
                <AvatarFallback className="text-3xl text-white/90">
                  {member.profile?.display_name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Heartbeat Online Indicator */}
              {memberIsOnline && (
                <div className="absolute -bottom-1 -right-1 z-30">
                  <div className="animate-[heartbeat_2s_ease-in-out_infinite]">
                    <div className="h-4 w-4 rounded-full bg-green-500 border-2 border-[#222] shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Role Badge & Username */}
        <div className="absolute -bottom-6 inset-x-0 flex flex-col items-center z-20">
          <Badge 
            className={cn(
              "px-4 py-1 shadow-lg",
              getRoleBadgeStyle(member.role)
            )}
          >
            {member.role}
          </Badge>
          {member.profile?.slug && (
            <p className="text-sm text-white/80 mt-2">
              @{member.profile.slug}
            </p>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#333] to-[#222]">
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base text-white/90 truncate">
              {member.profile?.display_name}
            </h3>
          </div>

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
          </div>

          <div className="flex gap-2 mt-4">
            {canChat && (
              <Button
                className="w-full bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10 shadow-lg backdrop-blur-sm transition-all duration-200"
                size="sm"
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
                      className="w-full bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10 shadow-lg backdrop-blur-sm transition-all duration-200"
                      size="sm"
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
        </div>
      </div>
    </Card>
  );
};

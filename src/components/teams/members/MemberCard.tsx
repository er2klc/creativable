
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { type Tables } from "@/integrations/supabase/types";
import { useTeamPresence } from "../context/TeamPresenceContext";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

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

export const MemberCard = ({
  member,
  currentUserLevel,
  className
}: MemberCardProps) => {
  const { isOnline } = useTeamPresence();
  const { teamSlug } = useParams();
  const navigate = useNavigate();
  const user = useUser();
  const isCurrentUser = user?.id === member.user_id;
  const canChat = false; // Temporarily disabled
  const memberIsOnline = isOnline(member.user_id);

  const handleCardClick = () => {
    // Profile navigation temporarily disabled
  };

  const handleChatClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Chat functionality temporarily disabled
    toast.error("Chat ist temporär deaktiviert");
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

  return <Card className={cn("group overflow-hidden bg-[#222] cursor-pointer relative h-[320px]", className)} onClick={handleCardClick}>
      <div className="relative h-[220px]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#222]/95 to-transparent" />
        <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center pt-8">
          <div className="absolute top-4 left-4 z-30">
            <div className="bg-[#1A1F2C]/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1 text-white/90">
              Level {member.points?.level || 0}
            </div>
          </div>

          <div className="absolute top-4 right-4 z-30">
            <div className="bg-[#1A1F2C]/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1 text-white/90">
              {member.points?.points || 0} Punkte
            </div>
          </div>

          <div className="relative z-20">
            {memberIsOnline && <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-green-500/20 to-green-500/30 animate-pulse" />}
            <div className="relative">
              <Avatar className="h-32 w-32 border-2 border-white/20 shadow-lg relative">
                <AvatarImage src={member.profile?.avatar_url} />
                <AvatarFallback className="text-3xl text-white/90">
                  {member.profile?.display_name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {memberIsOnline && <div className="absolute -bottom-1 -right-1 z-30">
                  <div className="animate-[heartbeat_2s_ease-in-out_infinite]">
                    <div className="h-4 w-4 rounded-full bg-green-500 border-2 border-[#222] shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  </div>
                </div>}
            </div>
          </div>
        </div>

        <div className="absolute -bottom-1 inset-x-0 flex flex-col items-center z-30 pb-4">
          <Badge className={cn("px-4 py-1 shadow-lg", getRoleBadgeStyle(member.role))}>
            {member.role}
          </Badge>
          {member.profile?.display_name && <p className="text-sm text-white/80 mt-1">
              @{member.profile.display_name}
            </p>}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 pt-8 bg-gradient-to-t from-[#333] via-[#222] to-transparent">
        <div className="space-y-2 mt-10">
          <div className="flex items-center justify-center pb-">
            <h3 className="font-medium text-base text-white/90 truncate max-w-[95%] text-center">
              {member.profile?.display_name}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Online Status
            </span>
          </div>

          {canChat && (
            <div className="flex gap-2 mt-4">
              <Button 
                className="w-full" 
                variant="glassy" 
                size="sm" 
                onClick={handleChatClick}
                disabled={true}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Nachricht senden
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>;
};

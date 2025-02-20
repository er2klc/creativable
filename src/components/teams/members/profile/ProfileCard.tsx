import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Brain, MapPin, Link as LinkIcon, Instagram, Linkedin, Mail, UserPlus, UserMinus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { toast } from "sonner";
import { EditProfileDialog } from "./EditProfileDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

interface ProfileCardProps {
  memberData: {
    id: string;
    avatar_url?: string;
    display_name?: string;
    bio?: string;
    last_seen: string;
    personality_type?: string;
    location?: string;
    social_links?: {
      website?: string;
      instagram?: string;
      linkedin?: string;
    };
    joined_at: string;
    stats: {
      posts_count: number;
      followers_count: number;
      following_count: number;
    };
    email?: string;
  };
  memberSlug: string;
  currentLevel: number;
  currentPoints: number;
  pointsToNextLevel: number;
  aboutMe?: string;
}

export const ProfileCard = ({ 
  memberData, 
  memberSlug, 
  currentLevel, 
  currentPoints, 
  pointsToNextLevel,
  aboutMe
}: ProfileCardProps) => {
  const user = useUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { teamSlug } = useParams();
  const isOwnProfile = user?.id === memberData.id;

  const { data: teamData } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: memberStats } = useQuery({
    queryKey: ['member-stats', memberData.id, teamData?.id],
    enabled: !!teamData?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_member_stats')
        .select('*')
        .eq('user_id', memberData.id)
        .eq('team_id', teamData.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: followStatus, isLoading: isLoadingFollow } = useQuery({
    queryKey: ['follow-status', memberData.id, teamData?.id],
    enabled: !!teamData?.id && !isOwnProfile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_member_follows')
        .select('id')
        .eq('follower_id', user?.id)
        .eq('following_id', memberData.id)
        .eq('team_id', teamData.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    }
  });

  const handleFollow = async () => {
    if (!teamData?.id || !user) return;

    try {
      if (followStatus) {
        const { error } = await supabase
          .from('team_member_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', memberData.id)
          .eq('team_id', teamData.id);

        if (error) throw error;
        toast.success('Du folgst diesem Mitglied nicht mehr');
      } else {
        const { error } = await supabase
          .from('team_member_follows')
          .insert({
            follower_id: user.id,
            following_id: memberData.id,
            team_id: teamData.id
          });

        if (error) throw error;
        toast.success('Du folgst diesem Mitglied jetzt');
      }

      queryClient.invalidateQueries({ queryKey: ['follow-status'] });
      queryClient.invalidateQueries({ queryKey: ['member-stats'] });
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast.error('Fehler beim Aktualisieren des Follow-Status');
    }
  };

  const bioText = aboutMe || memberData.bio || "Dieser Nutzer hat noch keine Bio hinzugefügt.";

  const joinedDateString = memberData.joined_at
    ? formatDistanceToNow(new Date(memberData.joined_at), { addSuffix: true, locale: de })
    : "Datum wird geladen...";

  const stats = memberStats || memberData.stats;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={memberData.avatar_url} />
            <AvatarFallback>{memberData.display_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <h1 className="text-2xl font-bold mb-1">{memberData.display_name}</h1>
          <p className="text-muted-foreground mb-2">@{memberSlug}</p>
          
          <p className="text-sm text-gray-600 mb-4">{bioText}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4" />
              <span>{memberData.personality_type || "Nicht angegeben"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{memberData.location || "Nicht angegeben"}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Mitglied seit {joinedDateString}
          </p>

          {isOwnProfile ? (
            <Button onClick={() => setIsEditDialogOpen(true)} className="w-full">
              Profil bearbeiten
            </Button>
          ) : (
            <Button 
              className="w-full" 
              variant={followStatus ? "outline" : "default"}
              onClick={handleFollow}
              disabled={isLoadingFollow}
            >
              {followStatus ? (
                <>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Entfolgen
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Folgen
                </>
              )}
            </Button>
          )}

          <div className="grid grid-cols-3 gap-4 py-4 border-y mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.posts_count}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.followers_count}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.following_count}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
          </div>

          <div className="mb-6 mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Level {currentLevel}</span>
              <span>{pointsToNextLevel} points to next level</span>
            </div>
            <Progress value={currentPoints % 100} className="h-2" />
          </div>

          <div className="flex justify-center gap-4 mt-6 pt-4 border-t">
            {memberData.social_links?.website && (
              <a 
                href={memberData.social_links.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <LinkIcon className="h-5 w-5" />
              </a>
            )}
            {memberData.social_links?.instagram && (
              <a 
                href={`https://instagram.com/${memberData.social_links.instagram}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {memberData.social_links?.linkedin && (
              <a 
                href={memberData.social_links.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {memberData.email && (
              <a 
                href={`mailto:${memberData.email}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        {isOwnProfile && (
          <EditProfileDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            profileData={memberData}
          />
        )}
      </CardContent>
    </Card>
  );
};

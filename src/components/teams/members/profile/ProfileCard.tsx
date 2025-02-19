
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Brain, MapPin, Link, Instagram, Linkedin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProfileCardProps {
  memberData: {
    avatar_url?: string;
    display_name?: string;
    bio?: string;
    last_seen: string;
    created_at: string;
    id: string;
    personality_type?: string;
    location?: string;
    social_links?: {
      website?: string;
      instagram?: string;
      linkedin?: string;
    };
    stats: {
      posts_count: number;
      followers_count: number;
      following_count: number;
    };
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
  const [isFollowing, setIsFollowing] = useState(false);
  const isOwnProfile = user?.id === memberData.id;

  const { data: settings } = useQuery({
    queryKey: ['user-settings', memberData.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('about_me')
        .eq('user_id', memberData.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const handleFollow = async () => {
    try {
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Unfollowed successfully' : 'Followed successfully');
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  const bioText = settings?.about_me || memberData.bio || "Dieser Nutzer hat noch keine Bio hinzugefügt.";
  
  // Sicheres Parsen des Datums mit Fallback
  const joinedDateString = memberData.created_at ? formatDistanceToNow(
    new Date(memberData.created_at),
    { addSuffix: true, locale: de }
  ) : "Datum unbekannt";

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

          <p className="text-sm text-muted-foreground mb-4">
            Mitglied seit {joinedDateString}
          </p>

          {isOwnProfile ? (
            <Button className="w-full">Edit Profile</Button>
          ) : (
            <Button 
              className="w-full" 
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}

          <div className="grid grid-cols-3 gap-4 py-4 border-y mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{memberData.stats.posts_count}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{memberData.stats.followers_count}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{memberData.stats.following_count}</div>
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

          {memberData.social_links && (
            <div className="flex justify-center gap-4">
              {memberData.social_links.website && (
                <Link className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
              {memberData.social_links.instagram && (
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
              {memberData.social_links.linkedin && (
                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </div>
          )}

          {memberData.personality_type && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <Brain className="h-4 w-4" />
              <span>{memberData.personality_type}</span>
            </div>
          )}

          {memberData.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <MapPin className="h-4 w-4" />
              <span>{memberData.location}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

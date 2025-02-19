
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Brain, Calendar, Clock, MapPin, Link, Instagram, Linkedin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface ProfileCardProps {
  memberData: {
    avatar_url?: string;
    display_name?: string;
    bio?: string;
    last_seen: string;
    created_at: string;
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
}

export const ProfileCard = ({ 
  memberData, 
  memberSlug, 
  currentLevel, 
  currentPoints, 
  pointsToNextLevel 
}: ProfileCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={memberData.avatar_url} />
            <AvatarFallback>{memberData.display_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <h1 className="text-2xl font-bold mb-1">{memberData.display_name}</h1>
          <p className="text-muted-foreground mb-4">@{memberSlug}</p>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Level {currentLevel}</span>
              <span>{pointsToNextLevel} points to next level</span>
            </div>
            <Progress value={currentPoints % 100} className="h-2" />
          </div>

          <div className="text-left space-y-3 mb-6">
            {memberData.bio && (
              <p className="text-sm">{memberData.bio}</p>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Active {formatDistanceToNow(new Date(memberData.last_seen), { addSuffix: true, locale: de })}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(memberData.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</span>
            </div>

            {memberData.personality_type && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="h-4 w-4" />
                <span>{memberData.personality_type}</span>
              </div>
            )}

            {memberData.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{memberData.location}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 border-y">
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

          <Button className="w-full mt-4">Edit Profile</Button>

          {memberData.social_links && (
            <div className="flex justify-center gap-4 mt-4">
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
        </div>
      </CardContent>
    </Card>
  );
};

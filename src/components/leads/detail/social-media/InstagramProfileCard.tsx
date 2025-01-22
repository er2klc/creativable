import { Instagram, Users, MessageSquare, Image, Video, Slideshow, MapPin, Hash, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { useSettings } from "@/hooks/use-settings";

interface InstagramProfileCardProps {
  lead: Tables<"leads">;
}

export function InstagramProfileCard({ lead }: InstagramProfileCardProps) {
  const { settings } = useSettings();
  
  if (lead.platform !== "Instagram") {
    return null;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <img 
                src={lead.social_media_profile_image_url || "/placeholder.svg"} 
                alt={lead.name} 
                className="object-cover"
              />
            </Avatar>
            <div>
              <h3 className="font-semibold">{lead.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>@{lead.social_media_username}</span>
                {lead.industry && (
                  <>
                    <span>•</span>
                    <span>{lead.industry}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.open(`https://instagram.com/${lead.social_media_username}`, '_blank')}
          >
            <Instagram className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {lead.social_media_bio && (
          <p className="text-sm text-muted-foreground mb-4">{lead.social_media_bio}</p>
        )}
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold">
              {lead.social_media_followers?.toLocaleString() || 0}
            </span>
            <span className="text-xs text-muted-foreground">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold">
              {lead.social_media_following?.toLocaleString() || 0}
            </span>
            <span className="text-xs text-muted-foreground">Following</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold">
              {lead.social_media_posts_count?.toLocaleString() || 0}
            </span>
            <span className="text-xs text-muted-foreground">Posts</span>
          </div>
        </div>

        {lead.social_media_interests && lead.social_media_interests.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Hashtags & Interests</h4>
            <div className="flex flex-wrap gap-1">
              {lead.social_media_interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
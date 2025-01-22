import { Users, MessageSquare, Image, Video, Images } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeadWithRelations } from "../types/lead";

interface InstagramProfileCardProps {
  lead: LeadWithRelations;
}

export const InstagramProfileCard = ({ lead }: InstagramProfileCardProps) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {lead.social_media_profile_image_url && (
            <img
              src={lead.social_media_profile_image_url}
              alt={lead.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{lead.name}</h3>
              {lead.social_media_verified && (
                <span className="text-blue-500">✓</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{lead.social_media_username}</p>
            {lead.industry && (
              <p className="text-sm text-muted-foreground mt-1">{lead.industry}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`https://instagram.com/${lead.social_media_username}`, '_blank')}
          >
            Profil öffnen
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          <div>
            <div className="flex items-center justify-center gap-1">
              <Users className="h-4 w-4" />
              <span className="font-semibold">{lead.social_media_followers || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Follower</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Users className="h-4 w-4" />
              <span className="font-semibold">{lead.social_media_following || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Image className="h-4 w-4" />
              <span className="font-semibold">{lead.social_media_posts_count || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Beiträge</p>
          </div>
        </div>

        {lead.social_media_bio && (
          <p className="mt-4 text-sm">{lead.social_media_bio}</p>
        )}
      </CardContent>
    </Card>
  );
};
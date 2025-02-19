
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { MediaGallery } from "@/components/teams/posts/components/media-gallery/MediaGallery";
import { Activity } from "./types";
import { useNavigate } from "react-router-dom";

interface ActivityFeedProps {
  activities: Activity[];
  teamSlug: string;
}

export const ActivityFeed = ({ activities, teamSlug }: ActivityFeedProps) => {
  const navigate = useNavigate();

  const handlePostClick = (slug: string) => {
    navigate(`/unity/team/${teamSlug}/posts/${slug}`);
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Aktivitäten</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="relative pl-4 border-l-2 border-gray-200 hover:border-primary transition-colors"
          >
            <div className="mb-2 flex items-center gap-2">
              <Badge
                variant={activity.type === 'post' ? 'default' : 'secondary'}
                className="h-6"
              >
                {activity.type === 'post' ? 'Beitrag' : 'Kommentar'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                  locale: de,
                })}
              </span>
            </div>

            {activity.type === 'post' ? (
              <div className="space-y-2">
                <div
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handlePostClick(activity.slug)}
                >
                  <h4 className="text-lg font-medium">{activity.title}</h4>
                </div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: activity.content }}
                />
                {activity.file_urls && activity.file_urls.length > 0 && (
                  <div className="mt-4 h-[200px]">
                    <MediaGallery files={activity.file_urls} />
                  </div>
                )}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-sm">{activity.reactions_count}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">{activity.comments_count}</span>
                  </div>
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: `${activity.category.color}10`,
                      color: activity.category.color,
                    }}
                  >
                    {activity.category.name}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handlePostClick(activity.post.slug)}
                >
                  <h4 className="text-base text-muted-foreground">
                    Kommentar auf: <span className="font-medium text-foreground">{activity.post.title}</span>
                  </h4>
                </div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: activity.content }}
                />
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: `${activity.post.category.color}10`,
                    color: activity.post.category.color,
                  }}
                >
                  {activity.post.category.name}
                </Badge>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

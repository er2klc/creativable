import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { MediaGallery } from "@/components/teams/posts/components/media-gallery/MediaGallery";
import { Activity } from "./types";
import { useNavigate } from "react-router-dom";
interface ActivityFeedProps {
  activities: Activity[];
  teamSlug: string;
}
export const ActivityFeed = ({
  activities = [],
  teamSlug
}: ActivityFeedProps) => {
  const navigate = useNavigate();
  const handlePostClick = (slug: string) => {
    navigate(`/unity/team/${teamSlug}/posts/${slug}`);
  };
  const posts = activities.filter(activity => activity.type === 'post');
  const comments = activities.filter(activity => activity.type === 'comment');
  if (!activities || activities.length === 0) {
    return <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Aktivitäten</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Keine Aktivitäten vorhanden
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Beiträge/Kommentare</h3>
      </CardHeader>
      <CardContent className="space-y-8">
        {posts.length > 0 && <div className="space-y-6">
            <h4 className="font-medium text-muted-foreground">Posts</h4>
            {posts.map(activity => <div key={activity.id} className="relative pl-4 border-l-2 border-gray-200 hover:border-primary transition-colors">
                <div className="mb-2">
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), {
                addSuffix: true,
                locale: de
              })}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="cursor-pointer hover:text-primary transition-colors" onClick={() => handlePostClick(activity.slug)}>
                    <h4 className="text-lg font-medium">{activity.title}</h4>
                  </div>
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{
              __html: activity.content
            }} />
                  {activity.file_urls && activity.file_urls.length > 0 && <div className="mt-4 h-[200px]">
                      <MediaGallery files={activity.file_urls} />
                    </div>}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{activity.reactions_count}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">{activity.comments_count}</span>
                    </div>
                    <Badge variant="outline" style={{
                backgroundColor: `${activity.category.color}10`,
                color: activity.category.color
              }}>
                      {activity.category.name}
                    </Badge>
                  </div>
                </div>
              </div>)}
          </div>}

        {comments.length > 0 && <div className="space-y-6">
            <h4 className="font-medium text-muted-foreground">Kommentare</h4>
            {comments.map(activity => <div key={activity.id} className="relative pl-4 border-l-2 border-gray-200 hover:border-primary transition-colors">
                <div className="mb-2">
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), {
                addSuffix: true,
                locale: de
              })}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="cursor-pointer hover:text-primary transition-colors" onClick={() => handlePostClick(activity.post.slug)}>
                    <h4 className="text-base text-muted-foreground">
                      Kommentar auf: <span className="font-medium text-foreground">{activity.post.title}</span>
                    </h4>
                  </div>
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{
              __html: activity.content
            }} />
                  <Badge variant="outline" style={{
              backgroundColor: `${activity.post.category.color}10`,
              color: activity.post.category.color
            }}>
                    {activity.post.category.name}
                  </Badge>
                </div>
              </div>)}
          </div>}
      </CardContent>
    </Card>;
};
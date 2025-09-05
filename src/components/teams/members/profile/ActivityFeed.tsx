
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { MediaGallery } from "@/components/teams/posts/components/media-gallery/MediaGallery";
import { Activity } from "./types";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

interface ActivityFeedProps {
  activities: Activity[];
  teamSlug: string;
}

export const ActivityFeed = ({
  activities = [],
  teamSlug
}: ActivityFeedProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("posts");
  
  const handlePostClick = (slug: string) => {
    navigate(`/unity/team/${teamSlug}/posts/${slug}`);
  };

  const posts = activities.filter(activity => activity.type === 'post');
  const comments = activities.filter(activity => activity.type === 'comment');

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Aktivitäten</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Keine Aktivitäten vorhanden
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Aktivitäten</h3>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="posts" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Beiträge ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Kommentare ({comments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                Keine Beiträge vorhanden
              </div>
            ) : (
              posts.map(activity => (
                <div key={activity.id} className="relative pl-4 border-l-2 border-gray-200 hover:border-primary transition-colors">
                  <div className="mb-2">
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: de
                      })}
                    </span>
                  </div>
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
                          color: activity.category.color
                        }}
                      >
                        {activity.category.name}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                Keine Kommentare vorhanden
              </div>
            ) : (
              comments.map(activity => (
                <div key={activity.id} className="relative pl-4 border-l-2 border-gray-200 hover:border-primary transition-colors">
                  <div className="mb-2">
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: de
                      })}
                    </span>
                  </div>
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
                        color: activity.post.category.color
                      }}
                    >
                      {activity.post.category.name}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

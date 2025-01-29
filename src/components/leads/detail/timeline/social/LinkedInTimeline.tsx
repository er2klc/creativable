import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Briefcase, GraduationCap } from "lucide-react";

interface LinkedInPost {
  id: string;
  post_type: string;
  company?: string;
  position?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  content?: string;
  school?: string;
  degree?: string;
}

interface LinkedInTimelineProps {
  posts: LinkedInPost[];
}

export const LinkedInTimeline = ({ posts }: LinkedInTimelineProps) => {
  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    return format(new Date(date), 'MMM yyyy', { locale: de });
  };

  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date) : new Date();
    const dateB = b.start_date ? new Date(b.start_date) : new Date();
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="relative space-y-6">
      {sortedPosts.length > 0 ? (
        sortedPosts.map((post) => (
          <Card key={post.id} className={cn(
            "p-4 border rounded-lg",
            post.post_type === 'experience' ? "bg-blue-50" : "bg-purple-50"
          )}>
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-2 rounded-full",
                post.post_type === 'experience' ? "bg-blue-100" : "bg-purple-100"
              )}>
                {post.post_type === 'experience' ? (
                  <Briefcase className="h-5 w-5 text-blue-600" />
                ) : (
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="font-semibold">
                  {post.post_type === 'experience' ? (
                    <>
                      {post.position}
                      {post.company && <span className="text-gray-600"> bei {post.company}</span>}
                    </>
                  ) : (
                    <>
                      {post.degree}
                      {post.school && <span className="text-gray-600"> bei {post.school}</span>}
                    </>
                  )}
                </div>
                
                <div className="text-sm text-gray-500 mt-1">
                  {formatDate(post.start_date)} - {post.end_date ? formatDate(post.end_date) : 'Heute'}
                  {post.location && <span> · {post.location}</span>}
                </div>
                
                {post.content && (
                  <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                    {post.content}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))
      ) : (
        <div className="text-center text-muted-foreground py-4">
          Keine LinkedIn Aktivitäten vorhanden
        </div>
      )}
    </div>
  );
};
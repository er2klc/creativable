import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Briefcase, GraduationCap, Award, BookOpen, Trophy, Heart } from "lucide-react";

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
  metadata?: any;
}

interface LinkedInTimelineProps {
  posts: LinkedInPost[];
}

export const LinkedInTimeline = ({ posts }: LinkedInTimelineProps) => {
  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    return format(new Date(date), 'MMM yyyy', { locale: de });
  };

  const getIcon = (postType: string) => {
    switch (postType) {
      case 'experience':
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      case 'education':
        return <GraduationCap className="h-5 w-5 text-purple-600" />;
      case 'certification':
        return <Award className="h-5 w-5 text-green-600" />;
      case 'course':
        return <BookOpen className="h-5 w-5 text-yellow-600" />;
      case 'honor':
        return <Trophy className="h-5 w-5 text-orange-600" />;
      case 'volunteer':
        return <Heart className="h-5 w-5 text-red-600" />;
      default:
        return <Briefcase className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBackgroundColor = (postType: string) => {
    switch (postType) {
      case 'experience':
        return "bg-blue-50";
      case 'education':
        return "bg-purple-50";
      case 'certification':
        return "bg-green-50";
      case 'course':
        return "bg-yellow-50";
      case 'honor':
        return "bg-orange-50";
      case 'volunteer':
        return "bg-red-50";
      default:
        return "bg-gray-50";
    }
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
            getBackgroundColor(post.post_type)
          )}>
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-2 rounded-full",
                post.post_type === 'experience' ? "bg-blue-100" : 
                post.post_type === 'education' ? "bg-purple-100" :
                post.post_type === 'certification' ? "bg-green-100" :
                post.post_type === 'course' ? "bg-yellow-100" :
                post.post_type === 'honor' ? "bg-orange-100" :
                post.post_type === 'volunteer' ? "bg-red-100" :
                "bg-gray-100"
              )}>
                {getIcon(post.post_type)}
              </div>
              
              <div className="flex-1">
                <div className="font-semibold">
                  {post.post_type === 'experience' ? (
                    <>
                      {post.position || post.content}
                      {post.company && <span className="text-gray-600"> bei {post.company}</span>}
                    </>
                  ) : post.post_type === 'education' ? (
                    <>
                      {post.degree || post.content}
                      {post.school && <span className="text-gray-600"> bei {post.school}</span>}
                    </>
                  ) : (
                    post.content
                  )}
                </div>
                
                <div className="text-sm text-gray-500 mt-1">
                  {formatDate(post.start_date)} - {post.end_date ? formatDate(post.end_date) : 'Heute'}
                  {post.location && <span> · {post.location}</span>}
                </div>
                
                {post.metadata && typeof post.metadata === 'object' && (
                  <div className="mt-2 text-sm text-gray-700">
                    {post.metadata.description || post.metadata.authority || post.metadata.organization}
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
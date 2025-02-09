
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageSquare, ChevronRight, Megaphone, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { CategoryList } from "./CategoryList";
import { PostList } from "./PostList";

interface PostsAndDiscussionsProps {
  categories: any[];
  teamId: string;
  activeCategory?: string;
}

export function PostsAndDiscussions({ categories, teamId, activeCategory }: PostsAndDiscussionsProps) {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Categories Sidebar */}
      <div className="col-span-3">
        <Card>
          <CardContent className="p-4">
            <CategoryList teamId={teamId} activeCategory={activeCategory} />
          </CardContent>
        </Card>
      </div>

      {/* Posts Area */}
      <div className="col-span-9">
        <PostList teamId={teamId} categoryId={activeCategory} />
      </div>
    </div>
  );
}

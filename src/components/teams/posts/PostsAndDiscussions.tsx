
import { Card, CardContent } from "@/components/ui/card";
import { CategoryList } from "./CategoryList";
import { PostList } from "./PostList";
import { CategoryOverview } from "./CategoryOverview";
import { CreatePostDialog } from "./CreatePostDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface PostsAndDiscussionsProps {
  categories: any[];
  teamId: string;
  activeCategory?: string;
}

export function PostsAndDiscussions({ categories, teamId, activeCategory }: PostsAndDiscussionsProps) {
  const isMobile = useIsMobile();

  if (activeCategory) {
    return (
      <div className={isMobile ? "space-y-4" : "grid grid-cols-12 gap-6"}>
        {/* Categories Sidebar */}
        <div className={isMobile ? "w-full" : "col-span-3"}>
          <Card>
            <CardContent className="p-4">
              <CategoryList teamId={teamId} activeCategory={activeCategory} />
            </CardContent>
          </Card>
        </div>

        {/* Posts Area */}
        <div className={isMobile ? "w-full" : "col-span-9"}>
          <div className="mb-4">
            <CreatePostDialog teamId={teamId} categoryId={activeCategory} />
          </div>
          <PostList teamId={teamId} categoryId={activeCategory} />
        </div>
      </div>
    );
  }

  return <CategoryOverview teamId={teamId} />;
}

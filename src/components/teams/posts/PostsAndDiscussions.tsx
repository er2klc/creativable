
import { Card, CardContent } from "@/components/ui/card";
import { CategoryList } from "./CategoryList";
import { PostList } from "./PostList";
import { CategoryOverview } from "./CategoryOverview";
import { CreatePostDialog } from "./CreatePostDialog";

interface PostsAndDiscussionsProps {
  categories: any[];
  teamId: string;
  activeCategory?: string;
}

export function PostsAndDiscussions({ categories, teamId, activeCategory }: PostsAndDiscussionsProps) {
  if (activeCategory) {
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
          <div className="mb-4 flex justify-end">
            <CreatePostDialog teamId={teamId} categoryId={activeCategory} />
          </div>
          <PostList teamId={teamId} categoryId={activeCategory} />
        </div>
      </div>
    );
  }

  return <CategoryOverview teamId={teamId} />;
}

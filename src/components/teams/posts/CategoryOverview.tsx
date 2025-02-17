
import { useQuery } from "@tanstack/react-query";
import { CreatePostDialog } from "./CreatePostDialog";
import { PostList } from "./PostList";
import { useTeamCategories } from "@/hooks/useTeamCategories";

interface CategoryOverviewProps {
  teamId: string;
  teamSlug: string;
  categorySlug?: string;
  canPost?: boolean;
}

export function CategoryOverview({ teamId, teamSlug, categorySlug, canPost = true }: CategoryOverviewProps) {
  const { data: categories } = useTeamCategories(teamSlug);
  const currentCategory = categories?.find(cat => cat.slug === categorySlug);

  return (
    <div className="space-y-6">
      {canPost && (
        <div className="flex justify-end">
          <CreatePostDialog
            teamId={teamId}
            categoryId={currentCategory?.id}
          />
        </div>
      )}
      <PostList
        teamId={teamId}
        categoryId={currentCategory?.id}
      />
    </div>
  );
}

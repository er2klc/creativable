
import { useTeamCategories } from "@/hooks/useTeamCategories";
import { TabScrollArea } from "../TabScrollArea";

interface AdminCategoriesScrollProps {
  activeTab: string;
  onCategoryClick: (categoryId: string) => void;
  teamSlug: string;
}

export const AdminCategoriesScroll = ({
  activeTab,
  onCategoryClick,
  teamSlug,
}: AdminCategoriesScrollProps) => {
  const { categories, isLoading } = useTeamCategories(teamSlug);

  if (isLoading) {
    return <div className="h-12 w-full bg-muted animate-pulse rounded-md" />;
  }

  return (
    <TabScrollArea
      activeTab={activeTab}
      onCategoryClick={onCategoryClick}
      isAdmin={true}
      teamSlug={teamSlug}
    />
  );
};

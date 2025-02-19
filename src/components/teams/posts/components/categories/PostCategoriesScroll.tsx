
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Lock, MessageCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeamCategories } from "@/hooks/useTeamCategories";
import { iconMap } from "../category-dialog/constants";
import { Button } from "@/components/ui/button";
import { CategoryManagementDialog } from "../category-dialog/CategoryManagementDialog";
import { useState } from "react";

interface PostCategoriesScrollProps {
  activeTab: string;
  onCategoryClick: (categorySlug?: string) => void;
  isAdmin?: boolean;
  teamSlug: string;
}

export const PostCategoriesScroll = ({ 
  activeTab, 
  onCategoryClick, 
  isAdmin,
  teamSlug 
}: PostCategoriesScrollProps) => {
  const [showManageDialog, setShowManageDialog] = useState(false);
  const { data: categories, isLoading } = useTeamCategories(teamSlug);

  // Filter categories - only show those with posts for everyone
  const filteredCategories = categories?.filter(category => 
    category.post_count && category.post_count > 0
  );

  // Check if we're in a post detail view (not just category view)
  const isPostDetailView = window.location.pathname.includes('/posts/') && 
                          !window.location.pathname.includes('/posts/category/');

  if (isLoading) {
    return <div className="h-12 w-full bg-muted animate-pulse rounded-md" />;
  }

  return (
    <div className="relative w-full">
      <ScrollArea className="w-full border-b">
        <div className="flex items-center gap-2 py-2 px-4">
          {!isPostDetailView && (
            <Badge
              variant="outline"
              className={cn(
                "cursor-pointer px-4 py-2 text-sm transition-colors whitespace-nowrap border-2 shrink-0",
                "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]",
                activeTab === 'all' ? "border-primary" : "border-transparent"
              )}
              onClick={() => onCategoryClick()}
            >
              <MessageCircle className="h-4 w-4 mr-2 inline-block" />
              Alle Beiträge
            </Badge>
          )}
          {filteredCategories?.map((category) => {
            const IconComponent = category.icon && iconMap[category.icon] ? iconMap[category.icon] : MessageCircle;
            
            return (
              <Badge
                key={category.id}
                variant="outline"
                className={cn(
                  "cursor-pointer px-4 py-2 text-sm transition-colors whitespace-nowrap border-2 flex items-center gap-2 shrink-0",
                  category.color || "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]",
                  activeTab === category.slug ? "border-primary" : "border-transparent"
                )}
                onClick={() => onCategoryClick(category.slug)}
              >
                <IconComponent className="h-4 w-4" />
                {category.name}
                {!category.is_public && <Lock className="h-3 w-3 ml-2" />}
                <span className="text-xs ml-1">({category.post_count})</span>
              </Badge>
            );
          })}

          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => setShowManageDialog(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
        <ScrollBar orientation="horizontal" className="h-2.5" />
      </ScrollArea>

      {isAdmin && (
        <CategoryManagementDialog
          open={showManageDialog}
          onOpenChange={setShowManageDialog}
          teamSlug={teamSlug}
        />
      )}
    </div>
  );
};

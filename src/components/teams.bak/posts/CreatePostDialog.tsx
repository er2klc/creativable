
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreatePostForm } from "./dialog/CreatePostForm";
import { useTeamMembers } from "./dialog/useTeamMembers";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreatePostCategoriesScroll } from "./components/categories/CreatePostCategoriesScroll";

interface CreatePostDialogProps {
  teamId: string;
  categoryId?: string;
  canPost: boolean;
  isLevel0?: boolean;
  onIntroductionClick?: () => void;
}

export const CreatePostDialog = ({ 
  teamId, 
  categoryId,
  canPost,
  isLevel0,
  onIntroductionClick
}: CreatePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(categoryId);
  const { teamSlug } = useParams();

  const { data: teamMembers } = useTeamMembers(teamId);
  
  const { data: categories } = useQuery({
    queryKey: ["team-categories", teamSlug],
    queryFn: async () => {
      if (!teamSlug) return [];
      
      const { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .single();

      if (!team) return [];

      const { data, error } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', team.id)
        .order('order_index');

      if (error) throw error;
      return data;
    },
    enabled: !!teamSlug,
  });

  const handleCategoryChange = (categorySlug?: string) => {
    if (!categories) return;
    const category = categories.find(cat => cat.slug === categorySlug);
    setSelectedCategoryId(category?.id);
  };

  const button = (
    <Button disabled={!canPost}>
      <Plus className="h-4 w-4 mr-2" />
      Neuer Beitrag
    </Button>
  );

  if (isLevel0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>Stelle dich erst der Community vor, um Beiträge erstellen zu können</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {button}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Neuen Beitrag erstellen</DialogTitle>
          <DialogDescription>
            Erstelle einen neuen Beitrag in einer der verfügbaren Kategorien.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[400px] overflow-auto">
          <CreatePostCategoriesScroll 
            activeTab={categories?.find(cat => cat.id === selectedCategoryId)?.slug || ""}
            onCategoryClick={handleCategoryChange}
            isAdmin={false}
            teamSlug={teamSlug || ""}
          />
        </div>

        <CreatePostForm
          teamId={teamId}
          categoryId={selectedCategoryId}
          onSuccess={() => setOpen(false)}
          teamMembers={teamMembers}
          isAdmin={false}
          teamSlug={teamSlug || ""}
        />
      </DialogContent>
    </Dialog>
  );
};

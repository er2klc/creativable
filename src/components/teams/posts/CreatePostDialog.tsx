
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
import { CreatePostForm } from "./dialog/CreatePostForm";
import { useTeamMembers } from "./dialog/useTeamMembers";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { CreatePostCategoriesScroll } from "./components/categories/CreatePostCategoriesScroll";

interface CreatePostDialogProps {
  teamId: string;
  categoryId?: string;
}

export const CreatePostDialog = ({ teamId, categoryId }: CreatePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categoryId);
  const user = useUser();
  const { teamSlug } = useParams();

  const { data: teamMembers } = useTeamMembers(teamId);
  
  const { data: teamMember } = useQuery({
    queryKey: ["team-member-role", teamId],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!teamId && !!user?.id,
  });

  const isAdmin = teamMember?.role === "admin" || teamMember?.role === "owner";

  const handleCategoryChange = (categorySlug?: string) => {
    setSelectedCategory(categorySlug);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Beitrag
        </Button>
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
            activeTab={selectedCategory || ""}
            onCategoryClick={handleCategoryChange}
            isAdmin={isAdmin}
            teamSlug={teamSlug || ""}
          />
        </div>

        <CreatePostForm
          teamId={teamId}
          categoryId={selectedCategory}
          onSuccess={() => setOpen(false)}
          teamMembers={teamMembers}
          isAdmin={isAdmin}
          teamSlug={teamSlug || ""}
        />
      </DialogContent>
    </Dialog>
  );
};


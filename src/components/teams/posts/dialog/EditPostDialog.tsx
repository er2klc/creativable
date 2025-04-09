
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { CreatePostForm } from "./CreatePostForm";
import { Post } from "../types/post";
import { useTeamMembers } from "./useTeamMembers";
import { useParams } from "react-router-dom";

interface EditPostDialogProps {
  post: Post;
  teamId: string;
  isAdmin?: boolean;
}

export const EditPostDialog = ({ post, teamId, isAdmin = false }: EditPostDialogProps) => {
  const [open, setOpen] = useState(false);
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const { data: teamMembers } = useTeamMembers(teamId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Bearbeiten
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Beitrag bearbeiten</DialogTitle>
        </DialogHeader>
        <CreatePostForm
          teamId={teamId}
          categoryId={post.category_id}
          initialValues={{
            title: post.title,
            content: post.content,
          }}
          editMode={{
            postId: post.id,
            originalFiles: post.file_urls,
          }}
          onSuccess={() => setOpen(false)}
          teamMembers={teamMembers}
          isAdmin={isAdmin}
          teamSlug={teamSlug || teamId} // Use teamSlug from params or fallback to teamId
        />
      </DialogContent>
    </Dialog>
  );
}

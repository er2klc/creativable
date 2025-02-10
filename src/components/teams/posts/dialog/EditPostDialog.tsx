
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { CreatePostForm } from "./CreatePostForm";
import { Post } from "../types/post";

interface EditPostDialogProps {
  post: Post;
  teamId: string;
}

export const EditPostDialog = ({ post, teamId }: EditPostDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const preventBubbling = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Bearbeiten
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[600px]"
        onClick={preventBubbling}
        onMouseDown={preventBubbling}
        onPointerDown={preventBubbling}
        onMouseDownCapture={preventBubbling}
        onPointerDownCapture={preventBubbling}
      >
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
        />
      </DialogContent>
    </Dialog>
  );
};

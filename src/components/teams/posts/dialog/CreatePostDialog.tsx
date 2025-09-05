
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface CreatePostDialogProps {
  teamId: string;
  categoryId: string;
}

export const CreatePostDialog = ({ teamId, categoryId }: CreatePostDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Beitrag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Neuen Beitrag erstellen</DialogTitle>
        </DialogHeader>
        {/* TODO: Implementiere das Formular für neue Beiträge */}
      </DialogContent>
    </Dialog>
  );
};

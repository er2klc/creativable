
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface IntroductionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamSlug: string;
  onCreatePost: () => void;
}

export const IntroductionDialog = ({
  isOpen,
  onClose,
  teamSlug,
  onCreatePost,
}: IntroductionDialogProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>👋 Willkommen im Team!</DialogTitle>
          <DialogDescription>
            Stelle dich doch kurz der Community vor! Erzähle etwas über dich und was dich hierher führt.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button onClick={onCreatePost} className="w-full">
            Jetzt vorstellen
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Später
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


import { useState } from "react";
import { Dialog, DialogContent, DialogHeader as UIDialogHeader, DialogFooter as UIDialogFooter } from "@/components/ui/dialog";
import { UnitForm } from "./UnitForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface CreateUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platformId: string;
  onUnitCreated: () => void;
}

// Simple wrapper components to avoid the type errors
const DialogHeader: React.FC<React.PropsWithChildren> = ({ children }) => (
  <UIDialogHeader>{children}</UIDialogHeader>
);

const DialogFooter: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <UIDialogFooter className={className}>{children}</UIDialogFooter>
);

export const CreateUnitDialog = ({
  open,
  onOpenChange,
  platformId,
  onUnitCreated
}: CreateUnitDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Bitte fülle alle Pflichtfelder aus");
      return;
    }

    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht authentifiziert");
      
      const { error } = await supabase
        .from('elevate_lerninhalte')
        .insert({
          platform_id: platformId,
          title: formData.title,
          description: formData.description,
          video_url: formData.videoUrl,
          created_by: user.id
        });

      if (error) throw error;
      
      toast.success("Lerneinheit erfolgreich erstellt");
      onUnitCreated();
      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        videoUrl: "",
      });
    } catch (error) {
      console.error("Error creating unit:", error);
      toast.error("Fehler beim Erstellen der Lerneinheit");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>Neue Lerneinheit erstellen</DialogHeader>
        <UnitForm
          initialContent={formData}
          onContentChange={setFormData}
        />
        <DialogFooter className="flex justify-end mt-4">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button disabled={isLoading} onClick={handleSubmit}>
              {isLoading ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

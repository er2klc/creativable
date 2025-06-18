
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NameField } from "./edit-dialog/NameField";
import { DescriptionField } from "./edit-dialog/DescriptionField";
import { LogoField } from "./edit-dialog/LogoField";
import { DialogFooter } from "./edit-dialog/DialogFooter";

const platformSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

type PlatformFormData = z.infer<typeof platformSchema>;

interface EditPlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: any;
  onPlatformUpdated: () => void;
}

export const EditPlatformDialog = ({ 
  open, 
  onOpenChange, 
  platform, 
  onPlatformUpdated 
}: EditPlatformDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<PlatformFormData>({
    resolver: zodResolver(platformSchema),
    defaultValues: {
      name: platform?.name || "",
      description: platform?.description || "",
      imageUrl: platform?.image_url || platform?.logo_url || "",
    }
  });

  const onSubmit = async (data: PlatformFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("elevate_platforms")
        .update({
          name: data.name,
          description: data.description,
          image_url: data.imageUrl,
          slug: data.name.toLowerCase().replace(/\s+/g, '-'),
          updated_at: new Date().toISOString()
        })
        .eq("id", platform.id);

      if (error) throw error;

      toast.success("Plattform erfolgreich aktualisiert");
      onPlatformUpdated();
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Error updating platform:", error);
      toast.error("Fehler beim Aktualisieren der Plattform");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Plattform bearbeiten</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <NameField 
            register={register}
            error={errors.name}
          />
          
          <DescriptionField 
            register={register}
            error={errors.description}
          />
          
          <LogoField 
            currentImageUrl={watch('imageUrl')}
            onImageUpload={(url) => setValue('imageUrl', url)}
          />
          
          <DialogFooter 
            isLoading={isLoading}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
